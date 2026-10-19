'use client'

import { useState, useTransition } from 'react'
import { addProjectImage } from '@/app/actions/projects'

export function ProjectImageUploader({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  async function upload(file: File) {
    setMessage('Uploading…')
    const body = new FormData(); body.append('file', file)
    const response = await fetch('/api/admin/project-upload', { method: 'POST', body })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error ?? 'Upload failed'); return }
    setUrl(result.url); setMessage('Uploaded. Add alt text and save the image below.')
  }
  function save(form: HTMLFormElement) {
    const data = new FormData(form); data.set('projectId', projectId); data.set('imageUrl', url)
    startTransition(async () => { try { await addProjectImage(data); setMessage('Image saved to project.'); form.reset(); setUrl('') } catch { setMessage('Could not save image.') } })
  }
  return <div className="rounded-2xl border border-[#dce8e1] bg-[#fbfcfa] p-4"><label className="block text-sm font-bold text-[#153443]">Project photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} className="mt-2 block w-full text-sm" /></label>{url && <form onSubmit={(event) => { event.preventDefault(); save(event.currentTarget) }} className="mt-4 grid gap-3 md:grid-cols-3"><select name="imageType" defaultValue="GALLERY" className="rounded-xl border p-3"><option>COVER</option><option>BEFORE</option><option>DURING</option><option>AFTER</option><option>GALLERY</option></select><input name="altText" required placeholder="Descriptive alt text" className="rounded-xl border p-3" /><input name="caption" placeholder="Caption (optional)" className="rounded-xl border p-3" /><button disabled={pending} className="rounded-xl bg-[#2f765b] px-4 py-3 font-bold text-white md:col-span-3">{pending ? 'Saving…' : 'Save photo'}</button></form>}<p className="mt-2 text-xs text-[#60757b]">{message}</p></div>
}
