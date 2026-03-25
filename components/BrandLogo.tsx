import Image from "next/image"
import Link from "next/link"

type BrandLogoProps = {
  compact?: boolean
  priority?: boolean
}

export default function BrandLogo({
  compact = false,
  priority = false,
}: BrandLogoProps) {
  const src = compact ? "/logo-symbol.svg" : "/logo.svg"
  const width = compact ? 36 : 178
  const height = compact ? 36 : 40

  return (
    <Link
      href="/"
      className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.55)] backdrop-blur-md transition hover:bg-white"
      aria-label="SEOAuditAI home"
    >
      <Image
        src={src}
        alt="SEOAuditAI"
        width={width}
        height={height}
        priority={priority}
        className="h-auto"
      />
    </Link>
  )
}
