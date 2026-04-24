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

interface SeriesClientProps {
  initialData: {
    trending: ApiResponse;
    popular: ApiResponse;
    topRated: ApiResponse;
    onTheAir: ApiResponse;
  };
  popularSeries: MediaItem[];
}

export default function SeriesClient({ initialData, popularSeries }: SeriesClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: null,
    year: "",
    minRating: 0,
    sortBy: "popularity.desc",
  });

  const [displayedSeries, setDisplayedSeries] = useState<MediaItem[]>(popularSeries);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 30;
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [allSeries, setAllSeries] = useState<MediaItem[]>(popularSeries);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  const filteredAllSeries = useMemo(() => {
    let items = [...allSeries];

    if (filters.genre) {
      items = items.filter(item => item.genre_ids?.includes(filters.genre!));
    }
    if (filters.year) {
      items = items.filter(item => {
        const itemYear = item.first_air_date?.split("-")[0];
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
        case "primary_release_date.desc": return new Date(b.first_air_date || "").getTime() - new Date(a.first_air_date || "").getTime();
        case "primary_release_date.asc": return new Date(a.first_air_date || "").getTime() - new Date(b.first_air_date || "").getTime();
        default: return 0;
      }
    });

    return items;
  }, [allSeries, filters]);

  const loadMoreSeries = useCallback(async (page: number) => {
    if (!hasLoadedAll) {
      setLoading(true);
      try {
        const [popular, topRated, onTheAir] = await Promise.all([
          apiClient.getTvPopular(page),
          apiClient.getTvTopRated(page),
          apiClient.getTvOnTheAir(page),
        ]);
        
        const newSeries = [...popular.results, ...topRated.results, ...onTheAir.results];
        setAllSeries(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNew = newSeries.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
        });
        
        if (page >= 5) {
          setHasLoadedAll(true);
        }
      } catch (error) {
        console.error("Error loading more series:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [hasLoadedAll]);

  const fetchDiscoverSeries = useCallback(async (page: number) => {
    if (!filters.genre) return null;
    
    setLoading(true);
    try {
      let endpoint = `/discover/tv?with_genres=${filters.genre}&page=${page}&sort_by=${filters.sortBy}`;
      
      if (filters.year) {
        endpoint += `&first_air_date_year=${filters.year}`;
      }
      if (filters.minRating > 0) {
        endpoint += `&vote_average.gte=${filters.minRating}`;
      }
      
      const response = await apiClient.fetch<ApiResponse>(endpoint);
      setCurrentPage(page);
      setTotalResults(response.total_results || 0);
      
      if (page === 1) {
        setDisplayedSeries(response.results);
      } else {
        setDisplayedSeries(prev => [...prev, ...response.results]);
      }
      
      setHasMore(page < response.total_pages);
      return response.results.length;
    } catch (error) {
      console.error("Error fetching discover series:", error);
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
        "On TV Now": true,
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
      setDisplayedSeries([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchDiscoverSeries(1);
    } else {
      setDisplayedSeries(filteredAllSeries.slice(0, ITEMS_PER_PAGE));
      setTotalResults(filteredAllSeries.length);
      setHasMore(filteredAllSeries.length > ITEMS_PER_PAGE);
    }
  }, [filters.genre, filters.year, filters.minRating, filters.sortBy]);

  useEffect(() => {
    if (!filters.genre && !loading && filteredAllSeries.length > 0) {
      const currentLength = displayedSeries.length;
      const remaining = filteredAllSeries.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      if (remaining.length > 0) {
        setDisplayedSeries(prev => [...prev, ...remaining]);
        setHasMore(currentLength + remaining.length < filteredAllSeries.length);
      }
    }
  }, [filteredAllSeries, filters.genre, loading]);

  useEffect(() => {
    if (filters.genre || hasLoadedAll) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreSeries(currentPage + 1);
          setCurrentPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [currentPage, hasMore, loading, filters.genre, hasLoadedAll, loadMoreSeries]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.genre || filters.year || filters.minRating > 0;
  const totalCount = filters.genre ? totalResults : filteredAllSeries.length;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar />
      
      <main className="pt-20 px-4 md:px-8 pb-12">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Series</h1>
              <p className="text-gray-400 text-lg">
                Discover the best TV shows, from popular hits to critically acclaimed.
              </p>
            </div>
            <div className="flex-shrink-0">
              <MovieFilters onFilterChange={handleFilterChange} mediaType="tv" />
            </div>
          </div>
        </header>

        <MovieGrid 
          categories={[
            { title: "Trending This Week", items: initialData.trending.results },
            { title: "Popular", items: initialData.popular.results },
            { title: "Top Rated", items: initialData.topRated.results },
            { title: "On TV Now", items: initialData.onTheAir.results },
          ]}
          filters={filters}
          collapsedSections={collapsedSections}
          onToggleSection={toggleSection}
        />

        {hasActiveFilters && displayedSeries.length > 0 && (
          <section className="mt-12 relative">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filters.genre ? "Discover Series" : "All Series"} ({totalCount})
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayedSeries.map((item, index) => (
                <MovieCard key={`${item.id}-${item.media_type || 'tv'}-${index}`} item={item} />
              ))}
            </div>

            <div ref={loaderRef} className="h-20 flex items-center justify-center">
              {loading && (
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              )}
              {!hasMore && displayedSeries.length > 0 && (
                <p className="text-gray-500">No more series to load</p>
              )}
            </div>
          </section>
        )}

        {hasActiveFilters && displayedSeries.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No series found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}