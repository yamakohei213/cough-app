import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
	try {
		const { blobs } = await list({ prefix: "coughs/" })

		const coughs = blobs.map((blob) => ({
			url: blob.url,
			pathname: blob.pathname,
			uploadedAt: blob.uploadedAt,
			size: blob.size,
		}))

		return NextResponse.json({ ok: true, coughs })
	} catch (error) {
		console.error("Failed to list coughs:", error)
		return NextResponse.json(
			{ ok: false, error: "咳音声の一覧取得に失敗しました" },
			{ status: 500 }
		)
	}
}
