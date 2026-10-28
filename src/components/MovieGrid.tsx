"use client";

import { useState } from "react";
import { MediaItem } from "@/lib/api/client";
import { FilterState } from "./MovieFilters";
import MovieCard from "./MovieCard";

interface Category {
  title: string;
  items: MediaItem[];
}

interface MovieGridProps {
  categories: Category[];
  filters?: FilterState;
  collapsedSections?: Record<string, boolean>;
  onToggleSection?: (title: string) => void;
}

export default function MovieGrid({
  categories,
  filters,
  collapsedSections = {},
  onToggleSection,
}: MovieGridProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<
    Record<string, boolean>
  >({});

  const isCollapsed = (title: string) => {
    if (collapsedSections && title in collapsedSections) {
      return collapsedSections[title];
    }
    return internalCollapsed[title] || false;
  };

  const toggleSection = (title: string) => {
    if (onToggleSection) {
      onToggleSection(title);
    } else {
      setInternalCollapsed((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    }
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: filterItems(category.items, filters),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="space-y-12">
      {filteredCategories.map((category) => (
        <section key={category.title} className="relative">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => toggleSection(category.title)}
              aria-label={`Toggle section ${category.title}`}
              className="w-8 h-8 flex items-center justify-center bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed(category.title) ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white">{category.title}</h2>
            <span className="text-gray-500 text-sm">
              ({category.items.length})
            </span>

            <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent" />
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed(category.title) ? "max-h-0 opacity-0" : "max-h-[9999px] opacity-100"}`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {category.items.map((item, idx) => (
                <MovieCard
                  key={`${category.title}-${item.id}-${idx}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function filterItems(items: MediaItem[], filters?: FilterState): MediaItem[] {
  if (!filters) return items;

  return items.filter((item) => {
    if (filters.genre && !item.genre_ids?.includes(filters.genre)) {
      return false;
    }
    if (filters.year) {
      const itemYear =
        item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];
      if (itemYear !== filters.year) return false;
    }
    if (filters.minRating > 0 && (item.vote_average || 0) < filters.minRating) {
      return false;
    }
    return true;
  });
}

// Re-export MovieCard for existing consumers
export { MovieCard };
