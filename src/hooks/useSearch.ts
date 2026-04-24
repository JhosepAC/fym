"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { MediaItem } from "@/lib/api/client";
import { useDebounce } from "@/hooks/useDebounce";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 500);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.searchMulti(searchQuery);
      setResults(response.results.filter((item) => item.media_type !== "person"));
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  };
}
