import { battutaRelease } from "@/content/battuta";
import type { MemberProfile } from "@/content/members";
import type { ProjectProfile } from "@/content/projects";
import { sustechCliRelease } from "@/content/sustech-cli";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

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
