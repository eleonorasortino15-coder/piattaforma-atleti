"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string | null; imageUrl: string | null };
}

interface Props {
  postId: string;
  initialComments: Comment[];
  isLoggedIn: boolean;
}

export default function CommentSection({ postId, initialComments, isLoggedIn }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setText("");
    }
    setLoading(false);
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        💬 {comments.length} comment{comments.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Form commento */}
          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!text.trim() || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "..." : "Post"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-400">
              <Link href="/sign-in" className="text-blue-600 hover:underline">Sign in</Link> to comment
            </p>
          )}

          {/* Lista commenti */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 items-start">
              {comment.user.imageUrl ? (
                <Image
                  src={comment.user.imageUrl}
                  alt={comment.user.name ?? "User"}
                  width={28}
                  height={28}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {comment.user.name?.[0] ?? "U"}
                </div>
              )}
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-700">{comment.user.name ?? "User"}</p>
                <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
