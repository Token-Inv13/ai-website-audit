export type ProgrammaticPageType = "tool" | "industry" | "platform"

export interface ProgrammaticFaq {
  question: string
  answer: string
}

export interface ProgrammaticLandingPage {
  slug: string
  pageType: ProgrammaticPageType
  title: string
  subtitle: string
  metaTitle: string
  metaDescription: string
  whyItMatters: string
  checks: string[]
  audience: string
  benefits: string[]
  faqs: ProgrammaticFaq[]
}

const defaultFaqs: ProgrammaticFaq[] = [
  {
    question: "How long does a website audit take?",
    answer:
      "Most audits are ready in under a minute. You get an instant preview and can unlock the full report when needed.",
  },
  {
    question: "What does this audit cover?",
    answer:
      "The audit checks key SEO fundamentals, UX clarity, and conversion friction points so you can prioritize high-impact improvements.",
  },
  {
    question: "Can I run it on any website?",
    answer:
      "Yes. You can run the audit on most public websites, including service websites, ecommerce stores, and marketing pages.",
  },
]

export const toolIntentPages: ProgrammaticLandingPage[] = [
  {
    slug: "free-seo-audit-tool",
    pageType: "tool",
    title: "Free SEO Audit Tool",
    subtitle:
      "Run a quick SEO, UX, and conversion audit to uncover your top growth opportunities.",
    metaTitle: "Free SEO Audit Tool | SEOAuditAI",
    metaDescription:
      "Use our free SEO audit tool to find ranking blockers, UX friction, and conversion issues in minutes.",
    whyItMatters:
      "A clear baseline helps you prioritize what to fix first. Instead of random changes, you get focused actions that improve discoverability and conversion outcomes.",
    checks: [
      "Title and meta description quality",
      "Headline clarity and section hierarchy",
      "Primary CTA visibility and messaging",
      "Trust signals and conversion blockers",
    ],
    audience:
      "Founders, marketers, and website owners who need a clear first diagnosis before deeper optimization.",
    benefits: [
      "Understand your website quality in seconds",
      "Spot high-priority SEO and conversion issues",
      "Get actionable next steps, not generic advice",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "website-seo-checker",
    pageType: "tool",
    title: "Website SEO Checker",
    subtitle:
      "Check your website SEO and uncover practical improvements you can apply quickly.",
    metaTitle: "Website SEO Checker | SEOAuditAI",
    metaDescription:
      "Analyze your website with an AI-powered SEO checker and identify issues affecting rankings and conversions.",
    whyItMatters:
      "Many websites lose visibility because of simple structure and messaging issues. A fast SEO checker reveals where your pages are underperforming and why.",
    checks: [
      "Search snippet basics and metadata",
      "Content structure and heading consistency",
      "UX clarity that supports search intent",
      "On-page conversion flow and CTA friction",
    ],
    audience:
      "Teams and solo builders who want a lightweight way to review SEO fundamentals before investing in heavy audits.",
    benefits: [
      "Faster SEO diagnostics for any public website",
      "Better prioritization of optimization work",
      "Clear path from SEO insight to action",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "website-audit-tool",
    pageType: "tool",
    title: "Website Audit Tool",
    subtitle:
      "Audit your website and get structured recommendations for SEO, UX, and conversion.",
    metaTitle: "Website Audit Tool | SEOAuditAI",
    metaDescription:
      "Run an AI website audit tool to evaluate SEO, UX, and conversion quality with actionable recommendations.",
    whyItMatters:
      "Traffic without conversion is expensive. A website audit gives you a practical view of both discoverability and user experience so improvements drive real business impact.",
    checks: [
      "Overall performance scoring",
      "SEO opportunities and missing basics",
      "User journey and readability issues",
      "Conversion readiness and CTA effectiveness",
    ],
    audience:
      "Startups, agencies, and small businesses looking for a practical and repeatable audit workflow.",
    benefits: [
      "One report combining SEO, UX, and CRO signals",
      "Faster insight-to-execution loop",
      "Easy sharing with team or clients",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "free-website-audit",
    pageType: "tool",
    title: "Free Website Audit",
    subtitle:
      "Get a free website audit preview and identify the biggest opportunities on your site.",
    metaTitle: "Free Website Audit | SEOAuditAI",
    metaDescription:
      "Start with a free website audit preview to discover SEO and UX issues affecting your performance.",
    whyItMatters:
      "Before making major changes, you need clarity. A free audit preview helps you identify what is worth fixing first and where to focus resources.",
    checks: [
      "Core SEO and indexing signals",
      "Headline and value proposition clarity",
      "Conversion path and CTA strength",
      "Quick wins with immediate impact",
    ],
    audience:
      "Website owners who want immediate insight without adding friction at the top of the funnel.",
    benefits: [
      "Low-friction entry point with instant value",
      "Clear benchmark of current website quality",
      "Actionable direction for your next optimizations",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "seo-analyzer",
    pageType: "tool",
    title: "SEO Analyzer",
    subtitle:
      "Analyze your SEO performance and uncover practical fixes to improve visibility.",
    metaTitle: "SEO Analyzer | SEOAuditAI",
    metaDescription:
      "Use our SEO analyzer to review your website structure, metadata, and conversion clarity in minutes.",
    whyItMatters:
      "SEO performance depends on technical basics and content clarity. An analyzer helps you detect weak spots quickly and prioritize changes with measurable upside.",
    checks: [
      "Metadata strength and relevance",
      "Hierarchy and scannability signals",
      "Message clarity for target intent",
      "Trust and conversion support elements",
    ],
    audience:
      "Growth-focused teams that need a fast, repeatable SEO review before deeper execution.",
    benefits: [
      "Understand where rankings are likely blocked",
      "Improve quality signals for both users and search engines",
      "Turn insights into a clear action plan",
    ],
    faqs: defaultFaqs,
  },
]

export const industryIntentPages: ProgrammaticLandingPage[] = [
  {
    slug: "seo-audit-for-lawyers",
    pageType: "industry",
    title: "SEO Audit for Lawyers",
    subtitle:
      "Improve legal website visibility and lead conversion with a focused website audit.",
    metaTitle: "SEO Audit for Lawyers | SEOAuditAI",
    metaDescription:
      "Run an SEO audit for lawyers to improve local visibility, trust signals, and case inquiry conversions.",
    whyItMatters:
      "Legal prospects compare credibility fast. Weak messaging, unclear practice area pages, or missing trust elements can reduce qualified inquiries.",
    checks: [
      "Practice area page clarity and structure",
      "Local-intent SEO fundamentals",
      "Contact CTA visibility and friction",
      "Authority and trust signal placement",
    ],
    audience:
      "Law firms and legal marketers who want better quality leads from organic traffic.",
    benefits: [
      "Improve qualified inquiry rate",
      "Strengthen legal service positioning",
      "Prioritize high-impact content and UX fixes",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "seo-audit-for-restaurants",
    pageType: "industry",
    title: "SEO Audit for Restaurants",
    subtitle:
      "Audit your restaurant website to improve local discovery and reservations.",
    metaTitle: "SEO Audit for Restaurants | SEOAuditAI",
    metaDescription:
      "Get an SEO audit for restaurants to improve local search visibility, menu page UX, and booking conversion.",
    whyItMatters:
      "Restaurant websites need fast clarity: menu, location, and booking. If users cannot find key information quickly, conversions drop.",
    checks: [
      "Location and opening-hours clarity",
      "Menu page readability and structure",
      "Reservation CTA prominence",
      "Local SEO metadata and relevance",
    ],
    audience:
      "Restaurant owners and local marketing teams aiming to increase bookings and walk-ins.",
    benefits: [
      "Increase reservation-oriented traffic quality",
      "Reduce friction to booking actions",
      "Improve local discoverability",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "seo-audit-for-real-estate",
    pageType: "industry",
    title: "SEO Audit for Real Estate Websites",
    subtitle:
      "Optimize your real estate website for visibility, credibility, and lead generation.",
    metaTitle: "SEO Audit for Real Estate Websites | SEOAuditAI",
    metaDescription:
      "Run an SEO audit for real estate websites to improve listing discoverability and lead conversion.",
    whyItMatters:
      "Real estate websites depend on trust and navigation clarity. Weak listing structure or unclear CTAs can waste high-intent traffic.",
    checks: [
      "Listing page structure and readability",
      "Lead capture flow and CTA clarity",
      "Metadata quality for search snippets",
      "Trust signals across key pages",
    ],
    audience:
      "Real estate teams and agencies that want more qualified inquiries from website traffic.",
    benefits: [
      "Improve listing page engagement",
      "Increase lead form completion rate",
      "Strengthen market positioning online",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "seo-audit-for-plumbers",
    pageType: "industry",
    title: "SEO Audit for Plumbers",
    subtitle:
      "Audit your plumbing website and improve local SEO and quote request conversion.",
    metaTitle: "SEO Audit for Plumbers | SEOAuditAI",
    metaDescription:
      "Use a plumbing SEO audit to improve local rankings, service-page clarity, and lead conversion.",
    whyItMatters:
      "Service businesses rely on immediate action. If your site does not communicate services, location, and trust quickly, leads are lost.",
    checks: [
      "Service page clarity and relevance",
      "Local SEO and contact signals",
      "Quote CTA visibility",
      "Trust elements and reassurance copy",
    ],
    audience:
      "Plumbing businesses and local service marketers focused on higher lead volume.",
    benefits: [
      "Capture more high-intent local visitors",
      "Increase quote request actions",
      "Clarify service offers and differentiation",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "seo-audit-for-photographers",
    pageType: "industry",
    title: "SEO Audit for Photographers",
    subtitle:
      "Improve your photography website’s visibility and inquiry conversion with a focused audit.",
    metaTitle: "SEO Audit for Photographers | SEOAuditAI",
    metaDescription:
      "Run an SEO audit for photographers to improve portfolio discoverability and booking inquiries.",
    whyItMatters:
      "Photography websites need strong presentation and clear contact flow. If portfolio pages are hard to scan or CTAs are weak, inquiries decrease.",
    checks: [
      "Portfolio page structure and UX clarity",
      "Metadata and keyword relevance",
      "Inquiry CTA placement",
      "Trust and social proof sections",
    ],
    audience:
      "Freelance and studio photographers who want more qualified inquiries from search traffic.",
    benefits: [
      "Improve discoverability for key services",
      "Increase inquiry conversion from portfolio traffic",
      "Clarify offer and booking flow",
    ],
    faqs: defaultFaqs,
  },
]

export const platformIntentPages: ProgrammaticLandingPage[] = [
  {
    slug: "wordpress",
    pageType: "platform",
    title: "WordPress Website Audit",
    subtitle:
      "Analyze your WordPress website and prioritize SEO, UX, and conversion improvements.",
    metaTitle: "WordPress Website Audit | SEOAuditAI",
    metaDescription:
      "Run a WordPress website audit to detect SEO gaps, UX friction, and conversion blockers quickly.",
    whyItMatters:
      "WordPress sites evolve quickly and often accumulate structural and messaging debt that impacts rankings and conversions.",
    checks: [
      "Metadata and indexing basics",
      "Page hierarchy and content structure",
      "CTA and conversion path clarity",
      "Trust and reassurance placement",
    ],
    audience:
      "WordPress site owners and marketers who need a practical optimization roadmap.",
    benefits: [
      "Faster diagnosis of ranking blockers",
      "Prioritized UX and conversion fixes",
      "Clear next actions for content teams",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "shopify",
    pageType: "platform",
    title: "Shopify Website Audit",
    subtitle:
      "Audit your Shopify store to improve product-page SEO and conversion performance.",
    metaTitle: "Shopify Website Audit | SEOAuditAI",
    metaDescription:
      "Analyze your Shopify website with an AI audit for SEO, UX, and conversion improvements.",
    whyItMatters:
      "For Shopify stores, small content and structure issues can directly impact revenue and ad efficiency.",
    checks: [
      "Collection and product page messaging",
      "Metadata and snippet quality",
      "Checkout-oriented CTA hierarchy",
      "Trust and social proof signals",
    ],
    audience:
      "Ecommerce teams using Shopify who want stronger conversion from existing traffic.",
    benefits: [
      "Improve product-page conversion clarity",
      "Find SEO gaps that affect discoverability",
      "Prioritize changes tied to revenue impact",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "saas",
    pageType: "platform",
    title: "SaaS Website Audit",
    subtitle:
      "Audit your SaaS landing pages to increase trial signups and demo requests.",
    metaTitle: "SaaS Website Audit | SEOAuditAI",
    metaDescription:
      "Run a SaaS website audit to improve SEO, UX messaging, and conversion flow on core pages.",
    whyItMatters:
      "SaaS growth pages must communicate value quickly. Weak positioning and unclear CTA flow reduce acquisition efficiency.",
    checks: [
      "Value proposition clarity in hero sections",
      "Signup CTA prominence",
      "Scannability and information architecture",
      "Search intent alignment",
    ],
    audience:
      "SaaS founders and growth teams optimizing signups from organic and paid traffic.",
    benefits: [
      "Improve trial and demo conversion",
      "Clarify messaging for target segments",
      "Identify high-leverage page improvements",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "startup",
    pageType: "platform",
    title: "Startup Website Audit",
    subtitle:
      "Improve startup positioning, SEO visibility, and conversion quality with a focused audit.",
    metaTitle: "Startup Website Audit | SEOAuditAI",
    metaDescription:
      "Get a startup website audit to identify SEO and UX issues that reduce traction and lead quality.",
    whyItMatters:
      "Startup websites change rapidly. Without clear messaging and structure, visitors leave before understanding the product.",
    checks: [
      "Headline and positioning clarity",
      "Lead capture flow quality",
      "SEO fundamentals for discoverability",
      "Trust markers and credibility signals",
    ],
    audience:
      "Early-stage teams who need to improve acquisition pages without heavy tooling.",
    benefits: [
      "Faster clarity on what blocks conversion",
      "More focused growth experiments",
      "Better alignment between traffic and signup intent",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "ecommerce",
    pageType: "platform",
    title: "Ecommerce Website Audit",
    subtitle:
      "Audit your ecommerce website to improve rankings, trust, and checkout conversion.",
    metaTitle: "Ecommerce Website Audit | SEOAuditAI",
    metaDescription:
      "Analyze your ecommerce website with an SEO and conversion audit to improve product and category page performance.",
    whyItMatters:
      "Ecommerce performance depends on both discoverability and purchase confidence. Weak structure and unclear CTAs reduce sales.",
    checks: [
      "Category and product page structure",
      "Metadata and search snippet quality",
      "Checkout path CTA effectiveness",
      "Trust signals near purchase actions",
    ],
    audience:
      "Online stores that want higher conversion from existing traffic and campaigns.",
    benefits: [
      "Increase quality of product-page traffic",
      "Reduce friction before checkout",
      "Prioritize improvements tied to conversion rate",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "small-business",
    pageType: "platform",
    title: "Small Business Website Audit",
    subtitle:
      "Audit your small business website to improve local visibility and lead generation.",
    metaTitle: "Small Business Website Audit | SEOAuditAI",
    metaDescription:
      "Run a small business website audit to find SEO, UX, and conversion opportunities quickly.",
    whyItMatters:
      "Small business websites need immediate clarity and trust. Missing basics can lower inquiries even when traffic exists.",
    checks: [
      "Homepage clarity and offer messaging",
      "Local SEO fundamentals",
      "Contact and quote CTA flow",
      "Trust elements like testimonials",
    ],
    audience:
      "Small business owners and local marketers aiming to convert more visitors into customers.",
    benefits: [
      "Stronger local acquisition pages",
      "Higher inquiry conversion potential",
      "Simple roadmap for quick website improvements",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "portfolio",
    pageType: "platform",
    title: "Portfolio Website Audit",
    subtitle:
      "Audit your portfolio website to improve discoverability and inbound inquiries.",
    metaTitle: "Portfolio Website Audit | SEOAuditAI",
    metaDescription:
      "Run a portfolio website audit to improve SEO visibility, readability, and lead conversion.",
    whyItMatters:
      "A strong portfolio still needs clear structure and conversion paths. Otherwise, visitors admire your work but do not contact you.",
    checks: [
      "Portfolio navigation and clarity",
      "Metadata and visibility fundamentals",
      "Contact CTA placement",
      "Proof and trust signal presentation",
    ],
    audience:
      "Freelancers and studios that need more qualified inbound opportunities.",
    benefits: [
      "Make portfolio pages easier to scan",
      "Increase contact intent from visitors",
      "Improve discoverability for core services",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "agency",
    pageType: "platform",
    title: "Agency Website Audit",
    subtitle:
      "Audit your agency website to improve SEO, trust, and inbound lead quality.",
    metaTitle: "Agency Website Audit | SEOAuditAI",
    metaDescription:
      "Use an agency website audit to identify SEO and conversion gaps across service pages.",
    whyItMatters:
      "Agency websites are judged on clarity and proof. Weak case-study structure or generic messaging lowers lead quality.",
    checks: [
      "Service positioning and offer clarity",
      "Lead CTA hierarchy",
      "Case study and trust signal visibility",
      "On-page SEO fundamentals",
    ],
    audience:
      "Agencies aiming to improve inbound lead quality without rebuilding their whole site.",
    benefits: [
      "Better service-page conversion clarity",
      "More persuasive proof structure",
      "Faster prioritization of high-impact fixes",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "webflow",
    pageType: "platform",
    title: "Webflow Website Audit",
    subtitle:
      "Run a Webflow website audit to improve SEO fundamentals and conversion clarity.",
    metaTitle: "Webflow Website Audit | SEOAuditAI",
    metaDescription:
      "Audit your Webflow website and find practical SEO, UX, and conversion opportunities.",
    whyItMatters:
      "Webflow gives design flexibility, but structure and messaging still decide search and conversion performance.",
    checks: [
      "Semantic structure and heading hierarchy",
      "Metadata quality and relevance",
      "Primary CTA visibility",
      "Trust and proof sections",
    ],
    audience:
      "Webflow teams and freelancers who want a practical growth-focused audit workflow.",
    benefits: [
      "Improve discoverability without sacrificing design",
      "Strengthen conversion paths on key pages",
      "Prioritize fixes with clear business impact",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "wix",
    pageType: "platform",
    title: "Wix Website Audit",
    subtitle:
      "Audit your Wix website to improve rankings, usability, and conversion potential.",
    metaTitle: "Wix Website Audit | SEOAuditAI",
    metaDescription:
      "Run a Wix website audit and identify SEO, UX, and conversion improvements in minutes.",
    whyItMatters:
      "Wix sites can perform well when structure and messaging are clear. Missing SEO basics can still limit growth.",
    checks: [
      "Metadata and page intent alignment",
      "Layout clarity and readability",
      "CTA hierarchy across core pages",
      "Trust and reassurance placement",
    ],
    audience:
      "Wix site owners who need quick clarity on what to improve first.",
    benefits: [
      "Faster prioritization of SEO fixes",
      "Clearer conversion flow for visitors",
      "Practical recommendations you can execute quickly",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "squarespace",
    pageType: "platform",
    title: "Squarespace Website Audit",
    subtitle:
      "Analyze your Squarespace website and improve SEO, UX, and conversion quality.",
    metaTitle: "Squarespace Website Audit | SEOAuditAI",
    metaDescription:
      "Run a Squarespace website audit to find SEO and conversion improvements for your key pages.",
    whyItMatters:
      "Squarespace sites benefit from clean design, but conversion and SEO performance still rely on strong content structure.",
    checks: [
      "Page structure and heading consistency",
      "Search snippet and metadata quality",
      "CTA visibility and flow",
      "Trust-building content placement",
    ],
    audience:
      "Squarespace users who want better visibility and stronger lead generation.",
    benefits: [
      "Improve page clarity for users and search engines",
      "Increase conversion readiness of core pages",
      "Get a concise action plan for optimization",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "nextjs",
    pageType: "platform",
    title: "Next.js Website Audit",
    subtitle:
      "Audit your Next.js website for SEO quality, UX clarity, and conversion opportunities.",
    metaTitle: "Next.js Website Audit | SEOAuditAI",
    metaDescription:
      "Use this Next.js website audit to uncover SEO and conversion issues on your marketing pages.",
    whyItMatters:
      "Next.js enables performance-focused sites, but messaging and structure still determine growth outcomes.",
    checks: [
      "Metadata consistency across pages",
      "Content hierarchy and readability",
      "CTA clarity and conversion flow",
      "Trust and proof element placement",
    ],
    audience:
      "Product and growth teams running Next.js marketing websites.",
    benefits: [
      "Validate acquisition page quality quickly",
      "Align SEO and conversion priorities",
      "Ship focused improvements faster",
    ],
    faqs: defaultFaqs,
  },
  {
    slug: "woocommerce",
    pageType: "platform",
    title: "WooCommerce Website Audit",
    subtitle:
      "Audit your WooCommerce store to improve product visibility and conversion rates.",
    metaTitle: "WooCommerce Website Audit | SEOAuditAI",
    metaDescription:
      "Run a WooCommerce website audit to optimize SEO, UX, and conversion performance for your store.",
    whyItMatters:
      "WooCommerce stores can lose revenue from avoidable UX and SEO gaps across product and category pages.",
    checks: [
      "Product page structure and messaging",
      "Metadata quality for search visibility",
      "CTA hierarchy from listing to checkout",
      "Trust and reassurance near conversion points",
    ],
    audience:
      "WooCommerce store owners and ecommerce teams focused on profitable growth.",
    benefits: [
      "Identify high-impact ecommerce fixes quickly",
      "Improve product-page conversion clarity",
      "Prioritize actions with revenue potential",
    ],
    faqs: defaultFaqs,
  },
]

export const allProgrammaticSeoPages = [
  ...toolIntentPages,
  ...industryIntentPages,
  ...platformIntentPages,
]

export function getToolIntentPageBySlug(slug: string) {
  return toolIntentPages.find((page) => page.slug === slug)
}

export function getIndustryPageBySlug(slug: string) {
  return industryIntentPages.find((page) => page.slug === slug)
}

export function getPlatformPageBySlug(slug: string) {
  return platformIntentPages.find((page) => page.slug === slug)
}
