import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { analyzeCompetition } from "@/lib/workspaceCompetition"
import {
  consumeWorkspaceUsage,
  createWorkspaceVisitorId,
  resolveWorkspaceVisitorId,
  applyWorkspaceVisitorCookie,
} from "@/lib/workspaceServer"

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

    const visitorId = resolveWorkspaceVisitorId(request.headers) ?? createWorkspaceVisitorId()
    const gate = await consumeWorkspaceUsage(visitorId, "competition")

    if (!gate.allowed) {
      const response = NextResponse.json(
        {
          error: `Competition analysis limit reached. Upgrade to ${
            gate.upgradeTarget === "basic" ? "Basic" : "Pro"
          } to keep comparing pages.`,
          upgradeTo: gate.upgradeTarget,
          workspace: gate.state,
        },
        { status: 429 },
      )

      applyWorkspaceVisitorCookie(response, visitorId)
      return response
    }

    const result = await analyzeCompetition({
      target: body.target,
      yourUrl: body.yourUrl,
    })
    const signalLimit = gate.state.limits.competitionCards
    const actionLimit = gate.state.limits.actionPlanItems

    const response = NextResponse.json(
      {
        ...result,
        yourPageSignals: result.yourPageSignals.slice(0, signalLimit),
        competitorSignals: result.competitorSignals.slice(0, signalLimit),
        comparisons: result.comparisons.slice(0, signalLimit),
        actions: result.actions.slice(0, actionLimit),
        workspace: gate.state,
      },
      { status: 200 },
    )

    applyWorkspaceVisitorCookie(response, visitorId)
    return response
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
