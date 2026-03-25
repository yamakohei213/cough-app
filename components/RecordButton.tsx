"use client"

import { useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"

type UploadResponse = {
  ok: boolean
  filename?: string
  path?: string
  error?: string
}

export default function RecordButton() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [blobData, setBlobData] = useState<Blob>()

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

  const tryUploading = async (blob: Blob) => {
    try {
      setUploading(true)
      setMessage("")
      const result = await uploadAudio(blob)
      setMessage(`保存完了: ${result.filename}`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存に失敗しました")
    } finally {
      setUploading(false)
    }
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
        popover=""
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
