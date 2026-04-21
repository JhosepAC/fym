import Navbar from "@/components/Navbar";
import HeroBannerWrapper from "@/components/HeroBannerWrapper";
import MovieRow from "@/components/MovieRow";
import { apiClient } from "@/lib/api";

async function getData() {
  const [trending, popular, topRated] = await Promise.all([
    apiClient.getTrending("tv"),
    apiClient.getTvPopular(),
    apiClient.getTvTopRated(),
  ]);

  return { trending, popular, topRated };
}

export default async function SeriesPage() {
  const { trending, popular, topRated } = await getData();

  const heroSeries = trending.results.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <Navbar />
      <main>
        <HeroBannerWrapper items={heroSeries} />
        
        <div className="relative z-30 -mt-32">
          <MovieRow title="Trending Series" items={trending.results.slice(1, 15)} autoScrollInterval={3000} />
          <MovieRow title="Popular Series" items={popular.results.slice(0, 15)} autoScrollInterval={5000} />
          <MovieRow title="Top Rated" items={topRated.results.slice(0, 15)} autoScrollInterval={8000} />
        </div>
      </main>
    </div>
  );
}
