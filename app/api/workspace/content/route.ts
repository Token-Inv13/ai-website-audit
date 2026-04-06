import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { improveContent } from "@/lib/workspaceContent"

interface ContentRequestBody {
  sourceText?: string
  focusKeyword?: string
}

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContentRequestBody

    if (!body.sourceText?.trim()) {
      return NextResponse.json(
        { error: "Please paste some text first." },
        { status: 400 },
      )
    }

    const result = await improveContent({
      sourceText: body.sourceText,
      focusKeyword: body.focusKeyword,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = getErrorMessage(error, "Internal server error")
    console.error("POST /api/workspace/content failed:", {
      message,
      error,
    })

    if (message.toLowerCase().includes("paste some text")) {
      return NextResponse.json(
        { error: "Please paste some text first." },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Content improvement failed." },
      { status: 500 },
    )
  }
}
