import type { Metadata } from "next"

import "./globals.css"

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://ai-website-audit-beta.vercel.app"

const seoTitle =
  "AI Website Audit Tool — Analyze SEO, UX & Conversion in Seconds"

const seoDescription =
  "Analyze your website instantly with our AI Website Audit tool. Get SEO insights, UX improvements and conversion recommendations in seconds."

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: seoTitle,
  description: seoDescription,
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
    title: seoTitle,
    description: seoDescription,
    siteName: "AI Website Audit",
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
  },
}

const softwareApplicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Website Audit",
  description: seoDescription,
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
