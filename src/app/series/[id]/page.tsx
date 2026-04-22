"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES, TMDB_CONFIG } from "@/lib/api";
import { TvShowDetail, Video, MediaItem, Cast, Crew, WatchProvider, TvSeason, TvEpisode, SeasonCast, SeasonCrew } from "@/lib/api/client";

export default function SeriesDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [series, setSeries] = useState<TvShowDetail | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState<TvEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<TvEpisode | null>(null);
  const [seasonDetails, setSeasonDetails] = useState<TvSeason | null>(null);
  const [seasonCast, setSeasonCast] = useState<SeasonCast[]>([]);
  const [seasonCrew, setSeasonCrew] = useState<SeasonCrew[]>([]);
  const [seasonVideos, setSeasonVideos] = useState<Video[]>([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [episodeImages, setEpisodeImages] = useState<{file_path: string}[]>([]);
  const [episodeVideos, setEpisodeVideos] = useState<Video[]>([]);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStillImage, setSelectedStillImage] = useState<string | null>(null);
  const [showStillModal, setShowStillModal] = useState(false);
  const [showEpisodeTrailerModal, setShowEpisodeTrailerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showFullSeasonOverview, setShowFullSeasonOverview] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showSeasonPosterModal, setShowSeasonPosterModal] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const overviewRef = React.useRef<HTMLParagraphElement>(null);
  const castScrollRef = React.useRef<HTMLDivElement>(null);

  const seriesId = Number(params.id);

  useEffect(() => {
    async function fetchSeries() {
      if (!seriesId || isNaN(seriesId)) {
        setError("Invalid series ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [seriesData, videosData, recommendationsData, creditsData, watchProvidersData] = await Promise.all([
          apiClient.getTvDetails(seriesId),
          apiClient.getTvVideos(seriesId),
          apiClient.getTvRecommendations(seriesId),
          apiClient.getTvCredits(seriesId),
          apiClient.getMovieWatchProviders(seriesId),
        ]);
        setSeries(seriesData);
        setVideos(videosData.results || []);
        setRecommendations(recommendationsData.results || []);
        setCast(creditsData.cast || []);
        setCrew(creditsData.crew || []);
        
        const firstSeason = seriesData.seasons?.find(s => s.season_number > 0);
        if (firstSeason) {
          setSelectedSeason(firstSeason.season_number);
        }
        
        const countryCode = "PE";
        const providers = watchProvidersData.results?.[countryCode];
        if (providers) {
          setWatchProviders(providers.flatrate || []);
        }
      } catch (err) {
        setError("Failed to load series details");
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, [seriesId]);

  useEffect(() => {
    async function fetchSeasonEpisodes() {
      if (!series || !selectedSeason) return;
      
      try {
        setLoadingEpisodes(true);
        const [seasonData, aggregateCredits, videosData] = await Promise.all([
          apiClient.getTvSeasonDetails(seriesId, selectedSeason),
          apiClient.getTvSeasonAggregateCredits(seriesId, selectedSeason),
          apiClient.getTvSeasonVideos(seriesId, selectedSeason),
        ]);
        setSeasonDetails(seasonData);
        setSeasonEpisodes(seasonData.episodes || []);
        setSelectedEpisode(seasonData.episodes?.[0] || null);
        setSeasonCast(aggregateCredits.cast || []);
        setSeasonCrew(aggregateCredits.crew || []);
        setSeasonVideos(videosData.results || []);
      } catch (err) {
        console.error("Failed to load episodes");
      } finally {
        setLoadingEpisodes(false);
      }
    }

    fetchSeasonEpisodes();
  }, [seriesId, selectedSeason]);

  useEffect(() => {
    if (showSeasonModal || showTrailerModal || showPosterModal || showSeasonPosterModal || showEpisodeModal || showImageModal || showEpisodeTrailerModal || showStillModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSeasonModal, showTrailerModal, showPosterModal, showSeasonPosterModal, showEpisodeModal, showImageModal, showEpisodeTrailerModal, showStillModal]);

  useEffect(() => {
    if (series && overviewRef.current) {
      const checkOverflow = () => {
        if (overviewRef.current) {
          setShowReadMore(overviewRef.current.scrollHeight > overviewRef.current.clientHeight);
        }
      };
      checkOverflow();
      const timeout = setTimeout(checkOverflow, 100);
      return () => clearTimeout(timeout);
    }
  }, [series]);

  useEffect(() => {
    async function fetchEpisodeDetails() {
      if (!selectedEpisode || !showEpisodeModal || !selectedSeason) return;
      
      try {
        const [imagesData, videosData] = await Promise.all([
          apiClient.getTvEpisodeImages(seriesId, selectedSeason, selectedEpisode.episode_number),
          apiClient.getTvEpisodeVideos(seriesId, selectedSeason, selectedEpisode.episode_number),
        ]);
        setEpisodeImages(imagesData.stills || []);
        setEpisodeVideos(videosData.results || []);
      } catch (err) {
        console.error("Failed to load episode details");
      }
    }

    fetchEpisodeDetails();
  }, [selectedEpisode, showEpisodeModal, seriesId, selectedSeason]);

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

  if (error || !series) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Navbar transparent={false} />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 text-xl mb-4">{error || "Series not found"}</p>
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

  const posterUrl = getImageUrl(series.poster_path, IMAGE_SIZES.poster.original);
  const backdropUrl = getImageUrl(series.backdrop_path, IMAGE_SIZES.backdrop.ultra);
  const hasPoster = series.poster_path !== null && series.poster_path !== undefined;
  const rating = series.vote_average?.toFixed(1) || "N/A";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Returning Series":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Planned":
      case "Announced":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Canceled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return "text-yellow-400";
    if (rating >= 6.0) return "text-yellow-400";
    if (rating >= 4.0) return "text-yellow-400";
    return "text-yellow-400";
  };

  const getProviderLink = (providerName: string) => {
    const searchQuery = encodeURIComponent(series?.name || "");
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

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Navbar transparent={false} />

      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 h-[85vh]">
            <Image
              src={backdropUrl}
              alt={series.name || ""}
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
              <button 
                type="button"
                className="w-64 lg:w-80 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => hasPoster && setShowPosterModal(true)}
              >
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={series.name || ""}
                    width={320}
                    height={480}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-80 h-[480px] bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex-1 max-w-3xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  {series.name || "Untitled"}
                </h1>
              </div>

              {series.tagline && (
                <p className="text-gray-400 italic text-xl mb-6">&quot;{series.tagline}&quot;</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg className={`w-6 h-6 ${getRatingColor(parseFloat(rating))}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className={`text-xl font-bold ${getRatingColor(parseFloat(rating))}`}>{rating}</span>
                  <span className="text-gray-400 text-sm">({series.vote_count?.toLocaleString()} votes)</span>
                </div>

                {series.status && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(series.status)}`}>
                    {series.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-300">
                {series.first_air_date && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(series.first_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}

                {series.number_of_seasons > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{series.number_of_seasons} {series.number_of_seasons === 1 ? "season" : "seasons"}</span>
                  </div>
                )}

                {series.number_of_episodes > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{series.number_of_episodes} episodes</span>
                  </div>
                )}
              </div>

              {series.genres && series.genres.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {series.genres.map((genre) => (
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

              {series.overview && (
                <div className="mb-10">
                  <h3 className="text-white text-2xl font-semibold mb-4">Synopsis</h3>
                  <p 
                    ref={overviewRef}
                    className={`text-gray-300 text-lg leading-relaxed ${!showFullOverview && "line-clamp-4"}`}
                  >
                    {series.overview}
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

          {series.seasons && series.seasons.length > 0 && (
            <div className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
              <h3 className="text-white text-2xl font-semibold mb-6">Episodes</h3>
              
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {series.seasons
                  .filter(s => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`flex-shrink-0 px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedSeason === season.season_number
                          ? "bg-red-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
              </div>

              {loadingEpisodes ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    {seasonDetails && (
                      <div className="sticky top-24 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
                        {seasonDetails.poster_path ? (
                          <div 
                            className="relative w-full aspect-[2/3] mb-4 rounded-xl overflow-hidden cursor-pointer"
                            onClick={() => setShowSeasonPosterModal(true)}
                          >
                            <Image
                              src={getImageUrl(seasonDetails.poster_path, IMAGE_SIZES.poster.large) || ""}
                              alt={seasonDetails.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
                            <span className="text-gray-500">No poster</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white text-xl font-bold">{seasonDetails.name}</h4>
                          {seasonDetails.vote_average > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-yellow-400 font-bold text-sm">{seasonDetails.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {seasonDetails.episodes?.length} episodes
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {seasonDetails.air_date?.split("-")[0]}
                          </span>
                        </div>
                        
                        {seasonDetails.overview && (
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {seasonDetails.overview.length > 200 && !showFullSeasonOverview 
                              ? `${seasonDetails.overview.slice(0, 200)}...`
                              : seasonDetails.overview
                            }
                          </p>
                        )}
                        {seasonDetails.overview && seasonDetails.overview.length > 200 && (
                          <button
                            onClick={() => setShowFullSeasonOverview(!showFullSeasonOverview)}
                            className="text-red-500 hover:text-red-400 text-sm font-medium mt-2 transition-colors"
                          >
                            {showFullSeasonOverview ? "Show less" : "Read more"}
                          </button>
                        )}
                        <button
                          onClick={() => setShowSeasonModal(true)}
                          className="w-full mt-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View Season Details
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-2 space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                    {seasonEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        onClick={() => setSelectedEpisode(episode)}
                        className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20 ${
                          selectedEpisode?.id === episode.id
                            ? "border-red-500 bg-gradient-to-br from-red-500/15 to-gray-900/80"
                            : "border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-900/40 hover:border-red-500/50"
                        }`}
                      >
                        <div className="flex gap-5 p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (episode.still_path) {
                                setSelectedStillImage(episode.still_path);
                                setShowStillModal(true);
                              }
                            }}
                            className="flex-shrink-0 w-52 h-32 relative rounded-xl overflow-hidden shadow-lg group/image cursor-pointer hover:ring-2 hover:ring-red-500 transition-all duration-300"
                          >
                            {episode.still_path ? (
                              <Image
                                src={getImageUrl(episode.still_path, IMAGE_SIZES.backdrop.medium) || ""}
                                alt={episode.name || ""}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                              <span className="text-red-500 font-bold text-sm">EP {episode.episode_number}</span>
                            </div>
                          </button>
                          
                          <div className="flex-1 flex flex-col justify-between py-2 min-w-0">
                            <div className="space-y-2">
                              <h4 className="text-white text-lg font-bold truncate group-hover:text-red-400 transition-colors">{episode.name}</h4>
                              {episode.overview && (
                                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{episode.overview}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-5 text-sm">
                                <span className="flex items-center gap-1.5 text-gray-400">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">{episode.air_date?.split("-")[0]}</span>
                                </span>
                                {episode.runtime && (
                                  <span className="flex items-center gap-1.5 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">{episode.runtime} min</span>
                                  </span>
                                )}
                                {episode.vote_average > 0 && (
                                  <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-bold">{episode.vote_average.toFixed(1)}</span>
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEpisode(episode);
                                  setShowEpisodeModal(true);
                                }}
                                className="group/btn px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-600/30 hover:shadow-red-500/50 hover:scale-105"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                More Info
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <div key={`${member.id}-${member.job}-${idx}`} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 hover:border-red-500/50 transition-all duration-300">
                      {member.profile_path ? (
                        <div className="relative w-16 h-16 mb-3 mx-auto">
                          <Image
                            src={getImageUrl(member.profile_path, IMAGE_SIZES.profile.medium) || ""}
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
                      <p className="text-red-400 text-xs text-center truncate">{member.job}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
              <h3 className="text-white text-2xl font-semibold mb-6">Recommended Series</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendations.slice(0, 10).map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/series/${rec.id}`}
                    className="group"
                  >
                    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                      {rec.poster_path ? (
                        <div className="relative aspect-[2/3]">
                          <Image
                            src={getImageUrl(rec.poster_path, IMAGE_SIZES.poster.medium) || ""}
                            alt={rec.name || ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[2/3] bg-gray-800" />
                      )}
                      <div className="p-3">
                        <p className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">
                          {rec.name}
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
      </div>

      {showPosterModal && hasPoster && (
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
              src={posterUrl || ""}
              alt={series.name || ""}
              width={600}
              height={900}
              className="max-h-[90vh] w-auto rounded-lg"
              quality={100}
            />
          </div>
        </div>
      )}

      {showTrailerModal && (() => {
          const seasonTrailer = seasonVideos.find(
            (v) => v.type === "Trailer" && v.site === "YouTube"
          );
          const activeTrailer = seasonTrailer || trailer;

          if (!activeTrailer) return null;

          return (
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
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
                  src={`https://www.youtube.com/embed/${activeTrailer.key}?autoplay=1&vq=hd1080`}
                  title={activeTrailer.name}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        })()}

      {showSeasonPosterModal && seasonDetails?.poster_path && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowSeasonPosterModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowSeasonPosterModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={getImageUrl(seasonDetails.poster_path, IMAGE_SIZES.poster.large) || ""}
              alt={seasonDetails.name || ""}
              width={500}
              height={750}
              className="max-h-[90vh] w-auto rounded-lg"
              quality={100}
            />
          </div>
        </div>
      )}

      {showSeasonModal && seasonDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowSeasonModal(false)}
        >
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSeasonModal(false)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2 bg-black/50 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-64 md:h-80">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => setShowSeasonPosterModal(true)}
              >
                {seasonDetails.poster_path ? (
                  <Image
                    src={getImageUrl(seasonDetails.poster_path, IMAGE_SIZES.backdrop.ultra) || ""}
                    alt={seasonDetails.name || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{seasonDetails.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  {seasonDetails.air_date && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {seasonDetails.air_date.split("-")[0]}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {seasonDetails.episodes?.length} episodes
                  </span>
                  {seasonDetails.vote_average > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400 font-bold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {seasonDetails.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {(() => {
              const seasonTrailer = seasonVideos.find(
                (v) => v.type === "Trailer" && v.site === "YouTube"
              );
              const seasonTrailerUrl = seasonTrailer ? `https://www.youtube.com/watch?v=${seasonTrailer.key}` : null;

              return seasonTrailerUrl ? (
                <div className="pt-4 pb-6 pl-6 md:pl-8">
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="group relative flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:bg-red-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                  >
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    WATCH TRAILER
                  </button>
                </div>
              ) : null;
            })()}

            <div className="p-6 md:p-8">
              {seasonDetails.overview && (
                <div className="mb-8">
                  <h3 className="text-white text-xl font-semibold mb-3">Overview</h3>
                  <p className="text-gray-300 leading-relaxed">{seasonDetails.overview}</p>
                </div>
              )}

              {seasonCast.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white text-xl font-semibold mb-4">Season Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {seasonCast.slice(0, 8).map((actor) => (
                      <div key={actor.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                        {actor.profile_path ? (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                            <Image
                              src={getImageUrl(actor.profile_path, IMAGE_SIZES.profile.medium) || ""}
                              alt={actor.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{actor.name}</p>
                          {actor.roles?.[0]?.character && (
                            <p className="text-gray-500 text-xs truncate">{actor.roles[0].character}</p>
                          )}
                          <p className="text-red-400 text-xs">{actor.total_episode_count} episodes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {seasonCrew.length > 0 && (
                <div>
                  <h3 className="text-white text-xl font-semibold mb-4">Season Crew</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {seasonCrew.slice(0, 8).map((member, idx) => (
                      <div key={`${member.id}-${member.job}-${idx}`} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                        {member.profile_path ? (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                            <Image
                              src={getImageUrl(member.profile_path, IMAGE_SIZES.profile.medium) || ""}
                              alt={member.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{member.name}</p>
                          <p className="text-red-400 text-xs truncate">{member.job}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={getImageUrl(selectedImage, IMAGE_SIZES.backdrop.original) || ""}
              alt="Episode still"
              width={1920}
              height={1080}
              className="max-h-[90vh] w-auto rounded-lg"
              quality={100}
            />
          </div>
        </div>
      )}

      {showEpisodeTrailerModal && episodeVideos.length > 0 && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setShowEpisodeTrailerModal(false)}
        >
          <div className="relative w-full max-w-6xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowEpisodeTrailerModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${episodeVideos[0].key}?autoplay=1&vq=hd1080`}
              title={episodeVideos[0].name}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {showEpisodeModal && selectedEpisode && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowEpisodeModal(false)}
        >
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEpisodeModal(false)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2 bg-black/50 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-64 md:h-80">
              {selectedEpisode.still_path ? (
                <Image
                  src={getImageUrl(selectedEpisode.still_path, IMAGE_SIZES.backdrop.ultra) || ""}
                  alt={selectedEpisode.name || ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg">EP {selectedEpisode.episode_number}</span>
                  {selectedEpisode.vote_average > 0 && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-yellow-400 font-bold text-sm">{selectedEpisode.vote_average.toFixed(1)}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedEpisode.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  {selectedEpisode.air_date && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedEpisode.air_date}
                    </span>
                  )}
                  {selectedEpisode.runtime && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectedEpisode.runtime} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {selectedEpisode.overview && (
                <div className="mb-8">
                  <h3 className="text-white text-xl font-semibold mb-3">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedEpisode.overview}</p>
                </div>
              )}

              {episodeVideos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white text-xl font-semibold mb-4">Videos ({episodeVideos.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {episodeVideos.slice(0, 6).map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          const tempVideo = video;
                          setEpisodeVideos(prev => [tempVideo, ...prev.filter(v => v.id !== video.id)]);
                          setShowEpisodeTrailerModal(true);
                        }}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-gray-800"
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${video.key}/maxresdefault.jpg`}
                          alt={video.name || ""}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-white text-xs font-medium truncate">{video.name}</p>
                          <p className="text-gray-400 text-xs">{video.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {episodeImages.length > 0 && (
                <div>
                  <h3 className="text-white text-xl font-semibold mb-4">Images ({episodeImages.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {episodeImages.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedImage(image.file_path);
                          setShowImageModal(true);
                        }}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-gray-800"
                      >
                        <Image
                          src={getImageUrl(image.file_path, IMAGE_SIZES.backdrop.large) || ""}
                          alt={`Still ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showStillModal && selectedStillImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setShowStillModal(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setShowStillModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={getImageUrl(selectedStillImage, IMAGE_SIZES.backdrop.original) || ""}
              alt="Episode still"
              width={1920}
              height={1080}
              className="max-h-[90vh] w-auto rounded-lg"
              quality={100}
            />
          </div>
        </div>
      )}
    </div>
  );
}