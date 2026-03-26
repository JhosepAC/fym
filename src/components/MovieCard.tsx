"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";

interface MovieCardProps {
  item: MediaItem;
  size?: "normal" | "large";
}

export default function MovieCard({ item, size = "normal" }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || item.name || "Untitled";
  const posterUrl = getImageUrl(item.poster_path, IMAGE_SIZES.poster.large);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";

  return (
    <div
      className={`relative cursor-pointer transition-transform duration-200 ${
        size === "large" ? "aspect-[2/3]" : "aspect-[2/3]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-full rounded-md overflow-hidden bg-gray-800 transition-all duration-200 ${
          isHovered ? "scale-105 z-20 shadow-xl" : "scale-100"
        }`}
      >
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover"
            sizes={size === "large" ? "256px" : "176px"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <span className="text-gray-400 text-sm text-center px-2">{title}</span>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-black/80 p-3 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{title}</h3>
              {item.overview && (
                <p className="text-gray-300 text-xs line-clamp-3">{item.overview}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
              <span className="text-gray-400 text-xs">
                {item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
