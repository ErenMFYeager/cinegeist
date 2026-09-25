import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAllMovies,
  getAllRatings,
} from "@/lib/db";

import {
  recommendMovies,
} from "@/lib/recommend";

import type {
  CinegeistMovie,
} from "@/lib/movie/types";

export async function GET(
  request: NextRequest
) {
  try {
    const limitParam =
      request.nextUrl.searchParams.get(
        "limit"
      );

    const limit =
      limitParam
        ? Math.min(
            Math.max(
              Number(limitParam),
              1
            ),
            50
          )
        : 10;

    const storedMovies =
      getAllMovies();

    const ratings =
      getAllRatings();

    const movies: CinegeistMovie[] =
      storedMovies.map(
        (movie) =>
          JSON.parse(
            movie.normalized_json
          ) as CinegeistMovie
      );

    if (ratings.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message:
          "Rate some movies first.",
      });
    }

    const recommendations =
      recommendMovies(
        movies,
        ratings,
        limit
      );

    return NextResponse.json({
      recommendations,
      ratedMovieCount:
        ratings.length,
      moviePoolSize:
        movies.length,
    });
  } catch (error) {
    console.error(
      "Recommendation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not generate recommendations",
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