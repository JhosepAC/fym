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

export default async function MoviesPage() {
  const initialData = await getData();
  return <MoviesClient initialData={initialData} />;
}