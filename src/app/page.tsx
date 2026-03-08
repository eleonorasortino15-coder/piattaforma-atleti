import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    // Utente loggato: controlla se ha già fatto l'onboarding
    const user = await db.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      redirect("/onboarding");
    }

    if (user.role === "ATHLETE") {
      redirect("/dashboard/athlete");
    } else {
      redirect("/dashboard/user");
    }
  }

  // Utente non loggato: mostra landing page
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b">
        <span className="text-xl font-bold text-gray-900">⚡ AthletePro</span>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Learn from the world&apos;s best athletes
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Access exclusive training courses, videos and lessons from professional WAKO athletes. Train smarter, compete better.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
          >
            Start for free
          </Link>
          <Link
            href="/athletes"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-50 transition"
          >
            Explore athletes
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-gray-900 mb-2">Pro Athletes</h3>
            <p className="text-gray-500 text-sm">Learn directly from world-class WAKO champions and professional coaches.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-3xl mb-3">🎥</div>
            <h3 className="font-bold text-gray-900 mb-2">Video Courses</h3>
            <p className="text-gray-500 text-sm">High quality training videos you can watch anytime, anywhere, at your own pace.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-bold text-gray-900 mb-2">Buy or Subscribe</h3>
            <p className="text-gray-500 text-sm">Purchase individual courses or subscribe to your favorite athlete&apos;s channel.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
