import type { MetadataRoute } from "next"

import { listRecentAudits } from "@/lib/auditStore"

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://ai-website-audit-beta.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const auditTypes = [
    "wordpress",
    "shopify",
    "saas",
    "startup",
    "ecommerce",
    "small-business",
    "portfolio",
    "agency",
  ]
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
      url: `${appUrl}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
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
    ...auditTypes.map((type) => ({
      url: `${appUrl}/audit/${type}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]

  try {
    const recentAudits = await listRecentAudits(25)
    const resultPages: MetadataRoute.Sitemap = recentAudits.map((audit) => ({
      url: `${appUrl}/result/${audit.id}`,
      lastModified: new Date(audit.createdAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }))

    return [...staticPages, ...resultPages]
  } catch {
    return staticPages
  }
}
