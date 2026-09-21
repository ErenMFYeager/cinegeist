"use client";
import { useState } from "react"; 
export default function TasteTest() {
  const [reaction, setReaction] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 text-center">
          Cinegeist
        </p>

        <h1 className="mt-4 text-4xl font-semibold text-center">
          Let's figure out your taste.
        </h1>

        <p className="mt-3 text-zinc-500 text-center">
          Tell us how you feel about these movies.
        </p>

        <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

          <div className="h-96 bg-zinc-900 flex items-center justify-center">
            <span className="text-zinc-600 text-lg">
              Movie Poster
            </span>
          </div>

          <div className="p-8 text-center">

            <h2 className="text-3xl font-semibold">
              Perfect Blue
            </h2>

            <p className="mt-2 text-zinc-500">
              1997 · Psychological · Animation
            </p>

            <p className="mt-6 text-zinc-400">
              How do you feel about this movie?
            </p>

            <div className="mt-6 flex justify-center gap-3">

                <button
                    onClick={() => setReaction("nope")}
                    className="rounded-full border border-zinc-700 px-6 py-3 hover:bg-zinc-800 transition"
                >
                    Nope
                </button>
                <button
                    onClick={() => setReaction("maybe")}
                    className="rounded-full border border-zinc-700 px-6 py-3 hover:bg-zinc-800 transition"
                >
                    Maybe
                </button>
                <button
                    onClick={() => setReaction("love")}
                    className="rounded-full bg-white text-black px-6 py-3 hover:bg-zinc-200 transition"
                >
                    Love
                </button>
                {reaction && (
                    <p className="mt-6 text-zinc-400">
                        Your choice:{" "}
                        <span className="text-white font-medium">
                            {reaction}
                        </span>
                    </p>
                )}
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}