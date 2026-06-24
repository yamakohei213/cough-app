import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import PlayButton from "./PlayButton"

describe("PlayButton Component", () => {
  const defaultProps = {
    index: 0,
    isActive: false,
    isPlaying: false,
    currentTime: 0,
    duration: 5,
    onPlayPause: vi.fn(),
  }

  it("正しいインデックスを含む aria-label でレンダリングされること", () => {
    render(<PlayButton {...defaultProps} />)
    const button = screen.getByRole("button", { name: "咳音声を再生 (番号: 1)" })
    expect(button).toBeInTheDocument()
  })

  it("非アクティブのときは Play アイコンが表示されること", () => {
    const { container } = render(<PlayButton {...defaultProps} />)
    // svg 要素が存在することを確認
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    // 非アクティブ時は、PlayButton 内の Lucide-Play アイコンが表示される
    expect(container.querySelector(".lucide-play")).toBeInTheDocument()
    expect(container.querySelector(".lucide-pause")).not.toBeInTheDocument()
  })

  it("アクティブかつ再生中のときは Pause アイコンが表示されること", () => {
    const { container } = render(
      <PlayButton {...defaultProps} isActive={true} isPlaying={true} />
    )
    expect(container.querySelector(".lucide-pause")).toBeInTheDocument()
    expect(container.querySelector(".lucide-play")).not.toBeInTheDocument()
  })

  it("アクティブだが停止中のときは Play アイコンが表示されること", () => {
    const { container } = render(
      <PlayButton {...defaultProps} isActive={true} isPlaying={false} />
    )
    expect(container.querySelector(".lucide-play")).toBeInTheDocument()
    expect(container.querySelector(".lucide-pause")).not.toBeInTheDocument()
  })

  it("クリックされたときに onPlayPause コールバックが呼ばれること", () => {
    const onPlayPause = vi.fn()
    render(<PlayButton {...defaultProps} onPlayPause={onPlayPause} />)
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(onPlayPause).toHaveBeenCalledTimes(1)
  })

  it("アクティブなときは進捗バーが表示され、正しい幅で計算されること", () => {
    render(
      <PlayButton {...defaultProps} isActive={true} currentTime={2.5} duration={10} />
    )
    // 進捗バー（%表示）が 25% であることを確認する
    const progressBar = screen.getByTestId("progress-bar")
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveStyle("width: 25%")
  })

  it("非アクティブなときは進捗バーが表示されないこと", () => {
    render(<PlayButton {...defaultProps} isActive={false} />)
    const progressBar = screen.queryByTestId("progress-bar")
    expect(progressBar).not.toBeInTheDocument()
  })
})
