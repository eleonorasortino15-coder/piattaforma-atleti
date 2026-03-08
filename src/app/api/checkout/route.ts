import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId } = await req.json();

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
    });
    if (!course) return new NextResponse("Course not found", { status: 404 });

    // Controlla se ha già acquistato
    const existing = await db.purchase.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (existing) return new NextResponse("Already purchased", { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round((course.price ?? 0) * 100),
            product_data: { name: course.title },
          },
        },
      ],
      metadata: { courseId, userId: user.id },
      success_url: `${baseUrl}/dashboard/user?success=1`,
      cancel_url: `${baseUrl}/athletes/${course.athleteId}?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
