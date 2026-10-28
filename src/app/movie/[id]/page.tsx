import { Suspense } from "react";
import MediaDetails from "@/components/MediaDetails";
export const metadata = { title: "Ficha de película" };
export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <MediaDetails
        key={(await params).id}
        id={Number((await params).id)}
        kind="movie"
      />
    </Suspense>
  );
}
