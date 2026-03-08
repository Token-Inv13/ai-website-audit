import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "AI Website Audit",
  description: "Analyze your website and get actionable improvements in seconds",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
