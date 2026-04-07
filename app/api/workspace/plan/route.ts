import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { isPlan, normalizePlan } from "@/lib/plan"
import {
  createWorkspaceVisitorId,
  resolveWorkspaceVisitorId,
  setWorkspacePlan,
  applyWorkspaceVisitorCookie,
} from "@/lib/workspaceServer"

interface WorkspacePlanRequestBody {
  plan?: string
}

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WorkspacePlanRequestBody

    if (!body.plan || !isPlan(body.plan)) {
      return NextResponse.json(
        { error: "Please choose a valid plan." },
        { status: 400 },
      )
    }

    const visitorId = resolveWorkspaceVisitorId(request.headers) ?? createWorkspaceVisitorId()
    const workspace = await setWorkspacePlan(visitorId, normalizePlan(body.plan))

    const response = NextResponse.json(
      {
        workspace,
      },
      { status: 200 },
    )

    applyWorkspaceVisitorCookie(response, visitorId)
    return response
  } catch (error) {
    const message = getErrorMessage(error, "Internal server error")
    console.error("POST /api/workspace/plan failed:", {
      message,
      error,
    })

    return NextResponse.json(
      { error: "Plan update failed." },
      { status: 500 },
    )
  }
}
