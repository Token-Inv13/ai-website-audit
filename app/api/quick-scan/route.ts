import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { runQuickSeoScan } from "@/lib/quickScan"

interface QuickScanRequestBody {
  url?: string
}

export const runtime = "nodejs"

function normalizeUrl(value?: string): string {
  const trimmed = value?.trim() ?? ""

  if (!trimmed) {
    throw new Error("Invalid URL provided.")
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  let parsed: URL

  try {
    parsed = new URL(withProtocol)
  } catch {
    throw new Error("Invalid URL provided.")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Invalid URL provided.")
  }

  return parsed.toString()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuickScanRequestBody
    const normalizedUrl = normalizeUrl(body.url)

    const result = await runQuickSeoScan(normalizedUrl)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = getErrorMessage(error, "Internal server error")
    console.error("POST /api/quick-scan failed:", {
      message,
      error,
    })

    if (message.includes("Invalid URL")) {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 })
    }

    if (message.includes("Unable to fetch website")) {
      return NextResponse.json(
        { error: "Website is unreachable or blocked." },
        { status: 502 },
      )
    }

    return NextResponse.json({ error: "Quick scan failed." }, { status: 500 })
  }
}
