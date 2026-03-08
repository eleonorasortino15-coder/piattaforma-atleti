import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CommentSection from "./_components/CommentSection";
import BuyButton from "./_components/BuyButton";
import SubscribeButton from "./_components/SubscribeButton";

interface Props {
  params: Promise<{ athleteId: string }>;
}

export default async function AthleteProfilePage({ params }: Props) {
  const { athleteId } = await params;
  const { userId } = await auth();

  const [athlete, currentUser] = await Promise.all([
    db.user.findUnique({
      where: { id: athleteId, role: "ATHLETE" },
      include: {
        courses: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
        posts: {
          where: { isPublished: true },
          orderBy: { createdAt: "desc" },
          include: {
            comments: {
              orderBy: { createdAt: "desc" },
              include: { user: { select: { name: true, imageUrl: true } } },
            },
          },
        },
      },
    }),
    userId
      ? db.user.findUnique({
          where: { clerkId: userId },
          include: { purchases: true, subscriptions: true },
        })
      : null,
  ]);

  if (!athlete) notFound();

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

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Profilo */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-6">
            {athlete.imageUrl ? (
              <Image src={athlete.imageUrl} alt={athlete.name ?? "Athlete"} width={96} height={96} className="rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                {athlete.name?.[0] ?? "A"}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{athlete.name ?? "Athlete"}</h1>
              <p className="text-blue-600 text-sm font-medium mt-0.5">WAKO Athlete</p>
              {athlete.bio && <p className="text-gray-600 mt-3 text-sm leading-relaxed">{athlete.bio}</p>}
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span><strong className="text-gray-900">{athlete.courses.length}</strong> courses</span>
                <span><strong className="text-gray-900">{athlete.posts.length}</strong> posts</span>
              </div>
              {athlete.subscriptionPrice && currentUser?.id !== athleteId && (
                <div className="mt-4">
                  <SubscribeButton
                    athleteId={athleteId}
                    price={athlete.subscriptionPrice}
                    isLoggedIn={!!currentUser}
                    alreadySubscribed={!!currentUser?.subscriptions?.some(s => s.athleteId === athleteId)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Corsi */}
        {athlete.courses.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {athlete.courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  {course.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {course.price ? `€${course.price}` : "Free"}
                    </span>
                    <BuyButton
                      courseId={course.id}
                      price={course.price ?? 0}
                      isLoggedIn={!!currentUser}
                      alreadyPurchased={
                        !!currentUser?.purchases?.some(p => p.courseId === course.id) ||
                        !!currentUser?.subscriptions?.some(s => s.athleteId === athleteId)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Post con commenti */}
        {athlete.posts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Updates</h2>
            <div className="space-y-4">
              {athlete.posts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-full h-56 object-cover rounded-lg mb-4" />
                  )}
                  <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <CommentSection
                    postId={post.id}
                    initialComments={post.comments}
                    isLoggedIn={!!currentUser}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {athlete.courses.length === 0 && athlete.posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No content published yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
