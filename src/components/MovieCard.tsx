"use client";
import Link from "next/link";
import type { MediaItem } from "@/lib/api";
import { mediaHref, mediaTitle, mediaType, mediaYear } from "@/lib/media";
import MediaImage from "./MediaImage";
import { SaveButton } from "./LibraryProvider";
import Icon from "./Icon";
export default function MovieCard({
  item,
}: {
  item: MediaItem;
  size?: "normal" | "large";
}) {
  const title = mediaTitle(item);
  return (
    <article className="movie-card">
      <div className="poster-wrap">
        <Link href={mediaHref(item)} aria-label={`Ver ficha de ${title}`}>
          <MediaImage path={item.poster_path} alt={`Cartel de ${title}`} />
          <span className="poster-view">
            <Icon name="arrow" />
          </span>
        </Link>
        <SaveButton item={item} compact />
      </div>
      <div className="card-rating">
        <span>
          {mediaYear(item) || "Sin fecha"}
          <span className="meta-dot" />
          {mediaType(item) === "tv" ? "Serie" : "Película"}
        </span>
        <span className="rating">
          <Icon name="star" size={13} />
          {item.vote_count > 0 ? item.vote_average.toFixed(1) : "—"}
        </span>
      </div>
      <h3>
        <Link href={mediaHref(item)}>{title}</Link>
      </h3>
    </article>
  );
}
