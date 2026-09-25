import { NextRequest, NextResponse } from "next/server";

import {
  getRating,
  getAllRatings,
  saveRating,
} from "@/lib/db";

import {
  getOrFetchMovie,
} from "@/lib/movie/cache";

export async function GET(
  request: NextRequest
) {
  const tmdbId = request.nextUrl.searchParams.get(
    "tmdbId"
  );

  if (tmdbId) {
    if (!/^\d+$/.test(tmdbId)) {
      return NextResponse.json(
        {
          error: "Invalid TMDB movie ID",
        },
        {
          status: 400,
        }
      );
    }

    const rating = getRating(
      Number(tmdbId)
    );

    return NextResponse.json({
      rating: rating ?? null,
    });
  }

  return NextResponse.json({
    ratings: getAllRatings(),
  });
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const tmdbId = Number(body.tmdbId);
    const rating = Number(body.rating);

    if (
      !Number.isInteger(tmdbId) ||
      tmdbId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid TMDB movie ID",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(rating) ||
      rating < 0.5 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 0.5 and 5",
        },
        {
          status: 400,
        }
      );
    }

    const movie = await getOrFetchMovie(
      tmdbId
    );

    saveRating(
      movie.tmdbId,
      rating
    );

    return NextResponse.json({
      success: true,
      movie,
      rating,
    });
  } catch (error) {
    console.error(
      "Rating save error:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not save rating",
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