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
  const [shareFeedback, setShareFeedback] = useState("")

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

  function buildShareUrl(): string | null {
    if (!id) {
      return null
    }

    const base =
      process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim()
        ? process.env.NEXT_PUBLIC_APP_URL
        : window.location.origin

    return `${base.replace(/\/$/, "")}/result/${id}`
  }

  async function handleShareReport() {
    const shareUrl = buildShareUrl()

    if (!shareUrl) {
      setShareFeedback("Unable to build report link.")
      return
    }

    setShareFeedback("")

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: "Website Audit Report",
          text: "Check this website audit report.",
          url: shareUrl,
        })
        setShareFeedback("Report link shared.")
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setShareFeedback("Report link copied.")
    } catch (shareError) {
      const message = getErrorMessage(shareError, "Unable to share report.")
      if (message.toLowerCase().includes("abort")) {
        return
      }

      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareFeedback("Report link copied.")
      } catch {
        setShareFeedback("Unable to copy report link.")
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="glass-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                AI Website Audit
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Website Audit Report
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Prioritized improvements for SEO, conversion, and UX with clear execution guidance.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {hasValidId ? (
                <a
                  href={`/api/report/${id}`}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white"
                >
                  Download PDF
                </a>
              ) : null}
              {hasValidId ? (
                <button
                  type="button"
                  onClick={handleShareReport}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white"
                >
                  Share Report
                </button>
              ) : null}
              <Link
                href="/"
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white"
              >
                New Audit
              </Link>
              {shareFeedback ? (
                <p className="w-full text-right text-xs font-medium text-slate-600">
                  {shareFeedback}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        {unlockedFromQuery ? (
          <div className="soft-panel border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-sm font-medium text-emerald-800">
              Payment successful. Your full report is now unlocked.
            </p>
          </div>
        ) : null}

        {!hasValidId ? (
          <div className="soft-panel p-8">
            <p className="text-red-600">Audit not found.</p>
          </div>
        ) : null}

        {hasValidId && loading ? (
          <div className="soft-panel p-8">
            <p className="text-slate-700">Loading audit report...</p>
          </div>
        ) : null}

        {hasValidId && !loading && error ? (
          <div className="soft-panel p-8">
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
