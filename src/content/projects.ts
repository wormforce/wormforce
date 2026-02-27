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
    slug: "monet",
    name: "MoNet",
    platform: "iOS App",
    status: "Preview",
    tagline: "A focused iOS workspace for visual thinking and fast momentum.",
    shortDescription:
      "MoNet is a mobile-first product for capturing, organizing, and iterating visual ideas with speed and clarity.",
    fullDescription:
      "MoNet is an iOS application built by Wormforce to help teams and creators turn scattered visual references into structured project momentum. It combines lightweight collection, AI-assisted understanding, and clear execution views in one minimal workflow.",
    coverImage: "/images/projects/monet-placeholder.svg",
    coverImageAlt: "MoNet product preview placeholder",
    highlights: [
      "Native iOS experience with clean interaction rhythm.",
      "Visual-first workflow from capture to execution.",
      "Designed for low-friction daily use on mobile.",
    ],
    featureBlocks: [
      {
        title: "Capture",
        description:
          "Save references, screenshots, and quick notes in seconds with minimal interruption.",
      },
      {
        title: "Organize",
        description:
          "Group visual items into focused boards and keep context clear as projects grow.",
      },
      {
        title: "Execute",
        description:
          "Convert ideas into actionable flows with concise summaries and next-step clarity.",
      },
    ],
  },
];

export function getProjectBySlug(slug: string): ProjectProfile | undefined {
  return projects.find((project) => project.slug === slug);
}
