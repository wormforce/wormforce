import type { MetadataRoute } from "next";
import { battutaPaths } from "@/content/battuta";
import { battutaGuides } from "@/content/battuta-guides";
import { members } from "@/content/members";
import { projects } from "@/content/projects";
import {
  battutaCommunityPacks,
  battutaCommunityUpdatedAt,
  communityPackPath,
  getLatestBattutaCommunityRelease,
} from "@/lib/battuta-community";
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
      lastModified: "2026-09-03",
    },
    {
      url: absoluteUrl(battutaPaths.en),
      lastModified: "2026-09-01",
    },
    {
      url: absoluteUrl(battutaPaths.privacy.en),
      lastModified: "2026-09-03",
    },
    {
      url: absoluteUrl(battutaPaths.community.zh),
      lastModified: battutaCommunityUpdatedAt,
    },
    {
      url: absoluteUrl(battutaPaths.community.en),
      lastModified: battutaCommunityUpdatedAt,
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

  const communityPackPages: MetadataRoute.Sitemap = battutaCommunityPacks.flatMap((pack) => {
    const lastModified = getLatestBattutaCommunityRelease(pack)?.publishedAt ?? battutaCommunityUpdatedAt;
    return [
      { url: absoluteUrl(communityPackPath(pack, "zh-CN")), lastModified },
      { url: absoluteUrl(communityPackPath(pack, "en")), lastModified },
    ];
  });

  return [...pages, ...memberPages, ...projectPages, ...guidePages, ...communityPackPages];
}
