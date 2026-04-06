"use client"

import Link from "next/link"
import { useState } from "react"

import UrlForm from "@/components/UrlForm"
import { BRAND_NAME } from "@/lib/branding"
import { buildKeywordClusters, type KeywordCluster } from "@/lib/workspaceKeywords"
import { getApiErrorMessage, getErrorMessage } from "@/lib/error"
import type {
  AiContentResult,
  CompetitionAnalysis,
  CompetitionAction,
  CompetitionSignal,
  IndexationInsight,
  QuickScanResult,
  RecentAuditSummary,
  WorkspaceTabKey,
} from "@/types/audit"

interface SeoWorkspaceProps {
  recentAudits: RecentAuditSummary[]
}

const tabs: Array<{
  key: WorkspaceTabKey
  label: string
  description: string
}> = [
  {
    key: "audit",
    label: "Audit",
    description: "Run the existing audit flow and review recent results.",
  },
  {
    key: "indexation",
    label: "Indexation",
    description: "Check fetchability, robots, and canonical signals.",
  },
  {
    key: "keywords",
    label: "Keywords",
    description: "Generate simple keyword ideas by search intent.",
  },
  {
    key: "competition",
    label: "Competition",
    description: "Compare visible SEO signals against a rival page or keyword.",
  },
  {
    key: "content",
    label: "Content AI",
    description: "Turn rough copy into better SEO-ready content assets.",
  },
]

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getDisplayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function verdictTone(value: IndexationInsight["verdict"]): string {
  if (value === "indexable") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (value === "potentially-blocked") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-slate-100 text-slate-700"
}

function intentTone(intent: KeywordCluster["intent"]): string {
  if (intent === "Informational") {
    return "bg-sky-100 text-sky-700"
  }

  if (intent === "Commercial") {
    return "bg-violet-100 text-violet-700"
  }

  if (intent === "Long-tail") {
    return "bg-emerald-100 text-emerald-700"
  }

  return "bg-slate-100 text-slate-700"
}

function signalTone(status: CompetitionSignal["status"]): string {
  if (status === "good") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (status === "warning") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-slate-100 text-slate-700"
}

function priorityTone(priority: CompetitionAction["priority"]): string {
  if (priority === "High") {
    return "bg-rose-100 text-rose-700"
  }

  if (priority === "Medium") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-slate-100 text-slate-700"
}

function confidenceTone(value: CompetitionAnalysis["confidence"] | IndexationInsight["confidence"]): string {
  if (value === "high") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (value === "medium") {
    return "bg-amber-100 text-amber-700"
  }

  return "bg-slate-100 text-slate-700"
}

function modeLabel(mode: CompetitionAnalysis["mode"]): string {
  return mode === "keyword" ? "Keyword mode" : "URL mode"
}

