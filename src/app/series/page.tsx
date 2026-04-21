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

export default async function SeriesPage() {
  const initialData = await getData();
  return <SeriesClient initialData={initialData} />;
}