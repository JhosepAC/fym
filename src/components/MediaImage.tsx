"use client";
import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/api";
import Icon from "./Icon";
export default function MediaImage({
  path,
  alt,
  sizes = "(max-width: 600px) 45vw, 200px",
  priority = false,
  backdrop = false,
}: {
  path?: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  backdrop?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(path, backdrop ? "w1280" : "w500");
  return url && !failed ? (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className="media-image"
    />
  ) : (
    <div className="image-fallback">
      <Icon name="film" size={28} />
      <span>{alt}</span>
    </div>
  );
}
