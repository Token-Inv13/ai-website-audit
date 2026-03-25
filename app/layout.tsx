import type { Metadata } from "next"

import {
  BRAND_NAME,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
} from "@/lib/branding"
import "./globals.css"
import { getPublicAppUrl } from "@/lib/publicAppUrl"

const appUrl = getPublicAppUrl()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: DEFAULT_SEO_TITLE,
  description: DEFAULT_SEO_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: appUrl,
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    siteName: BRAND_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
  },
}

const softwareApplicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND_NAME,
  description: DEFAULT_SEO_DESCRIPTION,
  url: appUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "9",
    priceCurrency: "USD",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationStructuredData),
          }}
        />
        {children}
      </body>
    </html>
  )
}
