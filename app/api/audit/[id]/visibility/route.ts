import { NextRequest, NextResponse } from "next/server"

import { getAuditManageCookieName } from "@/lib/auditAccess"
import { canManageAudit, updateAuditVisibility } from "@/lib/auditStore"
import { getErrorMessage } from "@/lib/error"

interface Params {
  params: Promise<{
    id: string
  }>
}

interface VisibilityRequestBody {
  isPublic?: boolean
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = (await request.json()) as VisibilityRequestBody

    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const manageToken = request.cookies.get(getAuditManageCookieName(id))?.value

    if (!manageToken || !(await canManageAudit(id, manageToken))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
    }

    const updated = await updateAuditVisibility(id, body.isPublic)

    if (!updated) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: updated.id,
        isPublic: updated.isPublic,
        domainNormalized: updated.domainNormalized,
        publicPath: updated.publicSlug || updated.domainNormalized,
        publicAt: updated.publicAt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("PATCH /api/audit/[id]/visibility failed:", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Unable to update report visibility.") },
      { status: 500 },
    )
  }
}
