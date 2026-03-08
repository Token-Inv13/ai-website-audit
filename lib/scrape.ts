import * as cheerio from "cheerio"

import type { ScrapedWebsiteData } from "@/types/audit"

export async function scrapeWebsite(url: string): Promise<ScrapedWebsiteData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AIWebsiteAuditBot/1.0; +https://example.com/bot)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch website (${response.status})`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const title = $("title").first().text().trim()
  const metaDescription =
    $("meta[name='description']").attr("content")?.trim() ?? ""
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim()
  const h2 = $("h2")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean)
    .slice(0, 20)

  const textSource = $("main").text() || $("body").text()
  const textContent = textSource.replace(/\s+/g, " ").trim().slice(0, 2000)

  return {
    title,
    metaDescription,
    h1,
    h2,
    textContent,
  }
}
