import type { Metadata, Viewport } from "next"
import Link from "next/link"

import BrandLogo from "@/components/BrandLogo"
import {
  BRAND_NAME,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
} from "@/lib/branding"
import "./globals.css"
import { getPublicAppUrl } from "@/lib/publicAppUrl"

const appUrl = getPublicAppUrl()

export const viewport: Viewport = {
  themeColor: "#f8fbff",
}

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: DEFAULT_SEO_TITLE,
  description: DEFAULT_SEO_DESCRIPTION,
  applicationName: BRAND_NAME,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: BRAND_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND_NAME,
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
        <div className="pointer-events-none sticky top-0 z-30 px-4 pt-4">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <div className="pointer-events-auto">
              <BrandLogo priority />
            </div>
            <Link
              href="/"
              className="pointer-events-auto hidden rounded-full border border-white/60 bg-white/75 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md sm:inline-flex"
            >
              AI SEO, UX & Conversion
            </Link>
          </div>
        </div>
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
