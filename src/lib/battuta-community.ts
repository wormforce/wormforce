import catalog from "@/content/battuta-community/catalog.json";
import type { BattutaLocale } from "@/content/battuta";

export type CommunityInstallDescriptor = {
  schemaVersion: 1;
  packId: string;
  releaseId: string;
  releaseSequence: number;
  displayVersion: string;
  name: string;
  author: {
    id: string;
    displayName: string;
  };
  license: {
    name: string;
    spdxId?: string;
    url?: string;
    attribution?: string;
  };
  packageManifestId: string;
  artifact: {
    path: string;
    byteCount: number;
    sha256: string;
  };
  minimumBattutaVersion: {
    macos: string;
    windows: string;
  };
  publishedAt: string;
};

export type BattutaCommunityPack = {
  slug: string;
  packId: string;
  name: string;
  summary: Record<BattutaLocale, string>;
  description: Record<BattutaLocale, string>;
  tags: Record<BattutaLocale, string[]>;
  coverImage?: string;
  previewAudio?: string;
  latestReleaseId: string;
  releases: CommunityInstallDescriptor[];
};

type BattutaCommunityCatalog = {
  schemaVersion: 1;
  updatedAt: string;
  packs: BattutaCommunityPack[];
};

const canonicalUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const communityCatalog = catalog as unknown as BattutaCommunityCatalog;

export const battutaCommunityPacks = communityCatalog.packs;
export const battutaCommunityUpdatedAt = communityCatalog.updatedAt;

export function isCanonicalCommunityUuid(value: string) {
  return canonicalUuid.test(value);
}

export function getBattutaCommunityPackBySlug(slug: string) {
  return battutaCommunityPacks.find((pack) => pack.slug === slug);
}

export function getLatestBattutaCommunityRelease(pack: BattutaCommunityPack) {
  return pack.releases.find((release) => release.releaseId === pack.latestReleaseId);
}

export function getBattutaCommunityRelease(packId: string, releaseId: string) {
  if (!isCanonicalCommunityUuid(packId) || !isCanonicalCommunityUuid(releaseId)) {
    return undefined;
  }

  const pack = battutaCommunityPacks.find((candidate) => candidate.packId === packId);
  if (!pack) {
    return undefined;
  }

  return pack.releases.find((release) => release.releaseId === releaseId);
}

export function communityPackPath(pack: BattutaCommunityPack, locale: BattutaLocale) {
  const prefix = locale === "en"
    ? "/en/projects/battuta/community/packs"
    : "/projects/battuta/community/packs";
  return `${prefix}/${pack.slug}`;
}

export function communityInstallLink(descriptor: CommunityInstallDescriptor) {
  return `battuta://community/install/${descriptor.packId}/${descriptor.releaseId}`;
}
