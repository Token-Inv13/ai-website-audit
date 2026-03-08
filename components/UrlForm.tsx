"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { getApiErrorMessage, getErrorMessage } from "@/lib/error"

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

      const payload = (await response
        .json()
        .catch(() => null)) as { id?: string } | null

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Unable to run audit."))
      }

      if (!payload?.id) {
        throw new Error("Unable to run audit.")
      }

      router.push(`/result/${payload.id}`)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to run audit."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <label htmlFor="website-url" className="block text-sm font-medium text-slate-700">
        Website URL
      </label>
      <div className="relative">
        <input
          id="website-url"
          type="url"
          placeholder="https://example.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={loading}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 font-semibold text-white shadow-[0_16px_35px_-18px_rgba(37,99,235,0.75)] transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Analyzing..." : "Analyze Website"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  )
}
