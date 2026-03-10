import { NextResponse } from "next/server"

import { getPublicAppUrl } from "@/lib/publicAppUrl"
import { getCheckoutSessionAuditId, getStripeClient } from "@/lib/stripe"

function buildRedirect(path: string, requestUrl: string): URL {
  const appUrl = getPublicAppUrl()

  if (appUrl) {
    return new URL(path, appUrl)
  }

  return new URL(path, requestUrl)
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const sessionId = requestUrl.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.redirect(buildRedirect("/", request.url))
    }

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const auditId = getCheckoutSessionAuditId(session)

    const isPaid = session.payment_status === "paid"

    if (isPaid) {
      return NextResponse.redirect(
        buildRedirect(`/result/${auditId}?payment=success`, request.url),
      )
    }

    return NextResponse.redirect(buildRedirect(`/result/${auditId}`, request.url))
  } catch (error) {
    console.error("GET /api/checkout/success failed:", error)
    return NextResponse.redirect(buildRedirect("/", request.url))
  }
}
