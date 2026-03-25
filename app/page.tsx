"use client"

import dynamic from "next/dynamic"
import PlayButton from "@/components/PlayButton"
import Image from "next/image"
import { useState } from "react"

const AudioRecorder = dynamic(() => import("@/components/RecordButton"), {
  ssr: false,
})

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col gap-12 py-12 items-center">
      <Image
        src="/title.png"
        alt="ロゴ"
        width={200}
        height={200}
      ></Image>
      <div className="grid grid-cols-4 gap-8">
        {[...Array(12).keys()].map((i) => (
          <PlayButton key={i} />
        ))}
      </div>
      <AudioRecorder />
    </div>
  )
}
