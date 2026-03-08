import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { listRecentAudits } from "@/lib/auditStore"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limitParam = Number(url.searchParams.get("limit") ?? "20")
    const audits = await listRecentAudits(limitParam)

    return NextResponse.json({ audits }, { status: 200 })
  } catch (error) {
    console.error("GET /api/audits failed:", {
      message: getErrorMessage(error, "Internal server error"),
      error,
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
