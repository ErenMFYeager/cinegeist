
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { searchMovies } from "@/lib/tmdb";
import { getAllRatings } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LetterboxdRating = {
  Date?: string;
  Name?: string;
  Year?: string;
  "Letterboxd URI"?: string;
  Rating?: string;
};

type TmdbCandidate = {
  id: number;
  title: string;
  release_date?: string;
  original_title?: string;
};

function normalizeTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getYear(value?: string): number | null {
  if (!value) return null;

  const match = value.match(/\b(18|19|20|21)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const offset = Math.max(
      0,
      Number(searchParams.get("offset") ?? 0) || 0
    );

    const limit = Math.min(
      20,
      Math.max(
        1,
        Number(searchParams.get("limit") ?? 10) || 10
      )
    );

    const csvPath = path.join(
      process.cwd(),
      "data",
      "letterboxd",
      "ratings.csv"
    );

    const csv = await fs.readFile(csvPath, "utf8");

    const parsed = Papa.parse<LetterboxdRating>(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not parse the Letterboxd CSV.",
          details: parsed.errors.slice(0, 5),
        },
        { status: 400 }
      );
    }

    const ratings = parsed.data.filter((row) => {
      const rating = Number(row.Rating);

      return (
        Boolean(row.Name?.trim()) &&
        Boolean(row.Year?.trim()) &&
        Number.isFinite(rating) &&
        rating >= 0.5 &&
        rating <= 5 &&
        rating * 2 === Math.round(rating * 2)
      );
    });

    const existingRatings = new Map(
      getAllRatings().map((row) => [row.tmdb_id, row.rating])
    );

    const batch = ratings.slice(offset, offset + limit);
    const preview = [];

    for (const row of batch) {
      const title = row.Name!.trim();
      const year = Number(row.Year);
      const rating = Number(row.Rating);

      try {
        const result = await searchMovies(title);

        const candidates: TmdbCandidate[] = Array.isArray(
          result.results
        )
          ? result.results
          : [];

        const ranked = candidates
          .map((movie) => {
            const releaseYear = getYear(movie.release_date);

            const exactTitle =
              normalizeTitle(movie.title) === normalizeTitle(title) ||
              normalizeTitle(movie.original_title ?? "") ===
                normalizeTitle(title);

            const sameYear = releaseYear === year;

            return {
              tmdbId: movie.id,
              title: movie.title,
              releaseYear,
              exactTitle,
              sameYear,
              confidence:
                exactTitle && sameYear
                  ? "high"
                  : "review",
            };
          })
          .sort((a, b) => {
            const score = (item: typeof a) =>
              (item.exactTitle ? 2 : 0) +
              (item.sameYear ? 1 : 0);

            return score(b) - score(a);
          });

        const best = ranked[0];

        const safeMatch = best?.exactTitle && best?.sameYear;
        const existingRating = safeMatch
          ? existingRatings.get(best.tmdbId)
          : undefined;

        preview.push({
          letterboxd: {
            title,
            year,
            rating,
            watchedDate: row.Date ?? null,
            uri: row["Letterboxd URI"] ?? null,
          },
          match: best ?? null,
          alternatives: ranked.slice(1, 4),
          status: !best
            ? "not_found"
            : !safeMatch
              ? "needs_review"
              : existingRating === undefined
                ? "safe_match"
                : existingRating === rating
                  ? "already_exists_same_rating"
                  : "existing_rating_conflict",
          existingCinegeistRating: existingRating ?? null,
        });
      } catch (error) {
        preview.push({
          letterboxd: {
            title,
            year,
            rating,
            watchedDate: row.Date ?? null,
            uri: row["Letterboxd URI"] ?? null,
          },
          match: null,
          alternatives: [],
          status: "search_failed",
          error:
            error instanceof Error
              ? error.message
              : "TMDB search failed",
        });
      }
    }

    const counts = preview.reduce<Record<string, number>>(
      (result, item) => {
        result[item.status] = (result[item.status] ?? 0) + 1;
        return result;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      totalCsvRows: ratings.length,
      offset,
      limit,
      previewed: preview.length,
      nextOffset:
        offset + preview.length < ratings.length
          ? offset + preview.length
          : null,
      counts,
      note: "Preview only. No database records or ratings were changed.",
      preview,
    });
  } catch (error) {
    console.error("Letterboxd preview failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Letterboxd preview failed",
      },
      { status: 500 }
    );
  }
}
