import "server-only";
import { ApiClient } from "./client";
export const serverApiClient = new ApiClient(
  process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "",
);
