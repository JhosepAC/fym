import { NextRequest, NextResponse } from "next/server";
import { validatePreferences } from "@/lib/decision";
import { createSelection } from "@/lib/decision-server";
export async function POST(request: NextRequest) {
  if (Number(request.headers.get("content-length") || 0) > 8192)
    return NextResponse.json(
      { error: "Las preferencias son demasiado extensas." },
      { status: 413 },
    );
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 8192)
      return NextResponse.json(
        { error: "Las preferencias son demasiado extensas." },
        { status: 413 },
      );
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron leer las preferencias." },
      { status: 400 },
    );
  }
  const preferences = validatePreferences(body);
  if (!preferences.ok)
    return NextResponse.json({ error: preferences.error }, { status: 400 });
  try {
    return NextResponse.json(await createSelection(preferences.value), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "No pudimos preparar tu selección. Vuelve a intentarlo en unos segundos.",
      },
      { status: 503 },
    );
  }
}
