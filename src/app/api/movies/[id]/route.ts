import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "TMDB API token is missing" },
      { status: 500 }
    );
  }

  const { id } = await context.params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid TMDB movie ID" },
      { status: 400 }
    );
  }

  try {
    const url = new URL(
      `https://api.themoviedb.org/3/movie/${id}`
    );

    url.searchParams.set(
      "append_to_response",
      "credits,keywords"
    );

    url.searchParams.set("language", "en-US");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "TMDB request failed",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const movie = await response.json();

    return NextResponse.json(movie);
  } catch (error) {
    console.error("TMDB movie details error:", error);

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