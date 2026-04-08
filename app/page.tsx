import type { Metadata } from "next"

import BrandLogo from "@/components/BrandLogo"
import HomeUrlForm from "@/components/HomeUrlForm"
import { BRAND_NAME } from "@/lib/branding"
import {
  PLAN_DESCRIPTIONS,
  PLAN_LABELS,
  PLAN_ORDER,
  formatPlanLimit,
  formatPlanMonthlyPrice,
  getPlanLimit,
} from "@/lib/plan"

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
          <div className="inline-flex flex-col gap-3">
            <BrandLogo />
            <p className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {BRAND_NAME}
            </p>
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Analyze your website and move through a simple SEO workspace built for fast audits.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
            Run an instant audit, open the workspace for indexation and keyword ideas, and unlock the full action plan when needed.
          </p>

          <div className="mt-8 soft-panel p-5 sm:p-6">
            <HomeUrlForm />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="/dashboard"
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white"
            >
              Open SEO Workspace
            </a>
            <p className="text-sm text-slate-500">
              Audit, Indexation, and Keywords in one simple product surface.
            </p>
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pricing
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Clear plan upgrades, visible in-product
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Stripe comes next sprint. This sprint focuses on UX, limits, and upgrade intent.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {PLAN_ORDER.map((plan) => {
              const isFeatured = plan === "basic"
              const audits = formatPlanLimit(getPlanLimit(plan, "auditsPerDay"))
              const keywords = getPlanLimit(plan, "keywordSuggestions")
              const contentBlocks = getPlanLimit(plan, "contentCards")

              return (
                <article
                  key={plan}
                  className={`rounded-2xl border p-6 shadow-sm ${
                    isFeatured
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200/80 bg-white/85 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm font-semibold uppercase tracking-wide ${
                          isFeatured ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {PLAN_LABELS[plan]}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{plan === "basic" ? "Most popular" : plan === "pro" ? "For teams" : "Start free"}</h3>
                      <p
                        className={`mt-2 text-3xl font-bold tracking-tight ${
                          isFeatured ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {formatPlanMonthlyPrice(plan)}
                      </p>
                    </div>
                    {isFeatured ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
                        Recommended
                      </span>
                    ) : null}
                  </div>

                  <p className={`mt-3 text-sm leading-relaxed ${isFeatured ? "text-slate-200" : "text-slate-600"}`}>
                    {PLAN_DESCRIPTIONS[plan]}
                  </p>

                  <div className="mt-5 space-y-2 text-sm">
                    <div className={`rounded-xl px-3 py-2 ${isFeatured ? "bg-white/10 text-white" : "bg-slate-50 text-slate-700"}`}>
                      {audits} audits/day
                    </div>
                    <div className={`rounded-xl px-3 py-2 ${isFeatured ? "bg-white/10 text-white" : "bg-slate-50 text-slate-700"}`}>
                      {keywords} keyword ideas/cluster
                    </div>
                    <div className={`rounded-xl px-3 py-2 ${isFeatured ? "bg-white/10 text-white" : "bg-slate-50 text-slate-700"}`}>
                      {contentBlocks} AI content blocks
                    </div>
                  </div>

                  <a
                    href="/dashboard"
                    className={`mt-6 inline-flex rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isFeatured
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-white"
                    }`}
                  >
                    {plan === "free" ? "Start free" : `Preview ${PLAN_LABELS[plan]}`}
                  </a>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
