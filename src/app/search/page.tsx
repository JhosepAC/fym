"use client";

import { useSearch } from "@/hooks/useSearch";
import MovieCard from "@/components/MovieCard";
import SearchSkeleton from "@/components/SearchSkeleton";
import Navbar from "@/components/Navbar";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();
  const { query, setQuery, results, loading, error, clearSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [setQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    const newUrl = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    window.history.pushState({}, "", newUrl);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <Navbar onSearch={handleSearch} initialQuery={query} />

      <main className="pt-24 px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {query ? (
              <>
                Search results for <span className="text-red-500">&quot;{query}&quot;</span>
              </>
            ) : (
              "Search Movies & TV Shows"
            )}
          </h1>
          {query && !loading && (
            <p className="text-gray-400">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => handleSearch(query)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && <SearchSkeleton />}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
            ))}
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No results found</p>
            <p className="text-gray-500 text-sm mt-2">Try different keywords</p>
          </div>
        )}

        {!loading && !error && !query && (
          <div className="text-center py-12">
            <svg
              className="w-20 h-20 mx-auto text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <p className="text-gray-400 text-lg mb-2">Start typing to search</p>
            <p className="text-gray-500 text-sm">Search for movies, TV shows, and more</p>
          </div>
        )}
      </main>
    </div>
  );
}
