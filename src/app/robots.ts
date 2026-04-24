import { MetadataRoute } from "next";

const BASE_URL = "https://fym-jac.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/search?", "/movie/", "/series/", "/collection/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}