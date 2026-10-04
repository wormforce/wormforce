import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Compile the actual route, injecting backend responses and configuration.
// The fixture never enters the production catalog or public directory.
const root = new URL("../", import.meta.url);
const descriptor = JSON.parse(readFileSync(new URL("tests/fixtures/battuta-community-install-descriptor.valid.json", root), "utf8"));
const env = { BATTUTA_COMMUNITY_BACKEND_ORIGIN: 'https://community-api.wormforce.net' };
let forwarded;
let upstream = () => new Response(JSON.stringify(descriptor), { headers: {
  'Content-Type': 'application/vnd.battuta.community-install+json;version=1',
} });
const fakeFetch = async (url, options) => { forwarded = { url, options }; return upstream(); };
function load(relativePath, dependencies) {
  const source = readFileSync(new URL(relativePath, root), "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: fileURLToPath(new URL(relativePath, root)),
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const compiledModule = { exports: {} };
  const require = name => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", "process", "fetch", outputText)(require, compiledModule, compiledModule.exports, { env }, fakeFetch);
  return compiledModule.exports;
}
const packs = [{ slug: "test-only", packId: descriptor.packId, latestReleaseId: descriptor.releaseId, releases: [descriptor] }];
const resolver = load("src/lib/battuta-community.ts", {
  "@/content/battuta-community/catalog.json": { schemaVersion: 1, updatedAt: "2026-09-09", packs },
});
const route = load("src/app/api/battuta/community/v1/packs/[packId]/releases/[releaseId]/install/route.ts", {
  "@/lib/battuta-community": resolver,
});
const request = (packId = descriptor.packId, releaseId = descriptor.releaseId) => route.GET(
  new Request("https://www.wormforce.net/api/test"), { params: Promise.resolve({ packId, releaseId }) },
);
assert.equal(route.dynamic, "force-dynamic");
assert.equal(resolver.communityInstallLink(descriptor), `battuta://community/install/${descriptor.packId}/${descriptor.releaseId}`);
let response = await request();
assert.equal(response.status, 200);
assert.equal(response.headers.get("cache-control"), "no-store");
assert.equal(response.headers.get("content-type"), "application/vnd.battuta.community-install+json;version=1");
assert.equal(response.headers.get("content-encoding"), "identity");
const body = await response.text();
assert.equal(Number(response.headers.get("content-length")), Buffer.byteLength(body));
assert.deepEqual(JSON.parse(body), descriptor);
assert.equal(forwarded.options.cache, 'no-store');
assert.equal(forwarded.options.redirect, 'manual');
assert.equal(forwarded.url, `https://community-api.wormforce.net/api/battuta/community/v1/packs/${descriptor.packId}/releases/${descriptor.releaseId}/install`);
for (const pair of [["bad-id", descriptor.releaseId], [descriptor.packId.toUpperCase(), descriptor.releaseId], [descriptor.packId, descriptor.packId]]) {
  response = await request(...pair);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
}
const originalName = descriptor.name;
descriptor.name = "音".repeat(65_536);
response = await request();
assert.equal(response.status, 502);
assert.equal(response.headers.get("cache-control"), "no-store");
descriptor.name = originalName;
packs.length = 0;
upstream = () => new Response('{}', { status: 404 });
response = await request();
assert.equal(response.status, 404, "Removing a published release must stop descriptor resolution");
assert.equal(response.headers.get("cache-control"), "no-store");
for (const status of [303, 500, 503]) {
  upstream = () => new Response('{}', { status });
  assert.equal((await request()).status, 502);
}
upstream = () => new Response(JSON.stringify({ ...descriptor, packId: descriptor.releaseId }), {
  headers: { 'Content-Type': 'application/vnd.battuta.community-install+json;version=1' },
});
assert.equal((await request()).status, 502);
let cancelled = false;
upstream = () => new Response(new ReadableStream({
  pull(controller) { controller.enqueue(new Uint8Array(40_000)); },
  cancel() { cancelled = true; },
}), { headers: { 'Content-Type': 'application/vnd.battuta.community-install+json;version=1' } });
assert.equal((await request()).status, 502);
assert.equal(cancelled, true, 'Oversized streaming responses must be cancelled');
upstream = () => new Response(new Uint8Array([0xff]), {
  headers: { 'Content-Type': 'application/vnd.battuta.community-install+json;version=1' },
});
assert.equal((await request()).status, 502, 'Invalid UTF-8 must not be normalized');
env.BATTUTA_COMMUNITY_BACKEND_ORIGIN = 'https://evil.example';
assert.equal((await request()).status, 503);
delete env.BATTUTA_COMMUNITY_BACKEND_ORIGIN;
assert.equal((await request()).status, 503);
console.log("Community route tests passed: fixed backend, pinned IDs, media type, byte limits, withdrawal, errors, redirects and no-store caching.");
