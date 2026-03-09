import { NextRequest, NextResponse } from "next/server"

import { getAuditManageCookieName } from "@/lib/auditAccess"
import { canManageAudit, getAudit } from "@/lib/auditStore"
import { getVisibleAuditResult } from "@/lib/auditVisibility"

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const audit = await getAudit(id)

    if (!audit) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 })
    }

    const manageToken = request.cookies.get(getAuditManageCookieName(id))?.value
    const canManageVisibility =
      typeof manageToken === "string" && manageToken
        ? await canManageAudit(id, manageToken)
        : false

    const publicPath = audit.publicSlug || audit.domainNormalized

    return NextResponse.json(
      {
        id: audit.id,
        url: audit.url,
        createdAt: audit.createdAt,
        unlocked: audit.unlocked,
        hasEmail: Boolean(audit.email),
        isPublic: audit.isPublic,
        domainNormalized: audit.domainNormalized,
        publicPath,
        canManageVisibility,
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
