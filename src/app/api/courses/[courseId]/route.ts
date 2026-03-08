import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ courseId: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ATHLETE") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();

    const course = await db.course.update({
      where: { id: courseId, athleteId: user.id },
      data: body,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
