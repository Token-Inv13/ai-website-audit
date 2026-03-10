import { NextResponse } from "next/server"
import Stripe from "stripe"

import {
  getStripeClient,
  getStripeWebhookSecret,
  unlockAuditFromCheckoutSession,
} from "@/lib/stripe"

export const runtime = "nodejs"

function getSignature(request: Request): string {
  const signature = request.headers.get("stripe-signature")?.trim()

  if (!signature) {
    throw new Error("Missing Stripe signature header")
  }

  return signature
}

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = getSignature(request)
    const stripe = getStripeClient()
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    )

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { auditId } = await unlockAuditFromCheckoutSession(session)

        console.info("Stripe webhook processed checkout.session.completed", {
          auditId,
          stripeEventId: event.id,
          stripeSessionId: session.id,
        })
        break
      }

      default:
        console.info("Stripe webhook ignored event", {
          stripeEventId: event.id,
          type: event.type,
        })
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe webhook error"

    console.error("POST /api/stripe/webhook failed:", message, error)

    return NextResponse.json(
      { error: "Invalid Stripe webhook request." },
      { status: 400 },
    )
  }
}
