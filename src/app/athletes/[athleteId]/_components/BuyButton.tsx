"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  courseId: string;
  price: number;
  isLoggedIn: boolean;
  alreadyPurchased: boolean;
}

export default function BuyButton({ courseId, price, isLoggedIn, alreadyPurchased }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (alreadyPurchased) {
    return (
      <button
        onClick={() => router.push("/dashboard/user")}
        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
      >
        ✓ Go to course
      </button>
    );
  }

  async function handleBuy() {
    if (!isLoggedIn) {
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
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
      onClick={handleBuy}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Loading..." : price ? `Buy €${price}` : "Get free"}
    </button>
  );
}
