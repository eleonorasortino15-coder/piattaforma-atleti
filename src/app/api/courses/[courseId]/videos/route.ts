import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mux } from "@/lib/mux";

interface Params {
  params: Promise<{ courseId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { courseId } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ATHLETE") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, athleteId: user.id },
    });
    if (!course) return new NextResponse("Not found", { status: 404 });

    const { title } = await req.json();
    if (!title?.trim()) return new NextResponse("Title is required", { status: 400 });

    // Conta i video esistenti per la posizione
    const videoCount = await db.video.count({ where: { courseId } });

    // Crea un upload diretto su Mux
    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: ["public"] },
      cors_origin: "*",
    });

    // Salva il video nel database
    const video = await db.video.create({
      data: {
        title: title.trim(),
        courseId,
        position: videoCount + 1,
        muxAssetId: upload.id,
        isPublished: true,
      },
    });

    return NextResponse.json({ video, uploadUrl: upload.url });
  } catch (error) {
    console.error("[VIDEOS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
