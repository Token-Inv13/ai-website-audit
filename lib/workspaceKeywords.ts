export type KeywordIntent =
  | "Informational"
  | "Commercial"
  | "Long-tail"

export interface KeywordSuggestion {
  value: string
  intent: KeywordIntent
  rationale: string
  score: number
}

export interface KeywordCluster {
  title: string
  description: string
  intent: KeywordIntent
  suggestions: KeywordSuggestion[]
}

interface SuggestionCandidate {
  value: string
  rationale: string
  score: number
}

const CLUSTERS: Array<{
  intent: KeywordIntent
  title: string
  description: string
  candidates: (seed: string) => SuggestionCandidate[]
}> = [
  {
    intent: "Informational",
    title: "Informational ideas",
    description: "Questions and learning-focused variations.",
    candidates: (seed) => [
      { value: `how to ${seed}`, rationale: "Question-led variation.", score: 92 },
      { value: `what is ${seed}`, rationale: "Definition-led variation.", score: 90 },
      { value: `${seed} guide`, rationale: "Classic educational content angle.", score: 88 },
      { value: `${seed} checklist`, rationale: "Actionable learning format.", score: 86 },
      { value: `${seed} examples`, rationale: "Helpful proof-oriented variation.", score: 84 },
      { value: `best practices for ${seed}`, rationale: "Higher-intent education format.", score: 82 },
    ],
  },
  {
    intent: "Commercial",
    title: "Commercial ideas",
    description: "Research, comparison, and evaluation searches.",
    candidates: (seed) => [
      { value: `best ${seed}`, rationale: "Purchase-oriented comparison term.", score: 93 },
      { value: `compare ${seed}`, rationale: "Side-by-side evaluation intent.", score: 90 },
      { value: `${seed} pricing`, rationale: "Decision-stage commercial variation.", score: 88 },
      { value: `${seed} software`, rationale: "Product discovery phrase.", score: 85 },
      { value: `${seed} tool`, rationale: "Practical solution discovery.", score: 84 },
      { value: `review ${seed}`, rationale: "Research-driven commercial query.", score: 82 },
    ],
  },
  {
    intent: "Long-tail",
    title: "Long-tail ideas",
    description: "More specific phrases with clearer use-case context.",
    candidates: (seed) => [
      { value: `${seed} for beginners`, rationale: "Entry-level intent.", score: 92 },
      { value: `${seed} for small business`, rationale: "Context-rich long-tail variation.", score: 91 },
      { value: `${seed} step by step`, rationale: "Process-led search intent.", score: 89 },
      { value: `${seed} with examples`, rationale: "Specific support-focused variation.", score: 87 },
      { value: `how to choose ${seed}`, rationale: "Decision-focused long-tail query.", score: 85 },
      { value: `${seed} without paid tools`, rationale: "Constraint-based use-case variation.", score: 83 },
    ],
  },
]

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
])

function normalizeSeed(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim()
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ")
}

function tokenize(value: string): string[] {
  return normalizeValue(value)
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token))
}

function uniqueTokens(value: string): string[] {
  return [...new Set(tokenize(value))]
}

function scoreSuggestion(seedTokens: string[], candidate: string, baseScore: number): number {
  const tokens = tokenize(candidate)
  const normalized = normalizeValue(candidate)
  const tokenCount = tokens.length
  const uniqueCount = uniqueTokens(candidate).length
  const overlap = seedTokens.filter((token) => tokens.includes(token)).length

  let score = baseScore

  if (tokenCount >= 2 && tokenCount <= 6) {
    score += 8
  }

  if (tokenCount > 6) {
    score -= 8
  }

  if (uniqueCount !== tokenCount) {
    score -= 6
  }

  if (overlap >= seedTokens.length && seedTokens.length > 0) {
    score -= 8
  }

  if (normalized === normalizeValue(seedTokens.join(" "))) {
    score -= 20
  }

  return score
}

function dedupeAndRank(
  seed: string,
  candidates: SuggestionCandidate[],
  intent: KeywordIntent,
): KeywordSuggestion[] {
  const seedTokens = tokenize(seed)
  const seen = new Set<string>()

  return candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreSuggestion(seedTokens, candidate.value, candidate.score),
      intent,
    }))
    .filter((candidate) => {
      const normalized = normalizeValue(candidate.value)

      if (seen.has(normalized)) {
        return false
      }

      seen.add(normalized)
      return true
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.value.localeCompare(right.value)
    })
    .slice(0, 4)
}

export function buildKeywordClusters(seed: string): KeywordCluster[] {
  const normalizedSeed = normalizeSeed(seed)

  if (!normalizedSeed) {
    return []
  }

  const displaySeed = titleCase(normalizedSeed)

  return CLUSTERS.map((cluster) => ({
    title: cluster.title,
    description: cluster.description,
    intent: cluster.intent,
    suggestions: dedupeAndRank(
      displaySeed,
      cluster.candidates(displaySeed).map((candidate) => ({
        ...candidate,
        value: candidate.value.replace(/\bseo\b/gi, "SEO"),
      })),
      cluster.intent,
    ),
  }))
}
