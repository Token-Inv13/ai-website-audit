import type { Metadata } from "next"

import SeoWorkspace from "@/components/workspace/SeoWorkspace"
import { withBrandSuffix } from "@/lib/branding"
import { listRecentAudits } from "@/lib/auditStore"
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

  try {
    recentAudits = await listRecentAudits(20)
  } catch (error) {
    console.warn("Failed to load recent audits for the SEO workspace.", error)
  }

  return <SeoWorkspace recentAudits={recentAudits} />
}
