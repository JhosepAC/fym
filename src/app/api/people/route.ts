import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/lib/api/server";
import type { PersonOption } from "@/lib/decision";
type PeopleResponse = {
  results: {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department?: string;
    known_for?: { title?: string; name?: string }[];
  }[];
};
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2) return NextResponse.json({ results: [] });
  if (query.length > 100)
    return NextResponse.json(
      { error: "El nombre no puede superar100 caracteres." },
      { status: 400 },
    );
  try {
    const response = await serverApiClient.fetch<PeopleResponse>(
      "/search/person",
      { query, include_adult: "false", page: "1" },
    );
    const results: PersonOption[] = response.results
      .filter((person) => person.known_for_department === "Acting")
      .slice(0, 8)
      .map((person) => ({
        id: person.id,
        name: person.name,
        profile_path: person.profile_path,
        known_for: (person.known_for || [])
          .map((item) => item.title || item.name || "")
          .filter(Boolean)
          .slice(0, 2),
      }));
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo buscar el reparto. Inténtalo de nuevo." },
      { status: 503 },
    );
  }
}
