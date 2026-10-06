import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const descriptor = JSON.parse(readFileSync(new URL('../tests/fixtures/battuta-community-install-descriptor.valid.json', import.meta.url)));
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
const env = { BATTUTA_COMMUNITY_BACKEND_ORIGIN: 'https://community-api.wormforce.net' };
const page = { schemaVersion: 1, releases: [descriptor], nextCursor: null };
let called;
let upstream = () => Response.json(page);
function load(path, dependencies) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'require', 'process', 'fetch', compiled)(exports, name => {
    assert.ok(Object.hasOwn(dependencies, name)); return dependencies[name];
  }, { env }, async (url, options) => { called = { url, options }; return upstream(); });
  return exports;
}
const library = load('src/lib/battuta-community-catalog.ts', { './battuta-community': { isCanonicalCommunityUuid: uuid } });
assert.deepEqual(library.parseCommunityCatalog(page), page);
const macOnly = structuredClone(descriptor);
macOnly.minimumBattutaVersion.windows = null;
assert.deepEqual(library.parseCommunityCatalog({ ...page, releases: [macOnly] }).releases, [macOnly]);
for (const windows of [undefined, false, 123, {}, []]) {
  const malformed = structuredClone(macOnly);
  if (windows === undefined) delete malformed.minimumBattutaVersion.windows;
  else malformed.minimumBattutaVersion.windows = windows;
  assert.throws(() => library.parseCommunityCatalog({ ...page, releases: [malformed] }));
}
const cover = { schemaVersion: 1, available: true, format: 'png', sha256: 'c'.repeat(64), byteCount: 200, width: 40, height: 20,
  path: `battuta/packs/${descriptor.packId}/releases/${descriptor.releaseId}/${'c'.repeat(64)}.cover.png` };
const coverPage = { ...page, covers: { [descriptor.releaseId]: cover } };
assert.deepEqual(library.parseCommunityCatalog(coverPage), coverPage);
for (const patch of [{ path: 'https://evil.invalid/payload.svg' }, { sha256: 'd'.repeat(64) }, { width: 1025 },
  { byteCount: 4194305 }, { format: 'svg' }, { available: false }, { url: 'https://evil.invalid' }]) {
  assert.throws(() => library.parseCommunityCatalog({ ...page, covers: { [descriptor.releaseId]: { ...cover, ...patch } } }));
}
assert.throws(() => library.parseCommunityCatalog({ ...page, covers: { [descriptor.packId]: cover } }));
for (const invalid of [null, {}, { ...page, nextCursor: 'bad' }, { ...page, releases: [descriptor, descriptor] },
  { ...page, releases: [{ ...descriptor, author: null }] },
  { ...page, releases: [{ ...descriptor, artifact: { ...descriptor.artifact, path: 'other.zip' } }] }]) {
  assert.throws(() => library.parseCommunityCatalog(invalid));
}
let cancelled = false;
await assert.rejects(library.readCatalogResponse(new Response(new ReadableStream({
  pull(controller) { controller.enqueue(new Uint8Array(600000)); }, cancel() { cancelled = true; },
}), { headers: { 'Content-Type': 'application/json' } })), /catalog_too_large/);
assert.equal(cancelled, true);
await assert.rejects(library.readCatalogResponse(new Response('{}', { status: 503 })), /catalog_unavailable/);
const route = load('src/app/api/battuta/community/v1/packs/route.ts', {
  '@/lib/battuta-community-catalog': library, '@/lib/battuta-community': { isCanonicalCommunityUuid: uuid },
});
const request = query => route.GET(new Request('https://www.wormforce.net/api/battuta/community/v1/packs' + query));
const response = await request('');
assert.deepEqual(await response.json(), page);
assert.equal(response.headers.get('cache-control'), 'no-store');
assert.equal(called.url, 'https://community-api.wormforce.net/api/battuta/community/v1/packs?limit=24');
assert.equal(called.options.redirect, 'manual');
assert.equal((await request('?q=BOX%20White&manufacturer=Kailh&switchType=clicky&author=Recorder')).status, 200);
const forwardedQuery = new URL(called.url).searchParams;
assert.equal(forwardedQuery.get('q'), 'BOX White');
assert.equal(forwardedQuery.get('manufacturer'), 'Kailh');
assert.equal(forwardedQuery.get('switchType'), 'clicky');
assert.equal(forwardedQuery.get('author'), 'Recorder');
for (const query of ['?q=one&q=two', '?switchType=invalid', '?author=%00', '?q=' + 'x'.repeat(161)]) {
  assert.equal((await request(query)).status, 400);
}
for (const query of ['?limit=100', '?after=bad', `?after=${descriptor.packId}&after=${descriptor.packId}`]) {
  assert.equal((await request(query)).status, 400);
}
upstream = () => new Response(null, { status: 303, headers: { Location: 'https://example.com' } });
assert.equal((await request('')).status, 502);
env.BATTUTA_COMMUNITY_BACKEND_ORIGIN = '';
assert.equal((await request('')).status, 503);
console.log('Live catalog tests passed: shapes, identities, pagination, stream bounds, fixed backend and distinct failure states.');
