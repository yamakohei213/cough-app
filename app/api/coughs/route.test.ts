import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "./route"
import { list } from "@vercel/blob"

// @vercel/blob の list メソッドをモックする
vi.mock("@vercel/blob", () => ({
  list: vi.fn(),
}))

describe("GET /api/coughs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("正常系: 咳音声ファイルの一覧を正常に取得できること", async () => {
    // モックデータの設定
    const mockBlobs = [
      { url: "https://example.com/cough1.mp3", pathname: "coughs/cough1.mp3" },
      { url: "https://example.com/cough2.webm", pathname: "coughs/cough2.webm" },
    ]
    vi.mocked(list).mockResolvedValue({
      blobs: mockBlobs,
      cursor: undefined,
      hasMore: false,
    } as any)

    const response = await GET()
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(data.coughs).toEqual([
      { url: "https://example.com/cough1.mp3", pathname: "coughs/cough1.mp3" },
      { url: "https://example.com/cough2.webm", pathname: "coughs/cough2.webm" },
    ])
    expect(list).toHaveBeenCalledWith({ prefix: "coughs/" })
  })

  it("異常系: @vercel/blob でエラーが発生した場合に 500 エラーを返すこと", async () => {
    vi.mocked(list).mockRejectedValue(new Error("Database error"))

    // console.error の出力を抑制し、テストログを綺麗に保つ
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const response = await GET()
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBe("咳音声の一覧取得に失敗しました")
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
