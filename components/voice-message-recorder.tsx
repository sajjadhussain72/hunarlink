"use client";

import { Mic, RotateCcw, Send, Square, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;
const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
];

function extensionFor(type: string) {
  const base = type.split(";")[0];
  return base === "audio/ogg"
    ? "ogg"
    : base === "audio/mp4"
      ? "mp4"
      : base === "audio/mpeg"
        ? "mp3"
        : "webm";
}

export function VoiceMessageRecorder({
  onUploaded,
  disabled,
  onStateChange,
  onAuthCheck,
}: {
  onUploaded: (audioPath: string, durationSeconds: number) => void;
  disabled?: boolean;
  onStateChange?: (state: "idle" | "recording" | "preview" | "uploading") => void;
  onAuthCheck?: () => boolean;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const [state, setState] = useState<
    "idle" | "recording" | "preview" | "uploading"
  >("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audio, setAudio] = useState<{
    blob: Blob;
    url: string;
    duration: number;
    mimeType: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audio) URL.revokeObjectURL(audio.url);
    },
    [audio],
  );
  useEffect(() => {
    if (state !== "recording") return;
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)),
      250,
    );
    return () => window.clearInterval(timer);
  }, [state]);
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  function clearAudio() {
    if (audio) URL.revokeObjectURL(audio.url);
    setAudio(null);
    setElapsed(0);
    setError("");
    setState("idle");
  }

  async function start() {
    if (onAuthCheck && !onAuthCheck()) return;
    setError("");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType =
        MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setError("The browser could not record audio.");
        setState("idle");
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const actualType =
          recorder.mimeType ||
          mimeType ||
          chunksRef.current[0]?.type ||
          "audio/webm";
        const blob = new Blob(chunksRef.current, { type: actualType });
        if (!blob.size) {
          setError("No audio was recorded. Please try again.");
          setState("idle");
          return;
        }
        if (blob.size > MAX_BYTES) {
          setError(
            "Recording is larger than 10 MB. Please record a shorter message.",
          );
          setState("idle");
          return;
        }
        const duration = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        setAudio({
          blob,
          url: URL.createObjectURL(blob),
          duration,
          mimeType: actualType,
        });
        setElapsed(duration);
        setState("preview");
      };
      recorderRef.current = recorder;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      setElapsed(0);
      recorder.start(250);
      setState("recording");
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow microphone access and try again."
          : "Microphone access is unavailable.",
      );
      setState("idle");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.requestData();
      recorderRef.current.stop();
    }
  }

  async function upload() {
    if (!audio || state !== "preview") return;
    setError("");
    setState("uploading");
    try {
      const formData = new FormData();
      formData.append(
        "file",
        audio.blob,
        `voice-message.${extensionFor(audio.mimeType)}`,
      );
      const response = await fetch("/api/chat/audio", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.pathname)
        throw new Error(result.error ?? "Upload failed.");
      onUploaded(result.pathname, audio.duration);
      clearAudio();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
      setState("preview");
    }
  }

  if (state === "idle")
    return (
      <button
        type="button"
        onClick={start}
        disabled={disabled}
        className="rounded-2xl border border-[#d5e2dc] p-3 text-[#153443] disabled:opacity-50 h-12"
        aria-label="Record voice message"
      >
        <Mic className="size-4" />
      </button>
    );
  if (state === "recording")
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 rounded-full bg-[#fff1f1] px-3 py-2 text-xs font-bold text-[#c84b4b]">
          <span className="size-2 animate-pulse rounded-full bg-[#c84b4b]" />
          Recording {Math.floor(elapsed / 60)}:
          {String(elapsed % 60).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => { stop(); upload(); }}
          className="rounded-xl bg-[#f5b841] px-3 py-2 text-xs font-black text-[#153443]"
        >
          <Send className="mr-1 inline size-3" />
          Send
        </button>
        <button
          type="button"
          onClick={clearAudio}
          className="rounded-xl border border-[#d5e2dc] px-3 py-2 text-xs font-bold"
        >
          Cancel
        </button>
      </div>
    );
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e8e4dd] bg-[#fffdfa] p-1.5">
      <div className="max-w-[230px]">
        <audio
          controls
          preload="metadata"
          src={audio?.url}
          className="h-8 max-w-[100px]"
          aria-label="Recorded voice preview"
        />
      </div>
      <span className="text-xs font-bold text-[#60757b]">
        {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={upload}
        disabled={state === "uploading"}
        className="rounded-xl bg-[#f5b841] px-3 py-2 text-xs font-black text-[#153443] disabled:opacity-50"
      >
        {state === "uploading" ? (
          <>
            <Upload className="mr-1 inline size-3 animate-pulse" />
            Uploading
          </>
        ) : (
          <>
            <Send className="mr-1 inline size-3" />
            Send
          </>
        )}
      </button>
      <button
        type="button"
        onClick={clearAudio}
        disabled={state === "uploading"}
        className="rounded-xl border border-[#d5e2dc] p-2"
        aria-label="Discard voice message"
      >
        <Trash2 className="size-4" />
      </button>
      {error && (
        <span className="basis-full text-xs text-[#b33a3a]">{error}</span>
      )}
      <button
        type="button"
        onClick={start}
        disabled={state === "uploading"}
        className="text-xs font-bold text-[#60757b]"
      >
        <RotateCcw className="mr-1 inline size-3" />
        Record again
      </button>
    </div>
  );
}
