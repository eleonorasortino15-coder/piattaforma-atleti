"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPriceForm({ subscriptionPrice }: { subscriptionPrice: number | null }) {
  const router = useRouter();
  const [value, setValue] = useState(subscriptionPrice?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionPrice: value ? parseFloat(value) : null }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-1">Channel Subscription</h2>
      <p className="text-sm text-gray-400 mb-4">Set a monthly price for users to subscribe to your channel. Leave empty to disable subscriptions.</p>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm font-medium">€</span>
        <input
          type="number"
          min="1"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 9.99"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500 text-sm">/ month</span>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {saved ? "✓ Saved!" : loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
