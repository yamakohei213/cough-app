import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs"

function extFromMimeOrName(mimeType: string, originalName: string) {
	if (mimeType.includes('webm')) return 'webm';
	if (mimeType.includes('ogg')) return 'ogg';
	if (mimeType.includes('wav')) return 'wav';
	if (mimeType.includes('mp4') || mimeType.includes('mpeg')) return 'm4a';

	const dot = originalName.lastIndexOf('.')
	if (dot >= 0) return originalName.slice(dot + 1).toLowerCase

	return "bin"
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData()
		const file = formData.get("audio")

		if (!file || typeof file === "string") {
			return NextResponse.json(
				{ ok: false, error: "audio ファイルが見つかりません" },
				{ status: 400 }
			)
		}

		const arrayBuffer = await file.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)


		const ext = extFromMimeOrName(file.type, file.name || "audio.bin")
		const filename = `${Date.now()}-${randomUUID()}.${ext}`
		const savePath = path.join("coughs", filename)

		const { url } = await put(savePath, buffer, { access: "public" })
		console.log(url)

		return NextResponse.json({
			ok: true,
			filename,
			path: savePath,
			mimeType: file.type,
			size: file.size,
		});
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ ok: false, error: "サーバー保存に失敗しました" },
			{ status: 500 }
		)
	}
}