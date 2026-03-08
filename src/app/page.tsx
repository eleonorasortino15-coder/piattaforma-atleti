import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) redirect("/onboarding");
    if (user.role === "ATHLETE") redirect("/dashboard/athlete");
    else redirect("/dashboard/user");
  }

  const featuredAthletes = await db.user.findMany({
    where: { role: "ATHLETE" },
    select: { id: true, name: true, imageUrl: true, bio: true, _count: { select: { courses: true } } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight text-white">
          <span className="text-blue-400">⚡</span> AthletePro
        </span>
        <div className="flex gap-4 items-center">
          <Link href="/sign-in" className="text-gray-300 hover:text-white font-medium px-4 py-2 transition">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-500 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-black to-black pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-blue-400 font-semibold tracking-widest uppercase text-sm mb-4">
            WAKO World Champions
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Learn from the Best.
            <br />
            <span className="text-blue-400">Unlock Elite Training.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Access exclusive video courses from professional WAKO athletes. Train smarter, compete better — on your schedule.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-500 transition"
            >
              Start for free
            </Link>
            <Link
              href="/athletes"
              className="border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/10 transition"
            >
              Explore athletes
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Athletes */}
      {featuredAthletes.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-white mb-2">Featured Athletes</h2>
          <p className="text-gray-500 mb-10">Train with world-class champions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAthletes.map((athlete) => (
              <Link key={athlete.id} href={`/athletes/${athlete.id}`}
                className="group bg-gray-900 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition">
                <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden">
                  {athlete.imageUrl ? (
                    <img src={athlete.imageUrl} alt={athlete.name ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400">
                      {athlete.name?.[0] ?? "A"}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-bold text-white text-lg">{athlete.name ?? "Athlete"}</p>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{athlete.bio ?? "Professional WAKO athlete"}</p>
                  <p className="text-blue-400 text-sm font-medium mt-3">{athlete._count.courses} course{athlete._count.courses !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-gray-900 border border-white/10">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="font-bold text-white text-lg mb-2">Pro Athletes</h3>
            <p className="text-gray-500 text-sm">Learn directly from world-class WAKO champions and professional coaches.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900 border border-white/10">
            <div className="text-3xl mb-4">🎥</div>
            <h3 className="font-bold text-white text-lg mb-2">Video Courses</h3>
            <p className="text-gray-500 text-sm">High quality training videos you can watch anytime, anywhere, at your own pace.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900 border border-white/10">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="font-bold text-white text-lg mb-2">Buy or Subscribe</h3>
            <p className="text-gray-500 text-sm">Purchase individual courses or subscribe to your favorite athlete's full channel.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} AthletePro. All rights reserved.
      </footer>
    </div>
  );
}
