import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mux } from "@/lib/mux";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { videoId } = await params;

  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video || !video.muxAssetId) return new NextResponse("Not found", { status: 404 });

  try {
    // muxAssetId contiene l'upload ID - recupera l'upload per trovare l'asset
    const upload = await mux.video.uploads.retrieve(video.muxAssetId);

    if (!upload.asset_id) {
      return NextResponse.json({ status: "processing" });
    }

    // Recupera l'asset per avere il playback ID
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    const playbackId = asset.playback_ids?.[0]?.id ?? null;

    // Aggiorna il DB
    await db.video.update({
      where: { id: videoId },
      data: {
        muxAssetId: asset.id,
        muxPlaybackId: playbackId,
        duration: asset.duration ? Math.round(asset.duration) : null,
      },
    });

    return NextResponse.json({ status: "ready", playbackId });
  } catch {
    return new NextResponse("Mux error", { status: 500 });
  }
}
