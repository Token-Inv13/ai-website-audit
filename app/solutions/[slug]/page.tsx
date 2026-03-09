import type { Metadata } from "next"
import { notFound } from "next/navigation"

import ProgrammaticLandingPage from "@/components/ProgrammaticLandingPage"
import { getIndustryPageBySlug, industryIntentPages } from "@/lib/programmaticSeo"

export const dynamicParams = false

interface PageParams {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return industryIntentPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const page = getIndustryPageBySlug(slug)

  if (!page) {
    return {
      title: "SEO Solutions | AI Website Audit",
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
      canonical: `/solutions/${page.slug}`,
    },
    openGraph: {
      type: "website",
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/solutions/${page.slug}`,
      siteName: "AI Website Audit",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  }
}

export default async function IndustryIntentPage({ params }: PageParams) {
  const { slug } = await params
  const page = getIndustryPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <ProgrammaticLandingPage
      content={page}
      canonicalPath={`/solutions/${page.slug}`}
    />
  )
}
