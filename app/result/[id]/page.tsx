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
  hasEmail: boolean
  isPublic: boolean
  domainNormalized: string
  publicPath: string | null
  canManageVisibility: boolean
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
  const [hasEmail, setHasEmail] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [publicPath, setPublicPath] = useState<string | null>(null)
  const [canManageVisibility, setCanManageVisibility] = useState(false)
  const [visibilityLoading, setVisibilityLoading] = useState(false)
  const [visibilityFeedback, setVisibilityFeedback] = useState("")
  const [visibilityError, setVisibilityError] = useState("")
  const [publicLinkFeedback, setPublicLinkFeedback] = useState("")
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [shareFeedback, setShareFeedback] = useState("")
  const shareUrlInputRef = useRef<HTMLInputElement | null>(null)
  const emailInputRef = useRef<HTMLInputElement | null>(null)

  const hasValidId = typeof id === "string" && id.length > 0
  const unlockedFromQuery = searchParams.get("unlocked") === "1"
  const paymentSuccessFromQuery = searchParams.get("payment") === "success"

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
        setHasEmail(payload.hasEmail)
        setIsPublic(payload.isPublic)
        setPublicPath(payload.publicPath)
        setCanManageVisibility(payload.canManageVisibility)
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

  async function handleCaptureEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!id || !canManageVisibility || emailLoading) {
      return
    }

    setEmailLoading(true)
    setEmailFeedback("")
    setEmailError("")
    setCheckoutError("")

    try {
      const response = await fetch(`/api/audit/${id}/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput }),
      })

      const payload = (await response
        .json()
        .catch(() => null)) as { hasEmail?: boolean; error?: string } | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Unable to save your email."))
      }

      setHasEmail(Boolean(payload?.hasEmail))
      setEmailFeedback("Your email has been saved.")
    } catch (captureError) {
      setEmailError(getErrorMessage(captureError, "Unable to save your email."))
    } finally {
      setEmailLoading(false)
    }
  }

  function buildPublicReportUrl(): string | null {
    if (!publicPath) {
      return null
    }

    const base =
      process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim()
        ? process.env.NEXT_PUBLIC_APP_URL
        : typeof window !== "undefined"
          ? window.location.origin
          : ""

    if (!base) {
      return null
    }

    return `${base.replace(/\/$/, "")}/report/${encodeURIComponent(publicPath)}`
  }

  async function handleUpdateVisibility(nextIsPublic: boolean) {
    if (!id || !canManageVisibility || visibilityLoading) {
      return
    }

    setVisibilityLoading(true)
    setVisibilityError("")
    setVisibilityFeedback("")
    setPublicLinkFeedback("")

    try {
      const response = await fetch(`/api/audit/${id}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: nextIsPublic }),
      })

      const payload = (await response
        .json()
        .catch(() => null)) as {
        isPublic?: boolean
        publicPath?: string | null
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Unable to update report visibility."))
      }

      const updatedVisibility =
        typeof payload?.isPublic === "boolean" ? payload.isPublic : nextIsPublic
      setIsPublic(updatedVisibility)
      setPublicPath(payload?.publicPath ?? null)
      setVisibilityFeedback(updatedVisibility ? "Report is now public." : "Report is now private.")
    } catch (visibilityUpdateError) {
      setVisibilityError(
        getErrorMessage(visibilityUpdateError, "Unable to update report visibility."),
      )
    } finally {
      setVisibilityLoading(false)
    }
  }

  async function handleUnlock() {
    if (!id) {
      return
    }

    if (!hasEmail) {
      setCheckoutError("Please enter your email before unlocking the full report.")
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

  useEffect(() => {
    if (!hasValidId || loading || error || hasEmail) {
      return
    }

    emailInputRef.current?.focus()
  }, [error, hasEmail, hasValidId, loading])

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

  async function handleCopyPublicLink() {
    const publicUrl = buildPublicReportUrl()
    if (!publicUrl) {
      setPublicLinkFeedback("Public link is unavailable.")
      return
    }

    try {
      await navigator.clipboard.writeText(publicUrl)
      setPublicLinkFeedback("Link copied.")
    } catch {
      setPublicLinkFeedback("Unable to copy link.")
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

        {unlockedFromQuery || paymentSuccessFromQuery ? (
          <div className="soft-panel border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-sm font-medium text-emerald-800">
              {isUnlocked
                ? "Payment successful. Your full report is now unlocked."
                : "Payment received. Your report is being unlocked. Refresh in a few seconds if needed."}
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

        {hasValidId && !loading && !error ? (
          <section className="soft-panel p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Report visibility</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  isPublic
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isPublic ? "Public" : "Private"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Public reports can be indexed by search engines and shared publicly.
            </p>

            {canManageVisibility ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateVisibility(!isPublic)}
                  disabled={visibilityLoading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {visibilityLoading
                    ? "Updating..."
                    : isPublic
                      ? "Make this report private"
                      : "Make this report public"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm font-medium text-amber-700">
                You can view this report, but only the owner can change its visibility.
              </p>
            )}

            {isPublic && publicPath ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Public report link
                </p>
                <p className="mt-1 break-all text-sm text-slate-700">{buildPublicReportUrl()}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            ) : null}

            {visibilityFeedback ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">{visibilityFeedback}</p>
            ) : null}
            {visibilityError ? (
              <p className="mt-3 text-sm font-medium text-red-600">{visibilityError}</p>
            ) : null}
            {publicLinkFeedback ? (
              <p className="mt-2 text-sm font-medium text-slate-600">{publicLinkFeedback}</p>
            ) : null}
          </section>
        ) : null}

        {hasValidId && !loading && !error && result ? (
          <AuditReport
            result={result}
            url={url}
            unlocked={isUnlocked}
            emailCaptured={hasEmail}
            onUnlock={handleUnlock}
            canUnlock={hasEmail}
            unlockHelperText={
              hasEmail
                ? "Continue to unlock the full report."
                : "Enter your email to unlock the full report."
            }
            checkoutLoading={checkoutLoading}
            checkoutError={checkoutError}
          />
        ) : null}
      </div>

      {hasValidId && !loading && !error && !hasEmail ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.6)] sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Audit Access
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your audit is ready</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email to view the full audit preview.
            </p>

            {canManageVisibility ? (
              <form onSubmit={handleCaptureEmail} className="mt-5 space-y-3">
                <label
                  htmlFor="email-gate-input"
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="email-gate-input"
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@example.com"
                  disabled={emailLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {emailLoading ? "Saving..." : "View my audit"}
                </button>
              </form>
            ) : (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This audit can only be unlocked by its owner.
              </p>
            )}

            <p className="mt-4 text-xs text-slate-500">
              We&apos;ll use your email to keep access to this report.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              No spam. Just your audit results and product updates.
            </p>

            {emailFeedback ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">{emailFeedback}</p>
            ) : null}
            {emailError ? (
              <p className="mt-3 text-sm font-medium text-red-600">{emailError}</p>
            ) : null}
          </div>
        </div>
      ) : null}

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

            {isPublic && publicPath ? (
              <div className="mt-4">
                <label
                  htmlFor="share-public-report-url"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Public Report Link
                </label>
                <input
                  id="share-public-report-url"
                  readOnly
                  value={buildPublicReportUrl() ?? ""}
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Copy Link
              </button>
              {isPublic && publicPath ? (
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Copy Public Link
                </button>
              ) : null}
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
