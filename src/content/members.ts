export type Publication = {
  title: string;
  venue: string;
  year: number;
  url: string;
  pdfUrl?: string;
};

export type MemberProfile = {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  fullBio: string;
  avatar: string;
  skills: string[];
  links: {
    label: "GitHub" | "LinkedIn" | "X" | "Email" | "Scholar";
    url: string;
  }[];
  publications?: Publication[];
};

export const members: MemberProfile[] = [
  {
    slug: "mingyang-wu",
    name: "Mingyang Wu",
    role: "Undergraduate@SUSTech\nResearch Assistant@CUHK MMLab",
    shortBio: "I like aeroplanes and travelling.\nCanton, China",
    fullBio:
      "I am currently a Research Assistant at [MMLab, The Chinese University of Hong Kong](https://mmlab.ie.cuhk.edu.hk/), advised by Professor [Xiangyu Yue](https://xyue.io/). My current research focuses on Data-Centric AI and reinforcement learning, with an emphasis on advancing audio-visual understanding in multimodal large language models.\n\nPreviously, I worked on brain-computer interfaces and neural decoding at NCC Lab, Southern University of Science and Technology, under Professor [Quanying Liu](https://scholar.google.com/citations?user=UpP9hJ8AAAAJ&hl=en). I am an undergraduate student at [Southern University of Science and Technology](https://sustech.edu.cn/) and a Co-Founder of WormForce Corp.",
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
      {
        label: "Scholar",
        url: "https://scholar.google.com/citations?user=ND7AssQAAAAJ&hl=zh-CN",
      },
      { label: "Email", url: "mailto:mingyang@wormforce.net" },
    ],
    publications: [
      {
        title:
          "RealMind: Advancing visual decoding and language interaction via EEG signals",
        venue:
          "2025 IEEE International Conference on Multimedia and Expo (ICME), 1-6",
        year: 2025,
        url: "https://ieeexplore.ieee.org/abstract/document/11209041/",
        pdfUrl: "https://arxiv.org/pdf/2410.23754",
      },
      {
        title:
          "An EEG Dataset for Multimodal Semantic Alignment and Neural Decoding during Reading and Listening",
        venue: "Scientific Data",
        year: 2025,
        url: "https://www.nature.com/articles/s41597-025-06466-8",
        pdfUrl: "https://www.nature.com/articles/s41597-025-06466-8",
      },
      {
        title:
          "MindPilot: Closed-loop Visual Stimulation Optimization for Brain Modulation with EEG-guided Diffusion",
        venue: "arXiv preprint arXiv:2602.10552",
        year: 2026,
        url: "https://arxiv.org/abs/2602.10552",
        pdfUrl: "https://arxiv.org/pdf/2602.10552",
      },
      {
        title:
          "BrainFLORA: Uncovering Brain Concept Representation via Multimodal Neural Embeddings",
        venue:
          "Proceedings of the 33rd ACM International Conference on Multimedia, 5577-5586",
        year: 2025,
        url: "https://dl.acm.org/doi/abs/10.1145/3746027.3754996",
        pdfUrl: "https://dl.acm.org/doi/pdf/10.1145/3746027.3754996",
      },
    ],
  },
  {
    slug: "quanbo-zhao",
    name: "Quanbo Zhao",
    role: "All-situation Engineer",
    shortBio:
      "A multidisciplinary engineer highly skilled in both hardware and software, featuring specialized expertise in AI image processing alongside extensive experience in optical imaging, space cameras, computer vision, AR, iOS/Android, and full-stack development.",
    fullBio:
      "I am a versatile tech generalist combining hardware knowledge with robust software engineering capabilities. My expertise encompasses optical imaging, aerospace cameras, computer vision, and deep learning for image/sequence processing. Additionally, I am an experienced developer across AR, mobile (Android/iOS), and frontend/backend full-stack environments.",
    avatar: "/images/members/member-2.jpg",
    skills: [
      "Deep Learning Algorithms",
      "Computer Vision",
      "Optical Imaging",
      "AR & Mobile Apps",
      "Full-Stack Development",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/7b7b7b" },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/%E6%B3%89%E5%8D%9A-%E8%B5%B5-1589b33b3/",
      },
      { label: "Email", url: "mailto:766853532@qq.com" },
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
