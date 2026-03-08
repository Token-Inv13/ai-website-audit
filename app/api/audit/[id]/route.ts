import { NextResponse } from "next/server"

import { getAudit } from "@/lib/auditStore"

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const audit = await getAudit(id)

  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 })
  }

  const previewResult = {
    ...audit.result,
    problems: audit.result.problems.slice(0, 2),
    improvements: audit.result.improvements.slice(0, 2),
  }

  return NextResponse.json(
    {
      id: audit.id,
      url: audit.url,
      createdAt: audit.createdAt,
      unlocked: audit.unlocked,
      stripeSessionId: audit.stripeSessionId,
      result: audit.unlocked ? audit.result : previewResult,
    },
    { status: 200 },
  )
}
