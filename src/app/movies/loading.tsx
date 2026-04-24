export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="w-24 h-8 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
            <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </nav>
      <main className="pt-20 px-4 md:px-8 pb-12">
        <div className="mb-8">
          <div className="h-12 w-32 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-6 w-64 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}