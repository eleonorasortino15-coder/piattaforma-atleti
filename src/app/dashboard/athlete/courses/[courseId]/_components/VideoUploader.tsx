"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VideoUploader({ courseId }: { courseId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "uploading" | "done">("form");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!title.trim() || !file) return;
    setStep("uploading");
    setError("");
    setProgress(0);

    // 1. Chiedi al server il link di upload Mux
    const res = await fetch(`/api/courses/${courseId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      setError("Failed to initialize upload. Please try again.");
      setStep("form");
      return;
    }

    const { uploadUrl } = await res.json();

    // 2. Carica il file direttamente su Mux
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200 || xhr.status === 201) {
        setStep("done");
        setTimeout(() => {
          router.refresh();
          setStep("form");
          setTitle("");
          setFile(null);
          setProgress(0);
        }, 2000);
      } else {
        setError("Upload failed. Please try again.");
        setStep("form");
      }
    });

    xhr.addEventListener("error", () => {
      setError("Upload failed. Please try again.");
      setStep("form");
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  }

  if (step === "uploading") {
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-700 mb-2">Uploading... {progress}%</p>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm font-medium text-green-700">✓ Video uploaded successfully!</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Video title"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
      >
        {file ? (
          <p className="text-sm text-gray-700 font-medium">📹 {file.name}</p>
        ) : (
          <>
            <p className="text-sm text-gray-500">Click to select a video file</p>
            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI — max 2GB</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!title.trim() || !file}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Upload Video
      </button>
    </div>
  );
}
