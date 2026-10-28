import CollectionDetails from "@/components/CollectionDetails";
export const metadata = { title: "Colección" };
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CollectionDetails id={Number((await params).id)} />;
}
