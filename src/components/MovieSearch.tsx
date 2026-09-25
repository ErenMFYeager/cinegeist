"use client";

import { useState } from "react";

type Movie = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
};

type SaveState =
  | "idle"
  | "saving"
  | "saved"
  | "error";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const [saveStates, setSaveStates] = useState<
    Record<number, SaveState>
  >({});

  const searchMovies = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/movies?query=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setMovies(data.results ?? []);
    } catch (error) {
      console.error(
        "Movie search failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const rateMovie = async (
    movieId: number,
    rating: number
  ) => {
    setSaveStates((current) => ({
      ...current,
      [movieId]: "saving",
    }));

    try {
      const response = await fetch(
        "/api/ratings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tmdbId: movieId,
            rating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save rating"
        );
      }

      setSaveStates((current) => ({
        ...current,
        [movieId]: "saved",
      }));
    } catch (error) {
      console.error(
        "Rating failed:",
        error
      );

      setSaveStates((current) => ({
        ...current,
        [movieId]: "error",
      }));
    }
  };

  return (
    <div className="w-full">
      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              searchMovies();
            }
          }}
          placeholder="Search for a movie..."
          className="flex-1 rounded-full border border-zinc-800 bg-zinc-950 px-5 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <button
          onClick={searchMovies}
          disabled={loading}
          className="rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Searching..."
            : "Search"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          Searching TMDB...
        </p>
      )}

      {/* Results */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => {
          const saveState =
            saveStates[movie.id] ??
            "idle";

          return (
            <div
              key={movie.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
            >
              {/* Poster */}
              <div className="aspect-[2/3] bg-zinc-900">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                    No poster
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5">
                <h2 className="font-semibold">
                  {movie.title}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {movie.release_date
                    ? movie.release_date.slice(
                        0,
                        4
                      )
                    : "Unknown year"}
                </p>

                {/* Rating */}
                <div className="mt-5">
                  <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
                    Your rating
                  </p>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(
                      (rating) => (
                        <button
                          key={rating}
                          onClick={() =>
                            rateMovie(
                              movie.id,
                              rating
                            )
                          }
                          disabled={
                            saveState ===
                            "saving"
                          }
                          className={`rounded-lg border py-2 text-sm transition ${
                            saveState ===
                              "saved"
                              ? "border-zinc-700 text-zinc-500"
                              : "border-zinc-800 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900"
                          }`}
                        >
                          {rating}
                        </button>
                      )
                    )}
                  </div>

                  {/* Save status */}
                  <div className="mt-3 h-5 text-center text-xs">
                    {saveState ===
                      "saving" && (
                      <span className="text-zinc-500">
                        Saving...
                      </span>
                    )}

                    {saveState ===
                      "saved" && (
                      <span className="text-zinc-400">
                        Added to your taste
                      </span>
                    )}

                    {saveState ===
                      "error" && (
                      <span className="text-red-400">
                        Couldn't save
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {!loading &&
        movies.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-zinc-600">
              Search for movies you've watched.
            </p>
          </div>
        )}
    </div>
  );
}