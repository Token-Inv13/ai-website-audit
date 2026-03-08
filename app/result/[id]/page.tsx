"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

import AuditReport from "@/components/AuditReport"
import type { AuditResult } from "@/types/audit"

interface AuditApiResponse {
  url: string
  result: AuditResult
  createdAt: string
  unlocked: boolean
}

export default function ResultPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params?.id
  const [result, setResult] = useState<AuditResult | null>(null)
  const [url, setUrl] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const hasValidId = typeof id === "string" && id.length > 0
  const unlockedFromQuery = searchParams.get("unlocked") === "1"

  useEffect(() => {
    if (!hasValidId) {
      return
    }

    let active = true

    async function loadAudit() {
      try {
        setError("")
        const response = await fetch(`/api/audit/${id}`, { cache: "no-store" })
        const payload = (await response.json()) as
          | AuditApiResponse
          | { error?: string }

        if (!response.ok || !("result" in payload)) {
          const errorMessage = "error" in payload ? payload.error : undefined
          throw new Error(errorMessage || "Audit not found.")
        }

        if (!active) {
          return
        }

        setResult(payload.result)
        setUrl(payload.url)
        setIsUnlocked(payload.unlocked)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error ? loadError.message : "Unable to load this audit."
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAudit()

    return () => {
      active = false
    }
  }, [hasValidId, id, unlockedFromQuery])

  async function handleUnlock() {
    if (!id) {
      return
    }

    setCheckoutLoading(true)
    setCheckoutError("")

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auditId: id }),
      })

      const payload = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Checkout session creation failed.")
      }

      window.location.href = payload.url
    } catch (unlockError) {
      const message =
        unlockError instanceof Error ? unlockError.message : "Unable to start checkout."
      setCheckoutError(message)
      setCheckoutLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Website Audit Report</h1>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            New Audit
          </Link>
        </div>

        {unlockedFromQuery ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">
              Payment successful. Your full report is now unlocked.
            </p>
          </div>
        ) : null}

        {!hasValidId ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-red-600">Audit not found.</p>
          </div>
        ) : null}

        {hasValidId && loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-700">Loading audit report...</p>
          </div>
        ) : null}

        {hasValidId && !loading && error ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
        ) : null}

        {hasValidId && !loading && !error && result ? (
          <AuditReport
            result={result}
            url={url}
            unlocked={isUnlocked}
            onUnlock={handleUnlock}
            checkoutLoading={checkoutLoading}
            checkoutError={checkoutError}
          />
        ) : null}
      </div>
    </main>
  )
}
