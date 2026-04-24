"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { apiClient, getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { MediaItem, Video } from "@/lib/api/client";
import { useRouter } from "next/navigation";

interface HeroBannerProps {
  items: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function HeroBanner({ items, currentIndex, onIndexChange }: HeroBannerProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailer, setTrailer] = useState<Video | null>(null);
  
  const item = items[currentIndex];
  const backdropUrl = getImageUrl(item?.backdrop_path, IMAGE_SIZES.backdrop.ultra);
  const title = item?.title || item?.name || "Untitled";
  const year = item?.release_date?.split("-")[0] || item?.first_air_date?.split("-")[0] || "";
  const mediaType = item?.media_type === "tv" || item?.first_air_date ? "tv" : "movie";

  useEffect(() => {
    async function fetchVideos() {
      if (!item?.id) return;
      
      try {
        const type = mediaType === "tv" ? "tv" : "movie";
        const data = await apiClient.getMediaVideos(type, item.id);
        const videoList = data.results || [];
        setVideos(videoList);
        
        const officialTrailer = videoList.find((v: Video) => v.type === "Trailer" && v.site === "YouTube" && (v as any).official === true);
        const anyTrailer = videoList.find((v: Video) => v.type === "Trailer" && v.site === "YouTube");
        setTrailer(officialTrailer || anyTrailer || null);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
        setTrailer(null);
      }
    }

    fetchVideos();
  }, [item?.id, mediaType]);

  useEffect(() => {
    if (showTrailerModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showTrailerModal]);

  const triggerAnimation = () => {
    setAnimKey(prev => prev + 1);
  };

  const handleMoreInfo = () => {
    router.push(`/${mediaType}/${item.id}`);
  };

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trailer) {
      setShowTrailerModal(true);
    }
  };

  const goNext = () => {
    triggerAnimation();
    onIndexChange((currentIndex + 1) % items.length);
  };

  const goPrev = () => {
    triggerAnimation();
    onIndexChange((currentIndex - 1 + items.length) % items.length);
  };

  if (!item) return null;

  return (
    <section className="relative h-screen min-h-[700px] flex flex-col justify-end overflow-hidden pb-8 md:pb-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/60 via-transparent to-transparent z-10" />
        
        {backdropUrl && !imageError ? (
          <Image
            key={`${item.id}-${animKey}`}
            src={backdropUrl}
            alt={title}
            fill
            quality={100}
            className="object-cover animate-hero-fade-in"
            priority
            sizes="100vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
      </div>

      <div key={`content-${animKey}`} className="relative z-20 max-w-4xl px-8 md:px-16 animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded">
            {mediaType === 'movie' ? 'Movie' : 'Series'}
          </span>
          {year && (
            <span className="text-gray-400 text-sm font-medium">
              {year}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
            {title}
          </span>
        </h1>

        {item.overview && (
          <p className="text-base md:text-lg text-gray-300 mb-6 max-w-xl line-clamp-3 leading-relaxed">
            {item.overview}
          </p>
        )}

        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 rounded-lg">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-400 font-bold text-lg">
                {item.vote_average?.toFixed(1) || "N/A"}
              </span>
            </div>
            <span className="text-gray-500 text-sm">/ 10</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleMoreInfo}
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            More Info
          </button>
          <button 
            onClick={handlePlayTrailer}
            disabled={!trailer}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              trailer
                ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110"
                : "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
            }`}
            title={trailer ? "Play Trailer" : "No trailer available"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 md:hidden">
          <button
            onClick={goPrev}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/30 transition-all duration-300"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            {items.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
              />
            ))}
          </div>
          <button
            onClick={goNext}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/30 transition-all duration-300"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3">
        <button
          onClick={goPrev}
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={goNext}
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:block animate-bounce">
        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {showTrailerModal && trailer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div className="relative w-full max-w-6xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&vq=hd1080`}
              title={trailer.name}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}