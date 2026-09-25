import type { CinegeistMovie, MovieFeatures } from "./types";

type FeatureRules = {
  [feature: string]: string[];
};

/*
 * These rules translate factual movie metadata
 * into Cinegeist's cinematic characteristics.
 *
 * The extractor is intentionally deterministic.
 *
 * Example:
 *
 * "subconscious" → psychological
 * "dream"        → surreal
 * "high concept" → high_concept
 *
 * This means we can always explain WHY
 * Cinegeist assigned a feature to a movie.
 */

const THEME_RULES: FeatureRules = {
  identity: [
    "identity",
    "self discovery",
    "self-discovery",
    "alter ego",
    "double identity",
  ],

  memory: [
    "memory",
    "memories",
    "amnesia",
    "remember",
    "forget",
    "forgotten",
  ],

  obsession: [
    "obsession",
    "obsessed",
    "obsessive",
    "fixation",
  ],

  manipulation: [
    "manipulation",
    "manipulate",
    "mind control",
    "brainwashing",
    "influence",
  ],

  subconscious: [
    "subconscious",
    "subconscious mind",
  ],

  dreams: [
    "dream",
    "dreams",
    "dream world",
    "nightmare",
    "sleep",
  ],

  morality: [
    "morality",
    "moral",
    "ethics",
    "ethical",
    "crime",
    "guilt",
  ],

  relationships: [
    "relationship",
    "relationships",
    "love",
    "romance",
    "family",
    "marriage",
  ],
};

const TONE_RULES: FeatureRules = {
  dark: [
    "dark",
    "murder",
    "death",
    "crime",
    "killer",
    "serial killer",
    "nightmare",
  ],

  tense: [
    "tense",
    "suspense",
    "thriller",
    "danger",
    "chase",
    "mission",
    "heist",
  ],

  disturbing: [
    "disturbing",
    "horror",
    "nightmare",
    "psychological",
    "murder",
    "serial killer",
  ],

  playful: [
    "comedy",
    "funny",
    "humor",
    "playful",
    "quirky",
  ],

  melancholic: [
    "melancholy",
    "melancholic",
    "grief",
    "loss",
    "loneliness",
    "sadness",
  ],

  hopeful: [
    "hope",
    "hopeful",
    "redemption",
    "survival",
    "inspiration",
  ],
};

const STYLE_RULES: FeatureRules = {
  surreal: [
    "surreal",
    "dream",
    "dreams",
    "dream world",
    "subconscious",
    "hallucination",
  ],

  atmospheric: [
    "atmosphere",
    "atmospheric",
    "haunting",
    "dreamlike",
    "dream world",
  ],

  experimental: [
    "experimental",
    "avant-garde",
    "surreal",
    "unconventional",
  ],

  cerebral: [
    "intellectual",
    "cerebral",
    "philosophy",
    "philosophical",
    "high concept",
    "psychological",
  ],

  visually_stylized: [
    "stylized",
    "visual",
    "artistic",
    "surreal",
    "animation",
  ],

  grounded: [
    "realistic",
    "grounded",
    "real life",
    "based on true story",
  ],
};

const NARRATIVE_RULES: FeatureRules = {
  high_concept: [
    "high concept",
    "high-concept",
    "concept",
    "subconscious",
    "dream world",
    "time travel",
    "parallel universe",
  ],

  mystery: [
    "mystery",
    "mysterious",
    "investigation",
    "detective",
    "unknown",
    "secret",
  ],

  heist: [
    "heist",
    "robbery",
    "theft",
    "thief",
    "steal",
  ],

  psychological: [
    "psychological",
    "subconscious",
    "mind",
    "memory",
    "manipulation",
    "obsession",
  ],

  nonlinear: [
    "nonlinear",
    "non-linear",
    "fragmented",
    "memory",
    "dream",
    "dreams",
  ],

  character_driven: [
    "character study",
    "character-driven",
    "relationships",
    "identity",
    "obsession",
  ],

  plot_driven: [
    "mission",
    "heist",
    "investigation",
    "mystery",
    "chase",
  ],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchText(movie: CinegeistMovie): string {
  return normalizeText(
    [
      movie.title,
      movie.originalTitle,
      movie.overview,
      movie.tagline ?? "",
      ...movie.genres,
      ...movie.keywords,
    ].join(" ")
  );
}

function extractFeatures(
  text: string,
  rules: FeatureRules
): string[] {
  const features: string[] = [];

  for (const [feature, keywords] of Object.entries(rules)) {
    const matched = keywords.some((keyword) =>
      text.includes(normalizeText(keyword))
    );

    if (matched) {
      features.push(feature);
    }
  }

  return features;
}

function calculateIntensity(
  text: string,
  movie: CinegeistMovie
): MovieFeatures["intensity"] {
  /*
   * These are deliberately simple rule-based scores.
   *
   * 0 = no detected signal
   * 1 = strong detected signal
   *
   * We are NOT claiming these are objective measurements.
   * They represent Cinegeist's current feature model.
   */

  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) =>
      text.includes(normalizeText(keyword))
    );

  const genreText = movie.genres
    .map(normalizeText)
    .join(" ");

  const violence =
    hasAny([
      "violence",
      "violent",
      "murder",
      "killer",
      "war",
      "assassin",
      "blood",
      "gore",
    ]) || genreText.includes("action")
      ? 1
      : 0;

  const suspense =
    hasAny([
      "suspense",
      "thriller",
      "danger",
      "chase",
      "mission",
      "heist",
      "mystery",
      "investigation",
      "killer",
    ])
      ? 1
      : 0;

  const emotional =
    hasAny([
      "love",
      "family",
      "relationship",
      "grief",
      "loss",
      "loneliness",
      "memory",
      "trauma",
      "redemption",
    ])
      ? 1
      : 0;

  const psychological =
    hasAny([
      "psychological",
      "subconscious",
      "mind",
      "memory",
      "manipulation",
      "obsession",
      "identity",
      "dream",
    ])
      ? 1
      : 0;

  return {
    violence,
    suspense,
    emotional,
    psychological,
  };
}

export function extractMovieFeatures(
  movie: CinegeistMovie
): MovieFeatures {
  const searchText = buildSearchText(movie);

  return {
    themes: extractFeatures(searchText, THEME_RULES),

    tone: extractFeatures(searchText, TONE_RULES),

    style: extractFeatures(searchText, STYLE_RULES),

    narrative: extractFeatures(
      searchText,
      NARRATIVE_RULES
    ),

    intensity: calculateIntensity(
      searchText,
      movie
    ),
  };
}