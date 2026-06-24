import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import { put } from "@vercel/blob"

// @vercel/blob の put メソッドをモックする
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}))

describe("POST /api", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("正常系: 送信された音声を @vercel/blob にアップロードし、メタデータを返すこと", async () => {
    // モックの put メソッドの戻り値
    vi.mocked(put).mockResolvedValue({
      url: "https://example.com/coughs/mock-url.webm",
      pathname: "coughs/mock-url.webm",
      contentType: "audio/webm",
      contentDisposition: "inline",
      size: 1024,
      uploadedAt: new Date(),
    })

    // ダミーの WebM 音声データを作成
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "audio/webm" })
    const file = new File([blob], "recording.webm", { type: "audio/webm" })

    // FormData を構築
    const formData = new FormData()
    formData.append("audio", file)

    // Request オブジェクトを作成
    const request = new Request("https://example.com/api", {
      method: "POST",
      body: formData,
    })
    request.formData = async () => formData

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(data.filename).toBeDefined()
    expect(data.path).toContain("coughs/")
    expect(data.mimeType).toBe("audio/webm")
    expect(data.size).toBe(4)

    // put が正しい引数で呼ばれたか
    expect(put).toHaveBeenCalledWith(
      expect.stringContaining("coughs/"),
      expect.any(Buffer),
      { access: "public" }
    )
  })

  it("異常系: audio フィールドが存在しない場合に 400 エラーを返すこと", async () => {
    // 空の FormData
    const formData = new FormData()

    const request = new Request("https://example.com/api", {
      method: "POST",
      body: formData,
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBe("audio ファイルが見つかりません")
  })

  it("異常系: アップロード中に例外が発生した場合に 500 エラーを返すこと", async () => {
    // put メソッドが例外を投げるように設定
    vi.mocked(put).mockRejectedValue(new Error("Upload failed"))

    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "audio/webm" })
    const file = new File([blob], "recording.webm", { type: "audio/webm" })

    const formData = new FormData()
    formData.append("audio", file)

    const request = new Request("https://example.com/api", {
      method: "POST",
      body: formData,
    })

    // console.error の出力を抑制
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBe("サーバー保存に失敗しました")
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
