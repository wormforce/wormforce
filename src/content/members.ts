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
    slug: "mingyang-wu",
    name: "Mingyang Wu",
    role: "AI Engineer",
    shortBio:
      "Builds applied AI products and reliable end-to-end web experiences.",
    fullBio:
      "Mingyang focuses on turning model capabilities into dependable product features. His work spans model integration, backend services, and frontend delivery to ship practical AI experiences quickly.",
    avatar: "/images/members/member-1.jpg",
    skills: [
      "Applied AI",
      "LLM Integration",
      "Next.js",
      "TypeScript",
      "Product Engineering",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/mingyangwu" },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/mingyangwu",
      },
      { label: "Email", url: "mailto:mingyang@wormforce.net" },
    ],
  },
  {
    slug: "xie-kunpeng",
    name: "Kunpeng Xie",
    role: "TBD",
    shortBio: "TBD",
    fullBio: "TBD",
    avatar: "/images/members/member-2.jpg",
    skills: [],
    links: [
      { label: "GitHub", url: "https://github.com/pentaoa" },
      { label: "Email", url: "mailto:xiekunpn@gmail.com" },
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
