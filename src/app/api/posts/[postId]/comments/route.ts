import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ postId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { postId } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { content } = await req.json();
    if (!content?.trim()) return new NextResponse("Content is required", { status: 400 });

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: user.id,
      },
      include: { user: { select: { name: true, imageUrl: true } } },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
