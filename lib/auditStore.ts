import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type {
  AuditResult,
  CopySuggestions,
  DetailedRecommendation,
  RecentAuditSummary,
} from "@/types/audit"

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

function isJsonObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseDetailedRecommendations(
  value: Prisma.JsonValue,
): DetailedRecommendation[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is Prisma.JsonObject => isJsonObject(item))
    .map((item) => {
      const title = typeof item.title === "string" ? item.title : ""
      const whyItMatters =
        typeof item.whyItMatters === "string" ? item.whyItMatters : ""
      const recommendedAction =
        typeof item.recommendedAction === "string" ? item.recommendedAction : ""
      const example = typeof item.example === "string" ? item.example : ""

      return { title, whyItMatters, recommendedAction, example }
    })
    .filter(
      (item) =>
        item.title || item.whyItMatters || item.recommendedAction || item.example,
    )
}

function parseCopySuggestions(value: Prisma.JsonValue): CopySuggestions {
  if (!isJsonObject(value)) {
    return {
      suggestedHeadline: "",
      suggestedCTA: "",
      suggestedMetaDescription: "",
    }
  }

  return {
    suggestedHeadline:
      typeof value.suggestedHeadline === "string" ? value.suggestedHeadline : "",
    suggestedCTA: typeof value.suggestedCTA === "string" ? value.suggestedCTA : "",
    suggestedMetaDescription:
      typeof value.suggestedMetaDescription === "string"
        ? value.suggestedMetaDescription
        : "",
  }
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
  quickWins: Prisma.JsonValue
  detailedRecommendations: Prisma.JsonValue
  copySuggestions: Prisma.JsonValue
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
      quickWins: parseStringArray(record.quickWins),
      detailedRecommendations: parseDetailedRecommendations(
        record.detailedRecommendations,
      ),
      copySuggestions: parseCopySuggestions(record.copySuggestions),
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
      quickWins: input.result.quickWins,
      detailedRecommendations:
        input.result.detailedRecommendations as unknown as Prisma.InputJsonValue,
      copySuggestions:
        input.result.copySuggestions as unknown as Prisma.InputJsonValue,
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

export async function listRecentAudits(
  limit = 20,
): Promise<RecentAuditSummary[]> {
  const safeLimit = Math.min(25, Math.max(1, Math.floor(limit)))
  const records = await prisma.audit.findMany({
    orderBy: { createdAt: "desc" },
    take: safeLimit,
    select: {
      id: true,
      url: true,
      overallScore: true,
      seoScore: true,
      conversionScore: true,
      uxScore: true,
      unlocked: true,
      createdAt: true,
    },
  })

  return records.map((record) => ({
    id: record.id,
    url: record.url,
    overallScore: record.overallScore,
    seoScore: record.seoScore,
    conversionScore: record.conversionScore,
    uxScore: record.uxScore,
    unlocked: record.unlocked,
    createdAt: record.createdAt.toISOString(),
  }))
}
