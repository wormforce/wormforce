export type Publication = {
  title: string;
  authors?: string;
  venue: string;
  year?: number;
  url?: string;
  pdfUrl?: string;
};

export type MemberProfile = {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  profileRole?: string;
  profileShortBio?: string;
  fullBio: string;
  avatar: string;
  /** Image object-position: "top" for top-center crop, default "center" */
  avatarObjectPosition?: "top" | "center";
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
    role: "AI Research Engineer",
    shortBio: "Data-centric AI, RL, and multimodal LLM research.",
    profileRole: "Undergraduate@SUSTech\nResearch Assistant@CUHK MMLab",
    profileShortBio: "I like aeroplanes and travelling.\nCanton, China",
    fullBio:
      "I am currently an RA at [CUHK MMLab](https://mmlab.ie.cuhk.edu.hk/), advised by Prof. [Xiangyu Yue](https://xyue.io/), where I study data-centric AI and RL to improve audio-video understanding in multimodal LLMs.\n\nPreviously, I worked on BCI and neural decoding at SUSTech NCC Lab with Prof. [Quanying Liu](https://scholar.google.com/citations?user=UpP9hJ8AAAAJ&hl=en). I am an UG at [SUSTech](https://sustech.edu.cn/) and Co-Founder of WormForce Corp.",
    avatar: "/images/members/mingyang-wu.jpg",
    skills: [
      "Data-Centric AI",
      "Reinforcement Learning",
      "Multimodal LLMs",
      "Audio-Video Understanding",
      "BCI & Neural Decoding",
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
          "AVCap: Reinforcing Audio-Video Joint Caption with Detail-Aware Reward",
        authors:
          "Mingyang Wu, Kaituo Feng, Bohao Li, Kaixiong Gong, Zihao Yin, Yi Yang, Xiangyu Yue",
        venue: "Under Review",
      },
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
        venue: "ICLR 2026",
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
    slug: "kunpeng-xie",
    name: "Kunpeng Xie",
    role: "Product Designer",
    shortBio:
      "Product design, interaction systems, and user-centered product delivery.",
    profileRole: "Product Designer\nCo-Founder@WormForce",
    profileShortBio:
      "Product and experience enthusiast.\nWormForce Corp.",
    fullBio:
      "I focus on product design and interaction systems, turning user needs into clear flows and visual systems. I work with the team to keep product direction aligned from ideation to shipped features. Co-Founder of [WormForce](https://wormforce.net) Corp.",
    avatar: "/images/members/kunpeng-xie.jpg",
    avatarObjectPosition: "top",
    skills: [
      "Product Strategy",
      "Interaction Design",
      "Design Systems",
      "User Research",
      "Prototyping",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/pentaoa" },
      { label: "Email", url: "mailto:xiekunpn@gmail.com" },
    ],
  },
  {
    slug: "quanbo-zhao",
    name: "Quanbo Zhao",
    role: "All-situation Engineer",
    shortBio:
      "Versatile engineer spanning optical systems, AI vision, and full-stack development.",
    fullBio:
      "I am a versatile tech generalist combining hardware knowledge with robust software engineering capabilities. My expertise encompasses optical imaging, aerospace cameras, computer vision, and deep learning for image/sequence processing. Additionally, I am an experienced developer across AR, mobile (Android/iOS), and frontend/backend full-stack environments.",
    avatar: "/images/members/member-3.jpg",
    skills: [
      "Deep Learning",
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
];

export function getMemberBySlug(slug: string): MemberProfile | undefined {
  return members.find((member) => member.slug === slug);
}
