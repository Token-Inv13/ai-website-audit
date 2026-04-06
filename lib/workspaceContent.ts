import OpenAI from "openai"

import type { AiContentResult } from "@/types/audit"

export interface ContentInput {
  sourceText: string
  focusKeyword?: string
}

const SYSTEM_PROMPT = `You are an SEO and content specialist.

Improve the provided text into concise, useful SEO content assets.

Return strictly valid JSON only with this exact shape:
{
  "metaTitle": string,
  "metaDescription": string,
  "suggestedH1": string,
  "suggestedH2": [string, string, string],
  "rewrite": string,
  "seoTips": [string, string, string, string]
}

Rules:
- Keep the meta title concise and commercially useful.
- Keep the meta description natural and around 140 to 160 characters.
- Make the H1 clear, direct, and aligned with the topic.
- Make the H2 suggestions practical section headings.
- Make the rewrite easy to copy and adapted to a landing page or article intro.
- Give short, actionable SEO tips.
- Output JSON only.`

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function fallbackContent(input: ContentInput): AiContentResult {
  const sourceText = normalizeText(input.sourceText)
  const keyword = normalizeText(input.focusKeyword ?? sourceText.split(" ").slice(0, 4).join(" "))
  const topic = keyword || "SEO content"

  return {
    sourceText,
    focusKeyword: keyword,
    metaTitle: `${topic} | SEOAuditAI`,
    metaDescription: `Improve ${topic.toLowerCase()} with a clearer structure, stronger search intent, and a more actionable message.`,
    suggestedH1: `Improve ${topic}`,
    suggestedH2: [
      `Why ${topic} matters`,
      `How to improve ${topic}`,
      `Quick wins for ${topic}`,
    ],
    rewrite:
      sourceText.length > 0
        ? sourceText
        : `Use ${topic} to create a clearer page with a single message, a useful structure, and obvious next steps.`,
    seoTips: [
      `Use the keyword "${keyword}" naturally in the title and H1.`,
      "Keep the introduction short and specific.",
      "Add one clear next step or CTA.",
      "Use H2s to break the page into scannable sections.",
    ],
  }
}

function parseResult(raw: string, input: ContentInput): AiContentResult {
  const normalized = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "")
  const parsed = JSON.parse(normalized) as Record<string, unknown>
  const sourceText = normalizeText(input.sourceText)
  const focusKeyword = normalizeText(input.focusKeyword ?? "")

  return {
    sourceText,
    focusKeyword,
    metaTitle:
      typeof parsed.metaTitle === "string" && parsed.metaTitle.trim()
        ? parsed.metaTitle.trim()
        : fallbackContent(input).metaTitle,
    metaDescription:
      typeof parsed.metaDescription === "string" && parsed.metaDescription.trim()
        ? parsed.metaDescription.trim()
        : fallbackContent(input).metaDescription,
    suggestedH1:
      typeof parsed.suggestedH1 === "string" && parsed.suggestedH1.trim()
        ? parsed.suggestedH1.trim()
        : fallbackContent(input).suggestedH1,
    suggestedH2: Array.isArray(parsed.suggestedH2)
      ? parsed.suggestedH2
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 3)
      : fallbackContent(input).suggestedH2,
    rewrite:
      typeof parsed.rewrite === "string" && parsed.rewrite.trim()
        ? parsed.rewrite.trim()
        : fallbackContent(input).rewrite,
    seoTips: Array.isArray(parsed.seoTips)
      ? parsed.seoTips
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 4)
      : fallbackContent(input).seoTips,
  }
}

export async function improveContent(input: ContentInput): Promise<AiContentResult> {
  const sourceText = normalizeText(input.sourceText)
  if (!sourceText) {
    throw new Error("Please paste some text first.")
  }

  if (process.env.MOCK_AI === "true") {
    return fallbackContent(input)
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return fallbackContent(input)
  }

  const client = new OpenAI({ apiKey })
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Source text:\n${sourceText}\n\nFocus keyword:\n${normalizeText(input.focusKeyword ?? "") || "none"}`,
      },
    ],
  })

  const output = response.output_text

  if (!output) {
    return fallbackContent(input)
  }

  try {
    return parseResult(output, input)
  } catch {
    return fallbackContent(input)
  }
}
