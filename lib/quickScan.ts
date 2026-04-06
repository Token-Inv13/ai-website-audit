import * as cheerio from "cheerio"
import type { CheerioAPI } from "cheerio"

import type { QuickScanResult } from "@/types/audit"

const QUICK_SCAN_TIMEOUT_MS = 8_000

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; AIWebsiteAuditBot/1.0; +https://example.com/bot)",
  Accept: "text/html,application/xhtml+xml",
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function isLengthInRange(length: number, min: number, max: number): boolean {
  return length >= min && length <= max
}

function countMeaningfulElements($: CheerioAPI): number {
  return $("main, article, section, header, footer, nav, p, h1, h2, h3, li, a, img").length
}

function getBodyTextLength($: CheerioAPI): number {
  return normalizeText($("body").text()).length
}

function hasClientRenderSignals(html: string): boolean {
  return (
    html.includes("__NEXT_DATA__") ||
    html.includes('id="__next"') ||
    html.includes("data-reactroot") ||
    html.includes("window.__NUXT__")
  )
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), QUICK_SCAN_TIMEOUT_MS)

  try {
    return await fetch(url, {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `Unable to fetch website (timeout after ${QUICK_SCAN_TIMEOUT_MS / 1000}s)`,
      )
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function runQuickSeoScan(url: string): Promise<QuickScanResult> {
  const response = await fetchWithTimeout(url)

  const html = await response.text()
  const $ = cheerio.load(html)

  const title = normalizeText($("title").first().text())
  const metaDescription =
    normalizeText($("meta[name='description']").attr("content") ?? "")
  const h1 = normalizeText($("h1").first().text())
  const canonical = normalizeText($("link[rel='canonical']").attr("href") ?? "")
  const robots = normalizeText($("meta[name='robots']").attr("content") ?? "")
  const finalUrl = response.url || url
  const bodyTextLength = getBodyTextLength($)
  const meaningfulElementCount = countMeaningfulElements($)
  const htmlIsSparse =
    html.length < 1_800 ||
    bodyTextLength < 120 ||
    meaningfulElementCount < 6 ||
    (hasClientRenderSignals(html) && bodyTextLength < 240)
  const robotsDirectives = robots.toLowerCase().split(/[,;]/).flatMap((chunk) =>
    chunk
      .trim()
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean),
  )
  const noindexDetected =
    robotsDirectives.includes("noindex") || robotsDirectives.includes("none")
  const canonicalMatches = canonical
    ? (() => {
        try {
          const canonicalUrl = new URL(canonical, finalUrl)
          const normalizedCanonical = canonicalUrl.toString().replace(/\/+$/, "")
          const normalizedFinal = new URL(finalUrl).toString().replace(/\/+$/, "")

          return normalizedCanonical === normalizedFinal
        } catch {
          return false
        }
      })()
    : false
  const hasStrongSignals = Boolean(title && metaDescription && h1)
  const verdict =
    response.status >= 400 || noindexDetected
      ? "potentially-blocked"
      : htmlIsSparse || !hasStrongSignals || !canonical || !canonicalMatches
        ? "needs-review"
        : "indexable"

  const confidence =
    response.status >= 400 || noindexDetected
      ? "medium"
      : htmlIsSparse
        ? "low"
        : hasStrongSignals && canonical && canonicalMatches
          ? "high"
          : "medium"

  const notes = [
    response.status >= 400
      ? `The page returned HTTP ${response.status}.`
      : `The page returned HTTP ${response.status} and can be fetched successfully.`,
    htmlIsSparse
      ? "The HTML shell is sparse, so this result is only partially verified."
      : `The page exposes ${bodyTextLength} visible characters and ${meaningfulElementCount} meaningful elements.`,
    noindexDetected
      ? "A noindex directive was detected in the robots meta tag."
      : robots
        ? `Robots meta tag detected: ${robots}.`
        : "No robots meta tag was detected.",
    canonical
      ? canonicalMatches
        ? "Canonical tag points to the current page."
        : `Canonical tag points to ${canonical}.`
      : "No canonical tag was detected.",
  ]

  const checks: QuickScanResult["checks"] = {
    title: title
      ? { status: "present", message: "Title tag detected." }
      : { status: "missing", message: "Title tag is missing." },
    metaDescription: metaDescription
      ? { status: "present", message: "Meta description detected." }
      : { status: "missing", message: "Meta description is missing." },
    h1: h1
      ? { status: "present", message: "H1 detected." }
      : { status: "missing", message: "H1 is missing." },
    https: url.startsWith("https://")
      ? { status: "present", message: "Website uses HTTPS." }
      : { status: "missing", message: "Website does not use HTTPS." },
    canonical: canonical
      ? { status: "present", message: "Canonical tag detected." }
      : { status: "missing", message: "Canonical tag is missing." },
    robots: robots
      ? { status: "present", message: "Robots meta tag detected." }
      : { status: "missing", message: "Robots meta tag is missing." },
    titleLength: !title
      ? { status: "missing", message: "Title length cannot be evaluated." }
      : isLengthInRange(title.length, 35, 65)
        ? { status: "present", message: `Title length is good (${title.length} chars).` }
        : {
            status: "warning",
            message: `Title length could be improved (${title.length} chars).`,
          },
    metaDescriptionLength: !metaDescription
      ? { status: "missing", message: "Meta description length cannot be evaluated." }
      : isLengthInRange(metaDescription.length, 140, 160)
        ? {
            status: "present",
            message: `Meta description length is good (${metaDescription.length} chars).`,
          }
        : {
            status: "warning",
            message: `Meta description length could be improved (${metaDescription.length} chars).`,
          },
  }

  const scoreWeights: Array<[keyof QuickScanResult["checks"], number]> = [
    ["title", 20],
    ["metaDescription", 20],
    ["h1", 15],
    ["https", 15],
    ["canonical", 15],
    ["robots", 15],
  ]

  const score = Math.max(
    0,
    Math.min(
      100,
      scoreWeights.reduce((total, [key, weight]) => {
        return checks[key].status === "present" ? total + weight : total
      }, 0),
    ),
  )

  return {
    url,
    score,
    indexation: {
      statusCode: response.status,
      finalUrl,
      title,
      robotsMeta: robots,
      canonicalHref: canonical,
      noindexDetected,
      canonicalMatches,
      htmlIsSparse,
      confidence,
      verdict,
      summary:
        verdict === "indexable"
          ? "Fully verified: this page looks indexable."
          : htmlIsSparse && response.status < 400
            ? "Partially verified: the page may be indexable, but the HTML shell is too sparse to confirm."
            : response.status >= 400
              ? "The page returned an error response and may not be indexable."
              : "The page is reachable, but something may still block indexing.",
      notes,
    },
    checks,
  }
}
