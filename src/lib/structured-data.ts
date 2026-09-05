import {
  battutaPaths,
  battutaRelease,
  type BattutaLocale,
} from "@/content/battuta";
import type { MemberProfile } from "@/content/members";
import type { ProjectProfile } from "@/content/projects";
import { sustechCliRelease } from "@/content/sustech-cli";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

const battutaLocalizedMetadata = {
  "zh-CN": {
    path: battutaPaths.zh,
    description:
      "Battuta 是一款适用于 macOS 与 Windows 的开源键盘音效应用，提供 21 种机械键盘音色、DIY 音色包、低延迟播放与本地输入统计。",
    featureList: [
      "21 种键盘音色与 5 种独立点击风格。",
      "支持逐键按下与回弹录音的 DIY 音色编辑器。",
      "不保存输入文字的本地隐私统计。",
    ],
  },
  en: {
    path: battutaPaths.en,
    description:
      "Battuta is an open-source keyboard sound app for macOS and Windows with 21 mechanical profiles, custom sound packs, low-latency playback, and private local typing statistics.",
    featureList: [
      "21 keyboard sound profiles and five independent pointer-click styles.",
      "A DIY editor for per-key press and release samples.",
      "Private local statistics without storing typed text.",
    ],
  },
} as const;

export function battutaStructuredData(locale: BattutaLocale) {
  const content = battutaLocalizedMetadata[locale];
  const projectUrl = absoluteUrl(content.path);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${projectUrl}#software`,
    name: "Battuta",
    url: projectUrl,
    description: content.description,
    inLanguage: locale,
    image: absoluteUrl("/battuta/og-v1.2.0.png"),
    dateModified: battutaRelease.updatedAt,
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    isAccessibleForFree: true,
    featureList: content.featureList,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: ["macOS 13 or later", "Windows 10 or 11 x64"],
    softwareVersion: battutaRelease.version,
    downloadUrl: [
      battutaRelease.macDownloadUrl,
      battutaRelease.windowsPortableDownloadUrl,
    ],
    installUrl: battutaRelease.windowsStoreUrl,
    codeRepository: battutaRelease.repositoryUrl,
    license: battutaRelease.licenseUrl,
    sameAs: [battutaRelease.repositoryUrl, battutaRelease.windowsStoreUrl],
  };
}

export function homeStructuredData(members: MemberProfile[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: teamProfile.name,
        alternateName: ["Wormforce Team", "wormforce.net"],
        description: teamProfile.seoDescription,
        publisher: { "@id": organizationId },
        inLanguage: ["en", "zh-CN"],
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: teamProfile.name,
        alternateName: "Wormforce Team",
        url: absoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/wormforce-app-icon-1024.png"),
          width: 1024,
          height: 1024,
        },
        description: teamProfile.seoDescription,
        email: teamProfile.contactEmail,
        sameAs: teamProfile.socialLinks
          .map((link) => link.url)
          .filter((url) => url.startsWith("https://")),
        knowsAbout: [
          "Applied AI",
          "Open-source software",
          "Developer tools",
          "Multimodal AI",
          "Native desktop applications",
        ],
        member: members.map((member) => ({
          "@type": "Person",
          "@id": absoluteUrl(`/members/${member.slug}#person`),
          name: member.name,
          url: absoluteUrl(`/members/${member.slug}`),
        })),
      },
    ],
  };
}

export function memberStructuredData(member: MemberProfile) {
  const profileUrl = absoluteUrl(`/members/${member.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${profileUrl}#profile-page`,
    url: profileUrl,
    name: `${member.name} | Wormforce`,
    description: member.seoDescription,
    mainEntity: {
      "@type": "Person",
      "@id": `${profileUrl}#person`,
      name: member.name,
      url: profileUrl,
      image: absoluteUrl(member.avatar),
      jobTitle: member.role,
      description: member.seoDescription,
      knowsAbout: member.skills,
      sameAs: member.links
        .map((link) => link.url)
        .filter((url) => url.startsWith("https://")),
      memberOf: { "@id": organizationId },
    },
    isPartOf: { "@id": websiteId },
  };
}

export function projectStructuredData(project: ProjectProfile) {
  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const base = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${projectUrl}#software`,
    name: project.name,
    url: projectUrl,
    description: project.seoDescription,
    image: absoluteUrl(project.coverImage),
    dateModified: project.updatedAt,
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    isAccessibleForFree: true,
    featureList: project.highlights,
  };

  if (project.slug === "battuta") {
    return {
      ...base,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: ["macOS 13 or later", "Windows 10 or 11 x64"],
      softwareVersion: battutaRelease.version,
      downloadUrl: [
        battutaRelease.macDownloadUrl,
        battutaRelease.windowsPortableDownloadUrl,
      ],
      installUrl: battutaRelease.windowsStoreUrl,
      codeRepository: battutaRelease.repositoryUrl,
      license: battutaRelease.licenseUrl,
      sameAs: [
        battutaRelease.repositoryUrl,
        battutaRelease.windowsStoreUrl,
      ],
    };
  }

  if (project.slug === "sustech-cli") {
    return {
      ...base,
      applicationCategory: "DeveloperApplication",
      operatingSystem: ["macOS", "Windows", "Linux"],
      softwareRequirements: "Node.js 20.18 or later",
      softwareVersion: sustechCliRelease.version,
      downloadUrl: sustechCliRelease.npmUrl,
      installUrl: sustechCliRelease.npmUrl,
      codeRepository: sustechCliRelease.repositoryUrl,
      license: sustechCliRelease.licenseUrl,
      sameAs: [sustechCliRelease.repositoryUrl, sustechCliRelease.npmUrl],
    };
  }

  return base;
}
