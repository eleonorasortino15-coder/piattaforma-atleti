"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BioForm({ bio }: { bio: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(bio ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: value }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-1">Your Bio</h2>
      <p className="text-sm text-gray-400 mb-4">This appears on your public profile page</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder="Tell your audience who you are, your achievements, your sport..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {saved ? "✓ Saved!" : loading ? "Saving..." : "Save bio"}
      </button>
    </div>
  );
}
