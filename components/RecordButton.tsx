"use client"
import { CircleStop, Loader2, Mic, RotateCw, Upload } from "lucide-react"
import { useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

type UploadResponse = {
  ok: boolean
  filename?: string
  path?: string
  error?: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

const recordingLimitMS = 10000

export default function RecordButton({
  onUploadSuccess,
}: {
  onUploadSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [blobData, setBlobData] = useState<Blob>()
  const [errorMessage, setErrorMessage] = useState<string>("")

  const tryUploading = async (blob: Blob) => {
    try {
      setUploadStatus("uploading")
      setErrorMessage("")
      const result = await uploadAudio(blob)
      setUploadStatus("success")
      if (onUploadSuccess) {
        onUploadSuccess()
      }
      setOpen(false)
    } catch (e) {
      setUploadStatus("error")
      if (e instanceof Error) {
        setErrorMessage(e.message)
      } else {
        setErrorMessage("アップロードに失敗しました。")
      }
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      if (status === "recording") {
        stopRecording()
      }
      setUploadStatus("idle")
      setBlobData(undefined)
      setErrorMessage("")
    }
  }

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

    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
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
        showCloseButton={uploadStatus !== "uploading"}
      >
        <DialogHeader>
          <DialogTitle>
            {status == "stopped" ? "録音が完了しました" : "録音中…"}
          </DialogTitle>
        </DialogHeader>
        {status == "stopped" && (
          <audio
            controls
            src={mediaBlobUrl}
          ></audio>
        )}
        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg font-medium">
            {errorMessage}
          </div>
        )}
        <div className="flex gap-6">
          {status == "stopped" ? (
            <div className="flex gap-3">
              <Button
                onClick={startRecording}
                disabled={uploadStatus === "uploading"}
              >
                <RotateCw />
                録音し直す
              </Button>
              {uploadStatus === "uploading" ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  アップロード中…
                </Button>
              ) : (
                (uploadStatus === "idle" || uploadStatus === "error") && (
                  <Button onClick={() => blobData && tryUploading(blobData)}>
                    <Upload />
                    アップロード
                  </Button>
                )
              )}
            </div>
          ) : (
            <Button onClick={stopRecording}>
              <CircleStop />
              停止
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
