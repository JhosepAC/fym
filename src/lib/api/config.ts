export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  LANGUAGE: "en-US",
} as const;

export const IMAGE_SIZES = {
  poster: {
    small: "w185",
    medium: "w342",
    large: "w500",
    original: "original",
  },
  backdrop: {
    small: "w300",
    medium: "w780",
    large: "w1280",
    ultra: "original",
    original: "original",
  },
  profile: {
    small: "w45",
    medium: "w185",
    large: "h632",
    original: "original",
  },
} as const;

export const ENDPOINTS = {
  trending: "/trending/all/week",
  movie: {
    popular: "/movie/popular",
    topRated: "/movie/top_rated",
    upcoming: "/movie/upcoming",
    nowPlaying: "/movie/now_playing",
    details: (id: number) => `/movie/${id}`,
    similar: (id: number) => `/movie/${id}/similar`,
    recommendations: (id: number) => `/movie/${id}/recommendations`,
    credits: (id: number) => `/movie/${id}/credits`,
    watchProviders: (id: number) => `/movie/${id}/watch/providers`,
    videos: (id: number) => `/movie/${id}/videos`,
  },
  tv: {
    popular: "/tv/popular",
    topRated: "/tv/top_rated",
    onTheAir: "/tv/on_the_air",
    details: (id: number) => `/tv/${id}`,
    similar: (id: number) => `/tv/${id}/similar`,
    recommendations: (id: number) => `/tv/${id}/recommendations`,
    credits: (id: number) => `/tv/${id}/credits`,
    seasonDetails: (id: number, season: number) => `/tv/${id}/season/${season}`,
    seasonAggregateCredits: (id: number, season: number) => `/tv/${id}/season/${season}/aggregate_credits`,
    videos: (id: number) => `/tv/${id}/videos`,
  },
  search: {
    multi: "/search/multi",
    movie: "/search/movie",
    tv: "/search/tv",
  },
  collection: {
    details: (id: number) => `/collection/${id}`,
  },
} as const;
