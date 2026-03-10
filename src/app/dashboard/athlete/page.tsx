import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import BioForm from "./_components/BioForm";
import NewPostForm from "./_components/NewPostForm";
import SubscriptionPriceForm from "./_components/SubscriptionPriceForm";

export default async function AthleteDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      courses: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { purchases: true } } },
      },
      posts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!user) redirect("/onboarding");
  if (user.role !== "ATHLETE") redirect("/dashboard/user");

  const totalStudents = user.courses.reduce((acc: number, c: { _count: { purchases: number } }) => acc + c._count.purchases, 0);

  const recentPurchases = await db.purchase.findMany({
    where: { course: { athleteId: user.id } },
    include: {
      user: { select: { id: true, name: true, imageUrl: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">
          <span className="text-blue-400">⚡</span> AthletePro
        </span>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile" className="text-sm text-gray-400 hover:text-white transition">
            Edit profile
          </Link>
          <Link href={`/athletes/${user.id}`} className="text-sm text-blue-400 hover:text-blue-300 transition">
            View my profile →
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Total Courses</p>
            <p className="text-3xl font-bold text-white mt-1">{user.courses.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Total Students</p>
            <p className="text-3xl font-bold text-white mt-1">{totalStudents}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Total Earnings</p>
            <p className="text-3xl font-bold text-white mt-1">€0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio */}
          <BioForm bio={user.bio} />

          {/* Subscription price */}
          <SubscriptionPriceForm subscriptionPrice={user.subscriptionPrice ?? null} />

          {/* Courses */}
          <div className="bg-gray-900 rounded-xl border border-white/10">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Your Courses</h2>
              <Link
                href="/dashboard/athlete/courses/new"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition"
              >
                + New
              </Link>
            </div>
            {user.courses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">No courses yet.</p>
                <Link href="/dashboard/athlete/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition">
                  Create first course
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {user.courses.map((course) => (
                  <Link key={course.id} href={`/dashboard/athlete/courses/${course.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/5 transition">
                    <div>
                      <p className="font-medium text-white text-sm">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{course._count.purchases} students</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      course.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Students */}
        {recentPurchases.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-white/10">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Recent Students</h2>
            </div>
            <div className="divide-y divide-white/10">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center gap-3 px-6 py-3">
                  {purchase.user.imageUrl ? (
                    <Image
                      src={purchase.user.imageUrl}
                      alt={purchase.user.name ?? "User"}
                      width={36}
                      height={36}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                      {purchase.user.name?.[0] ?? "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{purchase.user.name ?? "User"}</p>
                    <p className="text-xs text-gray-500">{purchase.course.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="bg-gray-900 rounded-xl border border-white/10">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Posts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Share updates with your followers</p>
          </div>
          <div className="p-6">
            <NewPostForm />
            {user.posts.length > 0 && (
              <div className="mt-6 space-y-4">
                {user.posts.map((post) => (
                  <div key={post.id} className="border border-white/10 rounded-xl p-4">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg mb-3" />
                    )}
                    <p className="text-gray-300 text-sm">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(post.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
