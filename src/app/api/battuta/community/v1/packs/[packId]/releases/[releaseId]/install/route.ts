import { getBattutaCommunityRelease } from "@/lib/battuta-community";

const descriptorMediaType = "application/vnd.battuta.community-install+json;version=1";
const maxDescriptorBytes = 65_536;

type InstallRouteProps = {
  params: Promise<{ packId: string; releaseId: string }>;
};

function notFoundResponse() {
  return new Response(JSON.stringify({ error: "community release not found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(_request: Request, { params }: InstallRouteProps) {
  const { packId, releaseId } = await params;
  const descriptor = getBattutaCommunityRelease(packId, releaseId);
  if (!descriptor || descriptor.packId !== packId || descriptor.releaseId !== releaseId) {
    return notFoundResponse();
  }

  const body = JSON.stringify(descriptor);
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
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
