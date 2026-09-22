"use client";

import { useEffect, useState } from "react";
import { movies } from "@/data/movies";

type Reaction = "nope" | "maybe" | "love";

export default function TasteTest() {
  const [currentMovie, setCurrentMovie] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Reaction>>({});
  const [finished, setFinished] = useState(false);

  const movie = movies[currentMovie];

  // Load saved ratings when the page opens
  useEffect(() => {
    const savedRatings = localStorage.getItem("cinegeist-ratings");

    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
  }, []);

  // Save ratings whenever they change
  useEffect(() => {
    localStorage.setItem("cinegeist-ratings", JSON.stringify(ratings));
  }, [ratings]);

  const handleReaction = (choice: Reaction) => {
    const updatedRatings = {
      ...ratings,
      [movie.title]: choice,
    };

    setRatings(updatedRatings);

    setTimeout(() => {
      if (currentMovie < movies.length - 1) {
        setCurrentMovie(currentMovie + 1);
      } else {
        setFinished(true);
      }
    }, 500);
  };

  if (finished) {
    const lovedMovies = movies.filter(
      (movie) => ratings[movie.title] === "love"
    );

    const maybeMovies = movies.filter(
      (movie) => ratings[movie.title] === "maybe"
    );

    const dislikedMovies = movies.filter(
      (movie) => ratings[movie.title] === "nope"
    );

    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Cinegeist
            </p>

            <h1 className="mt-4 text-5xl font-semibold">
              Your cinematic taste.
            </h1>

            <p className="mt-4 text-zinc-500">
              Here's what we learned from your first five movies.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">LOVE</p>

              <p className="mt-2 text-4xl font-semibold">
                {lovedMovies.length}
              </p>

              <div className="mt-5 space-y-3">
                {lovedMovies.map((movie) => (
                  <p key={movie.title} className="text-zinc-300">
                    {movie.title}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">MAYBE</p>

              <p className="mt-2 text-4xl font-semibold">
                {maybeMovies.length}
              </p>

              <div className="mt-5 space-y-3">
                {maybeMovies.map((movie) => (
                  <p key={movie.title} className="text-zinc-300">
                    {movie.title}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">NOPE</p>

              <p className="mt-2 text-4xl font-semibold">
                {dislikedMovies.length}
              </p>

              <div className="mt-5 space-y-3">
                {dislikedMovies.map((movie) => (
                  <p key={movie.title} className="text-zinc-300">
                    {movie.title}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-600">
              Taste engine
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              We're starting to understand you.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-zinc-500">
              Your reactions are the first layer of your Cinegeist taste
              profile. Soon, we'll turn them into patterns, preferences, and
              recommendations.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Cinegeist
          </p>

          <h1 className="mt-4 text-4xl font-semibold">
            Let's figure out your taste.
          </h1>

          <p className="mt-3 text-zinc-500">
            Tell us what you think about these movies.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="h-[500px] bg-zinc-900">
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-8 text-center">
            <h2 className="text-3xl font-semibold">{movie.title}</h2>

            <p className="mt-2 text-zinc-500">{movie.year}</p>

            <p className="mx-auto mt-5 max-w-lg text-zinc-400">
              {movie.description}
            </p>

            <p className="mt-7 text-zinc-500">
              How do you feel about this movie?
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => handleReaction("nope")}
                className="rounded-full border border-zinc-700 px-6 py-3 transition hover:bg-zinc-800"
              >
                Nope
              </button>

              <button
                onClick={() => handleReaction("maybe")}
                className="rounded-full border border-zinc-700 px-6 py-3 transition hover:bg-zinc-800"
              >
                Maybe
              </button>

              <button
                onClick={() => handleReaction("love")}
                className="rounded-full bg-white px-6 py-3 text-black transition hover:bg-zinc-200"
              >
                Love
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center text-sm text-zinc-600">
          Movie {currentMovie + 1} of {movies.length}
        </div>

        <div className="mt-6 text-center text-xs text-zinc-700">
          {Object.keys(ratings).length} movies rated
        </div>
      </div>
    </main>
  );
}