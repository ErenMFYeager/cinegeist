import type {
  CinegeistMovie,
  FeatureValue,
  MovieFeatures,
} from "./types";

function movieText(movie: CinegeistMovie): string {
  return [
    movie.title,
    movie.originalTitle,
    movie.overview,
    movie.tagline,
    ...movie.genres,
    ...movie.keywords,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function createFeature(
  value: number,
  evidence: string[]
): FeatureValue {
  return {
    value: Math.min(1, Math.max(0, Number(value.toFixed(2)))),
    evidence: [...new Set(evidence)],
  };
}

function findMatches(
  text: string,
  terms: string[]
): string[] {
  return terms.filter((term) => text.includes(term));
}

function inferFeature(
  text: string,
  terms: string[],
  options?: {
    base?: number;
    step?: number;
    minimumEvidence?: number;
  }
): FeatureValue {
  const matches = findMatches(text, terms);

  const base = options?.base ?? 0.65;
  const step = options?.step ?? 0.08;
  const minimumEvidence = options?.minimumEvidence ?? 1;

  if (matches.length < minimumEvidence) {
    return createFeature(0, []);
  }

  return createFeature(
    base + (matches.length - 1) * step,
    matches
  );
}

export function extractMovieFeatures(
  movie: CinegeistMovie
): MovieFeatures {
  const text = movieText(movie);

  /*
   * ------------------------------------------------------------
   * TONE
   * ------------------------------------------------------------
   */

  const tone = {
    dark: inferFeature(text, [
      "dark",
      "grim",
      "bleak",
      "darkness",
      "dark secret",
    ]),

    warm: inferFeature(text, [
      "warm",
      "heartwarming",
      "heart-warming",
      "tender",
    ]),

    melancholic: inferFeature(text, [
      "melancholy",
      "melancholic",
      "sadness",
      "grief",
      "loss",
    ]),

    tense: inferFeature(text, [
      "tense",
      "intense",
      "thriller",
      "suspenseful",
      "suspense",
    ]),

    unsettling: inferFeature(text, [
      "unsettling",
      "disturbing",
      "psychological horror",
      "nightmare",
      "dread",
    ]),

    hopeful: inferFeature(text, [
      "hopeful",
      "hope",
      "optimistic",
      "redemption",
    ]),

    playful: inferFeature(text, [
      "playful",
      "comedy",
      "funny",
      "humorous",
      "satire",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * MOOD
   * ------------------------------------------------------------
   */

  const mood = {
    atmospheric: inferFeature(text, [
      "atmospheric",
      "haunting atmosphere",
      "eerie atmosphere",
      "dreamlike",
    ]),

    intimate: inferFeature(text, [
      "intimate",
      "personal",
      "family relationships",
      "close relationship",
      "relationships",
      "found family",
    ]),

    dreamy: inferFeature(text, [
      "dream",
      "dreams",
      "dream world",
      "dreamlike",
      "surreal dream",
    ]),

    disturbing: inferFeature(text, [
      "disturbing",
      "disturbing imagery",
      "psychological horror",
      "extreme violence",
      "nightmare",
    ]),

    comforting: inferFeature(text, [
      "comforting",
      "heartwarming",
      "feel-good",
      "feel good",
      "uplifting",
    ]),

    mysterious: inferFeature(text, [
      "mystery",
      "mysterious",
      "investigation",
      "unknown",
      "unsolved",
    ]),

    bleak: inferFeature(text, [
      "bleak",
      "hopeless",
      "despair",
      "nihilistic",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * NARRATIVE
   * ------------------------------------------------------------
   */

  const narrative = {
    psychological: inferFeature(text, [
      "psychological thriller",
      "psychological horror",
      "psychological drama",
      "psychological",
    ]),

    character_driven: inferFeature(text, [
      "character study",
      "character-driven",
      "character driven",
      "personal relationships",
      "family relationships",
      "identity crisis",
    ]),

    plot_driven: inferFeature(text, [
      "mission",
      "heist",
      "investigation",
      "conspiracy",
      "crime",
      "murder mystery",
    ]),

    nonlinear: inferFeature(text, [
      "nonlinear",
      "non-linear",
      "flashback",
      "fragmented narrative",
      "multiple timelines",
    ]),

    slow_burn: inferFeature(text, [
      "slow burn",
      "slow-burn",
      "gradual",
      "deliberate pace",
    ]),

    high_concept: inferFeature(text, [
      "high concept",
      "high-concept",
      "dream world",
      "time travel",
      "alternate reality",
      "parallel universe",
      "simulation",
    ]),

    experimental: inferFeature(text, [
      "experimental",
      "avant-garde",
      "unconventional narrative",
      "experimental film",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * STYLE
   * ------------------------------------------------------------
   */

  const style = {
    surreal: inferFeature(text, [
      "surreal",
      "surrealism",
      "dream world",
      "dreamlike",
      "nightmarish",
    ]),

    cerebral: inferFeature(text, [
      "intellectual",
      "philosophical",
      "cerebral",
      "existential",
    ]),

    minimalist: inferFeature(text, [
      "minimalist",
      "minimalism",
      "sparse",
      "stripped-down",
    ]),

    visually_stylized: inferFeature(text, [
      "visually stylized",
      "stylized visuals",
      "stylized",
      "visual spectacle",
      "aesthetic",
    ]),

    grounded: inferFeature(text, [
      "social realism",
      "realism",
      "realistic",
      "grounded",
      "naturalistic",
    ]),

    absurdist: inferFeature(text, [
      "absurdist",
      "absurd",
      "surreal comedy",
      "dark comedy",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * EMOTIONAL
   * ------------------------------------------------------------
   */

  const emotional = {
    emotional: inferFeature(
      text,
      [
        "heartbreaking",
        "moving",
        "emotionally",
        "emotional journey",
        "deeply emotional",
      ],
      {
        minimumEvidence: 1,
      }
    ),

    introspective: inferFeature(text, [
      "introspective",
      "self-reflection",
      "identity crisis",
      "inner conflict",
      "self-discovery",
    ]),

    bittersweet: inferFeature(text, [
      "bittersweet",
      "bittersweet ending",
      "love and loss",
      "joy and sadness",
    ]),

    provocative: inferFeature(text, [
      "provocative",
      "controversial",
      "taboo",
      "transgressive",
      "confrontational",
    ]),

    existential: inferFeature(text, [
      "existential",
      "existential crisis",
      "existential emptiness",
      "meaning of life",
      "meaninglessness",
      "nihilism",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * PSYCHOLOGICAL SUB-DIMENSIONS
   *
   * This is the important V3.1 change.
   * "Psychological" alone is too broad.
   * ------------------------------------------------------------
   */

  const psychological = {
    identity: inferFeature(text, [
      "identity crisis",
      "new identity",
      "identity theft",
      "split personality",
      "alter ego",
      "secret identity",
      "identity",
    ]),

    obsession: inferFeature(text, [
      "obsession",
      "obsessive",
      "obsessed",
      "fixation",
    ]),

    paranoia: inferFeature(text, [
      "paranoia",
      "paranoid",
      "conspiracy",
      "surveillance",
      "persecution",
    ]),

    mental_deterioration: inferFeature(text, [
      "psychological deterioration",
      "mental breakdown",
      "breakdown",
      "losing his mind",
      "losing her mind",
      "descent into madness",
    ]),

    reality_distortion: inferFeature(text, [
      "unreliable reality",
      "distorted reality",
      "reality distortion",
      "hallucination",
      "hallucinations",
      "dream world",
      "alternate reality",
    ]),

    introspection: inferFeature(text, [
      "introspective",
      "inner conflict",
      "self-reflection",
      "identity crisis",
      "existential crisis",
    ]),

    existential: inferFeature(text, [
      "existential",
      "existential crisis",
      "existential emptiness",
      "meaninglessness",
      "nihilism",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * HORROR SUB-DIMENSIONS
   * ------------------------------------------------------------
   */

  const horror = {
    atmospheric: inferFeature(text, [
      "atmospheric horror",
      "eerie atmosphere",
      "haunting atmosphere",
      "haunted",
      "haunting",
    ]),

    psychological: inferFeature(text, [
      "psychological horror",
      "psychological terror",
    ]),

    found_footage: inferFeature(text, [
      "found footage",
      "found-footage",
      "handheld footage",
      "documentary style",
    ]),

    supernatural: inferFeature(text, [
      "supernatural",
      "ghost",
      "ghosts",
      "demon",
      "demons",
      "haunted house",
      "possession",
    ]),

    body_horror: inferFeature(text, [
      "body horror",
      "body transformation",
      "mutation",
      "mutilation",
      "grotesque transformation",
    ]),

    gore: inferFeature(text, [
      "gore",
      "gory",
      "blood and gore",
      "graphic violence",
      "extreme violence",
    ]),

    disturbing: inferFeature(text, [
      "disturbing",
      "disturbing imagery",
      "extreme",
      "transgressive",
      "shocking",
    ]),

    mystery_driven: inferFeature(text, [
      "mystery",
      "investigation",
      "unsolved",
      "unknown",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * INTENSITY
   * ------------------------------------------------------------
   */

  const intensity = {
    violence: inferFeature(text, [
      "violence",
      "violent",
      "gun violence",
      "gore",
      "gory",
      "graphic violence",
      "murder",
    ]),

    suspense: inferFeature(text, [
      "suspense",
      "suspenseful",
      "thriller",
      "tension",
      "tense",
    ]),

    emotional: inferFeature(text, [
      "heartbreaking",
      "moving",
      "emotional journey",
      "deeply emotional",
      "grief",
    ]),

    psychological: inferFeature(text, [
      "psychological thriller",
      "psychological horror",
      "psychological drama",
      "psychological deterioration",
      "mental breakdown",
    ]),
  };

  /*
   * ------------------------------------------------------------
   * GENRE-LEVEL BOOSTS
   *
   * These are deliberately conservative.
   * Genre alone should NOT create a huge semantic signal.
   * ------------------------------------------------------------
   */

  const genres = new Set(
    movie.genres.map((genre) => genre.toLowerCase())
  );

  if (genres.has("horror")) {
    intensity.suspense = boostFeature(
      intensity.suspense,
      0.35,
      "genre:horror"
    );
  }

  if (genres.has("thriller")) {
    intensity.suspense = boostFeature(
      intensity.suspense,
      0.35,
      "genre:thriller"
    );
  }

  if (genres.has("drama")) {
    intensity.emotional = boostFeature(
      intensity.emotional,
      0.25,
      "genre:drama"
    );
  }

  if (genres.has("science fiction")) {
    narrative.high_concept = boostFeature(
      narrative.high_concept,
      0.25,
      "genre:science fiction"
    );
  }

  return {
    tone,
    mood,
    narrative,
    style,
    emotional,
    psychological,
    horror,
    intensity,
  };
}

function boostFeature(
  feature: FeatureValue,
  boost: number,
  evidence: string
): FeatureValue {
  return createFeature(
    Math.max(feature.value, boost),
    [...feature.evidence, evidence]
  );
}