"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
      <div className="text-6xl mb-6">💥</div>
      <h1 className="text-2xl font-bold text-white mb-2">
        Something went wrong!
      </h1>
      <p className="text-[#9B9B9B] mb-6 text-center max-w-md">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-[#FF007A] hover:bg-[#FF007A]/90 text-white rounded-2xl font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
