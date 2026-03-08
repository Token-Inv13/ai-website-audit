import { NextResponse } from "next/server"

import { getAudit } from "@/lib/auditStore"
import { getVisibleAuditResult } from "@/lib/auditVisibility"
import { getErrorMessage } from "@/lib/error"
import { buildAuditReportPdf } from "@/lib/reportPdf"

export const runtime = "nodejs"

interface Params {
  params: Promise<{
    id: string
  }>
}

function buildFilename(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    const normalized = host.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()

    return `website-audit-${normalized || "report"}.pdf`
  } catch {
    return "website-audit-report.pdf"
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const audit = await getAudit(id)

    if (!audit) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 })
    }

    const result = getVisibleAuditResult(audit.result, audit.unlocked)
    const pdfBuffer = await buildAuditReportPdf({
      url: audit.url,
      createdAt: audit.createdAt,
      unlocked: audit.unlocked,
      result,
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${buildFilename(audit.url)}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("GET /api/report/[id] failed:", {
      message: getErrorMessage(error, "Internal server error"),
      error,
    })

    return NextResponse.json({ error: "Unable to generate PDF report." }, { status: 500 })
  }
}
