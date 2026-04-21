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
  },
  tv: {
    popular: "/tv/popular",
    topRated: "/tv/top_rated",
    onTheAir: "/tv/on_the_air",
    details: (id: number) => `/tv/${id}`,
    similar: (id: number) => `/tv/${id}/similar`,
  },
  search: {
    multi: "/search/multi",
    movie: "/search/movie",
    tv: "/search/tv",
  },
} as const;
