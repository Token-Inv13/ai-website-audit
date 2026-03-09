import { randomUUID } from "node:crypto"

import type { Prisma } from "@prisma/client"

import { normalizeDomainFromUrl, normalizeDomainFromValue } from "@/lib/domain"
import { prisma } from "@/lib/prisma"
import type {
  AuditResult,
  CopySuggestions,
  DetailedRecommendation,
  PublicAuditReport,
  RecentAuditSummary,
} from "@/types/audit"

export interface StoredAudit {
  id: string
  url: string
  manageToken?: string
  email: string | null
  emailCapturedAt: string | null
  domainNormalized: string
  isPublic: boolean
  publicSlug: string | null
  publicAt: string | null
  result: AuditResult
  createdAt: string
  unlocked: boolean
  stripeSessionId: string | null
}

interface CreateAuditInput {
  id: string
  url: string
  result: AuditResult
  manageToken?: string
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
  manageToken?: string | null
  email?: string | null
  emailCapturedAt?: Date | null
  domainNormalized?: string | null
  isPublic?: boolean
  publicSlug?: string | null
  publicAt?: Date | null
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
    manageToken: record.manageToken ?? undefined,
    email: record.email ?? null,
    emailCapturedAt: record.emailCapturedAt
      ? record.emailCapturedAt.toISOString()
      : null,
    domainNormalized:
      record.domainNormalized || normalizeDomainFromUrl(record.url),
    isPublic: record.isPublic ?? false,
    publicSlug: record.publicSlug ?? null,
    publicAt: record.publicAt ? record.publicAt.toISOString() : null,
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

function buildPublicSlugFromDomain(domain: string): string {
  return domain.trim().toLowerCase()
}

export async function createAudit(input: CreateAuditInput): Promise<StoredAudit> {
  const record = await prisma.audit.create({
    data: {
      id: input.id,
      manageToken: input.manageToken ?? randomUUID(),
      url: input.url,
      domainNormalized: normalizeDomainFromUrl(input.url),
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

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export async function hasAuditWithCapturedEmail(id: string): Promise<boolean> {
  const record = await prisma.audit.findUnique({
    where: { id },
    select: {
      email: true,
    },
  })

  if (!record) {
    return false
  }

  return typeof record.email === "string" && record.email.trim().length > 0
}

export async function getAuditCapturedEmail(id: string): Promise<string | null> {
  const record = await prisma.audit.findUnique({
    where: { id },
    select: {
      email: true,
    },
  })

  if (!record?.email) {
    return null
  }

  return record.email
}

export async function canManageAudit(
  id: string,
  manageToken: string,
): Promise<boolean> {
  if (!id || !manageToken) {
    return false
  }

  const record = await prisma.audit.findFirst({
    where: {
      id,
      manageToken,
    },
    select: { id: true },
  })

  return Boolean(record)
}

export async function updateAuditVisibility(
  id: string,
  isPublic: boolean,
): Promise<StoredAudit | null> {
  const existing = await prisma.audit.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      manageToken: true,
      domainNormalized: true,
      isPublic: true,
      publicSlug: true,
      publicAt: true,
      overallScore: true,
      seoScore: true,
      conversionScore: true,
      uxScore: true,
      problems: true,
      improvements: true,
      quickWins: true,
      detailedRecommendations: true,
      copySuggestions: true,
      unlocked: true,
      stripeSessionId: true,
      createdAt: true,
    },
  })

  if (!existing) {
    return null
  }

  const normalizedDomain =
    existing.domainNormalized || normalizeDomainFromUrl(existing.url)

  if (isPublic && !normalizedDomain) {
    throw new Error("Unable to publish this report because domain is invalid.")
  }

  const record = await prisma.audit.update({
    where: { id },
    data: {
      domainNormalized: normalizedDomain || existing.domainNormalized,
      isPublic,
      publicSlug:
        isPublic && normalizedDomain
          ? existing.publicSlug || buildPublicSlugFromDomain(normalizedDomain)
          : existing.publicSlug,
      publicAt: isPublic ? existing.publicAt ?? new Date() : existing.publicAt,
    },
  })

  return toStoredAudit(record)
}

export async function saveAuditEmail(
  id: string,
  email: string,
): Promise<StoredAudit | null> {
  const normalizedEmail = normalizeEmail(email)

  const existing = await prisma.audit.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      emailCapturedAt: true,
    },
  })

  if (!existing) {
    return null
  }

  const record = await prisma.audit.update({
    where: { id },
    data: {
      email: normalizedEmail,
      emailCapturedAt: existing.emailCapturedAt ?? new Date(),
    },
  })

  return toStoredAudit(record)
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

function toPublicAuditReport(record: {
  id: string
  url: string
  domainNormalized: string | null
  publicSlug: string | null
  createdAt: Date
  overallScore: number
  seoScore: number
  conversionScore: number
  uxScore: number
  problems: Prisma.JsonValue
  improvements: Prisma.JsonValue
  quickWins: Prisma.JsonValue
  detailedRecommendations: Prisma.JsonValue
  copySuggestions: Prisma.JsonValue
}): PublicAuditReport | null {
  const normalizedDomain =
    record.domainNormalized || normalizeDomainFromUrl(record.url)

  if (!normalizedDomain) {
    return null
  }

  return {
    id: record.id,
    url: record.url,
    domainNormalized: normalizedDomain,
    publicSlug: record.publicSlug,
    createdAt: record.createdAt.toISOString(),
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

export async function getLatestPublicAuditByDomain(
  domainOrSlug: string,
): Promise<PublicAuditReport | null> {
  const normalized = normalizeDomainFromValue(domainOrSlug)
  const slug = domainOrSlug.trim().toLowerCase()

  if (!normalized && !slug) {
    return null
  }

  const matchingRules: Prisma.AuditWhereInput[] = []
  if (normalized) {
    matchingRules.push({ domainNormalized: normalized })
  }
  if (slug) {
    matchingRules.push({ publicSlug: slug })
  }

  if (!matchingRules.length) {
    return null
  }

  const record = await prisma.audit.findFirst({
    where: {
      isPublic: true,
      OR: matchingRules,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      url: true,
      domainNormalized: true,
      publicSlug: true,
      createdAt: true,
      overallScore: true,
      seoScore: true,
      conversionScore: true,
      uxScore: true,
      problems: true,
      improvements: true,
      quickWins: true,
      detailedRecommendations: true,
      copySuggestions: true,
    },
  })

  if (!record) {
    return null
  }

  return toPublicAuditReport(record)
}

export async function listPublicReportDomains(
  limit = 200,
): Promise<Array<{ domain: string; updatedAt: string }>> {
  const safeLimit = Math.min(1000, Math.max(1, Math.floor(limit)))
  const records = await prisma.audit.findMany({
    where: {
      isPublic: true,
      domainNormalized: {
        not: null,
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: safeLimit,
    select: {
      domainNormalized: true,
      createdAt: true,
    },
  })

  const deduped = new Map<string, string>()
  for (const record of records) {
    const domain = record.domainNormalized?.trim().toLowerCase()
    if (!domain || deduped.has(domain)) {
      continue
    }
    deduped.set(domain, record.createdAt.toISOString())
  }

  return Array.from(deduped.entries()).map(([domain, updatedAt]) => ({
    domain,
    updatedAt,
  }))
}
