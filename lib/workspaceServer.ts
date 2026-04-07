import type { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  getUpgradeTarget,
  getUsageLimit,
  normalizePlan,
  type Plan,
  type UsageFeature,
} from "@/lib/plan"
import {
  createWorkspaceVisitorId,
  resolveWorkspaceVisitorId,
  type WorkspaceGateResult,
  type WorkspaceState,
  type WorkspaceUsageSnapshot,
  toWorkspaceState,
  WORKSPACE_VISITOR_COOKIE,
} from "@/lib/workspace"

type WorkspaceUsageRecord = {
  periodKey: string
  auditsUsed: number
  keywordsUsed: number
  competitionUsed: number
  contentUsed: number
}

const FEATURE_FIELD: Record<UsageFeature, keyof WorkspaceUsageRecord> = {
  audit: "auditsUsed",
  keywords: "keywordsUsed",
  competition: "competitionUsed",
  content: "contentUsed",
}

function getCurrentPeriodKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function toUsageSnapshot(record: WorkspaceUsageRecord): WorkspaceUsageSnapshot {
  return {
    periodKey: record.periodKey,
    auditsUsed: record.auditsUsed,
    keywordsUsed: record.keywordsUsed,
    competitionUsed: record.competitionUsed,
    contentUsed: record.contentUsed,
  }
}

export function applyWorkspaceVisitorCookie(
  response: NextResponse,
  visitorId: string,
): void {
  response.cookies.set({
    name: WORKSPACE_VISITOR_COOKIE,
    value: visitorId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function getWorkspaceState(
  visitorId: string,
): Promise<WorkspaceState> {
  const periodKey = getCurrentPeriodKey()

  const profile = await prisma.workspaceProfile.upsert({
    where: { visitorId },
    create: {
      visitorId,
      plan: "free",
    },
    update: {},
    select: {
      plan: true,
    },
  })

  const usage = await prisma.workspaceUsage.upsert({
    where: {
      visitorId_periodKey: {
        visitorId,
        periodKey,
      },
    },
    create: {
      visitorId,
      periodKey,
    },
    update: {},
    select: {
      periodKey: true,
      auditsUsed: true,
      keywordsUsed: true,
      competitionUsed: true,
      contentUsed: true,
    },
  })

  return toWorkspaceState(visitorId, normalizePlan(profile.plan), toUsageSnapshot(usage))
}

export async function setWorkspacePlan(
  visitorId: string,
  plan: Plan,
  metadata?: {
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    billingStatus?: string | null
    currentPeriodEnd?: Date | null
  },
): Promise<WorkspaceState> {
  await prisma.workspaceProfile.upsert({
    where: { visitorId },
    create: {
      visitorId,
      plan,
      stripeCustomerId: metadata?.stripeCustomerId ?? null,
      stripeSubscriptionId: metadata?.stripeSubscriptionId ?? null,
      billingStatus: metadata?.billingStatus ?? null,
      currentPeriodEnd: metadata?.currentPeriodEnd ?? null,
    },
    update: {
      plan,
      stripeCustomerId: metadata?.stripeCustomerId ?? undefined,
      stripeSubscriptionId: metadata?.stripeSubscriptionId ?? undefined,
      billingStatus: metadata?.billingStatus ?? undefined,
      currentPeriodEnd: metadata?.currentPeriodEnd ?? undefined,
    },
  })

  return getWorkspaceState(visitorId)
}

async function incrementUsageWithinTransaction(
  tx: Prisma.TransactionClient,
  visitorId: string,
  periodKey: string,
  feature: UsageFeature,
  limit: number,
): Promise<boolean> {
  const field = FEATURE_FIELD[feature]
  const where: Prisma.WorkspaceUsageWhereInput = Number.isFinite(limit)
    ? {
        visitorId,
        periodKey,
        [field]: {
          lt: limit,
        },
      }
    : {
        visitorId,
        periodKey,
      }

  const data: Prisma.WorkspaceUsageUpdateManyMutationInput = {
    [field]: {
      increment: 1,
    },
  } as Prisma.WorkspaceUsageUpdateManyMutationInput

  const result = await tx.workspaceUsage.updateMany({
    where,
    data,
  })

  return result.count > 0
}

export async function consumeWorkspaceUsage(
  visitorId: string,
  feature: UsageFeature,
): Promise<WorkspaceGateResult> {
  const periodKey = getCurrentPeriodKey()

  return prisma.$transaction(async (tx) => {
    const profile = await tx.workspaceProfile.upsert({
      where: { visitorId },
      create: {
        visitorId,
        plan: "free",
      },
      update: {},
      select: {
        plan: true,
      },
    })

    await tx.workspaceUsage.upsert({
      where: {
        visitorId_periodKey: {
          visitorId,
          periodKey,
        },
      },
      create: {
        visitorId,
        periodKey,
      },
      update: {},
      select: {
        periodKey: true,
      },
    })

    const plan = normalizePlan(profile.plan)
    const limit = getUsageLimit(plan, feature)
    const upgradeTarget = getUpgradeTarget(feature, plan)
    const allowed = await incrementUsageWithinTransaction(
      tx,
      visitorId,
      periodKey,
      feature,
      limit,
    )

    const usage = await tx.workspaceUsage.findUnique({
      where: {
        visitorId_periodKey: {
          visitorId,
          periodKey,
        },
      },
      select: {
        periodKey: true,
        auditsUsed: true,
        keywordsUsed: true,
        competitionUsed: true,
        contentUsed: true,
      },
    })

    if (!usage) {
      throw new Error("Workspace usage row missing after update.")
    }

    return {
      allowed,
      feature,
      limit,
      upgradeTarget,
      state: toWorkspaceState(visitorId, plan, toUsageSnapshot(usage)),
    }
  })
}

export { createWorkspaceVisitorId, resolveWorkspaceVisitorId }
