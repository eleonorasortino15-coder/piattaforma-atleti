import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { bio, subscriptionPrice } = await req.json();

    const data: Record<string, unknown> = {};
    if (bio !== undefined) data.bio = bio?.trim() || null;
    if (subscriptionPrice !== undefined) data.subscriptionPrice = subscriptionPrice || null;

    const user = await db.user.update({
      where: { clerkId: userId },
      data,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
