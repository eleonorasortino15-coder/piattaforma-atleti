import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function UserDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      purchases: {
        include: {
          course: {
            include: { athlete: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!user) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          <span className="text-blue-400">⚡</span> AthletePro
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/athletes" className="text-sm text-gray-400 hover:text-white transition">
            Explore athletes
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
          <Link href="/dashboard/profile" className="text-sm text-blue-400 hover:text-blue-300 transition">
            Edit profile →
          </Link>
        </div>
        <p className="text-gray-500 mb-8">Continue your training or explore new courses.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Courses Purchased</p>
            <p className="text-3xl font-bold text-white mt-1">{user.purchases.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Subscriptions</p>
            <p className="text-3xl font-bold text-white mt-1">0</p>
          </div>
        </div>

        {user.purchases.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-white/10 p-8 text-center">
            <p className="text-gray-500 mb-4">You have not purchased any courses yet.</p>
            <Link href="/athletes" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-500 transition">
              Explore athletes
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-white/10">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="font-semibold text-white">My Courses</h3>
            </div>
            <div className="divide-y divide-white/10">
              {user.purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{purchase.course.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {purchase.course.athlete.name ?? "Athlete"}
                    </p>
                  </div>
                  <Link
                    href={`/courses/${purchase.courseId}`}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition"
                  >
                    Watch →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
