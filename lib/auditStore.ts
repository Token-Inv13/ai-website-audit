import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { AuditResult } from "@/types/audit"

export interface StoredAudit {
  id: string
  url: string
  result: AuditResult
  createdAt: string
  unlocked: boolean
  stripeSessionId: string | null
}

interface CreateAuditInput {
  id: string
  url: string
  result: AuditResult
}

function parseStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string")
}

function toStoredAudit(record: {
  id: string
  url: string
  overallScore: number
  seoScore: number
  conversionScore: number
  uxScore: number
  problems: Prisma.JsonValue
  improvements: Prisma.JsonValue
  unlocked: boolean
  stripeSessionId: string | null
  createdAt: Date
}): StoredAudit {
  return {
    id: record.id,
    url: record.url,
    createdAt: record.createdAt.toISOString(),
    unlocked: record.unlocked,
    stripeSessionId: record.stripeSessionId,
    result: {
      overallScore: record.overallScore,
      seoScore: record.seoScore,
      conversionScore: record.conversionScore,
      uxScore: record.uxScore,
      problems: parseStringArray(record.problems),
      improvements: parseStringArray(record.improvements),
    },
  }
}

export async function createAudit(input: CreateAuditInput): Promise<StoredAudit> {
  const record = await prisma.audit.create({
    data: {
      id: input.id,
      url: input.url,
      overallScore: input.result.overallScore,
      seoScore: input.result.seoScore,
      conversionScore: input.result.conversionScore,
      uxScore: input.result.uxScore,
      problems: input.result.problems,
      improvements: input.result.improvements,
      unlocked: false,
    },
  })

  return toStoredAudit(record)
}

export async function getAudit(id: string): Promise<StoredAudit | null> {
  const record = await prisma.audit.findUnique({
    where: { id },
  })

  return record ? toStoredAudit(record) : null
}

export async function hasAudit(id: string): Promise<boolean> {
  const record = await prisma.audit.findUnique({
    where: { id },
    select: { id: true },
  })

  return Boolean(record)
}

export async function unlockAudit(
  id: string,
  stripeSessionId?: string,
): Promise<boolean> {
  const updateResult = await prisma.audit.updateMany({
    where: { id },
    data: {
      unlocked: true,
      stripeSessionId: stripeSessionId ?? null,
    },
  })

  return updateResult.count > 0
}
