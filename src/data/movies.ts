export type Movie = {
  title: string;
  year: number;
  description: string;
  poster: string;
};

export const movies: Movie[] = [
  {
    title: "Perfect Blue",
    year: 1997,
    description:
      "A psychological thriller about identity, obsession, fame, and reality.",
    poster:
      "https://image.tmdb.org/t/p/w780/6WTiOCfDPP8XV4jqfloiVWf7khR.jpg",
  },
  {
    title: "Monster",
    year: 2003,
    description:
      "A doctor becomes entangled in a terrifying mystery surrounding a former patient.",
    poster:
      "https://image.tmdb.org/t/p/w780/e3NBGiIoUPsO1jQ8iAbnh0UoOe.jpg",
  },
  {
    title: "Paprika",
    year: 2006,
    description:
      "A dream detective enters the subconscious world where dreams begin to collide with reality.",
    poster:
      "https://image.tmdb.org/t/p/w780/bLUUr474Go1DfeN5qkZr2wD1rV6.jpg",
  },
  {
    title: "Black Swan",
    year: 2010,
    description:
      "A dancer's pursuit of perfection begins to blur the boundary between ambition and obsession.",
    poster:
      "https://image.tmdb.org/t/p/w780/rH19vkjP6g4tG9H2Yw7kT2bV7V.jpg",
  },
  {
    title: "Cure",
    year: 1997,
    description:
      "A detective investigates a series of mysterious murders connected by an unsettling pattern.",
    poster:
      "https://image.tmdb.org/t/p/w780/2c6tQ2C1ZK0h7n0L5c7z7s9vY6H.jpg",
  },
];