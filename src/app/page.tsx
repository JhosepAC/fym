import Navbar from "@/components/Navbar";
import Discovery from "@/components/Discovery";
import { serverApiClient as apiClient } from "@/lib/api/server";
export const revalidate = 3600;
export default async function Home() {
  const [trending, popular, topRated, series] = await Promise.all([
    apiClient.getTrending("movie"),
    apiClient.getMoviePopular(),
    apiClient.getMovieTopRated(),
    apiClient.getTvPopular(),
  ]);
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <Discovery
          trending={trending.results}
          popular={popular.results}
          topRated={topRated.results}
          series={series.results}
        />
      </main>
    </>
  );
}
