import { NextRequest, NextResponse } from "next/server";
import { getOrFetchMovie } from "@/lib/movie/cache";

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
      {
        error: "Invalid TMDB movie ID",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const movie = await getOrFetchMovie(
      Number(id)
    );

    return NextResponse.json(movie);
  } catch (error) {
    console.error(
      "TMDB movie details error:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not fetch movie details",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 502,
      }
    );
  }
}