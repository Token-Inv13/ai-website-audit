import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { blogPosts, blogPostsBySlug } from "@/lib/blogPosts"

interface PageParams {
  params: Promise<{
    slug: string
  }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const post = blogPostsBySlug[slug as keyof typeof blogPostsBySlug]

  if (!post) {
    return {
      title: "Blog | AI Website Audit",
      description: "SEO, UX and conversion optimization guides.",
    }
  }

  return {
    title: `${post.title} | AI Website Audit Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params
  const post = blogPostsBySlug[slug as keyof typeof blogPostsBySlug]

  if (!post) {
    notFound()
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <article className="mx-auto w-full max-w-4xl space-y-7">
        <header className="glass-card p-8 sm:p-10">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            SEO Guide
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            {post.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        </header>

        <section className="soft-panel space-y-5 p-8 sm:p-10">
          {post.intro.map((paragraph, index) => (
            <p key={`intro-${index}`} className="text-base leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}

          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-3 pt-2">
              <h2 className="text-2xl font-semibold text-slate-900">{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.heading}-${index}`}
                  className="text-base leading-relaxed text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </section>

        <section className="soft-panel border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Turn Insights Into Action</h2>
          <p className="mt-3 text-slate-700">{post.cta}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-cyan-600"
            >
              Run Your Website Audit
            </Link>
            <Link
              href="/blog"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Blog
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}
