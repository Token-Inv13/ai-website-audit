import type { Metadata } from "next"
import Link from "next/link"

import { getLatestPublicAuditByDomain } from "@/lib/auditStore"
import { normalizeDomainFromValue } from "@/lib/domain"
import { getPublicAppUrl } from "@/lib/publicAppUrl"

const appUrl = getPublicAppUrl()

interface PageParams {
  params: Promise<{
    domain: string
  }>
}

function buildPublicSummary(input: {
  overallScore: number
  seoScore: number
  conversionScore: number
  uxScore: number
  topIssue?: string
  topWin?: string
}): string {
  const baseline =
    input.overallScore >= 80
      ? "This site is already in a strong position."
      : "This site has clear optimization opportunities."

  const weakest = [
    { label: "SEO", value: input.seoScore },
    { label: "Conversion", value: input.conversionScore },
    { label: "UX", value: input.uxScore },
  ].sort((a, b) => a.value - b.value)[0]

  const issueSentence = input.topIssue
    ? `Main issue observed: ${input.topIssue}`
    : "The audit detected structural and messaging gaps."
  const winSentence = input.topWin
    ? `Fastest win: ${input.topWin}`
    : "Quick implementation wins are available."

  return `${baseline} The current priority is ${weakest.label} (${weakest.value}/100). ${issueSentence} ${winSentence}`
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { domain } = await params
  const normalizedDomain = normalizeDomainFromValue(domain)
  const report = normalizedDomain
    ? await getLatestPublicAuditByDomain(normalizedDomain)
    : null

  const canonicalPath = `/report/${encodeURIComponent(
    report?.publicSlug || normalizedDomain || domain.toLowerCase(),
  )}`

  if (!report) {
    const fallbackTitle = normalizedDomain
      ? `SEO Audit of ${normalizedDomain} | AI Website Audit`
      : "SEO Audit Report | AI Website Audit"
    const fallbackDescription =
      "No public audit is available for this domain yet. Run a free audit to get an instant SEO, UX, and conversion snapshot."

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: {
        canonical: canonicalPath,
      },
      robots: {
        index: false,
        follow: true,
      },
      openGraph: {
        type: "website",
        title: fallbackTitle,
        description: fallbackDescription,
        url: canonicalPath,
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
      },
    }
  }

  const title = `SEO Audit of ${report.domainNormalized} | AI Website Audit`
  const description = `Public website audit preview for ${report.domainNormalized}. Review key SEO, UX, and conversion findings and run your own audit.`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalPath,
      siteName: "AI Website Audit",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function PublicReportPage({ params }: PageParams) {
  const { domain } = await params
  const normalizedDomain = normalizeDomainFromValue(domain)
  const report = normalizedDomain
    ? await getLatestPublicAuditByDomain(normalizedDomain)
    : null

  if (!report) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute bottom-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <section className="glass-card p-8 text-center sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Public Report
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              No public audit found for this domain
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Run a new audit to get an instant SEO, UX, and conversion analysis for your website.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Analyze your website
            </Link>
          </section>
        </div>
      </main>
    )
  }

  const topIssues = report.result.problems.slice(0, 6)
  const quickWins = report.result.quickWins.length
    ? report.result.quickWins.slice(0, 6)
    : report.result.improvements.slice(0, 6)

  const summary = buildPublicSummary({
    overallScore: report.result.overallScore,
    seoScore: report.result.seoScore,
    conversionScore: report.result.conversionScore,
    uxScore: report.result.uxScore,
    topIssue: topIssues[0],
    topWin: quickWins[0],
  })

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `SEO Audit of ${report.domainNormalized}`,
    description: `Public website audit preview for ${report.domainNormalized}.`,
    url: `${appUrl}/report/${encodeURIComponent(
      report.publicSlug || report.domainNormalized,
    )}`,
    about: {
      "@type": "SoftwareApplication",
      name: "AI Website Audit",
      applicationCategory: "BusinessApplication",
    },
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-7 sm:space-y-8">
        <section className="glass-card p-6 sm:p-8">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Public SEO Audit
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            SEO Audit of {report.domainNormalized}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 sm:text-lg">
            Public preview of key SEO, UX, and conversion findings for this domain.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700">
              Audited URL: <span className="font-semibold text-slate-900">{report.url}</span>
            </span>
            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Analyze your website
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Overall score", report.result.overallScore, "text-slate-900"],
            ["SEO score", report.result.seoScore, "text-emerald-700"],
            ["UX score", report.result.uxScore, "text-amber-700"],
            ["Conversion score", report.result.conversionScore, "text-blue-700"],
          ].map(([label, value, color]) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-3 text-4xl font-bold ${color}`}>
                {value}
                <span className="text-lg text-slate-500">/100</span>
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="soft-panel border-red-100/90 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Top issues found</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
              {topIssues.length ? (
                topIssues.map((problem, index) => (
                  <li key={`${problem}-${index}`}>{problem}</li>
                ))
              ) : (
                <li>No major issue was detected in this public preview.</li>
              )}
            </ul>
          </article>

          <article className="soft-panel border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 to-white p-6">
            <h2 className="text-xl font-semibold text-emerald-900">Quick wins</h2>
            <ul className="mt-4 space-y-3">
              {quickWins.length ? (
                quickWins.map((quickWin, index) => (
                  <li
                    key={`${quickWin}-${index}`}
                    className="rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-2 text-sm font-medium text-slate-800"
                  >
                    {quickWin}
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-2 text-sm text-slate-700">
                  Run a fresh audit to generate prioritized quick wins.
                </li>
              )}
            </ul>
          </article>
        </section>

        <section className="soft-panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">AI summary</h2>
          <p className="mt-3 leading-relaxed text-slate-700">{summary}</p>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-white/85 p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white/95 to-blue-100/80" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
          <div className="relative">
            <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Premium Section
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Unlock the full report
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Get detailed recommendations, copy improvements, and actionable fixes in the full report.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200/80 bg-slate-100/80 p-5 blur-[1.5px]"
                >
                  <div className="h-4 w-3/5 rounded bg-slate-200" />
                  <div className="mt-4 h-3 w-full rounded bg-slate-200/80" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-slate-200/70" />
                  <div className="mt-5 h-3 w-2/3 rounded bg-slate-200/70" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/80 bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-white shadow-[0_22px_60px_-24px_rgba(37,99,235,0.8)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Run your free website audit</h2>
          <p className="mt-3 max-w-2xl text-blue-50">
            Get your own report in minutes with clear SEO, UX, and conversion opportunities.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
          >
            Run your free website audit
          </Link>
        </section>
      </div>
    </main>
  )
}
