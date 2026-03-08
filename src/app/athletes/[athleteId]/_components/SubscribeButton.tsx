"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  athleteId: string;
  price: number;
  isLoggedIn: boolean;
  alreadySubscribed: boolean;
}

export default function SubscribeButton({ athleteId, price, isLoggedIn, alreadySubscribed }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (alreadySubscribed) {
    return (
      <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-lg text-sm font-semibold">
        ✓ Subscribed
      </span>
    );
  }

  async function handleSubscribe() {
    if (!isLoggedIn) {
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId }),
    });

    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
    >
      {loading ? "Loading..." : `Subscribe €${price}/mo`}
    </button>
  );
}
