import * as cheerio from "cheerio"

import type { QuickScanResult } from "@/types/audit"

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

export async function runQuickSeoScan(url: string): Promise<QuickScanResult> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    redirect: "follow",
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch website (${response.status})`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const title = normalizeText($("title").first().text())
  const metaDescription =
    normalizeText($("meta[name='description']").attr("content") ?? "")
  const h1 = normalizeText($("h1").first().text())
  const canonical = normalizeText($("link[rel='canonical']").attr("href") ?? "")
  const robots = normalizeText($("meta[name='robots']").attr("content") ?? "")

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
    checks,
  }
}
