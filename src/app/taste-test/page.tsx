"use client";

import { useState } from "react";
import { movies } from "@/data/movies";

export default function TasteTest() {
  const [currentMovie, setCurrentMovie] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);

  const movie = movies[currentMovie];

  const handleReaction = (choice: string) => {
    setReaction(choice);

    setTimeout(() => {
      setReaction(null);

      if (currentMovie < movies.length - 1) {
        setCurrentMovie(currentMovie + 1);
      }
    }, 500);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
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

            <h2 className="text-3xl font-semibold">
              {movie.title}
            </h2>

            <p className="mt-2 text-zinc-500">
              {movie.year}
            </p>

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

            {reaction && (
              <p className="mt-5 text-zinc-400">
                You chose{" "}
                <span className="font-medium text-white">
                  {reaction}
                </span>
              </p>
            )}

          </div>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-600">
          Movie {currentMovie + 1} of {movies.length}
        </p>

      </div>
    </main>
  );
}