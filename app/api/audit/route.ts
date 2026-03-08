import { randomUUID } from "node:crypto"

import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { analyzeWebsite } from "@/lib/analyze"
import { createAudit } from "@/lib/auditStore"
import { getErrorMessage } from "@/lib/error"
import { scrapeWebsite } from "@/lib/scrape"

interface AuditRequestBody {
  url?: string
}

export const runtime = "nodejs"

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function getDatabaseRuntimeDiagnostics() {
  const raw = process.env.DATABASE_URL

  if (!raw) {
    return {
      hasDatabaseUrl: false,
    }
  }

  try {
    const parsed = new URL(raw)

    return {
      hasDatabaseUrl: true,
      protocol: parsed.protocol.replace(":", ""),
      host: parsed.hostname,
      port: parsed.port || "(default)",
      usesSupabasePooler: parsed.hostname.includes("pooler.supabase.com"),
      hasPgbouncerFlag: parsed.searchParams.get("pgbouncer") === "true",
    }
  } catch {
    return {
      hasDatabaseUrl: true,
      parseable: false,
    }
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
    console.info("POST /api/audit attempting database save", {
      auditId: id,
      auditedHost: new URL(url).hostname,
      db: getDatabaseRuntimeDiagnostics(),
    })
    await createAudit({ id, url, result })
    console.info("POST /api/audit database save succeeded", {
      auditId: id,
    })

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    const prismaError =
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientRustPanicError
        ? error
        : null

    console.error("POST /api/audit failed", {
      message: getErrorMessage(error, "Internal server error"),
      prisma: prismaError
        ? {
            name: prismaError.name,
            code:
              "code" in prismaError && typeof prismaError.code === "string"
                ? prismaError.code
                : undefined,
            meta:
              "meta" in prismaError &&
              typeof prismaError.meta === "object" &&
              prismaError.meta !== null
                ? prismaError.meta
                : undefined,
          }
        : null,
      db: getDatabaseRuntimeDiagnostics(),
      error,
    })
    const message = getErrorMessage(error, "Internal server error")

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

    if (
      prismaError ||
      message.toLowerCase().includes("database") ||
      message.toLowerCase().includes("prisma")
    ) {
      return NextResponse.json(
        { error: "Database error while saving audit." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
