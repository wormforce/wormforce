export type TeamProfile = {
  name: string;
  tagline: string;
  description: string;
  seoDescription: string;
  mission: string;
  contactEmail: string;
  socialLinks: { label: string; url: string }[];
};

export const teamProfile: TeamProfile = {
  name: "Wormforce",
  tagline:
    "An independent builder team focused on practical AI products and resilient web systems.",
  description:
    "Wormforce is a compact team of three. We combine product thinking, engineering rigor, and fast delivery to turn ideas into reliable software.",
  seoDescription:
    "Wormforce is an independent engineering team building Battuta, sustech cli, open-source developer tools, and practical applied AI systems.",
  mission:
    "Build useful tools that stay fast, understandable, and maintainable as they scale from first release to real-world usage.",
  contactEmail: "team@wormforce.net",
  socialLinks: [
    { label: "GitHub", url: "https://github.com/wormforce/wormforce" },
    { label: "X", url: "https://x.com/wormforce" },
    { label: "Email", url: "mailto:team@wormforce.net" },
  ],
};
