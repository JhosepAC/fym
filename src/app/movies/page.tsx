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

async function getAllMovies() {
  const allMovies: Map<number, any> = new Map();
  const totalPages = 20;
  
  for (let page = 1; page <= totalPages; page++) {
    const [popular, topRated, upcoming] = await Promise.all([
      apiClient.getMoviePopular(page),
      apiClient.getMovieTopRated(page),
      apiClient.getMovieUpcoming(page),
    ]);
    
    [...popular.results, ...topRated.results, ...upcoming.results].forEach((movie: any) => {
      if (!allMovies.has(movie.id)) {
        allMovies.set(movie.id, movie);
      }
    });
  }
  
  return Array.from(allMovies.values());
}

export default async function MoviesPage() {
  const [initialData, allMovies] = await Promise.all([getData(), getAllMovies()]);
  return <MoviesClient initialData={initialData} allMovies={allMovies} />;
}