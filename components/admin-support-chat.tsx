'use client'

import { useEffect, useState, useTransition } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { deleteChatMessage, getAdminConversations, sendAdminMessage, sendAdminVoiceMessage, type AdminConversations } from '@/app/actions/chat'
import { VoiceMessagePlayer } from '@/components/voice-message-player'
import { VoiceMessageRecorder } from '@/components/voice-message-recorder'

type Item = Extract<AdminConversations, { ok: true }>['items'][number]
type ChatMessage = Item['messages'][number]

export function AdminSupportChat() {
  const [items, setItems] = useState<Item[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const selected = items.find((item) => item.conversation.id === selectedId)

  function loadConversations(selectFirst = false) {
    startTransition(async () => {
      const result = await getAdminConversations()
      if (!result.ok) { setError(result.message); return }
      setItems(result.items)
      setSelectedId((currentId) => {
        const stillExists = result.items.some((item) => item.conversation.id === currentId)
        return selectFirst || !stillExists ? result.items[0]?.conversation.id ?? '' : currentId
      })
      setError('')
    })
  }

  useEffect(() => {
    loadConversations(true)
  }, [])

  function addVoice(audioPath: string, durationSeconds: number) {
    if (!selected) return
    const conversationId = selected.conversation.id
    startTransition(async () => {
      const result = await sendAdminVoiceMessage({ conversationId, audioPath, durationSeconds })
      if (!result.ok) { setError(result.message); return }
      setItems((current) => current.map((item) => item.conversation.id === conversationId ? { ...item, messages: [...item.messages, result.message] } : item))
    })
  }

  function removeMessage(messageId: string, scope: 'ONLY_ME' | 'EVERYONE') {
    if (!window.confirm(scope === 'EVERYONE' ? 'Delete this message for everyone?' : 'Delete this message for you?')) return
    startTransition(async () => {
      const result = await deleteChatMessage(messageId, scope)
      if (!result.ok) { setError(result.message); return }
      setItems((current) => current.map((item) => ({ ...item, messages: item.messages.filter((message) => message.id !== messageId) })))
    })
  }

  function send() {
    const body = draft.trim()
    if (!body || !selected) return
    const conversationId = selected.conversation.id
    startTransition(async () => {
      const result = await sendAdminMessage({ conversationId, body })
      if (!result.ok) { setError(result.message); return }
      setItems((current) => current.map((item) => item.conversation.id === conversationId ? { ...item, messages: [...item.messages, result.message] } : item))
      setDraft('')
      setError('')
    })
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-[#e3ece7] bg-white shadow-sm" aria-labelledby="admin-chat-title">
      <div className="flex items-center justify-between gap-3 border-b border-[#e3ece7] p-5">
        <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#eaf5f0] text-[#2f765b]"><MessageCircle /></div><div><h2 id="admin-chat-title" className="font-bold">Client conversations</h2><p className="text-sm text-[#60757b]">Reply to customers from one HunarLink inbox. Updates refresh automatically.</p></div></div>
        <button type="button" onClick={() => loadConversations()} disabled={pending} className="rounded-xl border border-[#d5e2dc] px-3 py-2 text-xs font-bold text-[#153443] disabled:opacity-50">Refresh inbox</button>
      </div>
      <div className="grid min-h-[420px] md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="max-h-[420px] overflow-y-auto border-b border-[#e3ece7] bg-[#fbfcfa] p-3 md:border-b-0 md:border-r">
          {items.length === 0 && !error && <p className="p-3 text-sm text-[#60757b]">No customer conversations yet.</p>}
          {items.map((item) => <button key={item.conversation.id} type="button" onClick={() => setSelectedId(item.conversation.id)} className={`mb-2 w-full rounded-2xl p-3 text-left ${item.conversation.id === selectedId ? 'bg-[#153443] text-white' : 'bg-white text-[#153443]'}`}><p className="font-bold">{item.customerName}</p><p className="truncate text-xs opacity-70">{item.messages.at(-1)?.body ?? 'No messages yet'}</p></button>)}
        </div>
        <div className="flex min-w-0 flex-col">
          {selected ? <>
            <div className="flex items-center justify-between gap-3 border-b border-[#e3ece7] p-4"><div><p className="font-bold">{selected.customerName}</p><p className="text-xs text-[#60757b]">{selected.customerEmail}</p></div><span className="rounded-full bg-[#eaf5f0] px-3 py-1 text-xs font-bold text-[#2f765b]">Active conversation</span></div>
            <div className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto bg-[#fbfcfa] p-5">{selected.messages.map((message: ChatMessage) => <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.senderRole === 'CUSTOMER' ? 'self-start bg-white text-[#153443]' : 'self-end bg-[#153443] text-white'}`}>{message.messageType === 'AUDIO' && message.audioPath ? <VoiceMessagePlayer src={`/api/chat/audio/file?pathname=${encodeURIComponent(message.audioPath)}`} durationSeconds={message.durationSeconds} compact /> : <p>{message.body}</p>}<div className="mt-1 flex items-center justify-between gap-3"><time className="text-[11px] opacity-60">{new Date(message.createdAt).toLocaleString()}</time><details className="relative"><summary className="list-none cursor-pointer opacity-60 hover:opacity-100" aria-label="Message options">•••</summary><div className="absolute bottom-5 right-0 z-10 w-40 rounded-xl border border-[#dbe7e0] bg-white p-1 text-left text-[#153443] shadow-lg"><button type="button" onClick={() => removeMessage(message.id, 'ONLY_ME')} className="block w-full rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#f5f8f6]">Delete for me</button><button type="button" onClick={() => removeMessage(message.id, 'EVERYONE')} className="block w-full rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#fff1f1] hover:text-[#c84b4b]">Delete for everyone</button></div></details></div></div>)}</div>
            <div className="border-t border-[#e3ece7] p-4"><div className="flex gap-2"><label htmlFor="admin-message" className="sr-only">Reply to client</label><textarea id="admin-message" value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder="Write a reply to this client…" className="min-w-0 flex-1 resize-none rounded-2xl border border-[#d5e2dc] px-4 py-3 text-sm outline-none focus:border-[#f5b841]" disabled={pending} /><VoiceMessageRecorder onUploaded={addVoice} disabled={pending} /><button type="button" onClick={send} disabled={pending || !draft.trim()} className="self-end rounded-2xl bg-[#f5b841] p-3 text-[#153443] disabled:opacity-50" aria-label="Send reply"><Send /></button></div>{error && <p className="mt-2 text-sm text-[#b33a3a]">{error}</p>}</div>
          </> : <div className="m-auto p-8 text-center text-sm text-[#60757b]">{error || 'Select a client conversation to reply.'}</div>}
        </div>
      </div>
    </section>
  )
}
