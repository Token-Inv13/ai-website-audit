import OpenAI from "openai"

import type { AuditResult, ScrapedWebsiteData } from "@/types/audit"

const MOCK_AUDIT_RESULT: AuditResult = {
  overallScore: 72,
  seoScore: 68,
  conversionScore: 61,
  uxScore: 79,
  problems: [
    "Headline is too generic and does not clearly communicate value.",
    "Primary CTA is not prominent above the fold.",
    "No testimonials or trust indicators are visible.",
    "Meta description is missing or too weak.",
    "Page structure could be improved with clearer section hierarchy.",
  ],
  improvements: [
    "Rewrite the headline to highlight the main user benefit.",
    "Add a clear primary CTA in the hero section.",
    "Include testimonials or client logos for trust.",
    "Improve the meta description with a clear keyword and benefit.",
    "Reorganize sections to improve readability and scanning.",
  ],
}

const SYSTEM_PROMPT = `You are a website SEO and conversion optimization expert.

Analyze the following website data and produce a website audit.

Return JSON with:

overallScore (0-100)
seoScore (0-100)
conversionScore (0-100)
uxScore (0-100)

problems (array of 5 strings)

improvements (array of 5 actionable recommendations)

Response must be strictly valid JSON without markdown or additional text.`

function clampScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

function parseAuditResult(raw: string): AuditResult {
  const normalized = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "")
  const parsed = JSON.parse(normalized) as Record<string, unknown>

  return {
    overallScore: clampScore(parsed.overallScore),
    seoScore: clampScore(parsed.seoScore),
    conversionScore: clampScore(parsed.conversionScore),
    uxScore: clampScore(parsed.uxScore),
    problems: normalizeList(parsed.problems),
    improvements: normalizeList(parsed.improvements),
  }
}

export async function analyzeWebsite(data: ScrapedWebsiteData): Promise<AuditResult> {
  const isMockMode = process.env.MOCK_AI === "true"

  if (isMockMode) {
    return MOCK_AUDIT_RESULT
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set MOCK_AI=true for local mock mode.")
  }

  const client = new OpenAI({ apiKey })

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Website data to audit:\n${JSON.stringify(data, null, 2)}`,
      },
    ],
  })

  const output = response.output_text

  if (!output) {
    throw new Error("OpenAI returned an empty response")
  }

  return parseAuditResult(output)
}
