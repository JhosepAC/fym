"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";

interface MovieCardProps {
  item: MediaItem;
  size?: "normal" | "large";
}

export default function MovieCard({ item, size = "normal" }: MovieCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || item.name || "Untitled";
  const posterUrl = getImageUrl(item.poster_path, IMAGE_SIZES.poster.original);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A";
  const mediaType = item.media_type === "tv" || item.first_air_date ? "TV Series" : "Movie";

  const handleClick = () => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    router.push(`/${type}/${item.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = item.media_type === "tv" ? "tv" : "movie";
    router.push(`/${type}/${item.id}?play=true`);
  };

  return (
    <div
      className="relative cursor-pointer w-44 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 transition-all duration-500 ${
          isHovered ? "scale-105" : "shadow-md"
        }`}
      >
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes={size === "large" ? "256px" : "176px"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <span className="text-gray-400 text-sm text-center px-2">{title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-end p-3 animate-scale-in">
            <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">{title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400 text-xs font-medium">{rating} ★</span>
              <span className="text-gray-400 text-xs">{year}</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">{mediaType}</span>
            </div>
            <p className="text-gray-300 text-xs line-clamp-2 mb-3">{item.overview || "No description available."}</p>
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded text-sm font-bold hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                onClick={(e) => { e.stopPropagation(); handleClick(); }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver más
              </button>
              <button 
                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white hover:bg-white/20 hover:border-white/40 transition-all"
                onClick={handlePlayClick}
                title="Reproducir trailer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}