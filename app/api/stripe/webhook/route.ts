import { NextResponse } from "next/server"
import Stripe from "stripe"

import {
  getStripeClient,
  getStripeWebhookSecret,
  unlockAuditFromCheckoutSession,
} from "@/lib/stripe"
import { syncWorkspacePlanFromSubscription } from "@/lib/workspaceServer"

export const runtime = "nodejs"

function getSignature(request: Request): string {
  const signature = request.headers.get("stripe-signature")?.trim()

  if (!signature) {
    throw new Error("Missing Stripe signature header")
  }

  return signature
}

function getVisitorIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): string {
  const visitorId = metadata?.visitorId?.trim()

  if (!visitorId) {
    throw new Error("Stripe event is missing metadata.visitorId")
  }

  return visitorId
}

async function handleSubscriptionSync(subscription: Stripe.Subscription) {
  const visitorId = getVisitorIdFromMetadata(subscription.metadata)
  const workspace = await syncWorkspacePlanFromSubscription(subscription, visitorId)

  console.info("Stripe webhook processed subscription sync", {
    visitorId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    plan: workspace.plan,
  })
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
        if (session.mode === "subscription") {
          const visitorId =
            session.metadata?.visitorId?.trim() ?? session.client_reference_id?.trim()

          if (!visitorId) {
            throw new Error("Stripe checkout session is missing metadata.visitorId")
          }

          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null

          if (!subscriptionId) {
            throw new Error("Stripe checkout session is missing subscription id")
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const workspace = await syncWorkspacePlanFromSubscription(subscription, visitorId)

          console.info("Stripe webhook processed subscription checkout", {
            visitorId,
            stripeEventId: event.id,
            stripeSessionId: session.id,
            stripeSubscriptionId: subscription.id,
            plan: workspace.plan,
          })
          break
        }

        const { auditId } = await unlockAuditFromCheckoutSession(session)

        console.info("Stripe webhook processed checkout.session.completed", {
          auditId,
          stripeEventId: event.id,
          stripeSessionId: session.id,
        })
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionSync(subscription)
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
