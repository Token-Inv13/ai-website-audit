export const BRAND_NAME = "SEOAuditAI"
export const BRAND_DOMAIN = "seoauditai.io"
export const REPORT_LABEL = "SEOAuditAI Report"

export const DEFAULT_SEO_TITLE =
  "SEOAuditAI | Analyze SEO, UX & Conversion in Seconds"

export const DEFAULT_SEO_DESCRIPTION =
  "Analyze your website instantly with SEOAuditAI. Get SEO insights, UX improvements, and conversion recommendations in seconds."

export function withBrandSuffix(value: string): string {
  return `${value} | ${BRAND_NAME}`
}
