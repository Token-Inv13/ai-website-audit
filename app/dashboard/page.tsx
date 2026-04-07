import type { Metadata } from "next"
import { headers } from "next/headers"

import SeoWorkspace from "@/components/workspace/SeoWorkspace"
import { withBrandSuffix } from "@/lib/branding"
import { listRecentAudits } from "@/lib/auditStore"
import { resolveWorkspaceVisitorId } from "@/lib/workspace"
import { getWorkspaceState } from "@/lib/workspaceServer"
import type { RecentAuditSummary } from "@/types/audit"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: withBrandSuffix("SEO Workspace"),
  description:
    "A simple SEO hub for audit, indexation, and keyword ideas in one workspace.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardPage() {
  let recentAudits: RecentAuditSummary[] = []
  let workspaceState: Awaited<ReturnType<typeof getWorkspaceState>> | null = null

  try {
    recentAudits = await listRecentAudits(20)
  } catch (error) {
    console.warn("Failed to load recent audits for the SEO workspace.", error)
  }

  try {
    const headersList = await headers()
    const visitorId = resolveWorkspaceVisitorId(headersList)

    if (visitorId) {
      workspaceState = await getWorkspaceState(visitorId)
    }
  } catch (error) {
    console.warn("Failed to load persisted workspace state.", error)
  }

  return <SeoWorkspace recentAudits={recentAudits} workspaceState={workspaceState ?? undefined} />
}
