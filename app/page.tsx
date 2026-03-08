import UrlForm from "@/components/UrlForm"

const reviewItems = ["SEO review", "UX review", "Conversion review"]
const steps = ["Enter your URL", "Get your audit", "Unlock the full report"]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            AI Website Audit
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
            Analyze your website and get actionable SEO, UX, and conversion insights
            in seconds.
          </p>

          <div className="mt-8">
            <UrlForm />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {reviewItems.map((item) => (
            <article key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{item}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Step {index + 1}
                </p>
                <p className="mt-2 font-medium text-slate-800">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Simple Pricing</h2>
          <div className="mt-4 rounded-xl border border-blue-200 bg-white p-6">
            <p className="text-sm font-semibold text-slate-700">Full Audit Report</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">$9</p>
            <p className="mt-2 text-slate-600">
              One-time payment. Unlock the full report for a specific audit.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
