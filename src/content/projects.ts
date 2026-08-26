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
    platform: "macOS & Windows",
    status: "Live",
    tagline: "Bring the sound of your favorite keyboard to every keystroke on macOS and Windows.",
    shortDescription:
      "A native desktop app with 21 keyboard sound profiles, five click styles, DIY sound packs, and private local typing statistics.",
    fullDescription:
      "Battuta turns keyboard and pointer events into responsive, natural mechanical feedback across macOS and Windows. The selected profile's recordings are preloaded for low-latency playback, while all 265 samples and typing analytics remain local to the device.",
    coverImage: "/battuta/og-v1.2.0.png",
    coverImageAlt: "Battuta keyboard sound app for macOS and Windows",
    highlights: [
      "21 keyboard profiles, including BCP (Suit80), and five independent pointer click styles.",
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
