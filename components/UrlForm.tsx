"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UrlForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    let normalizedUrl = url.trim()

    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    try {
      new URL(normalizedUrl)
    } catch {
      setError("Please enter a valid URL.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const payload = (await response.json()) as { id?: string; error?: string }

      if (!response.ok || !payload.id) {
        throw new Error(payload.error || "Unable to run audit.")
      }

      router.push(`/result/${payload.id}`)
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to run audit."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <label htmlFor="website-url" className="block text-sm font-medium text-slate-700">
        Website URL
      </label>
      <input
        id="website-url"
        type="url"
        placeholder="https://example.com"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        disabled={loading}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Analyzing..." : "Analyze Website"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  )
}
