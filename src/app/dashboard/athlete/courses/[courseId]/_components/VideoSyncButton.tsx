"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoSyncButton({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");

  async function handleSync() {
    setLoading(true);
    const res = await fetch(`/api/videos/${videoId}/sync`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
    } else if (data.status === "processing") {
      setStatus("processing");
    } else {
      setStatus("ready");
      router.refresh();
    }
    setLoading(false);
  }

  if (status === "processing") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Still processing...</span>;
  }

  if (status === "error") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Error</span>;
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50"
    >
      {loading ? "Syncing..." : "Sync"}
    </button>
  );
}
