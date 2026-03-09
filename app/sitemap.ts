import type { MetadataRoute } from "next"

import { listPublicReportDomains } from "@/lib/auditStore"
import {
  industryIntentPages,
  platformIntentPages,
  toolIntentPages,
} from "@/lib/programmaticSeo"

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://ai-website-audit-beta.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const blogSlugs = [
    "how-to-audit-your-website",
    "website-seo-checklist",
    "improve-website-conversion-rate",
  ]

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${appUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...blogSlugs.map((slug) => ({
      url: `${appUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...platformIntentPages.map((page) => ({
      url: `${appUrl}/audit/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...toolIntentPages.map((page) => ({
      url: `${appUrl}/tools/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
    ...industryIntentPages.map((page) => ({
      url: `${appUrl}/solutions/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
  ]

  try {
    const publicReports = await listPublicReportDomains(500)
    const reportPages: MetadataRoute.Sitemap = publicReports.map((audit) => ({
      url: `${appUrl}/report/${encodeURIComponent(audit.domain)}`,
      lastModified: new Date(audit.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }))

    return [...staticPages, ...reportPages]
  } catch {
    return staticPages
  }
}
