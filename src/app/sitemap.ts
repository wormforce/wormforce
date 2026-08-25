import type { MetadataRoute } from "next";
import { members } from "@/content/members";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/projects"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/projects/battuta/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const memberPages: MetadataRoute.Sitemap = members.map((member) => ({
    url: absoluteUrl(`/members/${member.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...pages, ...memberPages, ...projectPages];
}
