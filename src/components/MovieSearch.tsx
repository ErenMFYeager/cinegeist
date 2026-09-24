"use client";

import { useState } from "react";

type Movie = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
};

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

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

      setMovies(data.results);
    } catch (error) {
      console.error("Movie search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
          className="rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
        >
          Search
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          Searching TMDB...
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
          >
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

            <div className="p-5">
              <h2 className="font-semibold">{movie.title}</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {movie.release_date
                  ? movie.release_date.slice(0, 4)
                  : "Unknown year"}
              </p>

              <button className="mt-4 w-full rounded-full border border-zinc-700 py-2 text-sm transition hover:bg-zinc-800">
                Add to my taste
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}