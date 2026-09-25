import { NextResponse } from "next/server";

import { discoverMovies } from "@/lib/tmdb";
import { getOrFetchMovie } from "@/lib/movie/cache";

export async function POST() {
  try {
    const pages = [1, 2, 3, 4, 5];

    let discovered = 0;
    let cached = 0;
    let failed = 0;

    for (const page of pages) {
      const data = await discoverMovies(page);

      const results = data.results ?? [];

      discovered += results.length;

      for (const movie of results) {
        try {
          await getOrFetchMovie(movie.id);
          cached++;
        } catch (error) {
          failed++;

          console.error(
            `Failed to cache movie ${movie.id}:`,
            error
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      discovered,
      cached,
      failed,
    });
  } catch (error) {
    console.error(
      "Candidate seeding failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not seed candidate movies",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}