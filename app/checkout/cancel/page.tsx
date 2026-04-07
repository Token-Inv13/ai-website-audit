import Link from "next/link"

import { BRAND_NAME } from "@/lib/branding"

export const metadata = {
  title: `${BRAND_NAME} Checkout Cancelled`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-2xl p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Stripe checkout
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Checkout cancelled
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          No change was made to your plan. You can restart the upgrade flow anytime from the
          dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
