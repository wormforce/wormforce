import type { NextRequest } from "next/server";

const prefix = "/api/battuta/community/v1";
const allowedPaths = new Set([
  "/auth/github", "/auth/github/callback", "/auth/me", "/auth/logout",
  "/auth/native/start", "/auth/native/authorize", "/auth/native/approve",
  "/auth/native/token", "/auth/native/logout", "/submissions",
]);
const errorResponse = (status: number, error: string) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function proxyBattutaCommunity(request: NextRequest) {
  const path = request.nextUrl.pathname.slice(prefix.length);
  const reviewPath = /^\/moderation\/submissions(?:\/[0-9a-f-]{36}(?:\/(?:preview\.wav|cover\.png))?)?$/.test(path);
  const publicPreview = /^\/packs\/[0-9a-f-]{36}\/releases\/[0-9a-f-]{36}\/preview\.(json|wav)$/.test(path);
  const publicCover = /^\/packs\/[0-9a-f-]{36}\/releases\/[0-9a-f-]{36}\/cover\.png$/.test(path);
  const coverPath = (reviewPath || publicCover) && path.endsWith("/cover.png");
  const publicMedia = publicPreview || publicCover;
  if (coverPath && (request.method !== "GET" || request.nextUrl.search)) return errorResponse(404, "not_found");
  if (publicPreview && (request.method !== "GET" || request.nextUrl.search)) return errorResponse(404, "not_found");
  if (!allowedPaths.has(path) && !/^\/submissions\/[0-9a-f-]{36}\/complete$/.test(path) && !reviewPath && !publicMedia) return errorResponse(404, "not_found");
  const backend = process.env.BATTUTA_COMMUNITY_BACKEND_ORIGIN;
  if (!backend) return errorResponse(503, "community_backend_not_configured");
  // Never accept the destination from browser input or follow upstream redirects.
  if (backend !== "https://community-api.wormforce.net") return errorResponse(503, "community_backend_invalid");
  const headers = new Headers();
  for (const key of ["content-type", "origin", "authorization"]) {
    const value = request.headers.get(key);
    if (value && !publicMedia) headers.set(key, value);
  }
  const cookies = request.headers.get("cookie")?.split(";").map(c => c.trim())
    .filter(c => c.startsWith("__Host-battuta-session=") || c.startsWith("__Host-battuta-oauth="));
  if (cookies?.length && !publicMedia) headers.set("cookie", cookies.join("; "));
  try {
    let body: Uint8Array | undefined;
    if (request.method === "POST" && request.body) {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = []; let length = 0;
      while (true) {
        const next = await reader.read(); if (next.done) break;
        length += next.value.byteLength;
        if (length > 16384) { await reader.cancel(); return errorResponse(413, "request_too_large"); }
        chunks.push(next.value);
      }
      body = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    }
    const upstream = await fetch(`${backend}${prefix}${path}${request.nextUrl.search}`, {
      method: request.method, headers, body: body as BodyInit | undefined,
      redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(25000),
    });
    if ((reviewPath || publicMedia) && upstream.status >= 300 && upstream.status < 400) {
      await upstream.body?.cancel(); return errorResponse(502, "invalid_review_redirect");
    }
    if (publicPreview && upstream.ok && (upstream.status !== 200 ||
      upstream.headers.get("content-type")?.split(";")[0].trim() !== (path.endsWith(".wav") ? "audio/wav" : "application/json"))) {
      await upstream.body?.cancel(); return errorResponse(502, "invalid_preview_response");
    }
    if (coverPath && upstream.ok && (upstream.status !== 200 || !upstream.body
      || upstream.headers.get("content-type")?.split(";")[0].trim() !== "image/png")) {
      await upstream.body?.cancel(); return errorResponse(502, "invalid_cover_response");
    }
    const resultHeaders = new Headers({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" });
    for (const key of ["content-type", "content-security-policy", "x-content-type-options"]) {
      const value = upstream.headers.get(key); if (value) resultHeaders.set(key, value);
    }
    for (const cookie of upstream.headers.getSetCookie()) {
      if (!publicMedia && (cookie.startsWith("__Host-battuta-session=") || cookie.startsWith("__Host-battuta-oauth="))) resultHeaders.append("set-cookie", cookie);
    }
    const location = upstream.headers.get("location");
    if (location) {
      const destination = new URL(location);
      if (!["https://www.wormforce.net", "https://github.com"].includes(destination.origin)) return errorResponse(502, "invalid_auth_redirect");
      resultHeaders.set("location", destination.href);
    }
    if ((reviewPath || publicMedia) && upstream.body) {
      const reader = upstream.body.getReader(); const chunks: Uint8Array[] = []; let total = 0;
      for (;;) {
        const next = await reader.read(); if (next.done) break;
        total += next.value.byteLength;
        if (total > (publicPreview ? 1152044 : 4 * 1024 * 1024)) { await reader.cancel(); return errorResponse(502, "review_response_too_large"); }
        chunks.push(next.value);
      }
      const bytes = new Uint8Array(total); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      if (coverPath && upstream.ok) {
        const length = upstream.headers.get("content-length");
        if (bytes.length < 67 || [137, 80, 78, 71, 13, 10, 26, 10].some((byte, index) => bytes[index] !== byte)
          || (length !== null && (!/^[1-9][0-9]*$/.test(length) || Number(length) !== bytes.length))) return errorResponse(502, "invalid_cover_response");
        resultHeaders.set("X-Content-Type-Options", "nosniff");
        resultHeaders.set("Content-Security-Policy", "default-src 'none'; sandbox");
      }
      return new Response(bytes, { status: upstream.status, headers: resultHeaders });
    }
    return new Response(upstream.body, { status: upstream.status, headers: resultHeaders });
  } catch { return errorResponse(502, "community_backend_unavailable"); }
}
