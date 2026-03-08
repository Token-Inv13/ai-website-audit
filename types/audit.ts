export interface AuditResult {
  overallScore: number
  seoScore: number
  conversionScore: number
  uxScore: number
  problems: string[]
  improvements: string[]
}

export interface ScrapedWebsiteData {
  title: string
  metaDescription: string
  h1: string
  h2: string[]
  textContent: string
}
