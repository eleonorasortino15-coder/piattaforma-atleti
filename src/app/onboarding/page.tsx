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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <p className="text-blue-400 font-semibold tracking-widest uppercase text-sm mb-3">Welcome</p>
          <h1 className="text-3xl font-bold text-white mb-3">
            How do you want to use AthletePro?
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Atleta */}
          <button
            onClick={() => handleSelect("ATHLETE")}
            disabled={loading}
            className={`bg-gray-900 rounded-2xl p-8 border-2 text-left transition-all
              ${selected === "ATHLETE" ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-blue-500/50"}
              ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-white mb-2">
              I&apos;m an Athlete
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Create and publish training courses, videos and lessons. Build your audience and earn money from your content.
            </p>
            <div className="mt-6 text-blue-400 font-semibold text-sm">
              Publish content →
            </div>
          </button>

          {/* Card Utente */}
          <button
            onClick={() => handleSelect("USER")}
            disabled={loading}
            className={`bg-gray-900 rounded-2xl p-8 border-2 text-left transition-all
              ${selected === "USER" ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-blue-500/50"}
              ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-4xl mb-4">💪</div>
            <h2 className="text-xl font-bold text-white mb-2">
              I&apos;m a Fan / Athlete
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover and purchase training courses from professional athletes. Learn from the best in your sport.
            </p>
            <div className="mt-6 text-blue-400 font-semibold text-sm">
              Explore courses →
            </div>
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-500 mt-8 text-sm">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
