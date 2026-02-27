export type MemberProfile = {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  fullBio: string;
  avatar: string;
  skills: string[];
  links: { label: "GitHub" | "LinkedIn" | "X" | "Email"; url: string }[];
};

export const members: MemberProfile[] = [
  {
    slug: "aiden-luo",
    name: "Aiden Luo",
    role: "AI Engineer",
    shortBio:
      "Builds applied AI workflows and inference pipelines for product teams.",
    fullBio:
      "Aiden focuses on turning model capabilities into dependable product features. His work spans prompt architecture, retrieval quality tuning, and low-latency serving patterns that hold up under real user traffic.",
    avatar: "/images/members/member-1.jpg",
    skills: [
      "Applied LLMs",
      "RAG Systems",
      "Prompt Evaluation",
      "Python",
      "Observability",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/aiden-luo" },
      { label: "X", url: "https://x.com/aiden_luo" },
      { label: "Email", url: "mailto:aiden@wormforce.net" },
    ],
  },
  {
    slug: "mira-chen",
    name: "Mira Chen",
    role: "Full-Stack Engineer",
    shortBio:
      "Owns web architecture, API integration, and end-to-end quality delivery.",
    fullBio:
      "Mira designs and implements full-stack systems with a strong focus on code health and operability. She leads the transition from prototype to production through typed interfaces, testable modules, and stable deployment workflows.",
    avatar: "/images/members/member-2.jpg",
    skills: [
      "Next.js",
      "TypeScript",
      "API Design",
      "PostgreSQL",
      "CI/CD",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/mira-chen" },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/mira-chen",
      },
      { label: "Email", url: "mailto:mira@wormforce.net" },
    ],
  },
  {
    slug: "nolan-park",
    name: "Nolan Park",
    role: "Product Designer",
    shortBio:
      "Shapes product direction and interaction systems for focused execution.",
    fullBio:
      "Nolan bridges product strategy and interface execution. He translates ambiguous needs into clear flows, measurable goals, and visual systems that keep teams aligned from ideation to shipped features.",
    avatar: "/images/members/member-3.jpg",
    skills: [
      "Product Strategy",
      "Interaction Design",
      "Design Systems",
      "User Research",
      "Prototyping",
    ],
    links: [
      { label: "X", url: "https://x.com/nolan_park" },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/nolan-park",
      },
      { label: "Email", url: "mailto:nolan@wormforce.net" },
    ],
  },
];

export function getMemberBySlug(slug: string): MemberProfile | undefined {
  return members.find((member) => member.slug === slug);
}
