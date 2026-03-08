import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ATHLETE") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { content, imageUrl } = await req.json();
    if (!content?.trim()) return new NextResponse("Content is required", { status: 400 });

    const post = await db.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        athleteId: user.id,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
