function normalizeAppUrl(value: string | undefined): string | null {
  const normalized = value?.trim().replace(/\/$/, "")

  return normalized ? normalized : null
}

export function getPublicAppUrl(): string {
  const explicitAppUrl = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL)

  if (explicitAppUrl) {
    return explicitAppUrl
  }

  const vercelUrl = normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)

  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`
  }

  const deploymentUrl = normalizeAppUrl(process.env.VERCEL_URL)

  if (deploymentUrl) {
    return deploymentUrl.startsWith("http")
      ? deploymentUrl
      : `https://${deploymentUrl}`
  }

  return "http://localhost:3000"
}

export function buildPublicAppUrl(path: string): string {
  return new URL(path, getPublicAppUrl()).toString()
}
