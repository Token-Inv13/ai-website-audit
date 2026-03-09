export interface ScoreBenchmark {
  label: "Excellent" | "Good" | "Average" | "Needs improvement"
  benchmarkText: string
  badgeClassName: string
}

export function getScoreBenchmark(score: number): ScoreBenchmark {
  if (score >= 85) {
    return {
      label: "Excellent",
      benchmarkText: "Top websites score 85+",
      badgeClassName: "bg-emerald-100 text-emerald-700",
    }
  }

  if (score >= 70) {
    return {
      label: "Good",
      benchmarkText: "Most optimized websites score 70+",
      badgeClassName: "bg-teal-100 text-teal-700",
    }
  }

  if (score >= 55) {
    return {
      label: "Average",
      benchmarkText: "Average websites score around 65",
      badgeClassName: "bg-amber-100 text-amber-700",
    }
  }

  return {
    label: "Needs improvement",
    benchmarkText: "Top websites score 80+",
    badgeClassName: "bg-red-100 text-red-700",
  }
}
