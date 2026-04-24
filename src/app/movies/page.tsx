import MoviesClient from "./MoviesClient";
import { apiClient } from "@/lib/api";

async function getData() {
  const [trending, popular, topRated, upcoming] = await Promise.all([
    apiClient.getTrending("movie"),
    apiClient.getMoviePopular(),
    apiClient.getMovieTopRated(),
    apiClient.getMovieUpcoming(),
  ]);

  return { trending, popular, topRated, upcoming };
}

async function getPopularMovies(page: number = 1) {
  return apiClient.getMoviePopular(page);
}

export const revalidate = 3600;

export default async function MoviesPage() {
  const initialData = await getData();
  const popularMovies = await getPopularMovies(1);
  return <MoviesClient initialData={initialData} popularMovies={popularMovies.results} />;
}