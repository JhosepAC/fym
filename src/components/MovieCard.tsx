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
  const posterUrl = getImageUrl(item.poster_path, IMAGE_SIZES.poster.large);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A";
  const mediaType = item.media_type === "tv" || item.first_air_date ? "TV Series" : "Movie";

  const handleClick = () => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    router.push(`/${type}/${item.id}`);
  };

  return (
    <div
      className="relative cursor-pointer w-44"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className={`relative w-full aspect-[2/3] rounded-md overflow-hidden bg-gray-800 transition-all duration-300 ${
          isHovered ? "scale-105 shadow-2xl" : "shadow-md"
        }`}
      >
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300"
            sizes={size === "large" ? "256px" : "176px"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <span className="text-gray-400 text-sm text-center px-2">{title}</span>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-3">
            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400 text-xs font-medium">{rating} ★</span>
              <span className="text-gray-400 text-xs">{year}</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">{mediaType}</span>
            </div>
            <p className="text-gray-300 text-xs line-clamp-2 mb-2">{item.overview || "No description available."}</p>
            <button className="w-full bg-white text-black py-1.5 rounded text-sm font-bold hover:bg-gray-200 transition-colors">
              See More Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
}