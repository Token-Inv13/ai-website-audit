import Stripe from "stripe"

import { unlockAudit } from "@/lib/auditStore"

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
