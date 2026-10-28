import Catalog from "@/components/Catalog";
import { serverApiClient as apiClient } from "@/lib/api/server";
export const metadata = { title: "Películas" };
export const revalidate = 3600;
export default async function MoviesPage() {
  const [popular, trending, topRated, upcoming] = await Promise.all([
    apiClient.getMoviePopular(),
    apiClient.getTrending("movie"),
    apiClient.getMovieTopRated(),
    apiClient.getMovieUpcoming(),
  ]);
  return (
    <Catalog
      kind="movie"
      initialData={{ popular, trending, topRated, upcoming }}
    />
  );
}
