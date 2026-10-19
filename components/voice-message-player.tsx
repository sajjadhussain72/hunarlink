'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const bars = [8, 13, 18, 11, 24, 16, 28, 20, 32, 17, 25, 14, 30, 21, 35, 19, 27, 12, 22, 16, 29, 18, 24, 10, 20, 14, 26, 17, 31, 12, 22, 15, 27, 18, 23, 11, 19, 14, 25, 17, 29, 12, 21, 16, 26, 13, 23, 10, 18, 14, 22]

export function VoiceMessagePlayer({ src, durationSeconds, compact = false }: { src: string; durationSeconds?: number | null; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)
  const [error, setError] = useState('')

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const update = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    const ended = () => { setPlaying(false); setProgress(0) }
    audio.addEventListener('timeupdate', update); audio.addEventListener('ended', ended)
    return () => { audio.removeEventListener('timeupdate', update); audio.removeEventListener('ended', ended) }
  }, [])

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false); return }
    setError('')
    try { await audio.play(); setPlaying(true) } catch { setPlaying(false); setError('Audio could not be played. Tap again or check your connection.') }
  }

  function handleAudioError() {
    setPlaying(false)
    setError('Voice message unavailable. Please refresh and try again.')
  }

  const seconds = Math.max(0, Math.round(duration || 0))
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  return <div className={`flex items-center gap-3 rounded-2xl border border-[#e8e4dd] bg-white ${compact ? 'px-3 py-2' : 'min-w-[260px] px-3 py-2.5'} text-[#26343b] shadow-[0_1px_3px_rgb(21_52_67/8%)]`}>
    <audio ref={audioRef} src={src} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onError={handleAudioError} className="hidden" />
    <button type="button" onClick={toggle} className="grid size-9 shrink-0 place-items-center rounded-full bg-[#153443] text-white transition hover:bg-[#2f765b]" aria-label={playing ? 'Pause voice message' : 'Play voice message'}>{playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button>
    <div className="min-w-0 flex-1"><div className="flex h-8 items-center gap-[2px]" aria-hidden="true">{bars.map((height, index) => <span key={index} className={`w-[2px] rounded-full transition-colors ${index / bars.length <= progress ? 'bg-[#2f765b]' : 'bg-[#c9c9c9]'}`} style={{ height: `${height}px` }} />)}</div><div className="flex justify-between text-[10px] font-medium text-[#7b8588]"><span>{label}</span><span>Voice message</span></div>{error && <p className="mt-1 text-[10px] font-medium text-[#b33a3a]" role="status">{error}</p>}</div>
  </div>
}
