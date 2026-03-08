"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

import AuditReport from "@/components/AuditReport"
import { getApiErrorMessage, getErrorMessage } from "@/lib/error"
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
        const payload = (await response
          .json()
          .catch(() => null)) as AuditApiResponse | null

        if (!response.ok) {
          throw new Error(getApiErrorMessage(payload, "Audit not found."))
        }

        if (!payload || !("result" in payload)) {
          throw new Error("Audit not found.")
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

        setError(getErrorMessage(loadError, "Unable to load this audit."))
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

      const payload = (await response
        .json()
        .catch(() => null)) as { url?: string } | null

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(payload, "Checkout session creation failed."),
        )
      }

      if (!payload?.url) {
        throw new Error("Checkout session creation failed.")
      }

      window.location.href = payload.url
    } catch (unlockError) {
      setCheckoutError(getErrorMessage(unlockError, "Unable to start checkout."))
      setCheckoutLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                AI Website Audit
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Website Audit Report
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Prioritized improvements for SEO, conversion, and UX with clear execution guidance.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              New Audit
            </Link>
          </div>
        </header>

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
