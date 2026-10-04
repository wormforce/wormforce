import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const env = { BATTUTA_COMMUNITY_BACKEND_ORIGIN: 'https://community-api.wormforce.net' };
let called, calls = 0;
const page = { schemaVersion: 1, totalPacks: 80,
  manufacturers: [{ name: 'Personal studio', count: 31 }, { name: 'CHERRY', count: 2 }], hasMore: false };
let upstream = () => Response.json(page);
function load(path, dependencies) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'require', 'process', 'fetch', compiled)(exports, name => {
    assert.ok(Object.hasOwn(dependencies, name)); return dependencies[name];
  }, { env }, async (url, options) => { called = { url, options }; calls++; return upstream(); });
  return exports;
}
const library = load('src/lib/battuta-community-catalog.ts', { './battuta-community': {} });
assert.deepEqual(library.parseCommunityFacets(page), page);
assert.deepEqual(library.parseCommunityFacets({ ...page, privateObjectKey: 'omit',
  manufacturers: page.manufacturers.map(item => ({ ...item, private: 'omit' })) }), page, 'whitelist public fields');
assert.deepEqual(library.parseCommunityFacets({ schemaVersion: 1, totalPacks: 4, manufacturers: [], hasMore: false }),
  { schemaVersion: 1, totalPacks: 4, manufacturers: [], hasMore: false }, 'unknown hardware is not zero works');
for (const invalid of [null, [], {}, { ...page, totalPacks: '80' }, { ...page, totalPacks: 1 },
  { ...page, totalPacks: -1 }, { ...page, totalPacks: Number.MAX_SAFE_INTEGER + 1 },
  { ...page, hasMore: true }, { ...page, hasMore: null },
  ...['', ' A ', 'A\u0000', 'x'.repeat(81)].map(name => ({ ...page, manufacturers: [{ name, count: 1 }] })),
  ...[-1, 0, 1.5, '1', 81].map(count => ({ ...page, manufacturers: [{ name: 'A', count }] })),
  { ...page, manufacturers: [{ name: 'A', count: 1 }, { name: 'a', count: 1 }] },
  { ...page, totalPacks: 5, manufacturers: [{ name: 'A', count: 3 }, { name: 'B', count: 3 }] },
  { ...page, manufacturers: Array.from({ length: 51 }, (_, i) => ({ name: `Studio ${i}`, count: 1 })) }]) {
  assert.throws(() => library.parseCommunityFacets(invalid));
}
const limited = { ...page, manufacturers: Array.from({ length: 50 }, (_, i) => ({ name: `Studio ${i}`, count: 1 })), hasMore: true };
assert.deepEqual(library.parseCommunityFacets(limited), limited);
let cancelled = false;
await assert.rejects(library.readFacetsResponse(new Response(new ReadableStream({
  pull(controller) { controller.enqueue(new Uint8Array(80000)); }, cancel() { cancelled = true; },
}), { headers: { 'Content-Type': 'application/json' } })), /facets_too_large/);
assert.equal(cancelled, true);
await assert.rejects(library.readFacetsResponse(new Response('{}', { status: 503 })), /facets_unavailable/);
const route = load('src/app/api/battuta/community/v1/packs/facets/route.ts', { '@/lib/battuta-community-catalog': library });
const request = query => route.GET(new Request('https://www.wormforce.net/api/battuta/community/v1/packs/facets' + query));
assert.deepEqual(await (await request('')).json(), page);
assert.equal(called.url, 'https://community-api.wormforce.net/api/battuta/community/v1/packs/facets');
assert.equal(called.options.redirect, 'manual'); assert.equal(called.options.cache, 'no-store');
assert.equal((await request('?q=%20Personal%20studio%20')).headers.get('cache-control'), 'no-store');
assert.equal(new URL(called.url).searchParams.get('q'), 'Personal studio');
const prior = calls;
for (const query of ['?q=a&q=b', '?limit=1', '?after=anything', '?q=%00', '?q=' + 'x'.repeat(81)]) assert.equal((await request(query)).status, 400);
assert.equal(calls, prior);
upstream = () => new Response(null, { status: 302, headers: { Location: 'https://other.invalid' } });
assert.equal((await request('')).status, 502);
upstream = () => Response.json({ schemaVersion: 1, manufacturers: [] });
assert.equal((await request('')).status, 502);
env.BATTUTA_COMMUNITY_BACKEND_ORIGIN = 'https://other.invalid';
assert.equal((await request('')).status, 503);
console.log('Global manufacturer facet tests passed: full-directory counts, rare studios, bounds, private field stripping and fixed-host proxy.');
