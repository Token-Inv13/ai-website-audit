import type { AuditResult } from "@/types/audit"

export function getVisibleAuditResult(
  result: AuditResult,
  unlocked: boolean,
): AuditResult {
  if (unlocked) {
    return result
  }

  return {
    ...result,
    problems: result.problems.slice(0, 2),
    improvements: result.improvements.slice(0, 2),
    detailedRecommendations: [],
  }
}
