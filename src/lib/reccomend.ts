import type {
  CinegeistMovie,
} from "@/lib/movie/types";

import type {
  StoredRating,
} from "@/lib/db";

type ScoredMovie = {
  movie: CinegeistMovie;
  score: number;
  matchedGenres: string[];
  matchedKeywords: string[];
};

function intersection(
  a: string[],
  b: string[]
): string[] {
  const bSet = new Set(
    b.map((value) =>
      value.toLowerCase()
    )
  );

  return a.filter((value) =>
    bSet.has(value.toLowerCase())
  );
}

function movieSimilarity(
  candidate: CinegeistMovie,
  likedMovie: CinegeistMovie
) {
  const matchedGenres = intersection(
    candidate.genres,
    likedMovie.genres
  );

  const matchedKeywords = intersection(
    candidate.keywords,
    likedMovie.keywords
  );

  const genreScore =
    matchedGenres.length * 1;

  const keywordScore =
    matchedKeywords.length * 1.5;

  return {
    score:
      genreScore +
      keywordScore,

    matchedGenres,
    matchedKeywords,
  };
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

  const ratedMovies = movies.filter(
    (movie) =>
      ratingMap.has(movie.tmdbId)
  );

  const candidates = movies.filter(
    (movie) =>
      !ratingMap.has(movie.tmdbId)
  );

  const results: ScoredMovie[] = [];

  for (const candidate of candidates) {
    let totalScore = 0;

    const allMatchedGenres = new Set<string>();
    const allMatchedKeywords =
      new Set<string>();

    for (const ratedMovie of ratedMovies) {
      const userRating =
        ratingMap.get(
          ratedMovie.tmdbId
        ) ?? 0;

      /*
       * Center ratings around 3.
       *
       * 5 stars  → +2
       * 4 stars  → +1
       * 3 stars  →  0
       * 2 stars  → -1
       * 1 star   → -2
       */
      const preferenceWeight =
        userRating - 3;

      if (preferenceWeight === 0) {
        continue;
      }

      const similarity =
        movieSimilarity(
          candidate,
          ratedMovie
        );

      totalScore +=
        similarity.score *
        preferenceWeight;

      for (
        const genre
        of similarity.matchedGenres
      ) {
        allMatchedGenres.add(
          genre
        );
      }

      for (
        const keyword
        of similarity.matchedKeywords
      ) {
        allMatchedKeywords.add(
          keyword
        );
      }
    }

    results.push({
      movie: candidate,
      score: totalScore,
      matchedGenres:
        Array.from(
          allMatchedGenres
        ),
      matchedKeywords:
        Array.from(
          allMatchedKeywords
        ),
    });
  }

  return results
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);
}