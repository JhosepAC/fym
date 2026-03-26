import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
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
  const { trending, popular, topRated, upcoming } = await getData();

  const heroMovie = trending.results[0];

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <Navbar />
      <main>
        {heroMovie && <HeroBanner item={heroMovie} />}
        
        <div className="relative z-30 -mt-32">
          <MovieRow title="Trending Movies" items={trending.results.slice(1, 15)} autoScrollInterval={3000} />
          <MovieRow title="Popular Movies" items={popular.results.slice(0, 15)} autoScrollInterval={5000} />
          <MovieRow title="Top Rated" items={topRated.results.slice(0, 15)} autoScrollInterval={8000} />
          <MovieRow title="Upcoming" items={upcoming.results.slice(0, 15)} autoScrollInterval={6000} />
        </div>
      </main>
    </div>
  );
}
