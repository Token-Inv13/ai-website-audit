import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

type AuditType =
  | "wordpress"
  | "shopify"
  | "saas"
  | "startup"
  | "ecommerce"
  | "small-business"
  | "portfolio"
  | "agency"

interface AuditTypeContent {
  title: string
  description: string
  h1: string
  intro: string
  focusAreas: string[]
}

const auditTypeContent: Record<AuditType, AuditTypeContent> = {
  wordpress: {
    title: "WordPress Website Audit Tool",
    description:
      "Analyze SEO, UX and conversion issues on your WordPress website with a fast AI-powered audit.",
    h1: "WordPress Website Audit Tool",
    intro:
      "WordPress websites often grow quickly, which can create hidden SEO and UX issues over time. Outdated plugin pages, weak metadata, and inconsistent structure can hurt rankings and reduce conversions. This audit helps you identify the most important improvements in minutes, so you can prioritize fixes that drive real impact instead of guessing what to optimize first.",
    focusAreas: [
      "Title and meta description quality on core pages",
      "Content hierarchy and heading structure",
      "Clarity of CTAs and conversion flow",
      "Trust signals and credibility elements",
    ],
  },
  shopify: {
    title: "Shopify Store Audit Tool",
    description:
      "Run a Shopify website audit to improve SEO, product-page UX, and conversion performance.",
    h1: "Shopify Store Audit Tool",
    intro:
      "Shopify stores need clear product messaging, strong trust signals, and a frictionless path to checkout. Small issues in page structure or CTA visibility can directly impact revenue. This audit gives you a practical view of your store's SEO and conversion strengths, then highlights high-priority actions you can apply quickly to improve traffic quality and sales outcomes.",
    focusAreas: [
      "Collection and product page messaging quality",
      "Primary CTA visibility above the fold",
      "Meta tags and indexing fundamentals",
      "Social proof and trust placement",
    ],
  },
  saas: {
    title: "SaaS Website Audit Tool",
    description:
      "Audit your SaaS landing pages for SEO, UX, and conversion opportunities that increase demo and trial signups.",
    h1: "SaaS Website Audit Tool",
    intro:
      "SaaS websites must communicate value quickly and guide visitors to a clear next step. Generic headlines, weak positioning, and unclear CTAs can reduce signup rates even with strong traffic. This audit helps SaaS teams uncover messaging gaps, structure issues, and conversion blockers so they can improve acquisition pages with a focused, data-driven action plan.",
    focusAreas: [
      "Value proposition clarity in hero sections",
      "Signup and trial CTA prominence",
      "Information architecture and scannability",
      "Keyword intent alignment in metadata",
    ],
  },
  startup: {
    title: "Startup Website Audit Tool",
    description:
      "Get a startup website audit to improve positioning, SEO visibility, and conversion performance.",
    h1: "Startup Website Audit Tool",
    intro:
      "Startup websites often change fast, and that speed can lead to inconsistent messaging and SEO gaps. If visitors do not understand your offer in seconds, conversion drops. This audit gives founders and growth teams a quick but actionable review of UX and SEO essentials, so they can strengthen positioning, improve trust, and convert more traffic into leads.",
    focusAreas: [
      "Headline and positioning clarity",
      "Lead capture and CTA effectiveness",
      "Core SEO tags and discoverability",
      "Trust elements for early-stage credibility",
    ],
  },
  ecommerce: {
    title: "Ecommerce Website Audit Tool",
    description:
      "Audit your ecommerce website to improve SEO foundations, product-page UX, and conversion rates.",
    h1: "Ecommerce Website Audit Tool",
    intro:
      "Ecommerce growth depends on both discoverability and conversion efficiency. Weak page hierarchy, poor CTA contrast, or missing trust signals can reduce order volume. This audit provides a fast diagnostic of your ecommerce site and delivers practical recommendations your team can execute quickly to improve traffic quality, user confidence, and checkout completion.",
    focusAreas: [
      "Category and product page structure",
      "SEO metadata and search snippet quality",
      "Checkout-oriented CTA clarity",
      "Trust and reassurance placement",
    ],
  },
  "small-business": {
    title: "Small Business Website Audit Tool",
    description:
      "Run a small business website audit to uncover SEO and UX fixes that help convert more visitors.",
    h1: "Small Business Website Audit Tool",
    intro:
      "Small business websites need to be clear, credible, and easy to act on. Common issues like weak headlines, missing metadata, or unclear contact CTAs can limit growth. This audit helps business owners identify practical improvements across SEO, UX, and conversion so they can improve visibility and turn more visitors into inquiries or customers.",
    focusAreas: [
      "Homepage clarity and local intent messaging",
      "SEO basics for better discoverability",
      "Contact and quote CTA effectiveness",
      "Trust markers such as testimonials and reviews",
    ],
  },
  portfolio: {
    title: "Portfolio Website Audit Tool",
    description:
      "Analyze your portfolio website to improve SEO visibility, readability, and lead conversion.",
    h1: "Portfolio Website Audit Tool",
    intro:
      "Portfolio websites must balance visual quality with clear positioning and conversion intent. If your work is strong but your structure is weak, visitors may leave without contacting you. This audit highlights where your portfolio can improve SEO, readability, and CTA placement so that more prospects understand your value and reach out.",
    focusAreas: [
      "Service positioning and personal branding clarity",
      "Project page structure and readability",
      "SEO metadata for discoverability",
      "Inquiry CTA and contact flow",
    ],
  },
  agency: {
    title: "Agency Website Audit Tool",
    description:
      "Audit your agency website for SEO, messaging clarity, and conversion improvements to generate more leads.",
    h1: "Agency Website Audit Tool",
    intro:
      "Agency websites are judged quickly on credibility, clarity, and proof of results. Missing case-study structure, weak CTA hierarchy, or generic copy can reduce lead quality. This audit gives agencies a focused review of SEO and conversion fundamentals, helping teams prioritize improvements that make service pages clearer and increase inbound opportunities.",
    focusAreas: [
      "Offer clarity and service-page structure",
      "Lead generation CTA placement",
      "Case studies and trust elements visibility",
      "Technical and on-page SEO essentials",
    ],
  },
}

export const dynamicParams = false

interface PageParams {
  params: Promise<{
    type: string
  }>
}

export function generateStaticParams() {
  return (Object.keys(auditTypeContent) as AuditType[]).map((type) => ({ type }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { type } = await params
  const content = auditTypeContent[type as AuditType]

  if (!content) {
    return {
      title: "Website Audit Tool",
      description: "Analyze SEO, UX and conversion issues on your website.",
    }
  }

  return {
    title: `${content.title} | AI Website Audit`,
    description: content.description,
    alternates: {
      canonical: `/audit/${type}`,
    },
  }
}

export default async function AuditTypePage({ params }: PageParams) {
  const { type } = await params
  const content = auditTypeContent[type as AuditType]

  if (!content) {
    notFound()
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-14 sm:py-16">
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
            {content.h1}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            {content.intro}
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Why run this audit?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              This specialized audit helps you detect the most impactful SEO and UX issues for this type of website. You get a practical score, clear problems, and action-focused recommendations you can use immediately to improve discoverability and conversion.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.focusAreas.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-cyan-600"
            >
              Start Your Website Audit
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Back to Homepage
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
