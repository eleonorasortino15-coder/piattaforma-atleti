import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { title } = await req.json();
    if (!title?.trim()) return new NextResponse("Title is required", { status: 400 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ATHLETE") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const course = await db.course.create({
      data: {
        title: title.trim(),
        athleteId: user.id,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
