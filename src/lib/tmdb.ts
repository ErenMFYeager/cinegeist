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

  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "User-Agent": "Cinegeist/1.0",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();

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

      // Exponential backoff:
      // 1st retry → 1 second
      // 2nd retry → 2 seconds
      // 3rd retry → 4 seconds
      const delay = 1000 * 2 ** (attempt - 1);

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
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
export async function discoverMovies(
  page: number = 1
) {
  return tmdbFetch("/discover/movie", {
    language: "en-US",
    page: String(page),

    include_adult: "false",
    include_video: "false",

    sort_by: "popularity.desc",

    vote_count_gte: "100",
  });
}