"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { apiClient, getImageUrl, IMAGE_SIZES, TMDB_CONFIG } from "@/lib/api";
import { TvShowDetail, Video, MediaItem, Cast, Crew, WatchProvider, TvSeason, TvEpisode } from "@/lib/api/client";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
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
        const seasonData = await apiClient.getTvSeasonDetails(seriesId, selectedSeason);
        setSeasonEpisodes(seasonData.episodes || []);
      } catch (err) {
        console.error("Failed to load episodes");
      } finally {
        setLoadingEpisodes(false);
      }
    }

    fetchSeasonEpisodes();
  }, [seriesId, selectedSeason]);

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
              <div 
                className="w-64 lg:w-80 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => posterUrl && setShowPosterModal(true)}
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
              </div>
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
              
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {series.seasons
                  .filter(s => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedSeason === season.season_number
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {season.name}
                    </button>
                  ))}
              </div>

              {loadingEpisodes ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {seasonEpisodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex gap-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 hover:border-red-500/50 transition-all"
                    >
                      <div className="flex-shrink-0 w-32 h-20 relative rounded-lg overflow-hidden">
                        {episode.still_path ? (
                          <Image
                            src={getImageUrl(episode.still_path, IMAGE_SIZES.backdrop.small) || ""}
                            alt={episode.name || ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-gray-400 text-sm">E{episode.episode_number}</span>
                          <h4 className="text-white font-semibold truncate">{episode.name}</h4>
                        </div>
                        
                        {episode.overview && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-2">{episode.overview}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{episode.air_date}</span>
                          {episode.runtime && <span>{episode.runtime} min</span>}
                          <span className="text-yellow-400 font-medium">★ {episode.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
              alt={series.name || ""}
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