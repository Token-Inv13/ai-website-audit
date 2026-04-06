import * as cheerio from "cheerio"

import type {
  CompetitionAction,
  CompetitionAnalysis,
  CompetitionSignal,
} from "@/types/audit"

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; AIWebsiteAuditBot/1.0; +https://example.com/bot)",
  Accept: "text/html,application/xhtml+xml",
}

const COMPETITION_TIMEOUT_MS = 8_000

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function toAbsoluteUrl(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

function looksLikeKeyword(value: string): boolean {
  return !value.includes(".") && !/^https?:\/\//i.test(value.trim())
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), COMPETITION_TIMEOUT_MS)

  try {
    return await fetch(url, {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

function averageSentenceLength(text: string): number {
  const sentences = text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (sentences.length === 0) {
    return 0
  }

  const totalWords = sentences.reduce(
    (count, sentence) => count + sentence.split(/\s+/).filter(Boolean).length,
    0,
  )

  return Math.round(totalWords / sentences.length)
}

function buildSignals($: cheerio.CheerioAPI, finalUrl: string): CompetitionSignal[] {
  const title = normalizeText($("title").first().text())
  const metaDescription = normalizeText(
    $("meta[name='description']").attr("content") ?? "",
  )
  const h1s = $("h1")
    .map((_, element) => normalizeText($(element).text()))
    .get()
    .filter(Boolean)
  const h2s = $("h2")
    .map((_, element) => normalizeText($(element).text()))
    .get()
    .filter(Boolean)
  const canonical = normalizeText($("link[rel='canonical']").attr("href") ?? "")
  const robots = normalizeText($("meta[name='robots']").attr("content") ?? "")
  const bodyText = normalizeText($("main").text() || $("body").text())

  const signals: CompetitionSignal[] = [
    {
      label: "Title",
      value: title ? `${title.length} chars` : "Missing",
      status:
        title.length >= 30 && title.length <= 65
          ? "good"
          : title
            ? "warning"
            : "warning",
    },
    {
      label: "Meta description",
      value: metaDescription ? `${metaDescription.length} chars` : "Missing",
      status:
        metaDescription.length >= 120 && metaDescription.length <= 165
          ? "good"
          : metaDescription
            ? "warning"
            : "warning",
    },
    {
      label: "Headings",
      value: `${h1s.length} H1 / ${h2s.length} H2`,
      status: h1s.length >= 1 ? "good" : "warning",
    },
    {
      label: "Content depth",
      value: `${bodyText.length} chars`,
      status: bodyText.length >= 800 ? "good" : bodyText.length >= 300 ? "neutral" : "warning",
    },
    {
      label: "Canonical",
      value: canonical ? "Present" : "Missing",
      status: canonical ? "good" : "warning",
    },
    {
      label: "Robots",
      value: robots || "Not detected",
      status: robots.toLowerCase().includes("noindex") ? "warning" : "neutral",
    },
    {
      label: "Readability",
      value: `${averageSentenceLength(bodyText) || 0} words per sentence`,
      status:
        averageSentenceLength(bodyText) > 24 ? "warning" : averageSentenceLength(bodyText) > 0 ? "neutral" : "warning",
    },
    {
      label: "Final URL",
      value: finalUrl,
      status: "neutral",
    },
  ]

  return signals
}

function scorePage(signals: CompetitionSignal[]): number {
  const weights: Record<CompetitionSignal["status"], number> = {
    good: 18,
    neutral: 9,
    warning: 0,
  }

  return Math.min(
    100,
    signals.reduce((score, signal) => score + weights[signal.status], 0),
  )
}

function buildActions(
  yourSignals: CompetitionSignal[],
  competitorSignals: CompetitionSignal[],
): CompetitionAction[] {
  const yourTitle = yourSignals.find((signal) => signal.label === "Title")
  const competitorTitle = competitorSignals.find((signal) => signal.label === "Title")
  const yourMeta = yourSignals.find((signal) => signal.label === "Meta description")
  const competitorMeta = competitorSignals.find((signal) => signal.label === "Meta description")
  const yourH = yourSignals.find((signal) => signal.label === "Headings")
  const competitorH = competitorSignals.find((signal) => signal.label === "Headings")
  const yourContent = yourSignals.find((signal) => signal.label === "Content depth")
  const competitorContent = competitorSignals.find((signal) => signal.label === "Content depth")

  const actions: CompetitionAction[] = []

  if (yourTitle?.status !== "good" && competitorTitle?.status === "good") {
    actions.push({
      title: "Tighten the title strategy",
      priority: "High",
      description:
        "Their page is better optimized for title clarity. Your page could improve this first.",
    })
  }

  if (yourMeta?.status !== "good" && competitorMeta?.status === "good") {
    actions.push({
      title: "Upgrade the meta description",
      priority: "High",
      description:
        "Opportunity found: a stronger meta description can improve search snippet appeal.",
    })
  }

  if (yourH?.status !== "good" && competitorH?.status === "good") {
    actions.push({
      title: "Clarify the heading structure",
      priority: "Medium",
      description:
        "Their page uses headings more clearly. Your page could improve scannability and relevance.",
    })
  }

  if (yourContent?.status !== "good" && competitorContent?.status === "good") {
    actions.push({
      title: "Add more topical depth",
      priority: "Medium",
      description:
        "Their page is better optimized for content depth. Expand the core section with more proof and context.",
    })
  }

  if (actions.length === 0) {
    actions.push({
      title: "Find a clearer positioning angle",
      priority: "Low",
      description:
        "Both pages look comparable on the visible signals. The next opportunity is sharper positioning and proof.",
    })
  }

  return actions.slice(0, 4)
}

function buildKeywordAnalysis(keyword: string, yourUrl: string | null): CompetitionAnalysis {
  const cleanedKeyword = normalizeText(keyword)
  const intent = cleanedKeyword.length > 24 ? "informational" : "commercial"
  const action = cleanedKeyword.includes("how") || cleanedKeyword.includes("what")
    ? "education-led"
    : "commercial-led"

  const yourPageSignals: CompetitionSignal[] = [
    {
      label: "Your page",
      value: yourUrl ? "Provided" : "Not provided",
      status: yourUrl ? "neutral" : "warning",
    },
  ]

  const competitorSignals: CompetitionSignal[] = [
    {
      label: "Keyword intent",
      value: intent,
      status: "good",
    },
    {
      label: "Recommended angle",
      value: action,
      status: "good",
    },
    {
      label: "Opportunity",
      value: "Create a page that matches the search intent more directly.",
      status: "good",
    },
  ]

  const comparisonNotes = [
    `Opportunity found: ${cleanedKeyword} should be framed with a ${intent} page type.`,
    "Their page is better optimized for intent when the content matches the query format closely.",
    yourUrl
      ? "Your page could improve by aligning headline, meta, and section structure with the keyword."
      : "Add your page URL later to compare the live page against this keyword opportunity.",
  ]

  return {
    mode: "keyword",
    input: cleanedKeyword,
    yourUrl,
    competitorUrl: null,
    focusKeyword: cleanedKeyword,
    confidence: "medium",
    summary: `Keyword opportunity mapped for ${cleanedKeyword}.`,
    opportunity: "Use the keyword as the basis for a clearer landing page angle.",
    yourPageSignals,
    competitorSignals,
    comparisons: comparisonNotes,
    actions: [
      {
        title: "Match the search intent",
        priority: "High",
        description:
          "Make sure the page format fits the keyword intent before adding more content.",
      },
      {
        title: "Improve the primary message",
        priority: "Medium",
        description:
          "Use the keyword in the headline and meta description without sounding forced.",
      },
      {
        title: "Add proof and detail",
        priority: "Low",
        description:
          "Expand the page with examples, benefits, and one clear next step.",
      },
    ],
  }
}

async function analyzeUrlMode(
  yourUrl: string | null,
  competitorUrl: string,
): Promise<CompetitionAnalysis> {
  const response = await fetchWithTimeout(competitorUrl)

  if (!response.ok) {
    throw new Error(`Unable to fetch competitor page (${response.status})`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const finalUrl = response.url || competitorUrl
  const competitorSignals = buildSignals($, finalUrl)
  const competitorScore = scorePage(competitorSignals)

  let yourSignals: CompetitionSignal[] = []
  let yourScore: number | null = null

  if (yourUrl) {
    const myResponse = await fetchWithTimeout(yourUrl)

    if (myResponse.ok) {
      const myHtml = await myResponse.text()
      const myDom = cheerio.load(myHtml)
      const normalizedYourUrl = myResponse.url || yourUrl
      yourSignals = buildSignals(myDom, normalizedYourUrl)
      yourScore = scorePage(yourSignals)
    } else {
      yourSignals = [
        {
          label: "Your page",
          value: `HTTP ${myResponse.status}`,
          status: "warning",
        },
      ]
    }
  }

  const comparisons = [
    yourScore !== null
      ? `Your page score: ${yourScore}/100 vs competitor score: ${competitorScore}/100.`
      : `Competitor score: ${competitorScore}/100. Add your URL to compare live signals.`,
    competitorSignals.find((signal) => signal.label === "Content depth")?.status === "good"
      ? "Their page is better optimized for content depth."
      : "Their page is not clearly stronger on content depth.",
    competitorSignals.find((signal) => signal.label === "Title")?.status === "good"
      ? "Their page is better optimized for title clarity."
      : "Their title signal is not a clear advantage.",
  ]

  const actions = buildActions(
    yourSignals.length ? yourSignals : [
      {
        label: "Your page",
        value: yourUrl ? "Provided" : "Not provided",
        status: yourUrl ? "neutral" : "warning",
      },
    ],
    competitorSignals,
  )

  const confidence =
    yourUrl && yourScore !== null
      ? "high"
      : competitorScore >= 70
        ? "medium"
        : "low"

  return {
    mode: "url",
    input: competitorUrl,
    yourUrl,
    competitorUrl: finalUrl,
    focusKeyword: null,
    confidence,
    summary:
      yourScore !== null
        ? "Live comparison generated from visible SEO signals."
        : "Competitor page analyzed from visible SEO signals.",
    opportunity:
      competitorSignals.some((signal) => signal.status === "warning")
        ? "Opportunity found: the page has visible SEO gaps that are easy to improve."
        : "The visible signals are solid. The next opportunity is positioning and differentiation.",
    yourPageSignals:
      yourSignals.length > 0
        ? yourSignals
        : [
            {
              label: "Your page",
              value: yourUrl ? "Provided" : "Not provided",
              status: yourUrl ? "neutral" : "warning",
            },
          ],
    competitorSignals,
    comparisons,
    actions,
  }
}

export async function analyzeCompetition(params: {
  target: string
  yourUrl?: string
}): Promise<CompetitionAnalysis> {
  const target = normalizeText(params.target)
  const yourUrl = params.yourUrl ? toAbsoluteUrl(params.yourUrl) : null
  const competitorUrl = toAbsoluteUrl(target)

  if (competitorUrl) {
    return analyzeUrlMode(yourUrl, competitorUrl)
  }

  if (looksLikeKeyword(target)) {
    return buildKeywordAnalysis(target, yourUrl)
  }

  throw new Error("Please enter a valid competitor domain or keyword.")
}
