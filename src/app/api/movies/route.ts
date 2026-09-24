import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Please provide a movie search query" },
      { status: 400 }
    );
  }

  try {
    const data = await searchMovies(query.trim());

    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB search error:", error);

    return NextResponse.json(
      {
        error: "Could not connect to TMDB",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 502 }
    );
  }
}