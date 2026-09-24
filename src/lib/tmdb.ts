const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch(
  path: string,
  searchParams?: Record<string, string>
) {
  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    throw new Error("TMDB_API_TOKEN is missing");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
  const errorText = await response.text();

  // Don't retry permanent errors like 404.
  if (response.status === 404) {
    const error = new Error(
      `TMDB resource not found (${response.status}): ${errorText}`
    );

    (error as Error & { status?: number }).status = 404;

    throw error;
  }

  // Retry temporary/server-side failures.
  if (response.status === 429 || response.status >= 500) {
    throw new Error(
      `TMDB temporary failure (${response.status}): ${errorText}`
    );
  }

  throw new Error(
    `TMDB request failed (${response.status}): ${errorText}`
  );
}

      return await response.json();
    } catch (error) {
      console.error(
        `TMDB request attempt ${attempt}/${maxAttempts} failed:`,
        error
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      // Small delay before retrying.
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * attempt)
      );
    }
  }

  throw new Error("TMDB request failed");
}

export async function searchMovies(query: string) {
  return tmdbFetch("/search/movie", {
    query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });
}

export async function getMovieDetails(id: string) {
  return tmdbFetch(`/movie/${id}`, {
    append_to_response: "credits,keywords",
    language: "en-US",
  });
}