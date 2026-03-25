import type { Metadata } from "next"
import { notFound } from "next/navigation"

import ProgrammaticLandingPage from "@/components/ProgrammaticLandingPage"
import { BRAND_NAME, withBrandSuffix } from "@/lib/branding"
import { getPlatformPageBySlug, platformIntentPages } from "@/lib/programmaticSeo"

export const dynamicParams = false

interface PageParams {
  params: Promise<{
    type: string
  }>
}

export function generateStaticParams() {
  return platformIntentPages.map((page) => ({ type: page.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { type } = await params
  const page = getPlatformPageBySlug(type)

  if (!page) {
    return {
      title: withBrandSuffix("Website Audit"),
      description: "Analyze your website and get actionable SEO, UX, and conversion insights.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `/audit/${page.slug}`,
    },
    openGraph: {
      type: "website",
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/audit/${page.slug}`,
      siteName: BRAND_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  }
}

export default async function AuditTypePage({ params }: PageParams) {
  const { type } = await params
  const page = getPlatformPageBySlug(type)

  if (!page) {
    notFound()
  }

  return <ProgrammaticLandingPage content={page} canonicalPath={`/audit/${page.slug}`} />
}
