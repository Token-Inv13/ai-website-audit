"use client"

import { useState } from "react"

import type { AuditResult } from "@/types/audit"

interface AuditReportProps {
  result: AuditResult
  url?: string
  unlocked: boolean
  onUnlock?: () => void
  checkoutLoading?: boolean
  checkoutError?: string
}

type CopyKey = "headline" | "cta" | "meta"

const scoreItems: Array<{
  key: "overallScore" | "seoScore" | "conversionScore" | "uxScore"
  label: string
  accent: string
}> = [
  {
    key: "overallScore",
    label: "Overall Score",
    accent: "from-slate-900 to-slate-700",
  },
  { key: "seoScore", label: "SEO Score", accent: "from-emerald-700 to-emerald-500" },
  {
    key: "conversionScore",
    label: "Conversion Score",
    accent: "from-blue-700 to-blue-500",
  },
  { key: "uxScore", label: "UX Score", accent: "from-amber-700 to-amber-500" },
]

function LockedListPlaceholders() {
  return (
    <>
      <li className="list-none rounded-xl border border-slate-200/80 bg-slate-100/80 px-3 py-2 text-slate-500 blur-[1px]">
        Full recommendation hidden
      </li>
      <li className="list-none rounded-xl border border-slate-200/80 bg-slate-100/80 px-3 py-2 text-slate-500 blur-[1px]">
        Full recommendation hidden
      </li>
      <li className="list-none rounded-xl border border-slate-200/80 bg-slate-100/80 px-3 py-2 text-slate-500 blur-[1px]">
        Full recommendation hidden
      </li>
    </>
  )
}

function LockedDetailedCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <article
          key={item}
          className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 blur-[1.5px]"
        >
          <div className="h-4 w-3/5 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
          <div className="mt-5 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
        </article>
      ))}
    </div>
  )
}

export default function AuditReport({
  result,
  url,
  unlocked,
  onUnlock,
  checkoutLoading,
  checkoutError,
}: AuditReportProps) {
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null)

  async function handleCopy(text: string, key: CopyKey) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500)
    } catch {
      setCopiedKey(null)
    }
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Audit Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Performance Snapshot
            </h2>
          </div>
          {url ? (
            <p className="max-w-xl rounded-xl border border-slate-200/70 bg-white/75 px-3 py-2 text-sm text-slate-600">
              Audited URL: <span className="font-medium text-slate-900">{url}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scoreItems.map((item) => (
            <article
              key={item.key}
              className="rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p
                className={`mt-3 bg-gradient-to-r ${item.accent} bg-clip-text text-4xl font-bold text-transparent`}
              >
                {result[item.key]}
                <span className="text-lg text-slate-500">/100</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="soft-panel border-violet-200/70 bg-gradient-to-br from-violet-50/95 to-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">Copy Suggestions</h3>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
            Ready to Use
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Headline</p>
              <button
                type="button"
                onClick={() => handleCopy(result.copySuggestions.suggestedHeadline, "headline")}
                className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
              >
                {copiedKey === "headline" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-800">{result.copySuggestions.suggestedHeadline}</p>
          </article>

          <article className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">CTA</p>
              <button
                type="button"
                onClick={() => handleCopy(result.copySuggestions.suggestedCTA, "cta")}
                className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
              >
                {copiedKey === "cta" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-800">{result.copySuggestions.suggestedCTA}</p>
          </article>

          <article className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Meta Description</p>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    result.copySuggestions.suggestedMetaDescription,
                    "meta",
                  )
                }
                className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
              >
                {copiedKey === "meta" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {result.copySuggestions.suggestedMetaDescription}
            </p>
          </article>
        </div>
      </section>

      <section className="soft-panel border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 to-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-emerald-900">Quick Wins</h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Start Here
          </span>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {result.quickWins.map((quickWin, index) => (
            <li
              key={`${quickWin}-${index}`}
              className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 text-sm font-medium text-slate-800 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Priority {index + 1}
              </p>
              <p className="mt-2 leading-relaxed">{quickWin}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="soft-panel border-red-100/90 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Problems Found</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            {result.problems.map((problem, index) => (
              <li key={`${problem}-${index}`}>{problem}</li>
            ))}
            {!unlocked ? <LockedListPlaceholders /> : null}
          </ul>
        </article>

        <article className="soft-panel border-blue-100/90 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Improvement Suggestions</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            {result.improvements.map((improvement, index) => (
              <li key={`${improvement}-${index}`}>{improvement}</li>
            ))}
            {!unlocked ? <LockedListPlaceholders /> : null}
          </ul>
        </article>
      </section>

      <section className="soft-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">Detailed Recommendations</h3>
          {!unlocked ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Locked in Preview
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-slate-600">
          Action plans with business impact, implementation direction, and concrete examples.
        </p>

        <div className="mt-6">
          {unlocked ? (
            <div className="grid gap-4 md:grid-cols-3">
              {result.detailedRecommendations.map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-sm"
                >
                  <h4 className="text-base font-semibold text-slate-900">{item.title}</h4>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Why it matters: </span>
                      {item.whyItMatters}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Recommended action: </span>
                      {item.recommendedAction}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Example: </span>
                      {item.example}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <LockedDetailedCards />
          )}
        </div>
      </section>

      {!unlocked ? (
        <section className="rounded-2xl border border-blue-300/80 bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-white shadow-[0_22px_60px_-24px_rgba(37,99,235,0.8)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Upgrade</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Unlock the full audit report</h3>
          <p className="mt-3 max-w-2xl text-blue-50">
            Get complete detailed recommendations, full issue list, and a clearer implementation plan tailored to this website.
          </p>
          <button
            type="button"
            onClick={onUnlock}
            disabled={checkoutLoading}
            className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {checkoutLoading ? "Redirecting to checkout..." : "Unlock Full Report — $9"}
          </button>
          {checkoutError ? <p className="mt-3 text-sm text-red-100">{checkoutError}</p> : null}
        </section>
      ) : null}
    </div>
  )
}
