import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getMovie,
  saveMovieFeatures,
} from "@/lib/db";

import {
  extractMovieFeatures,
} from "@/lib/movie/features";

import type {
  CinegeistMovie,
} from "@/lib/movie/types";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const tmdbId = Number(
      body.tmdbId
    );

    if (
      !Number.isInteger(tmdbId) ||
      tmdbId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid TMDB movie ID",
        },
        {
          status: 400,
        }
      );
    }

    const storedMovie =
      getMovie(tmdbId);

    if (!storedMovie) {
      return NextResponse.json(
        {
          error:
            "Movie is not cached yet",
        },
        {
          status: 404,
        }
      );
    }

    const movie =
      JSON.parse(
        storedMovie.normalized_json
      ) as CinegeistMovie;

    const features =
      extractMovieFeatures(movie);

    saveMovieFeatures(
      tmdbId,
      features
    );

    return NextResponse.json({
      success: true,
      tmdbId,
      title: movie.title,
      features,
    });
  } catch (error) {
    console.error(
      "Feature extraction failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not extract movie features",
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