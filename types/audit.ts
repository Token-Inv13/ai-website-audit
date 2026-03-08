export interface DetailedRecommendation {
  title: string
  whyItMatters: string
  recommendedAction: string
  example: string
}

export interface CopySuggestions {
  suggestedHeadline: string
  suggestedCTA: string
  suggestedMetaDescription: string
}

export interface AuditResult {
  overallScore: number
  seoScore: number
  conversionScore: number
  uxScore: number
  problems: string[]
  improvements: string[]
  quickWins: string[]
  detailedRecommendations: DetailedRecommendation[]
  copySuggestions: CopySuggestions
}

export interface ScrapedWebsiteData {
  title: string
  metaDescription: string
  h1: string
  h2: string[]
  textContent: string
}

export interface RecentAuditSummary {
  id: string
  url: string
  overallScore: number
  seoScore: number
  conversionScore: number
  uxScore: number
  unlocked: boolean
  createdAt: string
}

export type QuickScanStatus = "present" | "missing" | "warning"

export interface QuickScanCheck {
  status: QuickScanStatus
  message: string
}

export interface QuickScanResult {
  url: string
  score: number
  checks: {
    title: QuickScanCheck
    metaDescription: QuickScanCheck
    h1: QuickScanCheck
    https: QuickScanCheck
    canonical: QuickScanCheck
    robots: QuickScanCheck
    titleLength: QuickScanCheck
    metaDescriptionLength: QuickScanCheck
  }
}
