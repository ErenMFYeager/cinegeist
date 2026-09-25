import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, "cinegeist.db");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    tmdb_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    normalized_json TEXT NOT NULL,
    raw_json TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    tmdb_id INTEGER PRIMARY KEY,
    rating REAL NOT NULL,
    rated_at INTEGER NOT NULL,

    FOREIGN KEY (tmdb_id)
      REFERENCES movies(tmdb_id)
      ON DELETE CASCADE
  );
`);

export type StoredMovie = {
  tmdb_id: number;
  title: string;
  normalized_json: string;
  raw_json: string;
  fetched_at: number;
};

export type StoredRating = {
  tmdb_id: number;
  rating: number;
  rated_at: number;
};

export function getMovie(tmdbId: number): StoredMovie | undefined {
  return db
    .prepare(
      `
        SELECT
          tmdb_id,
          title,
          normalized_json,
          raw_json,
          fetched_at
        FROM movies
        WHERE tmdb_id = ?
      `
    )
    .get(tmdbId) as StoredMovie | undefined;
}

export function saveMovie(
  tmdbId: number,
  title: string,
  normalizedMovie: unknown,
  rawMovie: unknown
) {
  const now = Date.now();

  db.prepare(
    `
      INSERT INTO movies (
        tmdb_id,
        title,
        normalized_json,
        raw_json,
        fetched_at
      )
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(tmdb_id)
      DO UPDATE SET
        title = excluded.title,
        normalized_json = excluded.normalized_json,
        raw_json = excluded.raw_json,
        fetched_at = excluded.fetched_at
    `
  ).run(
    tmdbId,
    title,
    JSON.stringify(normalizedMovie),
    JSON.stringify(rawMovie),
    now
  );
}

export function saveRating(
  tmdbId: number,
  rating: number
) {
  db.prepare(
    `
      INSERT INTO ratings (
        tmdb_id,
        rating,
        rated_at
      )
      VALUES (?, ?, ?)
      ON CONFLICT(tmdb_id)
      DO UPDATE SET
        rating = excluded.rating,
        rated_at = excluded.rated_at
    `
  ).run(tmdbId, rating, Date.now());
}

export function getRating(
  tmdbId: number
): StoredRating | undefined {
  return db
    .prepare(
      `
        SELECT
          tmdb_id,
          rating,
          rated_at
        FROM ratings
        WHERE tmdb_id = ?
      `
    )
    .get(tmdbId) as StoredRating | undefined;
}

export function getAllRatings(): StoredRating[] {
  return db
    .prepare(
      `
        SELECT
          tmdb_id,
          rating,
          rated_at
        FROM ratings
        ORDER BY rated_at DESC
      `
    )
    .all() as StoredRating[];
}

export function getAllMovies(): StoredMovie[] {
  return db
    .prepare(
      `
        SELECT
          tmdb_id,
          title,
          normalized_json,
          raw_json,
          fetched_at
        FROM movies
        ORDER BY title ASC
      `
    )
    .all() as StoredMovie[];
}

export function getUnratedMovies(): StoredMovie[] {
  return db
    .prepare(
      `
        SELECT
          m.tmdb_id,
          m.title,
          m.normalized_json,
          m.raw_json,
          m.fetched_at
        FROM movies m
        LEFT JOIN ratings r
          ON m.tmdb_id = r.tmdb_id
        WHERE r.tmdb_id IS NULL
        ORDER BY m.title ASC
      `
    )
    .all() as StoredMovie[];
}

export default db;