import SeriesClient from "./SeriesClient";
import { apiClient } from "@/lib/api";

async function getData() {
  const [trending, popular, topRated, onTheAir] = await Promise.all([
    apiClient.getTrending("tv"),
    apiClient.getTvPopular(),
    apiClient.getTvTopRated(),
    apiClient.getTvOnTheAir(),
  ]);

  return { trending, popular, topRated, onTheAir };
}

async function getPopularSeries(page: number = 1) {
  return apiClient.getTvPopular(page);
}

export const revalidate = 3600;

export default async function SeriesPage() {
  const initialData = await getData();
  const popularSeries = await getPopularSeries(1);
  return <SeriesClient initialData={initialData} popularSeries={popularSeries.results} />;
}