"use client"

import { useEffect, useRef, useState } from "react"
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
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [shareFeedback, setShareFeedback] = useState("")
  const shareUrlInputRef = useRef<HTMLInputElement | null>(null)

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

  useEffect(() => {
    if (!isShareOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShareOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    shareUrlInputRef.current?.focus()
    shareUrlInputRef.current?.select()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isShareOpen])

  function openShareModal() {
    const nextShareUrl = buildShareUrl()

    if (!nextShareUrl) {
      setShareFeedback("Unable to build report link.")
      return
    }

    setShareUrl(nextShareUrl)
    setShareFeedback("")
    setIsShareOpen(true)
  }

  async function handleCopyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareFeedback("Report link copied.")
    } catch {
      setShareFeedback("Unable to copy report link.")
    }
  }

  async function handleNativeShare() {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return
    }

    try {
      await navigator.share({
        title: "Website Audit Report",
        text: "Check this website audit report.",
        url: shareUrl,
      })
      setShareFeedback("Report link shared.")
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
                  onClick={openShareModal}
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

      {isShareOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsShareOpen(false)
            }
          }}
        >
          <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.6)] sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">Share Report</h2>
            <p className="mt-2 text-sm text-slate-600">
              Copy and share this report link. Access level still follows the current unlock rules.
            </p>

            <div className="mt-5">
              <label
                htmlFor="share-report-url"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Report Link
              </label>
              <input
                ref={shareUrlInputRef}
                id="share-report-url"
                readOnly
                value={shareUrl}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Copy Link
              </button>
              {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Share
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {shareFeedback ? (
              <p className="mt-3 text-sm font-medium text-slate-600">{shareFeedback}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  )
}
