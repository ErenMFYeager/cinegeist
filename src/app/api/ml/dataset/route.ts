import { NextResponse } from "next/server";
import {
  getAllMovies,
  getAllRatings,
  getMovieFeatures,
} from "@/lib/db";
import type { MovieFeatures } from "@/lib/movie/types";

function flattenFeatures(features: MovieFeatures) {
  const result: Record<string, number> = {};

  const categories = [
    "tone",
    "mood",
    "narrative",
    "style",
    "emotional",
    "psychological",
    "horror",
  ] as const;

  for (const category of categories) {
    const group = features[category];

    for (const [feature, data] of Object.entries(group)) {
      result[`${category}_${feature}`] = data.value;
    }
  }

  const intensityFeatures = [
    "violence",
    "suspense",
    "emotional",
    "psychological",
  ] as const;

  for (const feature of intensityFeatures) {
    result[`intensity_${feature}`] =
      features.intensity[feature].value;
  }

  return result;
}

export async function GET() {
  try {
    const movies = getAllMovies();
    const ratings = getAllRatings();

    const ratingMap = new Map(
      ratings.map((rating) => [rating.tmdb_id, rating.rating])
    );

    const dataset = [];

    for (const movie of movies) {
      const rating = ratingMap.get(movie.tmdb_id);

      // Only rated movies belong to our supervised dataset.
      if (rating === undefined) {
        continue;
      }

      const featureRow = getMovieFeatures(movie.tmdb_id);

      if (!featureRow) {
        continue;
      }

      const features = JSON.parse(
        featureRow.features_json
      ) as MovieFeatures;

      dataset.push({
        tmdbId: movie.tmdb_id,
        title: movie.title,
        rating,
        features: flattenFeatures(features),
      });
    }

    return NextResponse.json({
      success: true,

      /*
       * Number of training examples.
       */
      samples: dataset.length,

      /*
       * Names of all numerical features.
       */
      featureNames:
        dataset.length > 0
          ? Object.keys(dataset[0].features)
          : [],

      dataset,
    });
  } catch (error) {
    console.error("Failed to build ML dataset:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to build ML dataset",
      },
      { status: 500 }
    );
  }
}