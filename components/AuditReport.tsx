import type { AuditResult } from "@/types/audit"

interface AuditReportProps {
  result: AuditResult
  url?: string
  unlocked: boolean
  onUnlock?: () => void
  checkoutLoading?: boolean
  checkoutError?: string
}

const scoreItems: Array<{ key: keyof AuditResult; label: string }> = [
  { key: "overallScore", label: "Overall Score" },
  { key: "seoScore", label: "SEO Score" },
  { key: "conversionScore", label: "Conversion Score" },
  { key: "uxScore", label: "UX Score" },
]

function LockedPlaceholders() {
  return (
    <>
      <li className="list-none rounded-md bg-slate-100 px-3 py-2 text-slate-500 blur-[1px]">
        Locked item
      </li>
      <li className="list-none rounded-md bg-slate-100 px-3 py-2 text-slate-500 blur-[1px]">
        Locked item
      </li>
      <li className="list-none rounded-md bg-slate-100 px-3 py-2 text-slate-500 blur-[1px]">
        Locked item
      </li>
    </>
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
  return (
    <div className="space-y-8">
      {url ? (
        <p className="text-sm text-slate-600">
          Audited URL: <span className="font-medium text-slate-900">{url}</span>
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scoreItems.map((item) => (
          <article key={item.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {result[item.key] as number}
              <span className="text-lg text-slate-500">/100</span>
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Problems Found</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            {result.problems.map((problem, index) => (
              <li key={`${problem}-${index}`}>{problem}</li>
            ))}
            {!unlocked ? <LockedPlaceholders /> : null}
          </ul>
        </article>

        <article className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Improvement Suggestions</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            {result.improvements.map((improvement, index) => (
              <li key={`${improvement}-${index}`}>{improvement}</li>
            ))}
            {!unlocked ? <LockedPlaceholders /> : null}
          </ul>
        </article>
      </section>

      {!unlocked ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Unlock the full audit</h3>
          <p className="mt-2 text-slate-700">
            Get the full list of issues and actionable improvements for this website.
          </p>
          <button
            type="button"
            onClick={onUnlock}
            disabled={checkoutLoading}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkoutLoading ? "Redirecting to checkout..." : "Unlock Full Report — $9"}
          </button>
          {checkoutError ? <p className="mt-3 text-sm text-red-600">{checkoutError}</p> : null}
        </section>
      ) : null}
    </div>
  )
}
