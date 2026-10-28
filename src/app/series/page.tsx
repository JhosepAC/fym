import Catalog from "@/components/Catalog";
import { serverApiClient as apiClient } from "@/lib/api/server";
export const metadata = { title: "Series" };
export const revalidate = 3600;
export default async function SeriesPage() {
  const [popular, trending, topRated, upcoming] = await Promise.all([
    apiClient.getTvPopular(),
    apiClient.getTrending("tv"),
    apiClient.getTvTopRated(),
    apiClient.getTvOnTheAir(),
  ]);
  return (
    <Catalog
      kind="tv"
      initialData={{ popular, trending, topRated, upcoming }}
    />
  );
}
