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

export type IndexationVerdict = "indexable" | "potentially-blocked" | "needs-review"

export type IndexationConfidence = "high" | "medium" | "low"

export interface IndexationInsight {
  statusCode: number
  finalUrl: string
  title: string
  robotsMeta: string
  canonicalHref: string
  noindexDetected: boolean
  canonicalMatches: boolean
  htmlIsSparse: boolean
  confidence: IndexationConfidence
  verdict: IndexationVerdict
  summary: string
  notes: string[]
}

export type SeoActionPriority = "High" | "Medium" | "Low"

export interface SeoActionPlanItem {
  title: string
  priority: SeoActionPriority
  description: string
}

export interface CompetitionSignal {
  label: string
  value: string
  status: "good" | "warning" | "neutral"
}

export interface CompetitionAction {
  title: string
  priority: SeoActionPriority
  description: string
}

export type CompetitionMode = "url" | "keyword"

export interface CompetitionAnalysis {
  mode: CompetitionMode
  input: string
  yourUrl: string | null
  competitorUrl: string | null
  focusKeyword: string | null
  confidence: IndexationConfidence
  summary: string
  opportunity: string
  yourPageSignals: CompetitionSignal[]
  competitorSignals: CompetitionSignal[]
  comparisons: string[]
  actions: CompetitionAction[]
}

export interface AiContentResult {
  sourceText: string
  focusKeyword: string
  metaTitle: string
  metaDescription: string
  suggestedH1: string
  suggestedH2: string[]
  rewrite: string
  seoTips: string[]
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

export interface PublicAuditReport {
  id: string
  url: string
  domainNormalized: string
  publicSlug: string | null
  createdAt: string
  result: AuditResult
}

export type QuickScanStatus = "present" | "missing" | "warning"

export interface QuickScanCheck {
  status: QuickScanStatus
  message: string
}

export interface QuickScanResult {
  url: string
  score: number
  indexation: IndexationInsight
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

export type WorkspaceTabKey = "audit" | "indexation" | "keywords" | "competition" | "content"
