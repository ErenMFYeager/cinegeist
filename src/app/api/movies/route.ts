import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "TMDB API token is missing" },
      { status: 500 }
    );
  }

  const response = await fetch(
    "https://api.themoviedb.org/3/movie/550",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "TMDB request failed" },
      { status: response.status }
    );
  }

  const movie = await response.json();

  return NextResponse.json(movie);
}