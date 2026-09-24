import type {
  CastMember,
  CinegeistMovie,
  Person,
} from "./types";

type TmdbMovie = {
  id: number;
  imdb_id?: string | null;

  title?: string;
  original_title?: string;

  release_date?: string;
  runtime?: number | null;

  overview?: string;
  tagline?: string | null;

  poster_path?: string | null;
  backdrop_path?: string | null;

  genres?: Array<{
    id: number;
    name: string;
  }>;

  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;

  spoken_languages?: Array<{
    iso_639_1: string;
    english_name?: string;
    name: string;
  }>;

  vote_average?: number;
  vote_count?: number;

  keywords?: {
    keywords?: Array<{
      id: number;
      name: string;
    }>;
  };

  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character?: string;
      order?: number;
    }>;

    crew?: Array<{
      id: number;
      name: string;
      department: string;
      job: string;
    }>;
  };
};

function toPerson(person: {
  id: number;
  name: string;
}): Person {
  return {
    tmdbId: person.id,
    name: person.name,
  };
}

export function normalizeMovie(raw: TmdbMovie): CinegeistMovie {
  const crew = raw.credits?.crew ?? [];
  const cast = raw.credits?.cast ?? [];

  // Director
  const directorCrew = crew.find(
    (person) =>
      person.department === "Directing" &&
      person.job === "Director"
  );

  const director = directorCrew
    ? toPerson(directorCrew)
    : null;

  // Writers
  const writerJobs = new Set([
    "Writer",
    "Screenplay",
    "Story",
  ]);

  const writerMap = new Map<number, Person>();

  for (const person of crew) {
    if (writerJobs.has(person.job)) {
      writerMap.set(person.id, toPerson(person));
    }
  }

  const writers = Array.from(writerMap.values());

  // Top cast
  const topCast: CastMember[] = [...cast]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 10)
    .map((person) => ({
      tmdbId: person.id,
      name: person.name,
      character: person.character ?? null,
    }));

  // Keywords
  const keywords =
    raw.keywords?.keywords?.map((keyword) => keyword.name) ?? [];

  // Genres
  const genres =
    raw.genres?.map((genre) => genre.name) ?? [];

  // Production countries
  const countries =
    raw.production_countries?.map(
      (country) => country.name
    ) ?? [];

  // Spoken languages
  const languages =
    raw.spoken_languages?.map(
      (language) =>
        language.english_name ?? language.name
    ) ?? [];

  return {
    tmdbId: raw.id,
    imdbId: raw.imdb_id ?? null,

    title: raw.title ?? "",
    originalTitle: raw.original_title ?? "",

    releaseDate: raw.release_date || null,
    runtime: raw.runtime ?? null,

    overview: raw.overview ?? "",
    tagline: raw.tagline ?? null,

    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,

    genres,

    countries,
    languages,

    keywords,

    director,
    writers,
    cast: topCast,

    rating: raw.vote_average ?? 0,
    voteCount: raw.vote_count ?? 0,
  };
}