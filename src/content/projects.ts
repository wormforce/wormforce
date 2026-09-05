export type ProjectProfile = {
  slug: string;
  name: string;
  platform: string;
  status: "Live" | "Preview" | "In Development";
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
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
    slug: "sustech-cli",
    name: "sustech cli",
    platform: "Node.js CLI",
    status: "Preview",
    tagline: "一条命令，连接你的南科大。",
    shortDescription:
      "为人、脚本与智能体设计的南科大命令行工具，覆盖教务、Blackboard、校园服务与结构化输出。",
    fullDescription:
      "sustech cli 将分散的校园服务统一成清晰的命令行界面，默认输出适合人类阅读的文本，也支持带版本的 JSON 与 JSONL。",
    seoTitle: "sustech cli — 南科大学生命令行工具",
    seoDescription:
      "sustech cli 是面向南科大学生、脚本与智能体的命令行工具，支持课表、课程、校车、Blackboard、校园服务及版本化 JSON 输出。",
    updatedAt: "2026-08-29",
    coverImage: "/sustech-cli/sustech-cli-frutiger-social-2400x1260.png",
    coverImageAlt: "白色背景上的 sustech cli 字标",
    highlights: [
      "一条 npm 命令全局安装，无需 Python 运行环境。",
      "公开数据、教务、Blackboard 与校园服务统一入口。",
      "为脚本与智能体提供带版本的结构化输出。",
    ],
    featureBlocks: [
      { title: "查询", description: "课表、课程、校车、教师与更多校园信息。" },
      { title: "集成", description: "Text、JSON 与 JSONL 三种稳定输出模式。" },
      { title: "确认", description: "远程变更采用预览、显式确认与回读验证。" },
    ],
  },
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
    seoTitle: "Battuta: Keyboard Sound App for Mac & Windows",
    seoDescription:
      "Battuta is an open-source keyboard sound app for Mac and Windows with 21 mechanical profiles, custom sound packs, low-latency playback, and local stats.",
    updatedAt: "2026-08-28",
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
