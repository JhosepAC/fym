"use client";

import MovieCard from "./MovieCard";
import { MediaItem } from "@/lib/api/client";

interface MovieRowProps {
  title: string;
  items: MediaItem[];
}

export default function MovieRow({ title, items }: MovieRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-8 pb-8">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
