import type { MetadataRoute } from "next"

import { getPublicAppUrl } from "@/lib/publicAppUrl"

const appUrl = getPublicAppUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
