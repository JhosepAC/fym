"use client";

import { useState } from "react";
import HeroBanner from "./HeroBanner";
import { MediaItem } from "@/lib/api/client";

export default function HeroBannerWrapper({ items }: { items: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <HeroBanner 
      items={items} 
      currentIndex={currentIndex} 
      onIndexChange={setCurrentIndex} 
    />
  );
}