"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      const course = await res.json();
      router.push(`/dashboard/athlete/courses/${course.id}`);
    } else {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <Link href="/dashboard/athlete" className="text-sm text-gray-400 hover:text-white transition">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-6 pt-12">
        <h1 className="text-2xl font-bold text-white mb-2">Create a new course</h1>
        <p className="text-gray-400 mb-8">
          Give your course a title. You can add more details after creation.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-white/10 p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Course title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Advanced Kickboxing Techniques"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create course"}
            </button>
            <Link
              href="/dashboard/athlete"
              className="px-6 py-2.5 rounded-lg font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
