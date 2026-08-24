export type ProjectProfile = {
  slug: string;
  name: string;
  platform: string;
  status: "Live" | "Preview" | "In Development";
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  coverImageAlt: string;
  highlights: string[];
  featureBlocks: {
    title: string;
    description: string;
  }[];
};

export const projects: ProjectProfile[] = [
  {
    slug: "battuta",
    name: "Battuta",
    platform: "macOS App",
    status: "Live",
    tagline: "Bring the sound of your favorite keyboard to every Mac keystroke.",
    shortDescription:
      "A menu bar app with 20 keyboard sound profiles, five click styles, DIY sound packs, and private local typing statistics.",
    fullDescription:
      "Battuta turns keyboard and pointer events into responsive, natural mechanical feedback across macOS. Audio samples are preloaded for low-latency playback, while typing analytics remain aggregated and local to the device.",
    coverImage: "/battuta/og.png",
    coverImageAlt: "Battuta macOS keyboard sound app product card",
    highlights: [
      "20 keyboard profiles and five independent pointer click styles.",
      "DIY editor for per-key press and release samples.",
      "Private local statistics without storing typed content.",
    ],
    featureBlocks: [
      {
        title: "Listen",
        description:
          "Hear distinct press, release, row, and large-key samples with balanced natural variation.",
      },
      {
        title: "Create",
        description:
          "Import recordings and build a complete custom sound pack in the DIY editor.",
      },
      {
        title: "Understand",
        description:
          "Explore typing trends, active times, apps, and key distribution without recording text.",
      },
    ],
  },
];

export function getProjectBySlug(slug: string): ProjectProfile | undefined {
  return projects.find((project) => project.slug === slug);
}
