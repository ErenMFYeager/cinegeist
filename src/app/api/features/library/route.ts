import { NextResponse } from "next/server";
import {
  getAllMovies,
  getAllRatings,
  getMovieFeatures,
} from "@/lib/db";
import type { MovieFeatures } from "@/lib/movie/types";

type FeatureSummary = {
  category: string;
  feature: string;
  value: number;
  evidence: string[];
};

function flattenFeatures(features: MovieFeatures): FeatureSummary[] {
  const result: FeatureSummary[] = [];

  const categories = [
    "tone",
    "mood",
    "narrative",
    "style",
    "emotional",
  ] as const;

  for (const category of categories) {
    const group = features[category];

    for (const [feature, data] of Object.entries(group)) {
      if (data.value > 0) {
        result.push({
          category,
          feature,
          value: Number(data.value.toFixed(2)),
          evidence: data.evidence,
        });
      }
    }
  }

  const intensityFeatures = [
    "violence",
    "suspense",
    "emotional",
    "psychological",
  ] as const;

  for (const feature of intensityFeatures) {
    const data = features.intensity[feature];

    if (data.value > 0) {
      result.push({
        category: "intensity",
        feature,
        value: Number(data.value.toFixed(2)),
        evidence: data.evidence,
      });
    }
  }

  return result.sort((a, b) => b.value - a.value);
}

export async function GET() {
  try {
    const movies = getAllMovies();
    const ratings = getAllRatings();

    const ratingMap = new Map(
      ratings.map((rating) => [rating.tmdb_id, rating.rating])
    );

    const result = movies
      .filter((movie) => ratingMap.has(movie.tmdb_id))
      .map((movie) => {
        const features = getMovieFeatures(movie.tmdb_id);

        if (!features) {
          return null;
        }

        const parsedFeatures = JSON.parse(
          features.features_json
        ) as MovieFeatures;

        return {
          tmdbId: movie.tmdb_id,
          title: movie.title,
          rating: ratingMap.get(movie.tmdb_id),
          features: flattenFeatures(parsedFeatures),
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        return (b?.rating ?? 0) - (a?.rating ?? 0);
      });

    return NextResponse.json({
      success: true,
      count: result.length,
      movies: result,
    });
  } catch (error) {
    console.error("Failed to inspect movie features:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to inspect movie features",
      },
      { status: 500 }
    );
  }
}