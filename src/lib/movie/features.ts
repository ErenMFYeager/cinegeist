import type {
  CinegeistMovie,
  FeatureValue,
  MovieFeatures,
} from "./types";

function text(movie: CinegeistMovie): string {
  return [
    movie.title,
    movie.originalTitle,
    movie.overview,
    movie.tagline ?? "",
    ...movie.genres,
    ...movie.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

function createFeature(
  value: number,
  evidence: string[]
): FeatureValue {
  return {
    value: Math.max(
      0,
      Math.min(1, value)
    ),
    evidence,
  };
}

function keywordMatches(
  movie: CinegeistMovie,
  terms: string[]
): string[] {
  const keywords =
    movie.keywords.map((keyword) =>
      keyword.toLowerCase()
    );

  return keywords.filter((keyword) =>
    terms.some((term) =>
      keyword.includes(
        term.toLowerCase()
      )
    )
  );
}

function textMatches(
  movie: CinegeistMovie,
  terms: string[]
): string[] {
  const fullText = text(movie);

  return terms.filter((term) =>
    fullText.includes(
      term.toLowerCase()
    )
  );
}

function inferFeature(
  movie: CinegeistMovie,
  terms: string[],
  baseStrength = 0.65
): FeatureValue {
  const keywordEvidence =
    keywordMatches(
      movie,
      terms
    );

  const textEvidence =
    textMatches(
      movie,
      terms
    );

  const evidence = Array.from(
    new Set([
      ...keywordEvidence,
      ...textEvidence,
    ])
  );

  if (evidence.length === 0) {
    return createFeature(
      0,
      []
    );
  }

  const strength = Math.min(
    1,
    baseStrength +
      (evidence.length - 1) *
        0.08
  );

  return createFeature(
    strength,
    evidence
  );
}

export function extractMovieFeatures(
  movie: CinegeistMovie
): MovieFeatures {
  const genreText =
    movie.genres
      .map((genre) =>
        genre.toLowerCase()
      );

  const result: MovieFeatures = {
    tone: {
      dark: inferFeature(
        movie,
        [
          "dark",
          "darkness",
          "bleak",
          "grim",
          "disturbing",
        ]
      ),

      warm: inferFeature(
        movie,
        [
          "warm",
          "heartwarming",
          "comforting",
        ]
      ),

      melancholic: inferFeature(
        movie,
        [
          "melancholy",
          "melancholic",
          "sadness",
          "grief",
          "loss",
        ]
      ),

      tense: inferFeature(
        movie,
        [
          "tense",
          "tension",
          "suspense",
          "thriller",
        ]
      ),

      unsettling: inferFeature(
        movie,
        [
          "unsettling",
          "disturbing",
          "horror",
          "nightmare",
        ]
      ),

      hopeful: inferFeature(
        movie,
        [
          "hope",
          "hopeful",
          "optimistic",
          "redemption",
        ]
      ),

      playful: inferFeature(
        movie,
        [
          "playful",
          "fun",
          "comedy",
          "humorous",
        ]
      ),
    },

    mood: {
      atmospheric: inferFeature(
        movie,
        [
          "atmospheric",
          "atmosphere",
          "mood",
        ]
      ),

      intimate: inferFeature(
        movie,
        [
          "intimate",
          "personal",
          "relationships",
          "family",
        ]
      ),

      dreamy: inferFeature(
        movie,
        [
          "dream",
          "dreams",
          "dreamlike",
          "surreal",
        ]
      ),

      disturbing: inferFeature(
        movie,
        [
          "disturbing",
          "horror",
          "nightmare",
          "psychological horror",
        ]
      ),

      comforting: inferFeature(
        movie,
        [
          "comforting",
          "heartwarming",
          "feel-good",
        ]
      ),

      mysterious: inferFeature(
        movie,
        [
          "mystery",
          "mysterious",
          "investigation",
          "unknown",
        ]
      ),

      bleak: inferFeature(
        movie,
        [
          "bleak",
          "despair",
          "nihilism",
          "hopeless",
        ]
      ),
    },

    narrative: {
      psychological: inferFeature(
        movie,
        [
          "psychological",
          "psychological thriller",
          "subconscious",
          "mind",
          "identity",
        ]
      ),

      character_driven: inferFeature(
        movie,
        [
          "character study",
          "character-driven",
          "relationships",
          "personal",
          "family",
        ]
      ),

      plot_driven: inferFeature(
        movie,
        [
          "mission",
          "investigation",
          "heist",
          "crime",
          "conspiracy",
        ]
      ),

      nonlinear: inferFeature(
        movie,
        [
          "nonlinear",
          "non-linear",
          "time travel",
          "flashback",
          "memory",
        ]
      ),

      slow_burn: inferFeature(
        movie,
        [
          "slow burn",
          "slow-burn",
          "deliberate",
          "gradual",
        ]
      ),

      high_concept: inferFeature(
        movie,
        [
          "high concept",
          "dream world",
          "time travel",
          "alternate reality",
          "parallel universe",
        ]
      ),

      experimental: inferFeature(
        movie,
        [
          "experimental",
          "avant-garde",
          "unconventional",
          "surreal",
        ]
      ),
    },

    style: {
      surreal: inferFeature(
        movie,
        [
          "surreal",
          "dream",
          "dreamlike",
          "absurd",
        ]
      ),

      cerebral: inferFeature(
        movie,
        [
          "intellectual",
          "cerebral",
          "philosophy",
          "philosophical",
          "ideas",
        ]
      ),

      minimalist: inferFeature(
        movie,
        [
          "minimalist",
          "minimalism",
          "sparse",
        ]
      ),

      visually_stylized:
        inferFeature(
          movie,
          [
            "stylized",
            "visual",
            "surreal",
            "artistic",
          ]
        ),

      grounded: inferFeature(
        movie,
        [
          "realistic",
          "realism",
          "grounded",
          "real-life",
        ]
      ),

      absurdist: inferFeature(
        movie,
        [
          "absurd",
          "absurdist",
            "dark comedy",
        ]
      ),
    },

    emotional: {
      emotional: inferFeature(
        movie,
        [
          "emotional",
          "emotion",
          "love",
          "grief",
          "loss",
          "family",
        ]
      ),

      introspective: inferFeature(
        movie,
        [
          "introspective",
          "identity",
          "self-discovery",
          "memory",
          "reflection",
        ]
      ),

      bittersweet: inferFeature(
        movie,
        [
          "bittersweet",
          "melancholy",
          "love",
          "loss",
          "nostalgia",
        ]
      ),

      provocative: inferFeature(
        movie,
        [
          "provocative",
          "controversial",
          "taboo",
          "extreme",
        ]
      ),

      existential: inferFeature(
        movie,
        [
          "existential",
          "existentialism",
          "meaning of life",
          "mortality",
          "death",
        ]
      ),
    },

    intensity: {
      violence: inferFeature(
        movie,
        [
          "violence",
          "violent",
          "murder",
          "gore",
          "slasher",
        ]
      ),

      suspense: inferFeature(
        movie,
        [
          "thriller",
          "suspense",
          "tension",
          "mystery",
          "danger",
        ]
      ),

      emotional: inferFeature(
        movie,
        [
          "emotional",
          "grief",
          "loss",
          "love",
          "family",
        ]
      ),

      psychological: inferFeature(
        movie,
        [
          "psychological",
          "mind",
          "identity",
          "subconscious",
          "obsession",
        ]
      ),
    },
  };

  /*
   * Genre-specific boosts.
   *
   * These aren't absolute truths.
   * They're only deterministic signals
   * for our first semantic prototype.
   */

  if (
    genreText.includes("horror")
  ) {
    result.intensity.violence.value =
      Math.max(
        result.intensity.violence.value,
        0.35
      );

    result.intensity.suspense.value =
      Math.max(
        result.intensity.suspense.value,
        0.55
      );
  }

  if (
    genreText.includes("thriller")
  ) {
    result.intensity.suspense.value =
      Math.max(
        result.intensity.suspense.value,
        0.65
      );
  }

  if (
    genreText.includes("drama")
  ) {
    result.emotional.emotional.value =
      Math.max(
        result.emotional.emotional.value,
        0.45
      );
  }

  if (
    genreText.includes("science fiction")
  ) {
    result.narrative.high_concept.value =
      Math.max(
        result.narrative.high_concept.value,
        0.45
      );
  }

  if (
    genreText.includes("animation")
  ) {
    result.style.visually_stylized.value =
      Math.max(
        result.style.visually_stylized.value,
        0.45
      );
  }

  return result;
}