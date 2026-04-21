"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES, TMDB_CONFIG } from "@/lib/api";
import { MovieDetail, Video, MediaItem, Cast, Crew } from "@/lib/api/client";

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const overviewRef = React.useRef<HTMLParagraphElement>(null);
  const castScrollRef = React.useRef<HTMLDivElement>(null);

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
        const [movieData, videosData, recommendationsData, creditsData] = await Promise.all([
          apiClient.getMovieDetails(movieId),
          apiClient.getMovieVideos(movieId),
          apiClient.getMovieRecommendations(movieId),
          apiClient.getMovieCredits(movieId),
        ]);
        setMovie(movieData);
        setVideos(videosData.results || []);
        setRecommendations(recommendationsData.results || []);
        setCast(creditsData.cast || []);
        setCrew(creditsData.crew || []);
      } catch (err) {
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  useEffect(() => {
    if (movie && overviewRef.current) {
      const checkOverflow = () => {
        if (overviewRef.current) {
          setShowReadMore(overviewRef.current.scrollHeight > overviewRef.current.clientHeight);
        }
      };
      checkOverflow();
      const timeout = setTimeout(checkOverflow, 100);
      return () => clearTimeout(timeout);
    }
  }, [movie]);

  const trailer = videos.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

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

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Navbar transparent={false} />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 text-xl mb-4">{error || "Movie not found"}</p>
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

  const posterUrl = getImageUrl(movie.poster_path, IMAGE_SIZES.poster.large);
  const backdropUrl = getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.original);
  const rating = movie.vote_average?.toFixed(1) || "N/A";

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Released":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Post Production":
      case "In Production":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Planned":
      case "Announced":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Rumored":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Canceled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return "text-green-400";
    if (rating >= 6.0) return "text-yellow-400";
    if (rating >= 4.0) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar transparent={false} />

      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 h-[85vh]">
            <Image
              src={backdropUrl}
              alt={movie.title || ""}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/70 via-40% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 px-6 lg:px-12 pt-40 pb-12">
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
              <div 
                className="w-64 lg:w-80 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => posterUrl && setShowPosterModal(true)}
              >
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title || ""}
                    width={320}
                    height={480}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-80 h-[480px] bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              {movie.belongs_to_collection && (
                <Link
                  href={`/collection/${movie.belongs_to_collection.id}`}
                  className="mt-6 p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-colors block"
                >
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Part of</p>
                  <p className="text-white font-semibold hover:text-red-400 transition-colors">{movie.belongs_to_collection.name}</p>
                </Link>
              )}
            </div>

            <div className="flex-1 max-w-3xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  {movie.title || "Untitled"}
                </h1>
                {movie.adult && (
                  <span className="flex-shrink-0 text-red-500 border border-red-500 px-3 py-1 rounded text-sm font-medium">
                    18+
                  </span>
                )}
              </div>

              {movie.tagline && (
                <p className="text-gray-400 italic text-xl mb-6">&quot;{movie.tagline}&quot;</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg className={`w-6 h-6 ${getRatingColor(parseFloat(rating))}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className={`text-xl font-bold ${getRatingColor(parseFloat(rating))}`}>{rating}</span>
                  <span className="text-gray-400 text-sm">({movie.vote_count?.toLocaleString()} votes)</span>
                </div>

                {movie.status && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(movie.status)}`}>
                    {movie.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-300">
                {movie.release_date && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}

                {movie.runtime > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.overview && (
                <div className="mb-10">
                  <h3 className="text-white text-2xl font-semibold mb-4">Synopsis</h3>
                  <p 
                    ref={overviewRef}
                    className={`text-gray-300 text-lg leading-relaxed ${!showFullOverview && "line-clamp-4"}`}
                  >
                    {movie.overview}
                  </p>
                  {showReadMore && (
                    <button
                      onClick={() => setShowFullOverview(!showFullOverview)}
                      className="text-red-500 hover:text-red-400 mt-3 text-sm font-medium transition-colors"
                    >
                      {showFullOverview ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {movie.budget > 0 && (
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700/30">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Budget</p>
                    <p className="text-white text-xl font-bold">{formatCurrency(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700/30">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Box Office</p>
                    <p className="text-white text-xl font-bold">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700/30">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Popularity</p>
                  <p className="text-white text-xl font-bold">#{Math.round(movie.popularity || 0).toLocaleString()}</p>
                </div>
              </div>

              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-4">Production</h3>
                  <div className="flex flex-wrap gap-4">
                    {movie.production_companies
                      .filter((company) => company.logo_path)
                      .slice(0, 6)
                      .map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <Image
                            src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${company.logo_path}`}
                            alt={company.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                          <div>
                            <p className="text-gray-900 text-sm font-medium">{company.name}</p>
                            {company.origin_country && (
                              <p className="text-gray-500 text-xs">{company.origin_country}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                {trailerUrl ? (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="group relative flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:bg-red-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                  >
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    WATCH TRAILER
                  </button>
                ) : (
                  <button disabled className="flex items-center gap-3 bg-gray-600 text-gray-400 px-8 py-4 rounded-xl font-bold cursor-not-allowed opacity-50">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    No Trailer
                  </button>
                )}
              </div>
            </div>

            </div>
        </div>
      </div>

      {cast.length > 0 && (
        <div className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
          <h3 className="text-white text-2xl font-semibold mb-6">Cast</h3>
          <div className="relative group">
            <button
              onClick={() => castScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div 
              ref={castScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {cast.slice(0, 10).map((actor) => (
                <div key={actor.id} className="flex-shrink-0 w-32">
                  <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                    {actor.profile_path ? (
                      <div className="relative w-32 h-40">
                        <Image
                          src={getImageUrl(actor.profile_path, IMAGE_SIZES.profile.medium) || ""}
                          alt={actor.name || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-40 bg-gray-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-white text-sm font-medium truncate">{actor.name}</p>
                      <p className="text-gray-500 text-xs truncate">{actor.character}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => castScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
          <h3 className="text-white text-2xl font-semibold mb-6">Recommended Movies</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.slice(0, 10).map((rec) => (
              <Link
                key={rec.id}
                href={`/movie/${rec.id}`}
                className="group"
              >
                <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                  {rec.poster_path ? (
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={getImageUrl(rec.poster_path, IMAGE_SIZES.poster.medium) || ""}
                        alt={rec.title || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[2/3] bg-gray-800" />
                  )}
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">
                      {rec.title}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {rec.vote_average?.toFixed(1)} ★
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
              alt={movie.title || ""}
              width={600}
              height={900}
              className="max-h-[90vh] w-auto rounded-lg"
              quality={100}
            />
          </div>
        </div>
      )}

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
    </div>
  );
}
