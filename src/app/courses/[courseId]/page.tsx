"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  description: string | null;
  muxPlaybackId: string | null;
  position: number;
  isFree: boolean;
  duration: number | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  videos: Video[];
  athlete: { id: string; name: string | null };
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/watch`)
      .then((res) => {
        if (res.status === 401) { router.push("/sign-in"); return null; }
        if (res.status === 403) { setError("You need to purchase this course to watch it."); return null; }
        if (!res.ok) { setError("Course not found."); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCourse(data);
          const first = data.videos[0] ?? null;
          setSelectedVideo(first);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId, router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <p className="text-white text-lg">{error}</p>
      <Link href="/athletes" className="text-blue-400 hover:underline text-sm">Browse athletes</Link>
    </div>
  );

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard/user" className="text-sm text-gray-400 hover:text-white transition">
          ← My Dashboard
        </Link>
        <span className="font-semibold text-white truncate max-w-xs">{course.title}</span>
        <Link href={`/athletes/${course.athlete.id}`} className="text-sm text-blue-400 hover:underline">
          {course.athlete.name ?? "Athlete"}
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar video list */}
        <aside className="w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto shrink-0">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {course.videos.length} videos
            </p>
          </div>
          <div className="divide-y divide-gray-800">
            {course.videos.map((video, idx) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition ${
                  selectedVideo?.id === video.id ? "bg-gray-800 border-l-2 border-blue-500" : ""
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">#{idx + 1}</p>
                <p className="text-sm font-medium text-white leading-tight">{video.title}</p>
                {video.duration && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                  </p>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Player area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {selectedVideo?.muxPlaybackId ? (
            <>
              <div className="bg-black">
                <MuxPlayer
                  playbackId={selectedVideo.muxPlaybackId}
                  streamType="on-demand"
                  className="w-full"
                  style={{ aspectRatio: "16/9" }}
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{selectedVideo.description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a video to start watching.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
