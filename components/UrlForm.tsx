"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { getApiErrorMessage, getErrorMessage } from "@/lib/error"
import { buildSeoActionPlan } from "@/lib/workspacePlan"
import type {
  QuickScanCheck,
  QuickScanResult,
  QuickScanStatus,
} from "@/types/audit"

const quickScanLabels: Array<{
  key: keyof QuickScanResult["checks"]
  label: string
}> = [
  { key: "title", label: "Title Tag" },
  { key: "metaDescription", label: "Meta Description" },
  { key: "h1", label: "H1" },
  { key: "https", label: "HTTPS" },
  { key: "canonical", label: "Canonical" },
  { key: "robots", label: "Robots Meta" },
  { key: "titleLength", label: "Title Length" },
  { key: "metaDescriptionLength", label: "Meta Description Length" },
]

function statusBadgeClasses(status: QuickScanStatus): string {
  if (status === "present") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (status === "warning") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-red-100 text-red-700"
}

function confidenceBadgeClasses(confidence: QuickScanResult["indexation"]["confidence"]): string {
  if (confidence === "high") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (confidence === "medium") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-slate-100 text-slate-700"
}

function priorityBadgeClasses(priority: string): string {
  if (priority === "High") {
    return "bg-red-100 text-red-700"
  }

  if (priority === "Medium") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-slate-100 text-slate-700"
}

function normalizeUrlInput(raw: string): string {
  const trimmed = raw.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  const parsed = new URL(withProtocol)

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Please enter a valid URL.")
  }

  return parsed.toString()
}

export default function UrlForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [quickScanLoading, setQuickScanLoading] = useState(false)
  const [error, setError] = useState("")
  const [quickScanResult, setQuickScanResult] = useState<QuickScanResult | null>(
    null,
  )
  const actionPlan = quickScanResult ? buildSeoActionPlan(quickScanResult) : []

  const isBusy = loading || quickScanLoading

  async function runFullAudit(normalizedUrl: string) {
    setLoading(true)

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const payload = (await response
        .json()
        .catch(() => null)) as { id?: string } | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Unable to run audit."))
      }

      if (!payload?.id) {
        throw new Error("Unable to run audit.")
      }

      router.push(`/result/${payload.id}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    let normalizedUrl = ""

    try {
      normalizedUrl = normalizeUrlInput(url)
    } catch {
      setError("Please enter a valid URL.")
      return
    }

    try {
      await runFullAudit(normalizedUrl)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to run audit."))
    }
  }

  async function handleQuickScan() {
    setError("")

    let normalizedUrl = ""

    try {
      normalizedUrl = normalizeUrlInput(url)
    } catch {
      setError("Please enter a valid URL.")
      return
    }

    setQuickScanLoading(true)

    try {
      const response = await fetch("/api/quick-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const payload = (await response
        .json()
        .catch(() => null)) as QuickScanResult | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Quick scan failed."))
      }

      if (!payload || !("checks" in payload)) {
        throw new Error("Quick scan failed.")
      }

      setQuickScanResult(payload)
    } catch (scanError) {
      setError(getErrorMessage(scanError, "Quick scan failed."))
    } finally {
      setQuickScanLoading(false)
    }
  }

  async function handleRunFullAuditFromScan() {
    if (!quickScanResult) {
      return
    }

    setError("")

    try {
      await runFullAudit(quickScanResult.url)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to run audit."))
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <label htmlFor="website-url" className="block text-sm font-medium text-slate-700">
          Website URL
        </label>
        <div className="relative">
          <input
            id="website-url"
            type="url"
            placeholder="https://example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={isBusy}
            required
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 font-semibold text-white shadow-[0_16px_35px_-18px_rgba(37,99,235,0.75)] transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Website"}
          </button>
          <button
            type="button"
            onClick={handleQuickScan}
            disabled={isBusy}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {quickScanLoading ? "Scanning..." : "Quick Scan"}
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {quickScanResult ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Quick Scan Results</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${confidenceBadgeClasses(quickScanResult.indexation.confidence)}`}>
                {quickScanResult.indexation.confidence === "high"
                  ? "Fully verified"
                  : quickScanResult.indexation.confidence === "medium"
                    ? "Mostly verified"
                    : "Partially verified"}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Score {quickScanResult.score}/100
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-600">{quickScanResult.url}</p>

          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Indexation status
            </p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {quickScanResult.indexation.summary}
            </p>
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickScanLabels.map((item) => {
              const check: QuickScanCheck = quickScanResult.checks[item.key]

              return (
                <li
                  key={item.key}
                  className="rounded-xl border border-slate-200/70 bg-white/80 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {item.label}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClasses(check.status)}`}
                    >
                      {check.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{check.message}</p>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-slate-900">SEO Action Plan</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Prioritized actions generated from the current scan signals.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {actionPlan.length} actions
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {actionPlan.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold text-slate-900">{item.title}</h5>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityBadgeClasses(
                        item.priority,
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/70 p-4">
            <p className="text-sm text-slate-700">
              Want deeper analysis and actionable recommendations?
            </p>
            <button
              type="button"
              onClick={handleRunFullAuditFromScan}
              disabled={isBusy}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Run Full Audit
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
