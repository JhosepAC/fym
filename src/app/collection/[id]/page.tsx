"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES } from "@/lib/api";
import { Collection } from "@/lib/api/client";

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectionId = Number(params.id);

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

  const backdropUrl = getImageUrl(collection.backdrop_path, IMAGE_SIZES.backdrop.large);
  const posterUrl = getImageUrl(collection.poster_path, IMAGE_SIZES.poster.large);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar transparent={false} />

      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 h-[40vh]">
            <Image
              src={backdropUrl}
              alt={collection.name || ""}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/70 to-transparent" />
          </div>
        )}

        <div className="relative z-10 px-6 lg:px-12 pt-32 pb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-shrink-0">
              <div className="w-48 lg:w-64 rounded-xl overflow-hidden">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={collection.name || ""}
                    width={256}
                    height={384}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-64 h-96 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 max-w-3xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {collection.name}
              </h1>

              <div className="flex items-center gap-4 mb-6 text-gray-400">
                <span>{collection.parts.length} {collection.parts.length === 1 ? "movie" : "movies"}</span>
              </div>

              {collection.overview && (
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  {collection.overview}
                </p>
              )}

              <h2 className="text-white text-2xl font-semibold mb-6">Movies in this collection</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collection.parts
                  .sort((a, b) => new Date(a.release_date).getFullYear() - new Date(b.release_date).getFullYear())
                  .map((part) => (
                    <Link
                      key={part.id}
                      href={`/movie/${part.id}`}
                      className="group"
                    >
                      <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/30 hover:border-red-500/50 transition-colors">
                        {part.backdrop_path ? (
                          <div className="relative h-32">
                            <Image
                              src={getImageUrl(part.backdrop_path, IMAGE_SIZES.backdrop.small) || ""}
                              alt={part.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-32 bg-gray-800" />
                        )}
                        <div className="p-3">
                          <p className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">
                            {part.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {part.release_date ? new Date(part.release_date).getFullYear() : "TBA"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}