import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer"

import type { AuditResult } from "@/types/audit"

interface PdfInput {
  url: string
  createdAt: string
  unlocked: boolean
  result: AuditResult
}

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    color: "#111827",
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 34,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 2,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  scoreCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    width: "48%",
  },
  scoreLabel: {
    color: "#6b7280",
    fontSize: 9,
  },
  scoreValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: 700,
  },
  listItem: {
    marginBottom: 6,
    lineHeight: 1.45,
  },
  recommendationCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 5,
  },
  recommendationLine: {
    marginBottom: 3,
    lineHeight: 1.4,
  },
})

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function AuditReportPdf({ url, createdAt, unlocked, result }: PdfInput) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Website Audit Report</Text>
        <Text style={styles.subtitle}>Audited URL: {url}</Text>
        <Text style={styles.subtitle}>Generated date: {formatDate(createdAt)}</Text>
        <Text style={styles.subtitle}>
          Report access level: {unlocked ? "Full Report" : "Preview"}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Overall Score</Text>
              <Text style={styles.scoreValue}>{result.overallScore}/100</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>SEO Score</Text>
              <Text style={styles.scoreValue}>{result.seoScore}/100</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Conversion Score</Text>
              <Text style={styles.scoreValue}>{result.conversionScore}/100</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>UX Score</Text>
              <Text style={styles.scoreValue}>{result.uxScore}/100</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Copy Suggestions</Text>
          <Text style={styles.listItem}>
            Headline: {result.copySuggestions.suggestedHeadline}
          </Text>
          <Text style={styles.listItem}>CTA: {result.copySuggestions.suggestedCTA}</Text>
          <Text style={styles.listItem}>
            Meta Description: {result.copySuggestions.suggestedMetaDescription}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Wins</Text>
          {result.quickWins.map((item, index) => (
            <Text key={`quick-win-${index}`} style={styles.listItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problems Found</Text>
          {result.problems.map((item, index) => (
            <Text key={`problem-${index}`} style={styles.listItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Improvement Suggestions</Text>
          {result.improvements.map((item, index) => (
            <Text key={`improvement-${index}`} style={styles.listItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>

        {unlocked ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Recommendations</Text>
            {result.detailedRecommendations.map((item, index) => (
              <View key={`recommendation-${index}`} style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>{item.title}</Text>
                <Text style={styles.recommendationLine}>
                  Why it matters: {item.whyItMatters}
                </Text>
                <Text style={styles.recommendationLine}>
                  Recommended action: {item.recommendedAction}
                </Text>
                <Text style={styles.recommendationLine}>Example: {item.example}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}

export async function buildAuditReportPdf(input: PdfInput): Promise<Buffer> {
  return renderToBuffer(<AuditReportPdf {...input} />)
}
