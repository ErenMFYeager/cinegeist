import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";
import { normalizeMovie } from "@/lib/movie/normalize";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid TMDB movie ID" },
      { status: 400 }
    );
  }

  try {
    const rawMovie = await getMovieDetails(id);

    const movie = normalizeMovie(rawMovie);

    return NextResponse.json(movie);
  } catch (error) {
    console.error("TMDB movie details error:", error);

    return NextResponse.json(
      {
        error: "Could not fetch movie details",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 502 }
    );
  }
}