"use client"

import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayButtonProps {
  index: number
  isActive: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
}

export default function PlayButton({
  index,
  isActive,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
}: PlayButtonProps) {
  // Calculate percentage for the progress bar
  const progressPercent = isActive && duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <button
      onClick={onPlayPause}
      className={cn(
        "group relative flex items-center justify-center w-20 h-20 rounded-2xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 overflow-hidden",
        isActive
          ? "border-primary/40 ring-2 ring-primary/20 bg-primary/[0.02]"
          : "border-border hover:border-primary/30"
      )}
      aria-label={`咳音声を再生 (番号: ${index + 1})`}
    >
      {/* Subtle pulse background when actively playing */}
      {isActive && isPlaying && (
        <div className="absolute inset-0 bg-primary/[0.04] animate-pulse pointer-events-none" />
      )}

      {/* Play/Pause Button Icon */}
      <div
        className={cn(
          "rounded-full p-3 transition-all duration-300 flex items-center justify-center",
          isActive
            ? "bg-primary text-primary-foreground scale-105 shadow-sm"
            : "bg-muted text-primary group-hover:bg-muted/80 group-hover:scale-110"
        )}
      >
        {isActive && isPlaying ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 fill-current translate-x-[0.5px]" />
        )}
      </div>

      {/* Progress Bar overlay on active card */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/80">
          <div
            data-testid="progress-bar"
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </button>
  )
}

