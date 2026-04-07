import { NextResponse } from "next/server"

import { getErrorMessage } from "@/lib/error"
import { isPlan, normalizePlan } from "@/lib/plan"
import {
  applyWorkspaceVisitorCookie,
  createWorkspaceVisitorId,
  resolveWorkspaceVisitorId,
} from "@/lib/workspaceServer"
import {
  getStripeClient,
  getStripePriceIdForPlan,
  getWorkspaceCheckoutUrls,
  type PaidPlan,
} from "@/lib/stripe"

interface WorkspacePlanRequestBody {
  plan?: string
}

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WorkspacePlanRequestBody

    if (!body.plan || !isPlan(body.plan)) {
      return NextResponse.json(
        { error: "Please choose a valid plan." },
        { status: 400 },
      )
    }

    const visitorId = resolveWorkspaceVisitorId(request.headers) ?? createWorkspaceVisitorId()
    const plan = normalizePlan(body.plan)

    if (plan === "free") {
      return NextResponse.json(
        { error: "Free plan does not require checkout." },
        { status: 400 },
      )
    }

    const stripe = getStripeClient()
    const priceId = getStripePriceIdForPlan(plan as PaidPlan)
    const { cancelUrl, successUrl } = getWorkspaceCheckoutUrls(plan as PaidPlan)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: visitorId,
      metadata: {
        visitorId,
        plan,
      },
      subscription_data: {
        metadata: {
          visitorId,
          plan,
        },
      },
    })

    if (!session.url) {
      throw new Error("Stripe checkout session URL missing.")
    }

    const response = NextResponse.json(
      {
        url: session.url,
      },
      { status: 200 },
    )

    applyWorkspaceVisitorCookie(response, visitorId)
    return response
  } catch (error) {
    const message = getErrorMessage(error, "Internal server error")
    console.error("POST /api/workspace/plan failed:", {
      message,
      error,
    })

    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Stripe is misconfigured. Missing STRIPE_SECRET_KEY." },
        { status: 500 },
      )
    }

    if (message.includes("STRIPE_PRICE_BASIC_ID") || message.includes("STRIPE_PRICE_PRO_ID")) {
      return NextResponse.json(
        {
          error: "Stripe price configuration is incomplete. Set the plan price IDs first.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: "Plan update failed." },
      { status: 500 },
    )
  }
}
