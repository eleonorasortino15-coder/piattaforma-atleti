import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import CourseEditForm from "./_components/CourseEditForm";
import VideoUploader from "./_components/VideoUploader";
import VideoSyncButton from "./_components/VideoSyncButton";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ATHLETE") redirect("/dashboard/user");

  const course = await db.course.findUnique({
    where: { id: courseId, athleteId: user.id },
    include: { videos: { orderBy: { position: "asc" } } },
  });

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/athlete" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-900 truncate max-w-xs">{course.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {course.isPublished ? "Published" : "Draft"}
          </span>
          <UserButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Course Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form modifica corso */}
          <CourseEditForm course={course} />

          {/* Sezione video */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Videos</h2>
              <span className="text-sm text-gray-400">{course.videos.length} video(s)</span>
            </div>

            {course.videos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-4">No videos yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {course.videos.map((video, index) => (
                  <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 text-sm w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-900 flex-1 truncate">{video.title}</span>
                    {video.muxPlaybackId ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Ready</span>
                    ) : (
                      <VideoSyncButton videoId={video.id} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <VideoUploader courseId={course.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
