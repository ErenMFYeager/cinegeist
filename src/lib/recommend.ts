import type { CinegeistMovie } from "@/lib/movie/types";
import type { StoredRating } from "@/lib/db";

type ScoredMovie = {
  movie: CinegeistMovie;

  score: number;

  matchedGenres: string[];
  matchedKeywords: string[];

  positiveEvidence: string[];
  negativeEvidence: string[];
};

type FeatureStats = {
  documentFrequency: Map<string, number>;
  totalMovies: number;
};

function normalizeFeature(
  value: string
): string {
  return value.trim().toLowerCase();
}

function calculateIdf(
  documentFrequency: number,
  totalMovies: number
): number {
  /*
   * IDF:
   *
   * Common feature:
   *   low score
   *
   * Rare feature:
   *   high score
   *
   * +1 smoothing prevents division by zero.
   */
  return Math.log(
    (totalMovies + 1) /
      (documentFrequency + 1)
  ) + 1;
}

function buildFeatureStats(
  movies: CinegeistMovie[]
): FeatureStats {
  const documentFrequency =
    new Map<string, number>();

  for (const movie of movies) {
    const features = new Set<string>();

    for (const genre of movie.genres) {
      features.add(
        `genre:${normalizeFeature(genre)}`
      );
    }

    for (const keyword of movie.keywords) {
      features.add(
        `keyword:${normalizeFeature(keyword)}`
      );
    }

    for (const feature of features) {
      documentFrequency.set(
        feature,
        (documentFrequency.get(feature) ?? 0) + 1
      );
    }
  }

  return {
    documentFrequency,
    totalMovies: movies.length,
  };
}

function getFeatureWeight(
  feature: string,
  stats: FeatureStats
): number {
  const documentFrequency =
    stats.documentFrequency.get(feature) ?? 0;

  return calculateIdf(
    documentFrequency,
    stats.totalMovies
  );
}

function buildTasteProfile(
  ratedMovies: CinegeistMovie[],
  ratings: StoredRating[],
  stats: FeatureStats
) {
  const ratingMap = new Map(
    ratings.map((rating) => [
      rating.tmdb_id,
      rating.rating,
    ])
  );

  /*
   * For every feature we accumulate:
   *
   *   how strongly the user liked/disliked
   *   movies containing that feature
   *
   * We also track how many movies gave us
   * evidence for that feature.
   */
  const profile = new Map<
    string,
    {
      totalPreference: number;
      evidenceCount: number;
    }
  >();

  for (const movie of ratedMovies) {
    const rating =
      ratingMap.get(movie.tmdbId);

    if (rating === undefined) {
      continue;
    }

    /*
     * Center ratings around 3:
     *
     * 5 → +2
     * 4 → +1
     * 3 →  0
     * 2 → -1
     * 1 → -2
     */
    const preference =
      rating - 3;

    if (preference === 0) {
      continue;
    }

    const features = new Set<string>();

    for (const genre of movie.genres) {
      features.add(
        `genre:${normalizeFeature(genre)}`
      );
    }

    for (const keyword of movie.keywords) {
      features.add(
        `keyword:${normalizeFeature(keyword)}`
      );
    }

    for (const feature of features) {
      const existing =
        profile.get(feature) ?? {
          totalPreference: 0,
          evidenceCount: 0,
        };

      /*
       * Keywords are more specific than genres,
       * so give them a little more influence.
       */
      const typeWeight =
        feature.startsWith("keyword:")
          ? 1.5
          : 1;

      existing.totalPreference +=
        preference * typeWeight;

      existing.evidenceCount += 1;

      profile.set(
        feature,
        existing
      );
    }
  }

  return profile;
}

export function recommendMovies(
  movies: CinegeistMovie[],
  ratings: StoredRating[],
  limit = 10
): ScoredMovie[] {
  const ratingMap = new Map(
    ratings.map((rating) => [
      rating.tmdb_id,
      rating.rating,
    ])
  );

  const ratedMovies =
    movies.filter((movie) =>
      ratingMap.has(movie.tmdbId)
    );

  const candidates =
    movies.filter(
      (movie) =>
        !ratingMap.has(movie.tmdbId)
    );

  if (
    ratedMovies.length === 0 ||
    candidates.length === 0
  ) {
    return [];
  }

  /*
   * Learn how rare each genre/keyword is
   * across our current movie universe.
   */
  const stats =
    buildFeatureStats(movies);

  /*
   * Build a representation of the user's
   * current taste.
   */
  const tasteProfile =
    buildTasteProfile(
      ratedMovies,
      ratings,
      stats
    );

  const results: ScoredMovie[] = [];

  for (const candidate of candidates) {
    let score = 0;

    const matchedGenres: string[] = [];
    const matchedKeywords: string[] = [];

    const positiveEvidence: string[] = [];
    const negativeEvidence: string[] = [];

    const candidateFeatures =
      new Set<string>();

    for (const genre of candidate.genres) {
      candidateFeatures.add(
        `genre:${normalizeFeature(genre)}`
      );
    }

    for (const keyword of candidate.keywords) {
      candidateFeatures.add(
        `keyword:${normalizeFeature(keyword)}`
      );
    }

    for (const feature of candidateFeatures) {
      const preference =
        tasteProfile.get(feature);

      if (!preference) {
        continue;
      }

      /*
       * How informative is this feature?
       *
       * Rare feature → larger contribution.
       * Common feature → smaller contribution.
       */
      const rarityWeight =
        getFeatureWeight(
          feature,
          stats
        );

      /*
       * Prevent one extremely rare feature
       * from completely dominating everything.
       */
      const cappedRarity =
        Math.min(
          rarityWeight,
          3
        );

      const evidenceStrength =
        preference.totalPreference /
        Math.sqrt(
          preference.evidenceCount
        );

      const contribution =
        evidenceStrength *
        cappedRarity;

      score += contribution;

      const rawFeature =
        feature
          .replace(
            /^genre:/,
            ""
          )
          .replace(
            /^keyword:/,
            ""
          );

      const displayFeature =
        rawFeature;

      if (
        feature.startsWith("genre:")
      ) {
        matchedGenres.push(
          displayFeature
        );
      } else {
        matchedKeywords.push(
          displayFeature
        );
      }

      if (contribution > 0) {
        positiveEvidence.push(
          displayFeature
        );
      } else if (contribution < 0) {
        negativeEvidence.push(
          displayFeature
        );
      }
    }

    results.push({
      movie: candidate,

      score: Number(
        score.toFixed(3)
      ),

      matchedGenres,
      matchedKeywords,

      positiveEvidence,
      negativeEvidence,
    });
  }

  return results
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);
}