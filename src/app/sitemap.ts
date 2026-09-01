import type { MetadataRoute } from "next";
import { battutaPaths } from "@/content/battuta";
import { battutaGuides } from "@/content/battuta-guides";
import { members } from "@/content/members";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: "2026-08-29",
    },
    {
      url: absoluteUrl("/projects"),
      lastModified: "2026-08-29",
    },
    {
      url: absoluteUrl(battutaPaths.privacy.zh),
      lastModified: "2026-08-25",
    },
    {
      url: absoluteUrl(battutaPaths.en),
      lastModified: "2026-09-01",
    },
    {
      url: absoluteUrl(battutaPaths.privacy.en),
      lastModified: "2026-09-01",
    },
  ];

  const memberPages: MetadataRoute.Sitemap = members.map((member) => ({
    url: absoluteUrl(`/members/${member.slug}`),
    lastModified: "2026-08-29",
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: project.updatedAt,
  }));

  const guidePages: MetadataRoute.Sitemap = battutaGuides.map((guide) => ({
    url: absoluteUrl(guide.path),
    lastModified: guide.updatedAt,
  }));

  return [...pages, ...memberPages, ...projectPages, ...guidePages];
}
