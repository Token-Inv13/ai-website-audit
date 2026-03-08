import { NextResponse } from "next/server"
import Stripe from "stripe"

import { unlockAudit } from "@/lib/auditStore"

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing")
  }

  return new Stripe(secretKey)
}

function buildRedirect(path: string, requestUrl: string): URL {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

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

    const auditId = session.metadata?.auditId

    if (!auditId) {
      return NextResponse.redirect(buildRedirect("/", request.url))
    }

    const isPaid = session.payment_status === "paid"

    if (isPaid) {
      const unlocked = await unlockAudit(auditId, session.id)

      if (!unlocked) {
        return NextResponse.redirect(buildRedirect("/", request.url))
      }

      return NextResponse.redirect(
        buildRedirect(`/result/${auditId}?unlocked=1`, request.url),
      )
    }

    return NextResponse.redirect(buildRedirect(`/result/${auditId}`, request.url))
  } catch (error) {
    console.error("GET /api/checkout/success failed:", error)
    return NextResponse.redirect(buildRedirect("/", request.url))
  }
}
