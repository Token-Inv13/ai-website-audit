import Stripe from "stripe"

import { unlockAudit } from "@/lib/auditStore"
import { getPublicAppUrl } from "@/lib/publicAppUrl"
import type { Plan } from "@/lib/plan"

function getTrimmedEnv(name: string): string | null {
  const value = process.env[name]?.trim()

  return value ? value : null
}

export function getStripeClient(): Stripe {
  const secretKey = getTrimmedEnv("STRIPE_SECRET_KEY")

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing")
  }

  return new Stripe(secretKey)
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = getTrimmedEnv("STRIPE_WEBHOOK_SECRET")

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is missing")
  }

  return webhookSecret
}

export type PaidPlan = Exclude<Plan, "free">

const STRIPE_PLAN_PRICE_ENV: Record<PaidPlan, string> = {
  basic: "STRIPE_PRICE_BASIC_ID",
  pro: "STRIPE_PRICE_PRO_ID",
}

function normalizePriceId(value: string | null | undefined): string | null {
  const priceId = value?.trim()

  return priceId ? priceId : null
}

export function getStripePriceIdForPlan(plan: PaidPlan): string {
  const priceId = getTrimmedEnv(STRIPE_PLAN_PRICE_ENV[plan])

  if (!priceId) {
    throw new Error(`${STRIPE_PLAN_PRICE_ENV[plan]} is missing`)
  }

  return priceId
}

export function getWorkspacePlanFromPriceId(
  priceId: string | null | undefined,
): PaidPlan | null {
  const normalizedPriceId = normalizePriceId(priceId)

  if (!normalizedPriceId) {
    return null
  }

  if (normalizedPriceId === getTrimmedEnv(STRIPE_PLAN_PRICE_ENV.basic)) {
    return "basic"
  }

  if (normalizedPriceId === getTrimmedEnv(STRIPE_PLAN_PRICE_ENV.pro)) {
    return "pro"
  }

  return null
}

export function getWorkspaceCheckoutUrls(plan: PaidPlan): {
  cancelUrl: string
  successUrl: string
} {
  const appUrl = getPublicAppUrl()

  return {
    successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancelUrl: `${appUrl}/checkout/cancel?plan=${plan}`,
  }
}

export function getCheckoutSessionAuditId(session: Stripe.Checkout.Session): string {
  const auditId = session.metadata?.auditId?.trim()

  if (!auditId) {
    throw new Error("Stripe checkout session is missing metadata.auditId")
  }

  return auditId
}

export async function unlockAuditFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ auditId: string; unlocked: boolean }> {
  const auditId = getCheckoutSessionAuditId(session)
  const unlocked = await unlockAudit(auditId, session.id)

  return { auditId, unlocked }
}
