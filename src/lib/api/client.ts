import { TMDB_CONFIG, ENDPOINTS } from "./config";

class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private language: string;

  constructor() {
    this.baseUrl = TMDB_CONFIG.BASE_URL;
    this.apiKey = TMDB_CONFIG.API_KEY || "";
    this.language = TMDB_CONFIG.LANGUAGE;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append("api_key", this.apiKey);
    url.searchParams.append("language", this.language);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTrending(mediaType: "all" | "movie" | "tv" = "all") {
    const endpoint = mediaType === "all" ? ENDPOINTS.trending : `/trending/${mediaType}/week`;
    return this.fetch<ApiResponse>(endpoint);
  }

  async getMoviePopular(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.movie.popular, { page: String(page) });
  }

  async getMovieTopRated(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.movie.topRated, { page: String(page) });
  }

  async getMovieUpcoming(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.movie.upcoming, { page: String(page) });
  }

  async getMovieNowPlaying(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.movie.nowPlaying, { page: String(page) });
  }

  async getMovieDetails(id: number) {
    return this.fetch<MovieDetail>(ENDPOINTS.movie.details(id));
  }

  async getMovieSimilar(id: number, page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.movie.similar(id), { page: String(page) });
  }

  async getMovieRecommendations(id: number, page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.movie.recommendations(id), { page: String(page) });
  }

  async getMovieCredits(id: number) {
    return this.fetch<CreditsResponse>(ENDPOINTS.movie.credits(id));
  }

  async getMovieWatchProviders(id: number) {
    return this.fetch<WatchProvidersResponse>(ENDPOINTS.movie.watchProviders(id));
  }

  async getTvPopular(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.tv.popular, { page: String(page) });
  }

  async getTvTopRated(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.tv.topRated, { page: String(page) });
  }

  async getTvOnTheAir(page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.tv.onTheAir, { page: String(page) });
  }

  async getTvDetails(id: number) {
    return this.fetch<TvShowDetail>(ENDPOINTS.tv.details(id));
  }

  async getTvRecommendations(id: number, page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.tv.recommendations(id), { page: String(page) });
  }

  async getTvCredits(id: number) {
    return this.fetch<CreditsResponse>(ENDPOINTS.tv.credits(id));
  }

  async getTvSeasonDetails(id: number, seasonNumber: number) {
    return this.fetch<TvSeason>(ENDPOINTS.tv.seasonDetails(id, seasonNumber));
  }

  async getMovieVideos(id: number) {
    return this.fetch<VideosResponse>(ENDPOINTS.movie.videos(id));
  }

  async getTvVideos(id: number) {
    return this.fetch<VideosResponse>(ENDPOINTS.tv.videos(id));
  }

  async getCollectionDetails(id: number) {
    return this.fetch<Collection>(ENDPOINTS.collection.details(id));
  }

  async searchMulti(query: string, page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.search.multi, {
      query,
      page: String(page),
    });
  }

  async searchMovies(query: string, page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.search.movie, {
      query,
      page: String(page),
    });
  }

  async searchTvShows(query: string, page: number = 1) {
    return this.fetch<ApiResponse>(ENDPOINTS.search.tv, {
      query,
      page: String(page),
    });
  }
}

export interface ApiResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export interface MediaItem {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult?: boolean;
  genre_ids?: number[];
}

export interface MovieDetail extends MediaItem {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
}

export interface TvShowDetail extends MediaItem {
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  first_air_date: string;
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
    air_date: string;
  }[];
}

export interface TvSeason {
  id: number;
  name: string;
  overview: string | null;
  season_number: number;
  air_date: string;
  episodes: TvEpisode[];
}

export interface TvEpisode {
  id: number;
  name: string;
  overview: string | null;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  still_path: string | null;
  air_date: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

export interface Cast {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface Collection {
  id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: CollectionPart[];
}

export interface CollectionPart {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface CountryProviders {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProvidersResponse {
  id: number;
  results: Record<string, CountryProviders>;
}

export const getImageUrl = (path: string | null | undefined, size: string = "w500"): string | null => {
  if (!path) return null;
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
};

export const apiClient = new ApiClient();
