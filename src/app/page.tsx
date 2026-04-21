import Navbar from "@/components/Navbar";
import HeroBannerWrapper from "@/components/HeroBannerWrapper";
import MovieRow from "@/components/MovieRow";
import { apiClient } from "@/lib/api";


async function getData() {
  const [trending, popular, topRated] = await Promise.all([
    apiClient.getTrending("movie"),
    apiClient.getMoviePopular(),
    apiClient.getMovieTopRated(),
  ]);

  return { trending, popular, topRated };
}

export default async function Home() {
  const { trending, popular, topRated } = await getData();

  const heroMovies = trending.results.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <Navbar />
      <main>
        <HeroBannerWrapper items={heroMovies} />
        
        <div className="relative z-30 mt-0">
          <MovieRow title="Trending Now" items={trending.results.slice(1, 15)} autoScrollInterval={3000} />
          <MovieRow title="Popular Movies" items={popular.results.slice(0, 15)} autoScrollInterval={5000} />
          <MovieRow title="Top Rated" items={topRated.results.slice(0, 15)} autoScrollInterval={8000} />
        </div>
      </main>
    </div>
  );
}