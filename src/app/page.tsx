import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Cinegeist
        </p>

        <h1 className="mt-6 text-6xl font-semibold tracking-tight">
          Your cinematic taste,
          <br />
          understood.
        </h1>

        <p className="mt-6 max-w-xl mx-auto text-zinc-400 text-lg">
          Discover what you love about movies — and find what you haven't
          discovered yet.
        </p>
        <Link
          href="/taste-test"
          className="mt-10 inline-block rounded-full bg-white px-8 py-4 text-black font-medium hover:bg-zinc-200 transition"
        >
          Discover my taste
        </Link>
      </div>
    </main>
  );
}