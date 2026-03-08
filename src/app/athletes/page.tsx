import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function ExploreAthletesPage() {
  const { userId } = await auth();
  const currentUser = userId
    ? await db.user.findUnique({ where: { clerkId: userId } })
    : null;

  const athletes = await db.user.findMany({
    where: { role: "ATHLETE" },
    include: {
      courses: { where: { isPublished: true } },
      posts: { where: { isPublished: true } },
      _count: { select: { subscribers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">⚡ AthletePro</Link>
        <div className="flex gap-3">
          {currentUser ? (
            <Link
              href={currentUser.role === "ATHLETE" ? "/dashboard/athlete" : "/dashboard/user"}
              className="text-sm text-blue-600 hover:underline px-4 py-2"
            >
              My Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">Sign in</Link>
              <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Athletes</h1>
          <p className="text-gray-500 mt-2">
            Discover world-class WAKO athletes and access their exclusive training content.
          </p>
        </div>

        {athletes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No athletes yet. Be the first to join!</p>
            <Link href="/sign-up" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
              Join as Athlete
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/athletes/${athlete.id}`}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-6 flex flex-col"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  {athlete.imageUrl ? (
                    <Image
                      src={athlete.imageUrl}
                      alt={athlete.name ?? "Athlete"}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                      {athlete.name?.[0] ?? "A"}
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-gray-900">{athlete.name ?? "Athlete"}</h2>
                    <p className="text-xs text-blue-600 font-medium">WAKO Athlete</p>
                  </div>
                </div>

                {/* Bio */}
                {athlete.bio && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {athlete.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  <span>
                    <strong className="text-gray-900">{athlete.courses.length}</strong> courses
                  </span>
                  <span>
                    <strong className="text-gray-900">{athlete.posts.length}</strong> posts
                  </span>
                  <span>
                    <strong className="text-gray-900">{athlete._count.subscribers}</strong> subscribers
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
