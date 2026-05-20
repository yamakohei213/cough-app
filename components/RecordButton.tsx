"use client"

import { useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"
import { Mic, RotateCw, Upload, Check } from "lucide-react"
import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

type UploadResponse = {
  ok: boolean
  filename?: string
  path?: string
  error?: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

const recordingLimitMS = 10000

export default function RecordButton({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [blobData, setBlobData] = useState<Blob>()

  const tryUploading = async (blob: Blob) => {
    try {
      setUploadStatus("uploading")
      const result = await uploadAudio(blob)
      setUploadStatus("success")
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (e) {
      setUploadStatus("error")
    }
  }

  const uploadAudio = async (blob: Blob) => {
    const formData = new FormData()

    const ext = blob.type.includes("webm")
      ? "webm"
      : blob.type.includes("ogg")
        ? "ogg"
        : blob.type.includes("mp4")
          ? "m4a"
          : "bin"

    formData.append("audio", blob, `recording-${Date.now()}.${ext}`)

    const res = await fetch("/api", {
      method: "POST",
      body: formData,
    })

    const data = (await res.json()) as UploadResponse

    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? "アップロードに失敗しました")
    }

    return data
  }

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      blobPropertyBag: { type: "audio/webm" },
      onStart() {
        setUploadStatus("idle")
        // setTimeout(() => stopRecording(), recordingLimitMS)
      },
      onStop(_blobUrl, blob) {
        setBlobData(blob)
      },
    })

  return (
    // <Tooltip>
    //   <TooltipTrigger asChild>
    //     {status == "recording" ? (
    //       <Button
    //         variant={"outline"}
    //         className="size-24 rounded-full"
    //         onClick={stopRecording}
    //       >
    //         <Check className="size-10 text-green-600"></Check>
    //       </Button>
    //     ) : (
    //       <Button
    //         variant={"outline"}
    //         className="size-24 rounded-full"
    //         onClick={startRecording}
    //       >
    //         <Mic className="size-10 text-red-600"></Mic>
    //       </Button>
    //     )}
    //   </TooltipTrigger>
    //   <TooltipContent side="bottom">Start Recording</TooltipContent>
    // </Tooltip>

    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="size-24 rounded-full"
          onClick={startRecording}
        >
          <Mic className="size-12 text-red-600"></Mic>
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>
            {status == "stopped" ? "Successfully recorded" : "Recording…"}
          </DialogTitle>
        </DialogHeader>
        {status == "stopped" && (
          <audio
            controls
            src={mediaBlobUrl}
          ></audio>
        )}
        <div className="flex gap-6">
          {status == "stopped" ? (
            <div className="flex gap-3">
              <Button onClick={startRecording}>
                <RotateCw />
                Re-record
              </Button>
              {uploadStatus == "idle" && (
                <Button onClick={() => blobData && tryUploading(blobData)}>
                  <Upload />
                  Upload
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={stopRecording}>Stop</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
