import type { CommunityInstallDescriptor } from "./battuta-community";
import type { CommunityPresentation } from "./battuta-community-catalog";

const manufacturers: Record<string, string> = {
  cherry: "CHERRY", kailh: "Kailh", gateron: "Gateron", topre: "Topre", ibm: "IBM",
  novelkeys: "NovelKeys", keychron: "Keychron", logitech: "Logitech", alps: "ALPS",
  alpaca: "Alpaca", zealpc: "ZealPC",
};
const switchTypes: Record<string, string> = {
  "线性": "linear", "段落": "tactile", "点击": "clicky", "静电容": "electrocapacitive",
  "静音": "silent", "磁轴": "magnetic", "其他": "other", "屈曲弹簧": "other",
};

export function atlasCatalogQuery(search: string, brand: string, family: string, manufacturer = "") {
  const query = new URLSearchParams();
  if (search.trim()) query.set("q", search.trim());
  const maker = manufacturer.trim() || manufacturers[brand];
  if (maker) query.set("manufacturer", maker);
  if (switchTypes[family]) query.set("switchType", switchTypes[family]);
  return query.toString();
}

export type AtlasEntry<T> =
  | { kind: "demo"; id: string; name: string; brand: string; profile: T }
  | { kind: "release"; id: string; name: string; brand: string; release: CommunityInstallDescriptor; presentation?: CommunityPresentation };

export function mergeAtlasEntries<T>(demos: Extract<AtlasEntry<T>, { kind: "demo" }>[],
  releases: CommunityInstallDescriptor[], presentations: Record<string, CommunityPresentation>,
  sort: "curated" | "name"): AtlasEntry<T>[] {
  const entries: AtlasEntry<T>[] = [
    ...releases.map(release => ({ kind: "release" as const, id: `release:${release.releaseId}`, name: release.name,
      brand: presentations[release.releaseId]?.manufacturer ?? "", release, presentation: presentations[release.releaseId] })),
    ...demos,
  ];
  if (sort === "name") return entries.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  // Stable manufacturer order, not invented popularity or a claim of official ownership.
  return entries.sort((a, b) => a.brand.localeCompare(b.brand)
    || (a.kind === b.kind ? 0 : a.kind === "release" ? -1 : 1));
}

export function releaseSwitchIllustration(info?: CommunityPresentation) {
  const model = info?.switchModel?.trim().toLowerCase();
  const maker = info?.manufacturer?.trim().toLowerCase();
  const known: Record<string, string> = {
    "cherry mx blue": "cherry-mx-blue", "mx blue": "cherry-mx-blue",
    "cherry mx brown": "cherry-mx-brown", "mx brown": "cherry-mx-brown",
    "cherry mx clear": "cherry-mx-clear", "mx clear": "cherry-mx-clear",
  };
  // Only a documented, recognized model receives an illustrative axis image.
  // No inference of a personal creator's hardware from the sound/name alone.
  if (maker === "cherry" && model && known[model]) return `/battuta/community/switches/${known[model]}.png`;
  return null;
}
