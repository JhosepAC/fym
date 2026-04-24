"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES, TMDB_CONFIG } from "@/lib/api";
import { MovieDetail, Video, MediaItem, Cast, Crew, WatchProvider, Collection } from "@/lib/api/client";

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([]);
  const [externalLink, setExternalLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showOtherResults, setShowOtherResults] = useState(false);
  const [otherResults, setOtherResults] = useState<MediaItem[]>([]);
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const overviewRef = React.useRef<HTMLParagraphElement>(null);
  const castScrollRef = React.useRef<HTMLDivElement>(null);

  const movieId = Number(params.id);
  const isPremiumMovie = movieId === 103;
  const shouldPlayTrailer = searchParams.get("play") === "true";

  useEffect(() => {
    if (shouldPlayTrailer && videos.length > 0) {
      setShowTrailerModal(true);
    }
  }, [shouldPlayTrailer, videos]);

  useEffect(() => {
    async function fetchMovie() {
      if (!movieId || isNaN(movieId)) {
        setError("Invalid movie ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const movieData = await apiClient.getMovieDetails(movieId);
        setMovie(movieData);
        
        let collectionPartsCount: number | null = null;
        if (movieData.belongs_to_collection) {
          const collectionData = await apiClient.getCollectionDetails(movieData.belongs_to_collection.id);
          collectionPartsCount = collectionData.parts.length;
          setCollectionCount(collectionPartsCount);
        }

        const [videosData, recommendationsData, creditsData, watchProvidersData] = await Promise.all([
          apiClient.getMovieVideos(movieId),
          apiClient.getMovieRecommendations(movieId),
          apiClient.getMovieCredits(movieId),
          apiClient.getMovieWatchProviders(movieId),
        ]);
        setVideos(videosData.results || []);
        setRecommendations(recommendationsData.results || []);
        setCast(creditsData.cast || []);
        setCrew(creditsData.crew || []);
        
        const countryCode = "PE";
        const providers = watchProvidersData.results?.[countryCode];
        if (providers) {
          setWatchProviders(providers.flatrate || []);
          setExternalLink(providers.link || null);
        }
      } catch (err) {
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  const loadMoreRecommendations = useCallback(async () => {
    if (loadingMore || !hasMoreRecommendations) return;
    setLoadingMore(true);
    try {
      const nextPage = recommendationsPage + 1;
      const data = await apiClient.getMovieRecommendations(movieId, nextPage);
      if (data.results && data.results.length > 0) {
        setRecommendations(prev => [...prev, ...data.results]);
        setRecommendationsPage(nextPage);
        if (data.results.length < 20 || nextPage >= 3) {
          setHasMoreRecommendations(false);
        }
      } else {
        setHasMoreRecommendations(false);
      }
    } catch (error) {
      console.error("Error loading more recommendations:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [movieId, recommendationsPage, loadingMore, hasMoreRecommendations]);

  const loadOtherResults = useCallback(async () => {
    if (showOtherResults) return;
    setShowOtherResults(true);
    try {
      const data = await apiClient.getMovieSimilar(movieId, 1);
      setOtherResults(data.results || []);
    } catch (error) {
      console.error("Error loading similar movies:", error);
    }
  }, [movieId, showOtherResults]);

  useEffect(() => {
    if (!hasMoreRecommendations || recommendations.length < 10) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          if (recommendationsPage >= 3 && hasMoreRecommendations) {
            loadOtherResults();
          } else {
            loadMoreRecommendations();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMoreRecommendations, recommendationsPage, loadingMore, recommendations.length, loadMoreRecommendations, loadOtherResults]);

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

  const getProviderLink = (providerName: string) => {
    const searchQuery = encodeURIComponent(movie?.title || "");
    const links: Record<string, string> = {
      "Netflix": `https://www.netflix.com/search?q=${searchQuery}`,
      "Disney Plus": `https://www.disneyplus.com/search?q=${searchQuery}`,
      "HBO Max": `https://www.max.com/search?q=${searchQuery}`,
      "Amazon Prime Video": `https://www.primevideo.com/search?q=${searchQuery}`,
      "Apple TV+": `https://tv.apple.com/us/search?q=${searchQuery}`,
      "Hulu": `https://www.hulu.com/search?q=${searchQuery}`,
      "Peacock": `https://www.peacocktv.com/search?q=${searchQuery}`,
      "Paramount+": `https://www.paramountplus.com/search?q=${searchQuery}`,
    };
    return links[providerName] || "#";
  };

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

  const posterUrl = getImageUrl(movie.poster_path, IMAGE_SIZES.poster.original);
  const backdropUrl = getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.ultra);
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
    if (isPremiumMovie) {
      if (rating >= 7.5) return "text-amber-300";
      if (rating >= 6.0) return "text-amber-400";
      return "text-amber-500";
    }
    if (rating >= 7.5) return "text-yellow-400";
    if (rating >= 6.0) return "text-yellow-400";
    if (rating >= 4.0) return "text-yellow-400";
    return "text-yellow-400";
  };

  const getPremiumAccent = (defaultClass: string, premiumClass: string) => {
    return isPremiumMovie ? premiumClass : defaultClass;
  };

  return (
    <div className={isPremiumMovie ? "min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#1a1510] to-[#0a0a0b]" : "min-h-screen bg-[#0a0a0b]"}>
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
            {isPremiumMovie && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1510]/50" />
            )}
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
                className={`relative w-64 lg:w-80 rounded-xl overflow-hidden cursor-pointer group transition-all duration-500 ${isPremiumMovie ? "ring-2 ring-amber-400/50 hover:ring-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]" : ""}`}
                onClick={() => posterUrl && setShowPosterModal(true)}
              >
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title || ""}
                    width={320}
                    height={480}
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-80 h-[480px] bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                {posterUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isPremiumMovie ? "bg-amber-500" : "bg-red-600"}`}>
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                )}
                {isPremiumMovie && (
                  <div className="absolute inset-0 rounded-xl border-2 border-amber-400/30 pointer-events-none" />
                )}
              </div>

              {movie.belongs_to_collection && (
                <div className={`mt-6 group relative overflow-hidden rounded-xl border transition-all duration-300 ${isPremiumMovie ? "border-amber-600/30 hover:border-amber-500/60" : "border-gray-700/50 hover:border-red-500/50"}`}>
                  <div className="absolute inset-0">
                    {movie.belongs_to_collection.backdrop_path && (
                      <Image
                        src={getImageUrl(movie.belongs_to_collection.backdrop_path, IMAGE_SIZES.backdrop.original) || ""}
                        alt={movie.belongs_to_collection.name || ""}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                  </div>
                  
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider backdrop-blur-sm ${isPremiumMovie ? "bg-amber-600/80 text-white" : "bg-red-600/80 text-white"}`}>
                        Collection
                      </span>
                      {collectionCount !== null && (
                        <span className="text-gray-400 text-xs">
                          {collectionCount} {collectionCount === 1 ? "movie" : "movies"}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-white text-lg font-bold mb-3">
                      {movie.belongs_to_collection.name}
                    </h3>
                    
                    <Link
                      href={`/collection/${movie.belongs_to_collection.id}`}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] group/btn ${isPremiumMovie ? "bg-amber-500 hover:bg-amber-400 text-black hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "bg-red-600 hover:bg-red-500 text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      View Collection
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 max-w-3xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className={`text-4xl lg:text-6xl font-bold leading-tight ${isPremiumMovie ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]" : "text-white"}`}>
                  {movie.title || "Untitled"}
                </h1>
                {movie.adult && (
                  <span className="flex-shrink-0 text-red-500 border border-red-500 px-3 py-1 rounded text-sm font-medium">
                    18+
                  </span>
                )}
              </div>

              {isPremiumMovie && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  <span className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold">Masterpiece</span>
                  <div className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </div>
              )}

              {movie.tagline && (
                <p className={`italic text-xl mb-6 ${isPremiumMovie ? "text-amber-300/80" : "text-gray-400"}`}>&quot;{movie.tagline}&quot;</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full ${isPremiumMovie ? "bg-amber-500/20 border border-amber-400/30" : "bg-white/10"}`}>
                  <svg className={`w-6 h-6 ${getRatingColor(parseFloat(rating))}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className={`text-xl font-bold ${getRatingColor(parseFloat(rating))}`}>{rating}</span>
                  <span className={isPremiumMovie ? "text-amber-400/70 text-sm" : "text-gray-400 text-sm"}>({movie.vote_count?.toLocaleString()} votes)</span>
                </div>

                {movie.status && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${isPremiumMovie ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : getStatusColor(movie.status)}`}>
                    {movie.status}
                  </span>
                )}

                {isPremiumMovie && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-amber-400 text-sm font-medium">Top 250</span>
                  </div>
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
                  <h3 className={`text-sm uppercase tracking-wider mb-3 ${isPremiumMovie ? "text-amber-400/70" : "text-gray-400"}`}>Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${isPremiumMovie ? "bg-amber-500/10 text-amber-200 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50" : "bg-white/10 text-gray-200 border-white/20 hover:bg-white/20"}`}
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
                    className={`group flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${isPremiumMovie 
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]" 
                      : "bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"}`}
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {isPremiumMovie ? "WATCH TRAILER" : "WATCH TRAILER"}
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

              {watchProviders.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4">Watch On</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {watchProviders.slice(0, 6).map((provider, idx) => (
                      <a
                        key={`${provider.provider_id}-${idx}`}
                        href={getProviderLink(provider.provider_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                        title={`Watch on ${provider.provider_name}`}
                      >
                        {provider.logo_path ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 hover:border-red-500 transition-all duration-300">
                            <Image
                              src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${provider.logo_path}`}
                              alt={provider.provider_name}
                              width={40}
                              height={40}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        ) : null}
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
                          src={getImageUrl(actor.profile_path, IMAGE_SIZES.profile.original) || ""}
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

      {crew.length > 0 && (
        <div className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
          <h3 className="text-white text-2xl font-semibold mb-6">Crew</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {crew
              .filter((member) => ["Director", "Screenplay", "Writer", "Producer", "Executive Producer", "Original Story"].includes(member.job))
              .slice(0, 5)
              .map((member, idx) => (
                <div key={`${member.id}-${member.job}-${idx}`} className={`bg-gray-800/50 rounded-xl p-4 border transition-all duration-300 ${isPremiumMovie ? "border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "border-gray-700/30 hover:border-red-500/50"}`}>
                  {member.profile_path ? (
                    <div className="relative w-16 h-16 mb-3 mx-auto">
                      <Image
                        src={getImageUrl(member.profile_path, IMAGE_SIZES.profile.original) || ""}
                        alt={member.name || ""}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mb-3 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <p className="text-white text-sm font-medium text-center truncate">{member.name}</p>
                  <p className={`text-xs text-center truncate ${isPremiumMovie ? "text-amber-400" : "text-red-400"}`}>{member.job}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
          <h3 className="text-white text-2xl font-semibold mb-6">Recommended Movies</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.map((rec, idx) => (
              <Link
                key={`${rec.id}-${idx}`}
                href={`/movie/${rec.id}`}
                className="group"
              >
                <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                  {rec.poster_path ? (
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={getImageUrl(rec.poster_path, IMAGE_SIZES.poster.original) || ""}
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

          <div ref={loaderRef} className="h-24 flex items-center justify-center">
            {loadingMore && (
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            )}
            {!hasMoreRecommendations && recommendations.length > 0 && (
              <p className="text-gray-500">No more recommendations</p>
            )}
          </div>

          {showOtherResults && otherResults.length > 0 && (
            <div className="mt-12">
              <h3 className="text-white text-2xl font-semibold mb-6">Other Results You May Like</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {otherResults.map((rec, idx) => (
                  <Link
                    key={`other-${rec.id}-${idx}`}
                    href={`/movie/${rec.id}`}
                    className="group"
                  >
<div className={`bg-gray-800/50 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 ${isPremiumMovie ? "border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "border-gray-700/30 hover:border-red-500/50"}`}>
                      {rec.poster_path ? (
                        <div className="relative aspect-[2/3]">
                          <Image
                            src={getImageUrl(rec.poster_path, IMAGE_SIZES.poster.original) || ""}
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
