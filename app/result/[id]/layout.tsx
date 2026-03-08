import type { Metadata } from "next"

interface LayoutParams {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: LayoutParams): Promise<Metadata> {
  const { id } = await params

  return {
    alternates: {
      canonical: `/result/${id}`,
    },
  }
}

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
