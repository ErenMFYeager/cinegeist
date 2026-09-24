import MovieSearch from "@/components/MovieSearch";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Cinegeist
          </p>

          <h1 className="mt-4 text-5xl font-semibold">
            Tell us what you watch.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Search for movies you've loved, liked, or watched.
          </p>
        </div>

        <div className="mt-12">
          <MovieSearch />
        </div>
      </div>
    </main>
  );
}