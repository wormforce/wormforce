import { readCatalogResponse } from "@/lib/battuta-community-catalog";
import { isCanonicalCommunityUuid } from "@/lib/battuta-community";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const fail = (status: number, error: string) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
  const query = new URL(request.url).searchParams;
  const after = query.get("after");
  const filters = ["q", "manufacturer", "switchType", "author"];
  if ([...query.keys()].some(key => !["after", ...filters].includes(key) || query.getAll(key).length > 1)
    || (after !== null && !isCanonicalCommunityUuid(after))) return fail(400, "invalid_catalog_page");
  for (const key of filters) {
    const value = query.get(key) ?? "";
    if ([...value].length > 160 || /[\p{Cc}\p{Cs}]/u.test(value)) return fail(400, "invalid_catalog_filter");
  }
  if (query.get("switchType") && !["linear", "tactile", "clicky", "silent", "electrocapacitive", "magnetic", "other"].includes(query.get("switchType")!)) return fail(400, "invalid_catalog_filter");
  const backend = process.env.BATTUTA_COMMUNITY_BACKEND_ORIGIN;
  if (backend !== "https://community-api.wormforce.net") return fail(503, "community_backend_not_configured");
  try {
    const forwarded = new URLSearchParams({ limit: "24" });
    if (after) forwarded.set("after", after);
    for (const key of filters) { const value = query.get(key)?.trim(); if (value) forwarded.set(key, value); }
    const upstream = await fetch(`${backend}/api/battuta/community/v1/packs?${forwarded}`, {
      cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15000), headers: { Accept: "application/json" },
    });
    const page = await readCatalogResponse(upstream);
    return Response.json(page, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return fail(502, "community_catalog_unavailable"); }
}
