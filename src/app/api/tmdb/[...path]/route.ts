import { NextRequest, NextResponse } from "next/server";

// Only public, read-only catalog endpoints are exposed to the browser.
const allowed =
  /^(trending\/(all|movie|tv)\/(day|week)|search\/(multi|movie|tv)|discover\/(movie|tv)|movie\/(popular|top_rated|upcoming|now_playing)|tv\/(popular|top_rated|on_the_air)|collection\/\d+|(movie|tv)\/\d+(\/(credits|recommendations|similar|videos|watch\/providers))?|tv\/\d+\/season\/\d+(\/(aggregate_credits|videos|episode\/\d+\/(images|videos)))?)$/;
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join("/");
  if (!allowed.test(path))
    return NextResponse.json({ error: "Ruta no disponible." }, { status: 404 });
  const key = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "El catálogo no está configurado." },
      { status: 503 },
    );
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  for (const [name, value] of request.nextUrl.searchParams)
    if (!["api_key", "access_token"].includes(name))
      url.searchParams.set(name, value);
  url.searchParams.set("api_key", key);
  url.searchParams.set("include_adult", "false");
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok)
      return NextResponse.json(
        { error: "No se pudo consultar el catálogo." },
        { status: response.status === 404 ? 404 : 502 },
      );
    return NextResponse.json(await response.json(), {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "El catálogo no responde. Inténtalo de nuevo." },
      { status: 502 },
    );
  }
}
