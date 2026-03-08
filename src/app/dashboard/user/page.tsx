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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">⚡ AthletePro</Link>
        <div className="flex items-center gap-4">
          <Link href="/athletes" className="text-sm text-blue-600 hover:underline">
            Explore athletes
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
        <p className="text-gray-500 mb-8">Continue your training or explore new courses.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Courses Purchased</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{user.purchases.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Subscriptions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          </div>
        </div>

        {user.purchases.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <p className="text-gray-400 mb-4">You have not purchased any courses yet.</p>
            <Link href="/athletes" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Explore athletes
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">My Courses</h3>
            </div>
            <div className="divide-y">
              {user.purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{purchase.course.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by {purchase.course.athlete.name ?? "Athlete"}
                    </p>
                  </div>
                  <Link
                    href={`/courses/${purchase.courseId}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
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
