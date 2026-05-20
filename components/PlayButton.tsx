"use client"

import { CirclePlay, CirclePause } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"

interface PlayButtonProps {
  cough: {
    url: string
    pathname: string
    uploadedAt: string
    size: number
  }
  index: number
  isActive: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
}

export default function PlayButton({
  cough,
  index,
  isActive,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
}: PlayButtonProps) {
  // Format Date (JP format, beautiful and clear)
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "不明な日時"
    }
  }

  // Format Size (Bytes, KB, MB)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // Format Time (mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate percentage for the custom progress bar
  const progressPercent = isActive && duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 border bg-card hover:shadow-md hover:border-primary/40",
        isActive ? "ring-2 ring-primary/30 border-primary/40 shadow-sm" : "border-border"
      )}
    >
      {/* Subtle pulse background when actively playing */}
      {isActive && isPlaying && (
        <div className="absolute inset-0 bg-primary/[0.015] animate-pulse pointer-events-none" />
      )}

      <CardContent className="p-4 flex items-center gap-4">
        {/* Rounded Play/Pause Button */}
        <Button
          size="icon-lg"
          variant={isActive ? "default" : "outline"}
          onClick={onPlayPause}
          className={cn(
            "rounded-full transition-transform active:scale-95 shrink-0 shadow-xs cursor-pointer",
            isActive && isPlaying ? "scale-105" : ""
          )}
        >
          {isActive && isPlaying ? (
            <CirclePause className="size-6 text-primary-foreground" />
          ) : (
            <CirclePlay className={cn("size-6", isActive ? "text-primary-foreground" : "text-primary")} />
          )}
        </Button>

        {/* Cough metadata */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-foreground truncate">
              Cough #{index + 1}
            </span>
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {formatSize(cough.size)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatDate(cough.uploadedAt)}</span>
            {isActive && duration > 0 && (
              <span className="font-mono text-xs text-primary font-semibold">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>
        </div>

        {/* Animated wave bars when playing */}
        {isActive && isPlaying && (
          <div className="flex items-end gap-[3px] h-5 px-1 shrink-0">
            <div className="w-[3px] h-3 bg-primary rounded-full animate-wave-1 origin-bottom" />
            <div className="w-[3px] h-5 bg-primary rounded-full animate-wave-2 origin-bottom" />
            <div className="w-[3px] h-2 bg-primary rounded-full animate-wave-3 origin-bottom" />
            <div className="w-[3px] h-4 bg-primary rounded-full animate-wave-4 origin-bottom" />
          </div>
        )}
      </CardContent>

      {/* Progress Bar overlay on active card */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </Card>
  )
}
