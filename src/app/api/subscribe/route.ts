import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { athleteId } = await req.json();

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const athlete = await db.user.findUnique({
      where: { id: athleteId, role: "ATHLETE" },
    });
    if (!athlete) return new NextResponse("Athlete not found", { status: 404 });

    if (!athlete.subscriptionPrice) {
      return new NextResponse("Athlete has no subscription plan", { status: 400 });
    }

    // Controlla se già abbonato
    const existing = await db.subscription.findUnique({
      where: { userId_athleteId: { userId: user.id, athleteId } },
    });
    if (existing) return new NextResponse("Already subscribed", { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            recurring: { interval: "month" },
            unit_amount: Math.round(athlete.subscriptionPrice * 100),
            product_data: {
              name: `${athlete.name ?? "Athlete"} - Monthly Subscription`,
            },
          },
        },
      ],
      metadata: { athleteId, userId: user.id, type: "subscription" },
      success_url: `${baseUrl}/athletes/${athleteId}?subscribed=1`,
      cancel_url: `${baseUrl}/athletes/${athleteId}?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[SUBSCRIBE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
