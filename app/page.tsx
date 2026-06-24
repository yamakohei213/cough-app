"use client"

import PlayButton from "@/components/PlayButton"
import { AudioLines } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
// Types for cough audio
interface Cough {
  url: string
  pathname: string
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
        const shuffledCoughs = [...data.coughs]
        for (let i = shuffledCoughs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledCoughs[i], shuffledCoughs[j]] = [
            shuffledCoughs[j],
            shuffledCoughs[i],
          ]
        }
        setCoughs(shuffledCoughs)
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

  useEffect(() => {
    fetchCoughs()
  }, [])

  const handlePlayPause = (url: string) => {
    if (!audioRef.current) return

    if (activeUrl === url) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current
          .play()
          .catch((err) => console.error("Playback failed:", err))
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

  return (
    <div className="h-screen flex flex-col gap-10 py-12 px-4 md:px-8 max-w-5xl mx-auto items-center selection:bg-primary/10">
      <audio
        ref={audioRef}
        preload="auto"
      />

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
      </div>

      {error && (
        <div className="w-full p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      <div className="w-full flex justify-center items-end pb-8 lg:pb-12 bg-linear-0 from-white from-20% to-white/0 w-full h-[200px] pointer-events-none">
        <div className="pointer-events-auto">
          <AudioRecorder onUploadSuccess={fetchCoughs} />
        </div>
      </div>

      <div className="w-full min-h-[140px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto w-full">
            {[...Array(6).keys()].map((i) => (
              <div
                key={i}
                className="w-20 h-20 bg-muted/40 animate-pulse rounded-2xl border border-border/60 flex items-center justify-center"
              >
                <div className="size-10 rounded-full bg-muted/60" />
              </div>
            ))}
          </div>
        ) : coughs.length === 0 ? (
          // Premium empty state
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10 gap-3 w-full max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-full">
              <AudioLines className="size-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                音声ファイルがありません
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                下のマイクボタンを押して、初めての咳音声を録音・アップロードしてみましょう！
              </p>
            </div>
          </div>
        ) : (
          // Dynamic cough card grid (flex wrapper for centered circles)
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto w-full">
            {coughs.map((cough, index) => (
              <PlayButton
                key={cough.url}
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
    </div>
  )
}
