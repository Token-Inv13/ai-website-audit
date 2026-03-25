import type { Metadata } from "next"

import UrlForm from "@/components/UrlForm"
import { BRAND_NAME } from "@/lib/branding"

const reviewItems = [
  { title: "SEO review", subtitle: "Find ranking blockers and metadata gaps." },
  { title: "UX review", subtitle: "Spot friction points that hurt engagement." },
  {
    title: "Conversion review",
    subtitle: "Prioritize changes that increase action rate.",
  },
]

const steps = ["Enter your URL", "Get your audit", "Unlock the full report"]

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <section className="glass-card p-8 sm:p-12">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {BRAND_NAME}
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Analyze your website and get actionable SEO, UX, and conversion insights in seconds.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
            Run an instant audit, preview your main opportunities, and unlock the full action plan when needed.
          </p>

          <div className="mt-8 soft-panel p-5 sm:p-6">
            <UrlForm />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {reviewItems.map((item) => (
            <article key={item.title} className="soft-panel p-5 sm:p-6">
              <p className="text-sm font-semibold tracking-wide text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.subtitle}</p>
            </article>
          ))}
        </section>

        <section className="soft-panel p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm">
                <p className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Step {index + 1}
                </p>
                <p className="mt-3 font-medium text-slate-800">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="soft-panel p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Simple Pricing</h2>
          <div className="mt-5 rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Full Audit Report</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">$9</p>
            <p className="mt-3 max-w-xl text-slate-600">
              One-time payment. Unlock the full report for a specific audit.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
