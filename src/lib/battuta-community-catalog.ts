import { isCanonicalCommunityUuid, type CommunityInstallDescriptor } from "./battuta-community";

export type CommunityPresentation = { manufacturer?: string; switchModel?: string; recordingAuthor?: string; description?: string; switchType?: string };
export type CommunityCatalogPage = { schemaVersion: 1; releases: CommunityInstallDescriptor[]; nextCursor: string | null; presentations?: Record<string, CommunityPresentation> };
export type CommunityCatalogFacets = { schemaVersion: 1; totalPacks: number; manufacturers: { name: string; count: number }[]; hasMore: boolean };

export function parseCommunityFacets(value: unknown): CommunityCatalogFacets {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("invalid_facets");
  const page = value as CommunityCatalogFacets;
  if (page.schemaVersion !== 1 || !Number.isSafeInteger(page.totalPacks) || page.totalPacks < 0
    || typeof page.hasMore !== "boolean" || !Array.isArray(page.manufacturers) || page.manufacturers.length > 50
    || (page.hasMore && page.manufacturers.length !== 50)) throw Error("invalid_facets");
  const names = new Set<string>(); let sum = 0;
  const manufacturers = page.manufacturers.map(item => {
    if (!item || typeof item.name !== "string" || !item.name.trim() || item.name !== item.name.trim()
      || [...item.name].length > 80 || /[\p{Cc}\p{Cs}]/u.test(item.name) || names.has(item.name.toLowerCase())
      || !Number.isSafeInteger(item.count) || item.count < 1 || item.count > page.totalPacks) throw Error("invalid_facets");
    names.add(item.name.toLowerCase()); sum += item.count;
    return { name: item.name, count: item.count };
  });
  if (!Number.isSafeInteger(sum) || sum > page.totalPacks) throw Error("invalid_facets");
  return { schemaVersion: 1, totalPacks: page.totalPacks, manufacturers, hasMore: page.hasMore };
}

export function parseCommunityCatalog(value: unknown): CommunityCatalogPage {
  if (!value || typeof value !== "object") throw Error("invalid_catalog");
  const page = value as CommunityCatalogPage;
  if (page.schemaVersion !== 1 || !Array.isArray(page.releases) || page.releases.length > 50
    || (page.nextCursor !== null && (typeof page.nextCursor !== "string" || !isCanonicalCommunityUuid(page.nextCursor)))) throw Error("invalid_catalog");
  const ids = new Set<string>();
  for (const release of page.releases) {
    if (!release || release.schemaVersion !== 1
      || ![release.packId, release.releaseId, release.packageManifestId, release.author?.id].every(id => typeof id === "string" && isCanonicalCommunityUuid(id))
      || new Set([release.packId, release.releaseId, release.packageManifestId]).size !== 3
      || typeof release.name !== "string" || !release.name.trim() || release.name.length > 480
      || typeof release.author.displayName !== "string" || release.author.displayName.length > 320
      || typeof release.displayVersion !== "string" || release.displayVersion.length > 80
      || !Number.isSafeInteger(release.releaseSequence) || release.releaseSequence < 1
      || typeof release.license?.name !== "string" || release.license.name.length > 480
      || typeof release.minimumBattutaVersion?.macos !== "string" || typeof release.minimumBattutaVersion?.windows !== "string"
      || !release.artifact || !/^[a-f0-9]{64}$/.test(release.artifact.sha256)
      || !Number.isSafeInteger(release.artifact.byteCount) || release.artifact.byteCount < 1 || release.artifact.byteCount > 134217728
      || release.artifact.path !== `battuta/packs/${release.packId}/releases/${release.releaseId}/${release.artifact.sha256}.simuboardpack.zip`
      || ids.has(release.packId)) throw Error("invalid_catalog_release");
    ids.add(release.packId);
  }
  if (page.presentations !== undefined) {
    if (!page.presentations || typeof page.presentations !== "object" || Array.isArray(page.presentations)) throw Error("invalid_presentations");
    for (const [id, info] of Object.entries(page.presentations)) {
      if (!page.releases.some(release => release.releaseId === id) || !info || typeof info !== "object" || Array.isArray(info)) throw Error("invalid_presentation_identity");
      const limits: Record<string, number> = { manufacturer: 80, switchModel: 120, recordingAuthor: 160, description: 1200, switchType: 32 };
      for (const [key, value] of Object.entries(info)) {
        if (!Object.hasOwn(limits, key) || typeof value !== "string" || [...value].length > limits[key] || /[\p{Cc}\p{Cs}]/u.test(value)) throw Error("invalid_presentation");
      }
      if (info.switchType && !["linear", "tactile", "clicky", "silent", "electrocapacitive", "magnetic", "other"].includes(info.switchType)) throw Error("invalid_switch_type");
    }
  }
  return page;
}

async function readBoundedCatalogJSON(response: Response, maximum: number, prefix: string): Promise<unknown> {
  if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "application/json" || !response.body) {
    await response.body?.cancel(); throw Error(`${prefix}_unavailable`);
  }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let count = 0;
  for (;;) {
    const next = await reader.read(); if (next.done) break;
    count += next.value.length;
    if (count > maximum) { await reader.cancel(); throw Error(`${prefix}_too_large`); }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(count); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export async function readCatalogResponse(response: Response): Promise<CommunityCatalogPage> {
  return parseCommunityCatalog(await readBoundedCatalogJSON(response, 1_048_576, "catalog"));
}

export async function readFacetsResponse(response: Response): Promise<CommunityCatalogFacets> {
  return parseCommunityFacets(await readBoundedCatalogJSON(response, 131_072, "facets"));
}
