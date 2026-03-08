import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { courseId } = await params;

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
    include: {
      athlete: { select: { id: true, name: true } },
      videos: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) return new NextResponse("Not found", { status: 404 });

  // Verifica accesso: atleta proprietario, acquisto singolo, o abbonamento al canale
  const isOwner = user.id === course.athleteId;

  const [purchase, subscription] = await Promise.all([
    db.purchase.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    }),
    db.subscription.findUnique({
      where: { userId_athleteId: { userId: user.id, athleteId: course.athleteId } },
    }),
  ]);

  if (!isOwner && !purchase && !subscription) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.json(course);
}
