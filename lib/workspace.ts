import {
  getNextPlan,
  getPlanLimit,
  getUsageLimit,
  type Plan,
  type UsageFeature,
} from "@/lib/plan"

export const WORKSPACE_VISITOR_COOKIE = "seoauditai_workspace_visitor"
export const WORKSPACE_VISITOR_HEADER = "x-seoauditai-workspace-visitor"
export const WORKSPACE_USAGE_WINDOW_DAYS = 1

export interface WorkspaceUsageSnapshot {
  periodKey: string
  auditsUsed: number
  keywordsUsed: number
  competitionUsed: number
  contentUsed: number
}

export interface WorkspaceLimitsSnapshot {
  auditsPerDay: number
  keywordSuggestions: number
  competitionCards: number
  contentCards: number
  actionPlanItems: number
}

export interface WorkspaceRemainingSnapshot {
  audits: number
  keywords: number
  competition: number
  content: number
}

export interface WorkspaceState {
  visitorId: string
  plan: Plan
  usage: WorkspaceUsageSnapshot
  limits: WorkspaceLimitsSnapshot
  remaining: WorkspaceRemainingSnapshot
  nextPlan: Plan
}

export interface WorkspaceGateResult {
  allowed: boolean
  feature: UsageFeature
  limit: number
  state: WorkspaceState
  upgradeTarget: Plan | null
}

function getCurrentPeriodKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function buildDefaultUsage(periodKey: string): WorkspaceUsageSnapshot {
  return {
    periodKey,
    auditsUsed: 0,
    keywordsUsed: 0,
    competitionUsed: 0,
    contentUsed: 0,
  }
}

function buildLimits(plan: Plan): WorkspaceLimitsSnapshot {
  return {
    auditsPerDay: getUsageLimit(plan, "audit"),
    keywordSuggestions: getUsageLimit(plan, "keywords"),
    competitionCards: getUsageLimit(plan, "competition"),
    contentCards: getUsageLimit(plan, "content"),
    actionPlanItems: getPlanLimit(plan, "actionPlanItems"),
  }
}

function buildRemaining(
  plan: Plan,
  usage: WorkspaceUsageSnapshot,
): WorkspaceRemainingSnapshot {
  const limits = buildLimits(plan)

  return {
    audits: Math.max(limits.auditsPerDay - usage.auditsUsed, 0),
    keywords: Math.max(limits.keywordSuggestions - usage.keywordsUsed, 0),
    competition: Math.max(limits.competitionCards - usage.competitionUsed, 0),
    content: Math.max(limits.contentCards - usage.contentUsed, 0),
  }
}

export function toWorkspaceState(
  visitorId: string,
  plan: Plan,
  usage: WorkspaceUsageSnapshot,
): WorkspaceState {
  return {
    visitorId,
    plan,
    usage,
    limits: buildLimits(plan),
    remaining: buildRemaining(plan, usage),
    nextPlan: getNextPlan(plan),
  }
}

export function createDefaultWorkspaceState(
  plan: Plan = "free",
  visitorId = "anonymous",
): WorkspaceState {
  return toWorkspaceState(visitorId, plan, buildDefaultUsage(getCurrentPeriodKey()))
}

export function createWorkspaceVisitorId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export function resolveWorkspaceVisitorId(headers: Headers): string | null {
  const value = headers.get(WORKSPACE_VISITOR_HEADER)?.trim()
  return value ? value : null
}
