import { readFacetsResponse } from "@/lib/battuta-community-catalog";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const fail = (status: number, error: string) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
  const query = new URL(request.url).searchParams;
  const q = query.get("q") ?? "";
  if ([...query.keys()].some(key => key !== "q") || query.getAll("q").length > 1
    || [...q].length > 80 || /[\p{Cc}\p{Cs}]/u.test(q)) return fail(400, "invalid_catalog_filter");
  const backend = process.env.BATTUTA_COMMUNITY_BACKEND_ORIGIN;
  if (backend !== "https://community-api.wormforce.net") return fail(503, "community_backend_not_configured");
  try {
    const suffix = q.trim() ? `?${new URLSearchParams({ q: q.trim() })}` : "";
    const upstream = await fetch(`${backend}/api/battuta/community/v1/packs/facets${suffix}`, {
      cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15000), headers: { Accept: "application/json" },
    });
    const page = await readFacetsResponse(upstream);
    return Response.json(page, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return fail(502, "community_facets_unavailable"); }
}
