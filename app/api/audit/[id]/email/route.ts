import { NextRequest, NextResponse } from "next/server"

import { getAuditManageCookieName } from "@/lib/auditAccess"
import { canManageAudit, normalizeEmail, saveAuditEmail } from "@/lib/auditStore"
import { getErrorMessage } from "@/lib/error"

interface Params {
  params: Promise<{
    id: string
  }>
}

interface EmailCaptureRequestBody {
  email?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = (await request.json()) as EmailCaptureRequestBody
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : ""

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      )
    }

    const manageToken = request.cookies.get(getAuditManageCookieName(id))?.value

    if (!manageToken || !(await canManageAudit(id, manageToken))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
    }

    const updated = await saveAuditEmail(id, email)

    if (!updated) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: updated.id,
        hasEmail: Boolean(updated.email),
        emailCapturedAt: updated.emailCapturedAt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("PATCH /api/audit/[id]/email failed:", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Unable to save your email.") },
      { status: 500 },
    )
  }
}
