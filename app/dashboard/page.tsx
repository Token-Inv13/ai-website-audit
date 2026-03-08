import Link from "next/link"

import { listRecentAudits } from "@/lib/auditStore"

export const dynamic = "force-dynamic"

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
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

export default async function DashboardPage() {
  const audits = await listRecentAudits(20)

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="glass-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                AI Website Audit
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Recent Audits
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Browse the latest generated reports and reopen any result page instantly.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white"
            >
              New Audit
            </Link>
          </div>
        </header>

        {audits.length === 0 ? (
          <section className="soft-panel p-8">
            <p className="text-slate-700">No audits found yet. Run your first audit to populate this dashboard.</p>
          </section>
        ) : (
          <section className="grid gap-4">
            {audits.map((audit) => (
              <article key={audit.id} className="soft-panel p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{getDisplayHost(audit.url)}</p>
                    <p className="mt-1 text-sm text-slate-600">{audit.url}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {formatDate(audit.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        audit.unlocked
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {audit.unlocked ? "Unlocked" : "Locked"}
                    </span>
                    <Link
                      href={`/result/${audit.id}`}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Report
                    </Link>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{audit.overallScore}<span className="text-sm text-slate-500">/100</span></p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SEO</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{audit.seoScore}<span className="text-sm text-slate-500">/100</span></p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conversion</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{audit.conversionScore}<span className="text-sm text-slate-500">/100</span></p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">UX</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{audit.uxScore}<span className="text-sm text-slate-500">/100</span></p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
