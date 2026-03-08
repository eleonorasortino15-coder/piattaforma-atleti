"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<"ATHLETE" | "USER" | null>(null);

  async function handleSelect(role: "ATHLETE" | "USER") {
    setSelected(role);
    setLoading(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      if (role === "ATHLETE") {
        router.push("/dashboard/athlete");
      } else {
        router.push("/dashboard/user");
      }
    } else {
      setLoading(false);
      setSelected(null);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to Athlete Platform
          </h1>
          <p className="text-gray-500 text-lg">
            How do you want to use the platform?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Atleta */}
          <button
            onClick={() => handleSelect("ATHLETE")}
            disabled={loading}
            className={`bg-white rounded-2xl p-8 border-2 text-left transition-all shadow-sm hover:shadow-md
              ${selected === "ATHLETE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"}
              ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              I&apos;m an Athlete
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Create and publish training courses, videos and lessons. Build your audience and earn money from your content.
            </p>
            <div className="mt-6 text-blue-600 font-semibold text-sm">
              Publish content →
            </div>
          </button>

          {/* Card Utente */}
          <button
            onClick={() => handleSelect("USER")}
            disabled={loading}
            className={`bg-white rounded-2xl p-8 border-2 text-left transition-all shadow-sm hover:shadow-md
              ${selected === "USER" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-400"}
              ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-4xl mb-4">💪</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              I&apos;m a Fan / Athlete
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Discover and purchase training courses from professional athletes. Learn from the best in your sport.
            </p>
            <div className="mt-6 text-green-600 font-semibold text-sm">
              Explore courses →
            </div>
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-400 mt-8 text-sm">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
