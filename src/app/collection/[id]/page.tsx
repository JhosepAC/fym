"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { Collection, CollectionPart, MediaItem } from "@/lib/api/client";

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const collectionId = Number(params.id);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    };
    
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [collection]);

  useEffect(() => {
    async function fetchCollection() {
      if (!collectionId || isNaN(collectionId)) {
        setError("Invalid collection ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getCollectionDetails(collectionId);
        setCollection(data);
      } catch (err) {
        setError("Failed to load collection");
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [collectionId]);

  const sortedParts = collection
    ? [...collection.parts].sort(
        (a, b) =>
          new Date(a.release_date).getFullYear() -
          new Date(b.release_date).getFullYear()
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Navbar transparent={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Navbar transparent={false} />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 text-xl mb-4">{error || "Collection not found"}</p>
<button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = getImageUrl(collection.backdrop_path, IMAGE_SIZES.backdrop.ultra);
  const posterUrl = getImageUrl(collection.poster_path, IMAGE_SIZES.poster.original);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar transparent={false} />

      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 h-[70vh]">
            <Image
              src={backdropUrl}
              alt={collection.name || ""}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/80 via-30% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/90 via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 px-6 lg:px-12 pt-44 pb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="flex-shrink-0">
              <div 
                className="relative w-56 lg:w-72 rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-black/50"
                onClick={() => posterUrl && setShowPosterModal(true)}
              >
                {posterUrl ? (
                  <>
                    <Image
                      src={posterUrl}
                      alt={collection.name || ""}
                      width={288}
                      height={432}
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-72 h-[432px] bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 max-w-4xl">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Collection
                </span>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span>{collection.parts.length} {collection.parts.length === 1 ? "movie" : "movies"}</span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
                {collection.name}
              </h1>

              {collection.overview && (
                <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl">
                  {collection.overview}
                </p>
              )}

              
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-12 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <span className="w-1 h-8 bg-red-600 rounded-full"></span>
            Movies in this collection
          </h2>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedParts.map((part, idx) => (
            <Link
              key={part.id}
              href={`/movie/${part.id}`}
              className="flex-shrink-0 group"
              onMouseEnter={() => setHoveredId(part.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`
                relative w-64 lg:w-72 rounded-xl overflow-hidden 
                border-2 transition-all duration-300 ease-out
                group-hover:translate-y-3
                ${hoveredId === part.id 
                  ? 'border-white/50' 
                  : 'border-gray-700/30 hover:border-white/30'
                }
              `}>
                {part.poster_path ? (
                  <>
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={getImageUrl(part.poster_path, IMAGE_SIZES.poster.original) || ""}
                        alt={part.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs font-bold rounded backdrop-blur-sm">
                          {part.release_date ? new Date(part.release_date).getFullYear() : "TBA"}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    {hoveredId === part.id && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm font-bold text-center">
                          View Details
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-4 bg-gray-900/90 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-500 font-bold text-sm">#{idx + 1}</span>
                    {part.vote_average > 0 && (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {part.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-white font-semibold truncate">
                    {part.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {part.release_date 
                      ? `Released ${new Date(part.release_date).getFullYear()}` 
                      : "Release date unknown"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          {canScrollLeft && (
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
              className="w-12 h-12 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm group"
            >
              <svg className="w-6 h-6 text-white group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
              className="w-12 h-12 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm group"
            >
              <svg className="w-6 h-6 text-white group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showPosterModal && posterUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowPosterModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={posterUrl}
              alt={collection.name || ""}
              width={600}
              height={900}
              className="max-h-[90vh] w-auto rounded-lg"
              quality={100}
            />
          </div>
        </div>
      )}
    </div>
  );
}