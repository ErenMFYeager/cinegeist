import {
  getMovie,
  saveMovie,
} from "@/lib/db";

import {
  getMovieDetails,
} from "@/lib/tmdb";

import {
  normalizeMovie,
} from "./normalize";

import type {
  CinegeistMovie,
} from "./types";

export async function getOrFetchMovie(
  tmdbId: number
): Promise<CinegeistMovie> {
  const cachedMovie = getMovie(tmdbId);

  if (cachedMovie) {
    return JSON.parse(
      cachedMovie.normalized_json
    ) as CinegeistMovie;
  }

  const rawMovie = await getMovieDetails(
    String(tmdbId)
  );

  const movie = normalizeMovie(rawMovie);

  saveMovie(
    movie.tmdbId,
    movie.title,
    movie,
    rawMovie
  );

  return movie;
}