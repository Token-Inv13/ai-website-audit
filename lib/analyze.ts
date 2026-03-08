import OpenAI from "openai"

import type {
  AuditResult,
  CopySuggestions,
  DetailedRecommendation,
  ScrapedWebsiteData,
} from "@/types/audit"

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
  quickWins: [
    "Add a visible primary CTA above the fold.",
    "Rewrite the headline around a clear user benefit.",
    "Add testimonials or trust badges near the hero section.",
  ],
  detailedRecommendations: [
    {
      title: "Rewrite the headline",
      whyItMatters:
        "Visitors need to understand the value of the product immediately.",
      recommendedAction:
        "Use a benefit-driven headline focused on the outcome for the user.",
      example: "Organize notes, tasks, and ideas in one simple workspace.",
    },
    {
      title: "Improve CTA visibility",
      whyItMatters:
        "A hidden CTA reduces conversions because users do not know what to do next.",
      recommendedAction:
        "Place a primary CTA button in the hero section with strong contrast.",
      example: "Start your free audit",
    },
    {
      title: "Add trust signals",
      whyItMatters:
        "Trust indicators reduce hesitation and improve conversion rates.",
      recommendedAction:
        "Display testimonials, review snippets, or client logos close to the top section.",
      example: "Trusted by founders, freelancers, and small teams.",
    },
  ],
  copySuggestions: {
    suggestedHeadline: "Analyze your website and improve conversions in minutes.",
    suggestedCTA: "Get Your Website Audit",
    suggestedMetaDescription:
      "Get an AI-powered website audit with actionable SEO, UX, and conversion insights to improve your landing page performance.",
  },
}

const SYSTEM_PROMPT = `You are an expert in SEO, UX, and conversion rate optimization.

Analyze the website data and produce a concrete, actionable audit that a business owner can apply immediately.

Return strictly valid JSON only (no markdown, no extra text) using this exact shape:
{
  "overallScore": number,
  "seoScore": number,
  "conversionScore": number,
  "uxScore": number,
  "problems": [string, string, string, string, string],
  "improvements": [string, string, string, string, string],
  "quickWins": [string, string, string],
  "detailedRecommendations": [
    {
      "title": string,
      "whyItMatters": string,
      "recommendedAction": string,
      "example": string
    },
    {
      "title": string,
      "whyItMatters": string,
      "recommendedAction": string,
      "example": string
    },
    {
      "title": string,
      "whyItMatters": string,
      "recommendedAction": string,
      "example": string
    }
  ],
  "copySuggestions": {
    "suggestedHeadline": string,
    "suggestedCTA": string,
    "suggestedMetaDescription": string
  }
}

Rules:
- Keep scores between 0 and 100.
- problems and improvements must be concise and specific.
- quickWins must be high-impact and quick to implement.
- detailedRecommendations must be concrete and practical.
- copySuggestions must be short, credible, and ready to use.
- suggestedHeadline: benefit-driven and concise.
- suggestedCTA: short, action-oriented CTA for a landing page.
- suggestedMetaDescription: natural SEO copy around 140 to 160 characters.
- Use plain English for end users.
- Output JSON only.`

function clampScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

function normalizeList(value: unknown, maxLength: number): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxLength)
}

function normalizeDetailedRecommendations(
  value: unknown,
): DetailedRecommendation[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => typeof item === "object" && item !== null)
    .map((item) => {
      const record = item as Record<string, unknown>

      return {
        title: typeof record.title === "string" ? record.title.trim() : "",
        whyItMatters:
          typeof record.whyItMatters === "string"
            ? record.whyItMatters.trim()
            : "",
        recommendedAction:
          typeof record.recommendedAction === "string"
            ? record.recommendedAction.trim()
            : "",
        example: typeof record.example === "string" ? record.example.trim() : "",
      }
    })
    .filter(
      (item) =>
        item.title && item.whyItMatters && item.recommendedAction && item.example,
    )
    .slice(0, 3)
}

function buildFallbackDetailedRecommendations(
  improvements: string[],
): DetailedRecommendation[] {
  const fallback = [
    {
      title: "Clarify your value proposition",
      whyItMatters:
        "Users decide in seconds whether the page is relevant to them.",
      recommendedAction:
        "Make the main headline specific about the audience and benefit.",
      example: "Get a complete website audit in under 2 minutes.",
    },
    {
      title: "Strengthen the main CTA",
      whyItMatters: "A clear next step improves conversion rates.",
      recommendedAction:
        "Place one primary CTA above the fold with high color contrast.",
      example: "Start your free audit",
    },
    {
      title: "Add trust elements",
      whyItMatters:
        "Trust signals reduce hesitation before users take action.",
      recommendedAction:
        "Add testimonials, logos, or social proof near the hero section.",
      example: "Trusted by 500+ startups",
    },
  ]

  return fallback.map((item, index) => ({
    ...item,
    recommendedAction: improvements[index] ?? item.recommendedAction,
  }))
}

function normalizeCopySuggestions(value: unknown): CopySuggestions | null {
  if (typeof value !== "object" || value === null) {
    return null
  }

  const record = value as Record<string, unknown>
  const suggestedHeadline =
    typeof record.suggestedHeadline === "string"
      ? record.suggestedHeadline.trim()
      : ""
  const suggestedCTA =
    typeof record.suggestedCTA === "string" ? record.suggestedCTA.trim() : ""
  const suggestedMetaDescription =
    typeof record.suggestedMetaDescription === "string"
      ? record.suggestedMetaDescription.trim()
      : ""

  if (!suggestedHeadline || !suggestedCTA || !suggestedMetaDescription) {
    return null
  }

  return {
    suggestedHeadline,
    suggestedCTA,
    suggestedMetaDescription,
  }
}

function parseAuditResult(raw: string): AuditResult {
  const normalized = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "")
  const parsed = JSON.parse(normalized) as Record<string, unknown>

  const problems = normalizeList(parsed.problems, 5)
  const improvements = normalizeList(parsed.improvements, 5)
  const quickWins = normalizeList(parsed.quickWins, 3)
  const detailedRecommendations = normalizeDetailedRecommendations(
    parsed.detailedRecommendations,
  )
  const copySuggestions = normalizeCopySuggestions(parsed.copySuggestions)

  return {
    overallScore: clampScore(parsed.overallScore),
    seoScore: clampScore(parsed.seoScore),
    conversionScore: clampScore(parsed.conversionScore),
    uxScore: clampScore(parsed.uxScore),
    problems,
    improvements,
    quickWins:
      quickWins.length === 3
        ? quickWins
        : [
            ...(quickWins.length > 0 ? quickWins : improvements.slice(0, 3)),
            ...MOCK_AUDIT_RESULT.quickWins,
          ].slice(0, 3),
    detailedRecommendations:
      detailedRecommendations.length === 3
        ? detailedRecommendations
        : buildFallbackDetailedRecommendations(improvements),
    copySuggestions: copySuggestions ?? MOCK_AUDIT_RESULT.copySuggestions,
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
