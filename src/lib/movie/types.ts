export type Person = {
  tmdbId: number;
  name: string;
};

export type CastMember = Person & {
  character: string | null;
};

export type CinegeistMovie = {
  tmdbId: number;
  imdbId: string | null;

  title: string;
  originalTitle: string;

  releaseDate: string | null;
  runtime: number | null;

  overview: string;
  tagline: string | null;

  posterPath: string | null;
  backdropPath: string | null;

  genres: string[];

  countries: string[];
  languages: string[];

  keywords: string[];

  director: Person | null;
  writers: Person[];
  cast: CastMember[];

  rating: number;
  voteCount: number;
};