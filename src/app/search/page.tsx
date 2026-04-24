"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";

type MediaType = "all" | "movie" | "tv";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=057a69a9b8b39aa9ab75e749e7113b80&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        setError("Failed to fetch results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value) {
      router.push(`/search?q=${encodeURIComponent(value)}`, { scroll: false });
    } else {
      router.push("/search", { scroll: false });
    }
  };

  const filteredResults = results.filter((item) => {
    if (!item.poster_path && !item.backdrop_path) return false;
    if (mediaType === "all") return item.media_type === "movie" || item.media_type === "tv";
    return item.media_type === mediaType;
  });

  const handleCardClick = (item: MediaItem) => {
    const type = item.media_type === "tv" ? "series" : "movie";
    router.push(`/${type}/${item.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    const type = item.media_type === "tv" ? "series" : "movie";
    router.push(`/${type}/${item.id}?play=true`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar onSearch={handleSearch} initialQuery={query} />

      <main className="pt-24 px-4 md:px-8 pb-12">
        {query && filteredResults.length > 0 && (
          <div className="relative h-48 md:h-64 mb-8 rounded-2xl overflow-hidden">
            {filteredResults[0].backdrop_path && (
              <Image
                src={getImageUrl(filteredResults[0].backdrop_path, IMAGE_SIZES.backdrop.ultra) || ""}
                alt=""
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                {query ? (
                  <>
                    Search results for <span className="text-red-500">&quot;{query}&quot;</span>
                  </>
                ) : (
                  "Search Movies & TV Shows"
                )}
              </h1>
              <p className="text-gray-400 text-lg">
                Found {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMediaType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mediaType === "all"
                ? "bg-red-600 text-white"
                : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMediaType("movie")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mediaType === "movie"
                ? "bg-red-600 text-white"
                : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType("tv")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mediaType === "tv"
                ? "bg-red-600 text-white"
                : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
            }`}
          >
            TV Shows
          </button>
        </div>

        {error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500 text-lg mb-2">{error}</p>
            <button
              onClick={() => handleSearch(query)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-xl bg-gray-800" />
                <div className="h-4 mt-2 rounded bg-gray-800 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredResults.map((item, idx) => (
              <SearchCard
                key={`${item.id}-${item.media_type}-${idx}`}
                item={item}
                onClick={() => handleCardClick(item)}
                onPlayClick={(e) => handlePlayClick(e, item)}
              />
            ))}
          </div>
        )}

        {!loading && !error && query && filteredResults.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-white text-xl font-semibold mb-2">No results found</p>
            <p className="text-gray-500">Try different keywords or check your spelling</p>
          </div>
        )}

        {!loading && !error && !query && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600/20 to-purple-600/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-white text-xl font-semibold mb-2">Start typing to search</p>
            <p className="text-gray-500">Search for movies, TV shows, actors, and more</p>
          </div>
        )}
      </main>
    </div>
  );
}

function SearchCard({
  item,
  onClick,
  onPlayClick,
}: {
  item: MediaItem;
  onClick: () => void;
  onPlayClick: (e: React.MouseEvent) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || item.name || "Untitled";
  const posterUrl = getImageUrl(item.poster_path, IMAGE_SIZES.poster.original);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A";
  const mediaTypeLabel = item.media_type === "tv" ? "TV Series" : "Movie";

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-red-500/20">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-gray-500 text-center px-2">{title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-between px-3 pt-3">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
            {mediaTypeLabel}
          </span>
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs font-bold">{rating}</span>
          </div>
        </div>

        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-end p-4 animate-scale-in">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{title}</h3>
            <p className="text-gray-400 text-xs mb-3">{year} • {mediaTypeLabel}</p>
            <p className="text-gray-300 text-sm line-clamp-3 mb-4">{item.overview || "No description available."}</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg text-sm font-bold hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/40"
                onClick={onClick}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver más
              </button>
              <button
                className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/40 transition-all"
                onClick={onPlayClick}
                title="Reproducir trailer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-xs mt-1">{year}</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0b]">
        <Navbar onSearch={() => {}} initialQuery="" />
        <div className="pt-24 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-48 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}