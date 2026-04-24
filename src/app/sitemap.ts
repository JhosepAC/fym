import { MetadataRoute } from "next";
import { apiClient } from "@/lib/api";

const BASE_URL = "https://fym.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/series`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  try {
    const [trendingMovies, trendingTv] = await Promise.all([
      apiClient.getTrending("movie"),
      apiClient.getTrending("tv"),
    ]);

    const movieUrls = (trendingMovies.results || []).slice(0, 20).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: new Date(movie.release_date ? new Date(movie.release_date) : new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const tvUrls = (trendingTv.results || []).slice(0, 20).map((show) => ({
      url: `${BASE_URL}/series/${show.id}`,
      lastModified: new Date(show.first_air_date ? new Date(show.first_air_date) : new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...movieUrls, ...tvUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}