"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { MessageCircle, Send, ShieldCheck } from "lucide-react";
import {
  deleteChatMessage,
  getSupportConversation,
  sendSupportMessage,
  sendVoiceMessage,
  type SupportConversation,
} from "@/app/actions/chat";
import { VoiceMessagePlayer } from "@/components/voice-message-player";
import { VoiceMessageRecorder } from "@/components/voice-message-recorder";

type ChatMessage = {
  id: string;
  body: string;
  senderRole: string;
  messageType?: string;
  audioPath?: string | null;
  durationSeconds?: number | null;
  createdAt: Date | string;
};

export function SupportChat() {
  const router = useRouter();
  const [conversation, setConversation] = useState<SupportConversation | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [recorderState, setRecorderState] = useState<
    "idle" | "recording" | "preview" | "uploading"
  >("idle");

  function checkAuth() {
    if (!conversation?.ok) {
      router.push("/sign-in?next=/support");
      return false;
    }
    return true;
  }

  function loadConversation() {
    startTransition(async () => {
      const result = await getSupportConversation();
      setConversation((current) => {
        if (
          !result.ok ||
          !current?.ok ||
          current.conversation.id !== result.conversation.id
        )
          return result;
        return { ...result, messages: result.messages };
      });
    });
  }

  useEffect(() => {
    loadConversation();
  }, []);

  function addVoice(audioPath: string, durationSeconds: number) {
    if (!checkAuth()) return;
    if (!conversation?.ok) return;
    startTransition(async () => {
      const result = await sendVoiceMessage({
        conversationId: conversation.conversation.id,
        audioPath,
        durationSeconds,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConversation({
        ...conversation,
        messages: [...conversation.messages, result.message],
      });
    });
  }

  function removeMessage(messageId: string, scope: "ONLY_ME" | "EVERYONE") {
    if (
      !conversation?.ok ||
      !window.confirm(
        scope === "EVERYONE"
          ? "Delete this message for everyone?"
          : "Delete this message for you?",
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteChatMessage(messageId, scope);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConversation((current) =>
        current?.ok
          ? {
              ...current,
              messages: current.messages.filter(
                (message) => message.id !== messageId,
              ),
            }
          : current,
      );
    });
  }

  function send() {
    if (!checkAuth()) return;
    const body = draft.trim();
    if (!body || !conversation?.ok) return;
    setError("");
    startTransition(async () => {
      const result = await sendSupportMessage({
        conversationId: conversation.conversation.id,
        body,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConversation({
        ...conversation,
        messages: [...conversation.messages, result.message],
      });
      setDraft("");
    });
  }

  return (
    <section
      className="mt-8 overflow-hidden rounded-3xl border border-[#e3ece7] bg-white shadow-sm"
      aria-labelledby="support-chat-title"
    >
      <div className="flex items-center gap-3 border-b border-[#e3ece7] p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eaf5f0] text-[#2f765b]">
          <MessageCircle />
        </div>
        <div>
          <h2 id="support-chat-title" className="font-bold">
            Chat with HunarLink
          </h2>
          <p className="text-sm text-[#60757b]">
            A real support conversation saved to your account.
          </p>
        </div>
      </div>
      <div className="flex min-h-48 flex-col gap-3 bg-[#fbfcfa] p-5">
        {!conversation && (
          <p className="text-sm text-[#60757b]">
            Loading your secure support chat…
          </p>
        )}
        {conversation && !conversation.ok && (
          <div className="mx-auto my-4 w-full max-w-md rounded-3xl border border-[#e3ece7] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#eaf5f0] text-[#2f765b]">
              <ShieldCheck />
            </div>
            <h3 className="mt-4 text-lg font-black text-[#153443]">
              Sign in to start chatting
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#60757b]">
              Your support conversation is private and saved to your account.
              Sign in or create an account before sending messages.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a
                href="/sign-in?next=/support"
                className="inline-flex items-center justify-center rounded-xl bg-[#153443] px-5 py-3 text-sm font-black text-white transition hover:bg-[#214b5d]"
              >
                Sign in
              </a>
              <a
                href="/sign-up?next=/support"
                className="inline-flex items-center justify-center rounded-xl border border-[#d5e2dc] px-5 py-3 text-sm font-black text-[#153443] transition hover:border-[#f5b841]"
              >
                Create account
              </a>
            </div>
          </div>
        )}
        {conversation?.ok && conversation.messages.length === 0 && (
          <div className="my-auto text-center text-sm text-[#60757b]">
            <ShieldCheck className="mx-auto mb-2 text-[#2f765b]" />
            Tell us what you need help with and our team will respond here.
          </div>
        )}
        {conversation?.ok &&
          conversation.messages.map((message: ChatMessage) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.senderRole === "CUSTOMER" ? "self-end bg-[#153443] text-white" : "self-start border border-[#e3ece7] bg-white text-[#153443]"}`}
            >
              {message.messageType === "AUDIO" && message.audioPath ? (
                <VoiceMessagePlayer
                  src={`/api/chat/audio/file?pathname=${encodeURIComponent(message.audioPath)}`}
                  durationSeconds={message.durationSeconds}
                  compact
                />
              ) : (
                <p>{message.body}</p>
              )}
              <div className="mt-1 flex items-center justify-between gap-3">
                <time className="text-[11px] opacity-60">
                  {new Date(message.createdAt).toLocaleString()}
                </time>
                <details className="relative">
                  <summary
                    className="list-none cursor-pointer opacity-60 hover:opacity-100"
                    aria-label="Message options"
                  >
                    •••
                  </summary>
                  <div className="absolute bottom-5 right-0 z-10 w-40 rounded-xl border border-[#dbe7e0] bg-white p-1 text-left text-[#153443] shadow-lg">
                    <button
                      type="button"
                      onClick={() => removeMessage(message.id, "ONLY_ME")}
                      className="block w-full rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#f5f8f6]"
                    >
                      Delete for me
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMessage(message.id, "EVERYONE")}
                      className="block w-full rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#fff1f1] hover:text-[#c84b4b]"
                    >
                      Delete for everyone
                    </button>
                  </div>
                </details>
              </div>
            </div>
          ))}
      </div>
      {conversation?.ok && (
        <div className="border-t border-[#e3ece7] p-4">
          <div className="flex items-end gap-2">
            {recorderState === "idle" && (
              <>
                <label htmlFor="support-message" className="sr-only">
                  Message HunarLink
                </label>
                <textarea
                  id="support-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing &&
                      event.keyCode !== 229
                    ) {
                      event.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Write to the HunarLink team…"
                  rows={2}
                  className="min-w-0 flex-1 resize-none rounded-2xl border border-[#d5e2dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#f5b841]"
                  disabled={pending}
                />
              </>
            )}
            <div className="flex items-end gap-2">
              <VoiceMessageRecorder onUploaded={addVoice} disabled={pending} onStateChange={setRecorderState} onAuthCheck={checkAuth} />
              {recorderState === "idle" && (
                <button
                  type="button"
                  onClick={send}
                  disabled={pending || !draft.trim()}
                  className="rounded-2xl bg-[#f5b841] p-3 text-[#153443] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send />
                </button>
              )}
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-[#b33a3a]">{error}</p>}
          <p className="mt-2 text-xs text-[#60757b]">
            Press Enter to send. Use Shift + Enter for a new line.
          </p>
        </div>
      )}
    </section>
  );
}
