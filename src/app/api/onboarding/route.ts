import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { role } = await req.json();

    if (role !== "USER" && role !== "ATHLETE") {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    const dbUser = await db.user.upsert({
      where: { clerkId: userId },
      update: { role },
      create: {
        clerkId: userId,
        email: email ?? "",
        name: name || null,
        imageUrl: user.imageUrl,
        role,
      },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("[ONBOARDING_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