function ToolPill({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        active ? "bg-slate-900 text-white" : "bg-white/75 text-slate-600"
      }`}
    >
      Live
    </span>
  )
}

function AuditTab({ recentAudits }: { recentAudits: RecentAuditSummary[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="space-y-6">
        <div className="soft-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Existing flow
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Run an audit without leaving the workspace
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                The current quick scan, premium unlock, and PDF report flow stays intact. This
                shell only gives it a better product frame.
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {recentAudits.length} recent audits
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/85 p-4 sm:p-5">
            <UrlForm />
          </div>
        </div>

        <div className="soft-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent audits</h3>
              <p className="mt-1 text-sm text-slate-600">
                Reopen prior reports in one click and keep the workspace compact.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50"
            >
              New analysis
            </Link>
          </div>

          {recentAudits.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-white/70 p-5 text-sm text-slate-600">
              No audits yet. Run your first analysis to populate this section.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {recentAudits.map((audit) => (
                <article
                  key={audit.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {getDisplayHost(audit.url)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{audit.url}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {formatDate(audit.createdAt)}
                      </p>
                    </div>
                    <Link
                      href={`/result/${audit.id}`}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open report
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    {[
                      ["Overall", audit.overallScore],
                      ["SEO", audit.seoScore],
                      ["Conversion", audit.conversionScore],
                      ["UX", audit.uxScore],
                    ].map(([label, score]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {score as number}
                          <span className="text-sm font-medium text-slate-500">/100</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Why this shell works</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>One navigation surface for multiple SEO tools.</li>
            <li>Current audit flow remains available and untouched.</li>
            <li>Layout and cards are reusable for future tools.</li>
            <li>Mobile and desktop share the same mental model.</li>
          </ul>
        </div>

        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Next tools ready for later</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Competition", "Content", "Performance", "Backlinks"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            The sprint leaves a clean path for future tools without introducing a heavy dashboard
            surface.
          </p>
        </div>
      </aside>
    </div>
  )
}

function IndexationTab() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<IndexationInsight | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/quick-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const payload = (await response.json().catch(() => null)) as
        | QuickScanResult
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Indexation check failed."))
      }

      if (!payload || !("indexation" in payload)) {
        throw new Error("Indexation check failed.")
      }

      setResult(payload.indexation)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Indexation check failed."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <section className="soft-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Indexation V1
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Quick indexability check
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Lightweight signals only: HTTP status, robots meta, and canonical consistency.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            No Search Console API
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label htmlFor="indexation-url" className="block text-sm font-medium text-slate-700">
            URL to inspect
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="indexation-url"
              type="url"
              placeholder="https://example.com/page"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Inspect indexation"}
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Verdict
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{result.summary}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${verdictTone(result.verdict)}`}>
                    {result.verdict.replace("-", " ")}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      result.confidence === "high"
                        ? "bg-emerald-100 text-emerald-700"
                        : result.confidence === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {result.confidence === "high"
                      ? "Fully verified"
                      : result.confidence === "medium"
                        ? "Mostly verified"
                        : "Partially verified"}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Final URL: <span className="font-medium text-slate-900">{result.finalUrl}</span>
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    HTTP status
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{result.statusCode}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Robots meta
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {result.robotsMeta || "Not detected"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Canonical
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {result.canonicalHref || "Not detected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Status
                </p>
                <p className="mt-2 text-sm font-medium text-emerald-950">
                  {result.noindexDetected
                    ? "A noindex directive is present."
                    : "No direct noindex signal was detected."}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Canonical
                </p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {result.canonicalMatches
                    ? "Canonical aligns with the inspected URL."
                    : "Canonical should be verified manually."}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Action
                </p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {result.verdict === "indexable"
                    ? "Looks safe to move forward."
                    : "Check page source and indexing settings."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 sm:p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Notes
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {result.notes.map((note) => (
                  <li
                    key={note}
                    className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">What this V1 checks</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>HTTP status code from the live request.</li>
            <li>Robots meta directives, including noindex and none.</li>
            <li>Canonical presence and whether it matches the inspected page.</li>
            <li>A clear status message: indexable, potentially blocked, or review needed.</li>
          </ul>
        </div>

        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Future extension path</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This screen is intentionally small so it can later expand into a Search Console-backed
            indexation module without changing the workspace structure.
          </p>
        </div>
      </aside>
    </div>
  )
}

function CompetitionTab() {
  const [target, setTarget] = useState("")
  const [yourUrl, setYourUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<CompetitionAnalysis | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/workspace/competition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          yourUrl: yourUrl.trim() || undefined,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | CompetitionAnalysis
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Competition analysis failed."))
      }

      if (!payload || !("mode" in payload)) {
        throw new Error("Competition analysis failed.")
      }

      setResult(payload)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Competition analysis failed."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
      <section className="soft-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Competition V1
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Lightweight competitor signals
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Compare a live page or infer an opportunity from a keyword without any paid data
              source.
            </p>
          </div>
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Honest V1
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="competition-target" className="block text-sm font-medium text-slate-700">
              Competitor domain or keyword
            </label>
            <input
              id="competition-target"
              type="text"
              placeholder="example.com or seo audit"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="competition-your-url" className="block text-sm font-medium text-slate-700">
              Your URL
            </label>
            <input
              id="competition-your-url"
              type="url"
              placeholder="https://your-site.com/page"
              value={yourUrl}
              onChange={(event) => setYourUrl(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze competition"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Result
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{result.summary}</h3>
                  <p className="mt-2 text-sm text-slate-600">{result.opportunity}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${confidenceTone(
                      result.confidence,
                    )}`}
                  >
                    {result.confidence === "high"
                      ? "Fully verified"
                      : result.confidence === "medium"
                        ? "Mostly verified"
                        : "Partially verified"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {modeLabel(result.mode)}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Input: <span className="font-medium text-slate-900">{result.input}</span>
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Your page
                  </h4>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    {result.yourUrl ? "Live URL" : "Not provided"}
                  </span>
                </div>
                <ul className="mt-4 space-y-3">
                  {result.yourPageSignals.map((signal) => (
                    <li
                      key={`${signal.label}-${signal.value}`}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-900">{signal.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${signalTone(
                            signal.status,
                          )}`}
                        >
                          {signal.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{signal.value}</p>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Rival / keyword
                  </h4>
                  <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-700">
                    {result.focusKeyword ? "Keyword" : "Competitor page"}
                  </span>
                </div>
                <ul className="mt-4 space-y-3">
                  {result.competitorSignals.map((signal) => (
                    <li
                      key={`${signal.label}-${signal.value}`}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-900">{signal.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${signalTone(
                            signal.status,
                          )}`}
                        >
                          {signal.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{signal.value}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Simple comparisons
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {result.comparisons.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Opportunity actions
              </h4>
              <div className="mt-3 grid gap-3">
                {result.actions.map((action) => (
                  <article
                    key={action.title}
                    className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h5 className="text-sm font-semibold text-slate-900">{action.title}</h5>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityTone(
                          action.priority,
                        )}`}
                      >
                        {action.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{action.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">What this V1 does</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Compares visible SEO signals from a live competitor page when a URL is available.</li>
            <li>Maps a keyword opportunity when you only have the target query.</li>
            <li>Keeps the output honest when a signal is estimated or only partially verified.</li>
            <li>Highlights clear next moves instead of pretending to be a full competitor suite.</li>
          </ul>
        </div>

        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Future path</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This screen can later accept richer crawl or SERP data without changing the product
            mental model or the workspace layout.
          </p>
        </div>
      </aside>
    </div>
  )
}

function CopyButton({
  value,
  copied,
  onCopy,
}: {
  value: string
  copied: boolean
  onCopy: (value: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function ContentTab() {
  const [sourceText, setSourceText] = useState("")
  const [focusKeyword, setFocusKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<AiContentResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      window.setTimeout(
        () => setCopied((current) => (current === value ? null : current)),
        1400,
      )
    } catch {
      setCopied(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/workspace/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          focusKeyword: focusKeyword.trim() || undefined,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | AiContentResult
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Content improvement failed."))
      }

      if (!payload || !("metaTitle" in payload)) {
        throw new Error("Content improvement failed.")
      }

      setResult(payload)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Content improvement failed."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <section className="soft-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Content AI V1
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Copyable SEO content improvements
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Paste rough copy, then get clearer title, description, headings, and a tighter
              rewrite in one view.
            </p>
          </div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
            Fast AI
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="content-source" className="block text-sm font-medium text-slate-700">
              Source text
            </label>
            <textarea
              id="content-source"
              rows={8}
              placeholder="Paste a page section, homepage draft, or rough landing page copy..."
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content-keyword" className="block text-sm font-medium text-slate-700">
              Focus keyword
            </label>
            <input
              id="content-keyword"
              type="text"
              placeholder="seo audit, landing page, ai content..."
              value={focusKeyword}
              onChange={(event) => setFocusKeyword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate content"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Output
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    Ready-to-copy SEO assets
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Turn one rough draft into clearer metadata, headings, and a better intro.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${confidenceTone(
                    "high",
                  )}`}
                >
                  Deterministic or AI assisted
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Meta title
                  </h4>
                  <CopyButton value={result.metaTitle} copied={copied === result.metaTitle} onCopy={handleCopy} />
                </div>
                <p className="mt-3 text-sm text-slate-800">{result.metaTitle}</p>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Meta description
                  </h4>
                  <CopyButton
                    value={result.metaDescription}
                    copied={copied === result.metaDescription}
                    onCopy={handleCopy}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{result.metaDescription}</p>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Suggested H1
                  </h4>
                  <CopyButton value={result.suggestedH1} copied={copied === result.suggestedH1} onCopy={handleCopy} />
                </div>
                <p className="mt-3 text-sm text-slate-700">{result.suggestedH1}</p>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Suggested H2s
                </h4>
                <div className="mt-3 grid gap-3">
                  {result.suggestedH2.map((item) => (
                    <div
                      key={item}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 p-3"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                      <CopyButton value={item} copied={copied === item} onCopy={handleCopy} />
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Rewrite
                  </h4>
                  <CopyButton value={result.rewrite} copied={copied === result.rewrite} onCopy={handleCopy} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{result.rewrite}</p>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  SEO tips
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {result.seoTips.map((tip) => (
                    <li
                      key={tip}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">How to use it</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Paste a rough draft or section from a page that needs improvement.</li>
            <li>Add one focus keyword if you want the output anchored to a search term.</li>
            <li>Copy only the cards you need and keep the editing loop fast.</li>
            <li>Use the rewrite and H2s as a starting point, not a full content replacement.</li>
          </ul>
        </div>

        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Why it stays lightweight</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This V1 is designed to be immediately useful even without a heavy editor, so the
            workspace keeps its quick, low-friction feel.
          </p>
        </div>
      </aside>
    </div>
  )
}

function KeywordsTab() {
  const [keyword, setKeyword] = useState("")
  const [clusters, setClusters] = useState<KeywordCluster[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      window.setTimeout(
        () => setCopied((current) => (current === value ? null : current)),
        1400,
      )
    } catch {
      setCopied(null)
    }
  }

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setClusters(buildKeywordClusters(keyword))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <section className="soft-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Keywords V1
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Simple keyword ideas by intent
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No paid keyword source here, just a lightweight generator for usable variations.
            </p>
          </div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
            Local suggestions
          </span>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-3">
          <label htmlFor="keyword-input" className="block text-sm font-medium text-slate-700">
            Seed keyword
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="keyword-input"
              type="text"
              placeholder="seo audit, landing page, ecommerce analytics..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Generate ideas
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-4">
          {clusters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 p-5 text-sm text-slate-600">
              Enter a keyword to generate intent-based variants, grouped cards, and copyable
              suggestions.
            </div>
          ) : (
            clusters.map((cluster) => (
              <article
                key={cluster.title}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{cluster.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${intentTone(
                          cluster.intent,
                        )}`}
                      >
                        {cluster.intent}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{cluster.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {cluster.suggestions.map((suggestion) => (
                    <button
                      key={suggestion.value}
                      type="button"
                      onClick={() => void handleCopy(suggestion.value)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-white"
                    >
                      <span>{suggestion.value}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Score {suggestion.score}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {copied === suggestion.value ? "Copied" : "Copy"}
                      </span>
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">How the V1 is organized</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Informational, commercial, transactional, and navigational groups.</li>
            <li>Copyable suggestions for quick transfer into briefs or content plans.</li>
            <li>Simple enough to be useful without pretending to be a keyword database.</li>
          </ul>
        </div>

        <div className="soft-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Expansion-ready</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The data model is intentionally narrow so future tools can share the same card and
            tab layout without a redesign.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default function SeoWorkspace({ recentAudits }: SeoWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>("audit")

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="glass-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {BRAND_NAME} workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A simple SEO hub built for fast work
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Audit, Indexation, Keywords, Competition, and Content live in one clear workspace
                so the product feels like a hub instead of a single-purpose tool.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tools live
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">5</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Audit history
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{recentAudits.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  UX direction
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Simple, premium, extensible
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {tabs.map((tab) => {
              const active = tab.key === activeTab

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.75)]"
                      : "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold">{tab.label}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          active ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {tab.description}
                      </p>
                    </div>
                    <ToolPill active={active} />
                  </div>
                </button>
              )
            })}
          </div>
        </header>

        <section className="space-y-6">
          {activeTab === "audit" ? <AuditTab recentAudits={recentAudits} /> : null}
          {activeTab === "indexation" ? <IndexationTab /> : null}
          {activeTab === "keywords" ? <KeywordsTab /> : null}
          {activeTab === "competition" ? <CompetitionTab /> : null}
          {activeTab === "content" ? <ContentTab /> : null}
        </section>
      </div>
    </main>
  )
}
