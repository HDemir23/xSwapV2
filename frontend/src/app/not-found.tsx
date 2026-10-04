import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | xSwap",
};

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-[#9B9B9B] mb-6 text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/"
        className="px-6 py-2.5 bg-[#FF007A] hover:bg-[#FF007A]/90 text-white rounded-2xl font-medium transition-colors"
      >
        Go Home
      </a>
    </div>
  );
}
