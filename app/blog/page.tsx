import type { Metadata } from "next"
import Link from "next/link"

import { blogPosts } from "@/lib/blogPosts"

export const metadata: Metadata = {
  title: "Website Audit Blog | SEO, UX and Conversion Guides",
  description:
    "Read practical guides about website audits, SEO checklists, UX improvements, and conversion optimization.",
  alternates: {
    canonical: "/blog",
  },
}

export default function BlogIndexPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="glass-card p-8 sm:p-10">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            AI Website Audit Blog
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            SEO, UX and Conversion Guides
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600 sm:text-lg">
            Actionable articles to improve your website performance and turn insights into growth.
          </p>
        </section>

        <section className="grid gap-4">
          {blogPosts.map((post) => (
            <article key={post.slug} className="soft-panel p-6">
              <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
              <p className="mt-2 text-slate-600">{post.description}</p>
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
              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Read article
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
