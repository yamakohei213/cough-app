"use client"

import { useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"

type UploadResponse = {
  ok: boolean
  filename?: string
  path?: string
  error?: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

const popoverElement = document.getElementById("recording-popover")

export default function RecordButton() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [blobData, setBlobData] = useState<Blob>()

  const UploadButton = () => {
    if (uploadStatus == "idle")
      return (
        <div
          className="bg-green-50 rounded-md  ring-1 text-green-700 text-center py-2 cursor-pointer hover:bg-green-600 transition-colors ring-green-700 hover:text-white px-3"
          onClick={() => {
            if (blobData) {
              tryUploading(blobData)
            }
          }}
        >
          ☑️ Upload
        </div>
      )
  }

  const tryUploading = async (blob: Blob) => {
    try {
      setUploadStatus("uploading")
      const result = await uploadAudio(blob)
      setUploadStatus("success")
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

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      blobPropertyBag: { type: "audio/webm" },
      onStop(_blobUrl, blob) {
        setBlobData(blob)
      },
    })

  return (
    <>
      <div className="fixed bottom-0 right-0">{mediaBlobUrl}</div>
      <button
        className="flex items-center gap-4 bg-red-600 before:block before:bg-white before:size-6 before:rounded-full text-white font-semibold py-4 px-6 rounded-lg text-2xl cursor-pointer hover:bg-red-700 transition-colors"
        onClick={startRecording}
        popoverTarget="recording-popover"
        popoverTargetAction="show"
      >
        Record…
      </button>
      <div
        id="recording-popover"
        popover="manual"
        className="fixed inset-0 bg-white-400 p-8 rounded-2xl m-auto backdrop:bg-gray-900/50 space-y-6"
      >
        {status == "stopped" ? (
          <audio
            controls
            src={mediaBlobUrl}
          ></audio>
        ) : (
          <div>Recording…</div>
        )}
        <div className="flex gap-6 font-semibold">
          {status == "stopped" ? (
            <>
              <div
                className="bg-red-50 rounded-md ring-1 text-red-700 text-center py-2 cursor-pointer hover:bg-red-700 transition-colors hover:text-white ring-red-700 px-3"
                onClick={startRecording}
              >
                ↺ Re-record
              </div>
            </>
          ) : (
            <button
              className="bg-red-50 rounded-md ring-1 text-red-700 text-center py-2 cursor-pointer hover:bg-red-700 transition-colors hover:text-white ring-red-700 px-3"
              onClick={stopRecording}
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </>
  )
}
