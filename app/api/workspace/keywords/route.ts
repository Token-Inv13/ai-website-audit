import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { buildKeywordClusters } from "@/lib/workspaceKeywords"
import {
  consumeWorkspaceUsage,
  createWorkspaceVisitorId,
  resolveWorkspaceVisitorId,
  applyWorkspaceVisitorCookie,
} from "@/lib/workspaceServer"

interface KeywordsRequestBody {
  keyword?: string
}

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as KeywordsRequestBody
    const keyword = body.keyword?.trim()

    if (!keyword) {
      return NextResponse.json(
        { error: "Please enter a seed keyword." },
        { status: 400 },
      )
    }

    const visitorId = resolveWorkspaceVisitorId(request.headers) ?? createWorkspaceVisitorId()
    const gate = await consumeWorkspaceUsage(visitorId, "keywords")

    if (!gate.allowed) {
      const response = NextResponse.json(
        {
          error: `Keyword generation limit reached. Upgrade to ${
            gate.upgradeTarget === "basic" ? "Basic" : "Pro"
          } to keep generating ideas.`,
          upgradeTo: gate.upgradeTarget,
          workspace: gate.state,
        },
        { status: 429 },
      )

      applyWorkspaceVisitorCookie(response, visitorId)
      return response
    }

    const visibleSuggestions = gate.state.limits.keywordSuggestions
    const clusters = buildKeywordClusters(keyword).map((cluster) => ({
      ...cluster,
      suggestions: cluster.suggestions.slice(0, visibleSuggestions),
    }))

    const response = NextResponse.json(
      {
        clusters,
        workspace: gate.state,
      },
      { status: 200 },
    )

    applyWorkspaceVisitorCookie(response, visitorId)
    return response
  } catch (error) {
    const message = getErrorMessage(error, "Internal server error")
    console.error("POST /api/workspace/keywords failed:", {
      message,
      error,
    })

    if (message.toLowerCase().includes("seed keyword")) {
      return NextResponse.json(
        { error: "Please enter a seed keyword." },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Keyword generation failed." },
      { status: 500 },
    )
  }
}
