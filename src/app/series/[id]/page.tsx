import { Suspense } from "react";
import MediaDetails from "@/components/MediaDetails";
export const metadata = { title: "Ficha de serie" };
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <MediaDetails
        key={(await params).id}
        id={Number((await params).id)}
        kind="tv"
      />
    </Suspense>
  );
}
