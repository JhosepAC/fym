"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import MovieFilters, { FilterState } from "@/components/MovieFilters";
import MovieGrid from "@/components/MovieGrid";
import { MediaItem } from "@/lib/api/client";

interface ApiResponse {
  results: MediaItem[];
}

interface MoviesClientProps {
  initialData: {
    trending: ApiResponse;
    popular: ApiResponse;
    topRated: ApiResponse;
    upcoming: ApiResponse;
  };
}

export default function MoviesClient({ initialData }: MoviesClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: null,
    year: "",
    minRating: 0,
    sortBy: "popularity.desc",
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar />
      
      <main className="pt-20 px-4 md:px-8 pb-12">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Movies</h1>
              <p className="text-gray-400 text-lg">
                Discover the latest films, from action blockbusters to indie gems.
              </p>
            </div>
            <div className="flex-shrink-0">
              <MovieFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
        </header>

        <MovieGrid 
          categories={[
            { title: "Trending This Week", items: initialData.trending.results },
            { title: "Popular", items: initialData.popular.results },
            { title: "Top Rated", items: initialData.topRated.results },
            { title: "Coming Soon", items: initialData.upcoming.results },
          ]}
          filters={filters}
        />
      </main>
    </div>
  );
}