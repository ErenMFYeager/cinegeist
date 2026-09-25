import { NextResponse } from "next/server";

import {
  getAllMovies,
  getAllRatings,
} from "@/lib/db";

export async function GET() {
  const movies = getAllMovies();
  const ratings = getAllRatings();

  const ratingMap = new Map(
    ratings.map((rating) => [
      rating.tmdb_id,
      rating,
    ])
  );

  const library = movies
    .filter((movie) =>
      ratingMap.has(movie.tmdb_id)
    )
    .map((movie) => {
      const normalized = JSON.parse(
        movie.normalized_json
      );

      const rating =
        ratingMap.get(movie.tmdb_id);

      return {
        tmdbId: movie.tmdb_id,
        title: normalized.title,
        year:
          normalized.releaseDate
            ?.slice(0, 4) ?? null,
        rating: rating?.rating ?? null,
        genres: normalized.genres,
        keywords: normalized.keywords,
      };
    })
    .sort(
      (a, b) =>
        (b.rating ?? 0) -
        (a.rating ?? 0)
    );

  return NextResponse.json({
    library,
  });
}