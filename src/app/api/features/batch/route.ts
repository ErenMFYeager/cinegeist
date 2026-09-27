import { NextRequest, NextResponse } from "next/server";
import { getAllMovies, getAllRatings, saveMovieFeatures } from "@/lib/db";
import { extractMovieFeatures } from "@/lib/movie/features";
import type { CinegeistMovie } from "@/lib/movie/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const ratedOnly = body.ratedOnly === true;

    const movies = getAllMovies();

    let targetMovies = movies;

    if (ratedOnly) {
      const ratings = getAllRatings();
      const ratedIds = new Set(ratings.map((rating) => rating.tmdb_id));

      targetMovies = movies.filter((movie) => ratedIds.has(movie.tmdb_id));
    }

    let processed = 0;
    let failed = 0;

    const errors: Array<{
      tmdbId: number;
      error: string;
    }> = [];

    for (const row of targetMovies) {
      try {
        const movie = JSON.parse(row.normalized_json) as CinegeistMovie;

        const features = extractMovieFeatures(movie);

        saveMovieFeatures(movie.tmdbId, features);

        processed++;
      } catch (error) {
        failed++;

        errors.push({
          tmdbId: row.tmdb_id,
          error:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      ratedOnly,
      totalFound: targetMovies.length,
      processed,
      failed,
      errors,
    });
  } catch (error) {
    console.error("Batch feature extraction failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract movie features",
      },
      { status: 500 }
    );
  }
}