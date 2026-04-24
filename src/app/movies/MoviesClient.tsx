"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import MovieFilters, { FilterState } from "@/components/MovieFilters";
import MovieGrid from "@/components/MovieGrid";
import { MovieCard } from "@/components/MovieGrid";
import { apiClient } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";

interface ApiResponse {
  results: MediaItem[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface MoviesClientProps {
  initialData: {
    trending: ApiResponse;
    popular: ApiResponse;
    topRated: ApiResponse;
    upcoming: ApiResponse;
  };
  allMovies: MediaItem[];
}

export default function MoviesClient({ initialData, allMovies }: MoviesClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: null,
    year: "",
    minRating: 0,
    sortBy: "popularity.desc",
  });

  const [displayedMovies, setDisplayedMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 30;
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const filteredAllMovies = useMemo(() => {
    let items = [...allMovies];

    if (filters.genre) {
      items = items.filter(item => item.genre_ids?.includes(filters.genre!));
    }
    if (filters.year) {
      items = items.filter(item => {
        const itemYear = item.release_date?.split("-")[0];
        return itemYear === filters.year;
      });
    }
    if (filters.minRating > 0) {
      items = items.filter(item => (item.vote_average || 0) >= filters.minRating);
    }

    items.sort((a, b) => {
      switch (filters.sortBy) {
        case "popularity.desc": return (b.popularity || 0) - (a.popularity || 0);
        case "popularity.asc": return (a.popularity || 0) - (b.popularity || 0);
        case "vote_average.desc": return (b.vote_average || 0) - (a.vote_average || 0);
        case "vote_average.asc": return (a.vote_average || 0) - (b.vote_average || 0);
        case "primary_release_date.desc": return new Date(b.release_date || "").getTime() - new Date(a.release_date || "").getTime();
        case "primary_release_date.asc": return new Date(a.release_date || "").getTime() - new Date(b.release_date || "").getTime();
        default: return 0;
      }
    });

    return items;
  }, [allMovies, filters]);

  const fetchDiscoverMovies = useCallback(async (page: number) => {
    if (!filters.genre) return null;
    
    setLoading(true);
    try {
      let endpoint = `/discover/movie?with_genres=${filters.genre}&page=${page}&sort_by=${filters.sortBy}`;
      
      if (filters.year) {
        endpoint += `&primary_release_year=${filters.year}`;
      }
      if (filters.minRating > 0) {
        endpoint += `&vote_average.gte=${filters.minRating}`;
      }
      
      const response = await apiClient.fetch<ApiResponse>(endpoint);
      setCurrentPage(page);
      setTotalResults(response.total_results || 0);
      
      if (page === 1) {
        setDisplayedMovies(response.results);
      } else {
        setDisplayedMovies(prev => [...prev, ...response.results]);
      }
      
      setHasMore(page < response.total_pages);
      return response.results.length;
    } catch (error) {
      console.error("Error fetching discover movies:", error);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [filters.genre, filters.sortBy, filters.year, filters.minRating]);

  useEffect(() => {
    if (filters.genre) {
      setCollapsedSections({
        "Trending This Week": true,
        "Popular": true,
        "Top Rated": true,
        "Coming Soon": true,
      });
    } else {
      setCollapsedSections({});
    }
  }, [filters.genre]);

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  useEffect(() => {
    if (filters.genre) {
      setDisplayedMovies([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchDiscoverMovies(1);
    } else {
      setDisplayedMovies(filteredAllMovies.slice(0, ITEMS_PER_PAGE));
      setTotalResults(filteredAllMovies.length);
      setHasMore(filteredAllMovies.length > ITEMS_PER_PAGE);
    }
  }, [filters.genre, filters.year, filters.minRating, filters.sortBy]);

  useEffect(() => {
    if (!filters.genre && !loading && filteredAllMovies.length > 0) {
      const currentLength = displayedMovies.length;
      const remaining = filteredAllMovies.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      if (remaining.length > 0) {
        setDisplayedMovies(prev => [...prev, ...remaining]);
        setHasMore(currentLength + remaining.length < filteredAllMovies.length);
      }
    }
  }, [filteredAllMovies, filters.genre, loading]);

  useEffect(() => {
    if (!filters.genre) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchDiscoverMovies(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [currentPage, hasMore, loading, filters.genre, fetchDiscoverMovies]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.genre || filters.year || filters.minRating > 0;
  const totalCount = filters.genre ? totalResults : filteredAllMovies.length;

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
              <MovieFilters onFilterChange={handleFilterChange} mediaType="movie" />
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
          collapsedSections={collapsedSections}
          onToggleSection={toggleSection}
        />

        {hasActiveFilters && displayedMovies.length > 0 && (
          <section className="mt-12 relative">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filters.genre ? "Discover Movies" : "All Movies"} ({totalCount})
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayedMovies.map((item, index) => (
                <MovieCard key={`${item.id}-${item.media_type || 'movie'}-${index}`} item={item} />
              ))}
            </div>

            <div ref={loaderRef} className="h-20 flex items-center justify-center">
              {loading && (
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              )}
              {!hasMore && displayedMovies.length > 0 && (
                <p className="text-gray-500">No more movies to load</p>
              )}
            </div>
          </section>
        )}

        {hasActiveFilters && displayedMovies.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}