"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES, TMDB_CONFIG } from "@/lib/api";
import { MovieDetail } from "@/lib/api/client";

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);

  const movieId = Number(params.id);

  useEffect(() => {
    async function fetchMovie() {
      if (!movieId || isNaN(movieId)) {
        setError("Invalid movie ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getMovieDetails(movieId);
        setMovie(data);
      } catch (err) {
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1B]">
        <Navbar transparent={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#1A1A1B]">
        <Navbar transparent={false} />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 text-xl mb-4">{error || "Movie not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = getImageUrl(movie.poster_path, IMAGE_SIZES.poster.large);
  const backdropUrl = getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.original);
  const rating = movie.vote_average?.toFixed(1) || "N/A";

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <Navbar transparent={false} />

      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 h-[70vh]">
            <Image
              src={backdropUrl}
              alt={movie.title || ""}
              fill
              className="object-cover object-top opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1B] via-[#1A1A1B]/50 to-transparent" />
          </div>
        )}

        <div className="relative z-10 px-8 pt-32 pb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-64 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-2xl">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title || ""}
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

            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {movie.title || "Untitled"}
              </h1>

              {movie.tagline && (
                <p className="text-gray-400 italic text-lg mb-4">&quot;{movie.tagline}&quot;</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating}
                </span>

                {movie.release_date && (
                  <span className="text-gray-300">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}

                {movie.runtime > 0 && (
                  <span className="text-gray-300 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatRuntime(movie.runtime)}
                  </span>
                )}

                {movie.adult && (
                  <span className="text-red-500 border border-red-500 px-2 py-0.5 rounded text-sm">18+</span>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {movie.overview && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
                  <p className={`text-gray-300 leading-relaxed ${!showFullOverview && "line-clamp-4"}`}>
                    {movie.overview}
                  </p>
                  {movie.overview.length > 200 && (
                    <button
                      onClick={() => setShowFullOverview(!showFullOverview)}
                      className="text-red-500 hover:text-red-400 mt-2 text-sm"
                    >
                      {showFullOverview ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                {movie.budget > 0 && (
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm">Budget</p>
                    <p className="text-white font-semibold">
                      ${movie.budget.toLocaleString()}
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm">Revenue</p>
                    <p className="text-white font-semibold">
                      ${movie.revenue.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-3">Production</h2>
                  <div className="flex flex-wrap gap-3">
                    {movie.production_companies
                      .filter((company) => company.logo_path)
                      .slice(0, 5)
                      .map((company) => (
                        <div
                          key={company.id}
                          className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          {company.logo_path ? (
                            <Image
                              src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${company.logo_path}`}
                              alt={company.name}
                              width={32}
                              height={32}
                              className="object-contain brightness-0 invert opacity-70"
                            />
                          ) : null}
                          <span className="text-gray-300 text-sm">{company.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play Trailer
                </button>
                <button className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
