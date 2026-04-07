export type Plan = "free" | "basic" | "pro"

export type PlanFeature = "keywords" | "content" | "competition" | "actionPlan" | "unlimitedAudits"
export type UsageFeature = "audit" | "keywords" | "competition" | "content"

export const PLAN_ORDER: Plan[] = ["free", "basic", "pro"]

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
}

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  free: "Starter access with visible limits and upgrade prompts.",
  basic: "Most core workspace features unlocked for solo operators.",
  pro: "Full access with the highest quotas and no soft caps.",
}

export const PLAN_LIMITS = {
  free: {
    auditsPerDay: 3,
    keywordSuggestions: 2,
    contentCards: 2,
    competitionCards: 2,
    actionPlanItems: 2,
  },
  basic: {
    auditsPerDay: 10,
    keywordSuggestions: 3,
    contentCards: 4,
    competitionCards: 4,
    actionPlanItems: 4,
  },
  pro: {
    auditsPerDay: Number.POSITIVE_INFINITY,
    keywordSuggestions: 4,
    contentCards: 6,
    competitionCards: 6,
    actionPlanItems: 5,
  },
} as const

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  basic: 1,
  pro: 2,
}

const FEATURE_MIN_PLAN: Record<Exclude<PlanFeature, "unlimitedAudits">, Plan> = {
  keywords: "basic",
  content: "basic",
  competition: "basic",
  actionPlan: "basic",
}

const FEATURE_LIMIT_KEY: Record<UsageFeature, keyof typeof PLAN_LIMITS.free> = {
  audit: "auditsPerDay",
  keywords: "keywordSuggestions",
  competition: "competitionCards",
  content: "contentCards",
}

const STORAGE_KEYS = {
  plan: "seoauditai:plan",
  auditUsage: "seoauditai:audit-usage",
} as const

function getStorageValue(key: string): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function setStorageValue(key: string, value: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage write failures in privacy-restricted environments.
  }
}

function getAuditUsageKey(date = new Date()): string {
  return `${STORAGE_KEYS.auditUsage}:${date.toISOString().slice(0, 10)}`
}

export function isPlan(value: string | null | undefined): value is Plan {
  return value === "free" || value === "basic" || value === "pro"
}

export function normalizePlan(value: string | null | undefined): Plan {
  return isPlan(value) ? value : "free"
}

export function getPlanRank(plan: Plan): number {
  return PLAN_RANK[plan]
}

export function hasAccess(feature: PlanFeature | UsageFeature, plan: Plan): boolean {
  if (feature === "audit") {
    return plan === "pro"
  }

  if (feature === "unlimitedAudits") {
    return plan === "pro"
  }

  return getPlanRank(plan) >= getPlanRank(FEATURE_MIN_PLAN[feature])
}

export function getPlanLimit(
  plan: Plan,
  key: keyof typeof PLAN_LIMITS.free,
): number {
  return PLAN_LIMITS[plan][key]
}

export function getUsageLimit(plan: Plan, feature: UsageFeature): number {
  return getPlanLimit(plan, FEATURE_LIMIT_KEY[feature])
}

export function formatPlanLimit(value: number): string {
  return Number.isFinite(value) ? String(value) : "Unlimited"
}

export function getNextPlan(plan: Plan): Plan {
  if (plan === "free") {
    return "basic"
  }

  if (plan === "basic") {
    return "pro"
  }

  return "pro"
}

export function getUpgradeTarget(
  feature: PlanFeature | UsageFeature,
  plan: Plan,
): Plan | null {
  if (hasAccess(feature, plan)) {
    return null
  }

  if (feature === "audit") {
    return plan === "free" ? "basic" : "pro"
  }

  if (feature === "unlimitedAudits") {
    return "pro"
  }

  return plan === "free" ? "basic" : "pro"
}

export function readStoredPlan(): Plan {
  return normalizePlan(getStorageValue(STORAGE_KEYS.plan))
}

export function writeStoredPlan(plan: Plan): void {
  setStorageValue(STORAGE_KEYS.plan, plan)
}

export function readAuditUsage(): number {
  const raw = getStorageValue(getAuditUsageKey())
  const parsed = raw ? Number(raw) : 0

  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0
}

export function writeAuditUsage(value: number): void {
  setStorageValue(getAuditUsageKey(), String(Math.max(0, Math.floor(value))))
}

export function incrementAuditUsage(): number {
  const nextValue = readAuditUsage() + 1
  writeAuditUsage(nextValue)
  return nextValue
}

export function getDailyAuditUsageLabel(plan: Plan): string {
  const limit = getPlanLimit(plan, "auditsPerDay")

  return `${readAuditUsage()}/${formatPlanLimit(limit)} audits today`
}
