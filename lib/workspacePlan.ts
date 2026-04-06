import type { QuickScanResult, SeoActionPlanItem } from "@/types/audit"

const PRIORITY_ORDER: Record<SeoActionPlanItem["priority"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
}

function pushIfMissing(
  items: SeoActionPlanItem[],
  item: SeoActionPlanItem,
): void {
  const normalizedTitle = item.title.toLowerCase()

  if (items.some((existing) => existing.title.toLowerCase() === normalizedTitle)) {
    return
  }

  items.push(item)
}

export function buildSeoActionPlan(result: QuickScanResult): SeoActionPlanItem[] {
  const items: SeoActionPlanItem[] = []
  const { checks, indexation } = result

  if (checks.title.status !== "present") {
    pushIfMissing(items, {
      title: "Fix or write a clearer title tag",
      priority: "High",
      description:
        "The title is missing or weak, so search results and click-through clarity will suffer.",
    })
  } else if (checks.titleLength.status === "warning") {
    pushIfMissing(items, {
      title: "Tighten the title length",
      priority: "High",
      description:
        "The title exists, but the length should be adjusted to reduce truncation risk.",
    })
  }

  if (checks.metaDescription.status !== "present") {
    pushIfMissing(items, {
      title: "Add a meta description",
      priority: "High",
      description:
        "Search snippets are less descriptive when the meta description is missing.",
    })
  } else if (checks.metaDescriptionLength.status === "warning") {
    pushIfMissing(items, {
      title: "Improve the meta description length",
      priority: "Medium",
      description:
        "The description exists but should be tightened to better fit search snippets.",
    })
  }

  if (checks.h1.status !== "present") {
    pushIfMissing(items, {
      title: "Add a single clear H1",
      priority: "High",
      description:
        "The page needs one obvious primary heading so both users and crawlers understand the topic.",
    })
  }

  if (checks.https.status !== "present") {
    pushIfMissing(items, {
      title: "Move the page to HTTPS",
      priority: "High",
      description:
        "HTTPS is a trust and SEO baseline, and the current URL does not use it.",
    })
  }

  if (checks.robots.status !== "present" || indexation.noindexDetected) {
    pushIfMissing(items, {
      title: "Remove blocking robots directives",
      priority: "High",
      description:
        "The robots signal suggests the page could be blocked or needs confirmation.",
    })
  }

  if (checks.canonical.status !== "present" || !indexation.canonicalMatches) {
    pushIfMissing(items, {
      title: "Verify the canonical URL",
      priority: "Medium",
      description:
        "The canonical signal is missing or mismatched, so indexing may consolidate incorrectly.",
    })
  }

  if (indexation.htmlIsSparse || indexation.confidence === "low") {
    pushIfMissing(items, {
      title: "Confirm client-rendered content",
      priority: "Low",
      description:
        "The HTML shell is sparse, so the page should be checked with a rendered view before concluding.",
    })
  }

  if (checks.title.status === "present" && checks.metaDescription.status === "present") {
    pushIfMissing(items, {
      title: "Expand above-the-fold clarity",
      priority: "Low",
      description:
        "If the page already has the basics, the next improvement is clearer messaging above the fold.",
    })
  }

  return items.sort((left, right) => {
    const priorityDelta =
      PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority]

    if (priorityDelta !== 0) {
      return priorityDelta
    }

    return left.title.localeCompare(right.title)
  }).slice(0, 5)
}
