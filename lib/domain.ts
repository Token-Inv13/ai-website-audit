function cleanHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "")
}

export function normalizeDomainFromValue(value: string): string {
  if (!value.trim()) {
    return ""
  }

  const candidate = value.includes("://") ? value : `https://${value}`

  try {
    const parsed = new URL(candidate)
    const hostname = cleanHostname(parsed.hostname)

    if (!hostname) {
      return ""
    }

    return hostname.startsWith("www.") ? hostname.slice(4) : hostname
  } catch {
    return ""
  }
}

export function normalizeDomainFromUrl(url: string): string {
  return normalizeDomainFromValue(url)
}
