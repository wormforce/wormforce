import { isCanonicalCommunityUuid } from "@/lib/battuta-community";

const descriptorMediaType = "application/vnd.battuta.community-install+json;version=1";
const maxDescriptorBytes = 65_536;

// Artifacts are immutable; permission to install a release is not.
export const dynamic = "force-dynamic";

type InstallRouteProps = {
  params: Promise<{ packId: string; releaseId: string }>;
};

function notFoundResponse() {
  return new Response(JSON.stringify({ error: "community release not found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(_request: Request, { params }: InstallRouteProps) {
  const { packId, releaseId } = await params;
  if (!isCanonicalCommunityUuid(packId) || !isCanonicalCommunityUuid(releaseId) || packId === releaseId) {
    return notFoundResponse();
  }
  const fail = (status: number, error: string) => Response.json({ error }, {
    status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
  const backend = process.env.BATTUTA_COMMUNITY_BACKEND_ORIGIN;
  if (backend !== "https://community-api.wormforce.net") return fail(503, "community_backend_not_configured");
  let body: string;
  try {
    // Fixed origin and canonical IDs only. No credentials or caller headers are
    // forwarded; installation descriptors are public but revocable metadata.
    const upstream = await fetch(`${backend}/api/battuta/community/v1/packs/${packId}/releases/${releaseId}/install`, {
      cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15000),
      headers: { Accept: descriptorMediaType },
    });
    if (upstream.status === 404) { await upstream.body?.cancel(); return notFoundResponse(); }
    if (!upstream.ok || upstream.headers.get("content-type") !== descriptorMediaType || !upstream.body) {
      await upstream.body?.cancel(); return fail(502, "invalid_install_response");
    }
    const reader = upstream.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const next = await reader.read(); if (next.done) break;
      size += next.value.byteLength;
      if (size > maxDescriptorBytes) { await reader.cancel(); return fail(502, "install_response_too_large"); }
      chunks.push(next.value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    body = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const descriptor = JSON.parse(body);
    if (descriptor.schemaVersion !== 1 || descriptor.packId !== packId || descriptor.releaseId !== releaseId) {
      return fail(502, "install_identity_mismatch");
    }
    // Backend validates the full descriptor. Clients independently validate it
    // again; preserve raw bytes so duplicate keys cannot be normalized away.
  } catch { return fail(502, "community_backend_unavailable"); }
  const byteCount = new TextEncoder().encode(body).byteLength;
  if (byteCount > maxDescriptorBytes) {
    return new Response(JSON.stringify({ error: "community descriptor exceeds the transport limit" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": descriptorMediaType,
      "Content-Encoding": "identity",
      "Content-Length": String(byteCount),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
