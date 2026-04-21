"use client";

import { useState } from "react";

export interface FilterState {
  genre: number | null;
  year: string;
  minRating: number;
  sortBy: string;
}

interface MovieFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "popularity.asc", label: "Least Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "vote_average.asc", label: "Lowest Rated" },
  { value: "primary_release_date.desc", label: "Newest First" },
  { value: "primary_release_date.asc", label: "Oldest First" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

const RATINGS = [9, 8, 7, 6, 5];

export default function MovieFilters({ onFilterChange }: MovieFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    genre: null,
    year: "",
    minRating: 0,
    sortBy: "popularity.desc",
  });

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      genre: null,
      year: "",
      minRating: 0,
      sortBy: "popularity.desc",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.genre || filters.year || filters.minRating > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
          hasActiveFilters
            ? "bg-red-600/20 border-red-500 text-red-500"
            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-40 animate-fade-in">
          <div className="p-4 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: "1rem",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#1a1a1b]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Genre
              </label>
              <div className="relative">
                <select
                  value={filters.genre || ""}
                  onChange={(e) =>
                    updateFilter("genre", e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: "1rem",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                  }}
                >
                  <option value="" className="bg-[#1a1a1b]">
                    All Genres
                  </option>
                  {GENRES.map((genre) => (
                    <option key={genre.id} value={genre.id} className="bg-[#1a1a1b]">
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Release Year
              </label>
              <div className="relative">
                <select
                  value={filters.year}
                  onChange={(e) => updateFilter("year", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: "1rem",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                  }}
                >
                  <option value="" className="bg-[#1a1a1b]">
                    All Years
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year} className="bg-[#1a1a1b]">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Minimum Rating
              </label>
              <div className="flex flex-wrap gap-2">
                {RATINGS.map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      updateFilter(
                        "minRating",
                        filters.minRating === rating ? 0 : rating
                      )
                    }
                    className={`flex-1 min-w-[3rem] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filters.minRating === rating
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {rating}+
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-lg"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}