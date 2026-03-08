import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import { analyzeWebsite } from "@/lib/analyze"
import { createAudit } from "@/lib/auditStore"
import { scrapeWebsite } from "@/lib/scrape"

interface AuditRequestBody {
  url?: string
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuditRequestBody
    const url = body.url?.trim()

    if (!url || !isValidHttpUrl(url)) {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 })
    }

    const scrapedData = await scrapeWebsite(url)
    const result = await analyzeWebsite(scrapedData)

    const id = randomUUID()
    await createAudit({ id, url, result })

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Configure OPENAI_API_KEY." },
        { status: 500 },
      )
    }

    if (message.includes("Unable to fetch website")) {
      return NextResponse.json(
        { error: "Website is unreachable or blocked." },
        { status: 502 },
      )
    }

    if (message.toLowerCase().includes("openai") || message.toLowerCase().includes("json")) {
      return NextResponse.json(
        { error: "OpenAI analysis failed. Please retry." },
        { status: 502 },
      )
    }

    if (message.toLowerCase().includes("database") || message.toLowerCase().includes("prisma")) {
      return NextResponse.json(
        { error: "Database error while saving audit." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: "Unexpected error while running the audit." },
      { status: 500 },
    )
  }
}
