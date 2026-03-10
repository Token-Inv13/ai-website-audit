import Link from "next/link"

import type { ProgrammaticLandingPage as ProgrammaticLandingPageData } from "@/lib/programmaticSeo"
import { getPublicAppUrl } from "@/lib/publicAppUrl"

interface ProgrammaticLandingPageProps {
  content: ProgrammaticLandingPageData
  canonicalPath: string
}

const appUrl = getPublicAppUrl()

export default function ProgrammaticLandingPage({
  content,
  canonicalPath,
}: ProgrammaticLandingPageProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.title,
    description: content.metaDescription,
    url: `${appUrl}${canonicalPath}`,
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-14 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl space-y-8">
        <section className="glass-card p-8 sm:p-10">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            AI Website Audit
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            {content.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-cyan-600"
            >
              Analyze your website
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Run a free audit
            </Link>
          </div>
        </section>

        <section className="soft-panel p-7 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Why this audit matters</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            {content.whyItMatters}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="soft-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">What the audit checks</h2>
            <ul className="mt-4 space-y-2">
              {content.checks.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="soft-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">Who this is for</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              {content.audience}
            </p>
          </article>
        </section>

        <section className="soft-panel p-7 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            What this audit helps you improve
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {content.benefits.map((benefit) => (
              <li
                key={benefit}
                className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 text-sm text-slate-700"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="soft-panel p-7 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {content.faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-5"
              >
                <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/80 bg-gradient-to-br from-blue-600 to-cyan-600 p-7 text-white shadow-[0_22px_60px_-24px_rgba(37,99,235,0.8)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Run your free website audit</h2>
          <p className="mt-3 max-w-2xl text-blue-50">
            Get an instant analysis with SEO, UX, and conversion recommendations you can act on.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
          >
            Run a free audit
          </Link>
        </section>
      </div>
    </main>
  )
}
