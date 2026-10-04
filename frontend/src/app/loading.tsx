export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-[#2B2B2B] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#FF007A] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-[#9B9B9B] mt-4">Loading...</p>
    </div>
  );
}
