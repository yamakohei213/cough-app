"use client"

import dynamic from "next/dynamic"
import PlayButton from "@/components/PlayButton"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Disc, Cloud, Calendar, Database, RefreshCw, AudioLines } from "lucide-react"

// Types for cough audio
interface Cough {
  url: string
  pathname: string
  uploadedAt: string
  size: number
}

const AudioRecorder = dynamic(() => import("@/components/RecordButton"), {
  ssr: false,
})

export default function Home() {
  const [coughs, setCoughs] = useState<Cough[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Audio Playback State
  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch cough files from API
  const fetchCoughs = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/coughs")
      const data = await res.json()
      if (data.ok && Array.isArray(data.coughs)) {
        // Sort coughs by uploaded time descending (newest first)
        const sortedCoughs = [...data.coughs].sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        setCoughs(sortedCoughs)
        setError(null)
      } else {
        setError(data.error || "音声ファイルの取得に失敗しました。")
      }
    } catch (err) {
      console.error(err)
      setError("ネットワークエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchCoughs()
  }, [])

  // Audio Play/Pause trigger handler
  const handlePlayPause = (url: string) => {
    if (!audioRef.current) return

    if (activeUrl === url) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((err) => console.error("Playback failed:", err))
      }
    } else {
      // Pause current
      audioRef.current.pause()
      setCurrentTime(0)
      setDuration(0)
      setActiveUrl(url)
    }
  }

  // Handle active URL change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (activeUrl) {
      audio.src = activeUrl
      audio.load()

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.error("Playback start error:", err)
            setIsPlaying(false)
          })
      }
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [activeUrl])

  // Set up audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setActiveUrl(null)
      setCurrentTime(0)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [])

  // Format date helper for stats
  const getLatestUploadDate = () => {
    if (coughs.length === 0) return "なし"
    try {
      const dates = coughs.map((c) => new Date(c.uploadedAt).getTime())
      const maxDate = new Date(Math.max(...dates))
      return maxDate.toLocaleDateString("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "不明"
    }
  }

  return (
    <div className="min-h-screen flex flex-col gap-10 py-12 px-4 md:px-8 max-w-5xl mx-auto items-center selection:bg-primary/10">
      {/* Hidden Global Audio Element */}
      <audio ref={audioRef} preload="auto" />

      {/* Header Logo & Title */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative group transition-transform duration-300 hover:scale-105">
          <Image
            src="/title.png"
            alt="ロゴ"
            width={180}
            height={180}
            className="drop-shadow-md rounded-2xl"
            priority
          />
        </div>
        <div className="space-y-1 mt-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-neutral-700 bg-clip-text text-transparent">
            Cough Sound Dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Vercel Blob クラウドストレージ上の咳音声をリアルタイム再生 & 録音管理
          </p>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-2xl border border-border/80">
        <div className="flex items-center gap-3 px-3 py-1">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Disc className="size-4 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Coughs</p>
            <p className="text-lg font-bold font-mono">{loading ? "..." : coughs.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Cloud className="size-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Storage</p>
            <p className="text-sm font-bold truncate max-w-[120px]">Vercel Blob</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Calendar className="size-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Latest Rec</p>
            <p className="text-sm font-bold">{loading ? "..." : getLatestUploadDate()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Database className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">API Status</p>
              <p className="text-sm font-bold text-green-600">Active</p>
            </div>
          </div>
          <button
            onClick={fetchCoughs}
            disabled={loading}
            className="p-2 hover:bg-muted active:scale-95 transition-all rounded-lg text-muted-foreground hover:text-foreground shrink-0 cursor-pointer disabled:opacity-50"
            title="リロード"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="w-full p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Cough grid or loading skeletons */}
      <div className="w-full min-h-[300px]">
        {loading ? (
          // Premium pulsing skeleton loader grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9).keys()].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted/40 animate-pulse rounded-xl border border-border/60 flex items-center p-4 gap-4"
              >
                <div className="size-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : coughs.length === 0 ? (
          // Premium empty state
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10 gap-3">
            <div className="p-4 bg-muted rounded-full">
              <AudioLines className="size-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">音声ファイルがありません</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                下のマイクボタンを押して、初めての咳音声を録音・アップロードしてみましょう！
              </p>
            </div>
          </div>
        ) : (
          // Dynamic cough card grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coughs.map((cough, index) => (
              <PlayButton
                key={cough.url}
                cough={cough}
                index={index}
                isActive={activeUrl === cough.url}
                isPlaying={isPlaying && activeUrl === cough.url}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={() => handlePlayPause(cough.url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating or fixed centered action button for recording */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <AudioRecorder onUploadSuccess={fetchCoughs} />
        <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
          Record New Cough
        </span>
      </div>
    </div>
  )
}
