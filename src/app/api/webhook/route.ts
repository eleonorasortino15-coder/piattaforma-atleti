import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { courseId, userId, athleteId, type } = session.metadata ?? {};

    if (!userId) return new NextResponse("Missing metadata", { status: 400 });

    if (type === "subscription" && athleteId) {
      await db.subscription.upsert({
        where: { userId_athleteId: { userId, athleteId } },
        create: {
          userId,
          athleteId,
          stripeSubscriptionId: session.subscription as string,
        },
        update: {
          stripeSubscriptionId: session.subscription as string,
        },
      });
    } else if (courseId) {
      await db.purchase.create({
        data: { courseId, userId },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await db.subscription.deleteMany({
      where: { stripeSubscriptionId: subscription.id },
    });
  }

  return new NextResponse(null, { status: 200 });
}
