import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { analyzeCompetition } from "@/lib/workspaceCompetition"

interface CompetitionRequestBody {
  target?: string
  yourUrl?: string
}

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompetitionRequestBody

    if (!body.target?.trim()) {
      return NextResponse.json(
        { error: "Please enter a competitor domain or keyword." },
        { status: 400 },
      )
    }

    const result = await analyzeCompetition({
      target: body.target,
      yourUrl: body.yourUrl,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = getErrorMessage(error, "Internal server error")
    console.error("POST /api/workspace/competition failed:", {
      message,
      error,
    })

    if (message.toLowerCase().includes("valid competitor domain or keyword")) {
      return NextResponse.json(
        { error: "Please enter a valid competitor domain or keyword." },
        { status: 400 },
      )
    }

    if (message.toLowerCase().includes("fetch")) {
      return NextResponse.json(
        { error: "Unable to analyze that page right now." },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { error: "Competition analysis failed." },
      { status: 500 },
    )
  }
}
