import { NextResponse } from "next/server"

import { getAudit } from "@/lib/auditStore"
import { getVisibleAuditResult } from "@/lib/auditVisibility"

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const audit = await getAudit(id)

    if (!audit) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: audit.id,
        url: audit.url,
        createdAt: audit.createdAt,
        unlocked: audit.unlocked,
        stripeSessionId: audit.stripeSessionId,
        result: getVisibleAuditResult(audit.result, audit.unlocked),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("GET /api/audit/[id] failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
