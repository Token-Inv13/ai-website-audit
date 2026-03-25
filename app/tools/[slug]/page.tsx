import type { Metadata } from "next"
import { notFound } from "next/navigation"

import ProgrammaticLandingPage from "@/components/ProgrammaticLandingPage"
import { BRAND_NAME, withBrandSuffix } from "@/lib/branding"
import { getToolIntentPageBySlug, toolIntentPages } from "@/lib/programmaticSeo"

export const dynamicParams = false

interface PageParams {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return toolIntentPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const page = getToolIntentPageBySlug(slug)

  if (!page) {
    return {
      title: withBrandSuffix("SEO Tools"),
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
      canonical: `/tools/${page.slug}`,
    },
    openGraph: {
      type: "website",
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/tools/${page.slug}`,
      siteName: BRAND_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  }
}

export default async function ToolIntentPage({ params }: PageParams) {
  const { slug } = await params
  const page = getToolIntentPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <ProgrammaticLandingPage content={page} canonicalPath={`/tools/${page.slug}`} />
}
