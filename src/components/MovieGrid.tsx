"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";
import { FilterState } from "./MovieFilters";

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

export default function MovieGrid({ categories, filters, collapsedSections = {}, onToggleSection }: MovieGridProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<Record<string, boolean>>({});

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
      setInternalCollapsed(prev => ({
        ...prev,
        [title]: !prev[title]
      }));
    }
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: filterItems(category.items, filters),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-12">
      {filteredCategories.map((category) => (
        <section key={category.title} className="relative">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => toggleSection(category.title)}
              className="w-8 h-8 flex items-center justify-center bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed(category.title) ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-white">{category.title}</h2>
            <span className="text-gray-500 text-sm">({category.items.length})</span>
            
            <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed(category.title) ? 'max-h-0 opacity-0' : 'max-h-[9999px] opacity-100'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {category.items.map((item, idx) => (
                <MovieCard key={`${category.title}-${item.id}-${idx}`} item={item} />
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
  
  return items.filter(item => {
    if (filters.genre && !item.genre_ids?.includes(filters.genre)) {
      return false;
    }
    if (filters.year) {
      const itemYear = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];
      if (itemYear !== filters.year) return false;
    }
    if (filters.minRating > 0 && (item.vote_average || 0) < filters.minRating) {
      return false;
    }
    return true;
  });
}

function MovieCard({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || item.name || "Untitled";
  const posterUrl = getImageUrl(item.poster_path, IMAGE_SIZES.poster.original);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A";
  const mediaType = item.media_type === "tv" || item.first_air_date ? "TV Series" : "Movie";
  const overview = item.overview || "No description available.";

  const handleClick = () => {
    const type = item.media_type === "tv" || item.first_air_date ? "series" : "movie";
    router.push(`/${type}/${item.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = item.media_type === "tv" || item.first_air_date ? "series" : "movie";
    router.push(`/${type}/${item.id}?play=true`);
  };

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-red-500/20">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
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
            {mediaType}
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
            <p className="text-gray-400 text-xs mb-3">{year} • {mediaType}</p>
            <p className="text-gray-300 text-sm line-clamp-3 mb-4">{overview}</p>
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg text-sm font-bold hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/40"
                onClick={handleClick}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver más
              </button>
              <button 
                className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/40 transition-all"
                onClick={handlePlayClick}
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

export { MovieCard };