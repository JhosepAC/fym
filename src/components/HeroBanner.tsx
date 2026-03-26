"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";

interface HeroBannerProps {
  item: MediaItem;
}

export default function HeroBanner({ item }: HeroBannerProps) {
  const [imageError, setImageError] = useState(false);
  const backdropUrl = getImageUrl(item.backdrop_path, IMAGE_SIZES.backdrop.large);
  const title = item.title || item.name || "Untitled";

  return (
    <section className="relative h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1B] via-[#1A1A1B]/60 to-transparent z-10" />
      
      {backdropUrl && !imageError ? (
        <Image
          src={backdropUrl}
          alt={title}
          fill
          className="object-cover opacity-40"
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-40" />
      )}

      <div className="relative z-20 max-w-3xl px-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          {title}
        </h1>
        {item.overview && (
          <p className="text-lg text-gray-300 mb-6 max-w-xl line-clamp-3">
            {item.overview}
          </p>
        )}
        <div className="flex items-center gap-4 mb-6">
          <span className="flex items-center gap-1 text-yellow-400 text-lg font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {item.vote_average?.toFixed(1) || "N/A"}
          </span>
          <span className="text-gray-400">
            {item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || ""}
          </span>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Browse Now
          </button>
          <button className="flex items-center gap-2 bg-gray-500/50 text-white px-8 py-3 rounded font-semibold hover:bg-gray-500/70 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}
