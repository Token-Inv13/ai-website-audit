import { NextResponse } from "next/server"

import {
  getAuditCapturedEmail,
  hasAudit,
  hasAuditWithCapturedEmail,
} from "@/lib/auditStore"
import { getErrorMessage } from "@/lib/error"
import { getPublicAppUrl } from "@/lib/publicAppUrl"
import { getStripeClient } from "@/lib/stripe"

interface CheckoutRequestBody {
  auditId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody
    const auditId = body.auditId?.trim()

    if (!auditId) {
      return NextResponse.json({ error: "Missing audit id." }, { status: 400 })
    }

    if (!(await hasAudit(auditId))) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 })
    }

    if (!(await hasAuditWithCapturedEmail(auditId))) {
      return NextResponse.json(
        { error: "Please enter your email before unlocking the full report." },
        { status: 400 },
      )
    }

    const capturedEmail = await getAuditCapturedEmail(auditId)

    const appUrl = getPublicAppUrl()
    const priceId = process.env.STRIPE_PRICE_ID?.trim()

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe configuration is incomplete." },
        { status: 500 },
      )
    }

    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/result/${auditId}`,
      customer_email: capturedEmail ?? undefined,
      metadata: {
        auditId,
        capturedEmail: capturedEmail ?? "",
      },
    })

    if (!session.url) {
      throw new Error("Stripe session URL missing")
    }

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error("POST /api/checkout failed:", error)
    const message = getErrorMessage(error, "Internal server error")

    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Stripe is misconfigured. Missing STRIPE_SECRET_KEY." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
