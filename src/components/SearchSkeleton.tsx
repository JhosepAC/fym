"use client";

export default function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
        >
          <div className="bg-gray-800 rounded-md aspect-[2/3] mb-2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
          </div>
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-1 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
          </div>
          <div className="h-3 bg-gray-800 rounded w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
