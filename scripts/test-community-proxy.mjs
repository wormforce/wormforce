import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/battuta-community-proxy.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
const env = {};
let forwarded;
let upstream = () => new Response('{}', { headers: { 'Content-Type': 'application/json' } });
const fakeFetch = async (url, options) => { forwarded = { url, options }; return upstream(); };
new Function('exports', 'process', 'fetch', compiled)(exports, { env }, fakeFetch);
function request(path, options = {}) {
  const r = new Request(`https://www.wormforce.net/api/battuta/community/v1${path}`, options);
  r.nextUrl = new URL(r.url);
  return r;
}
assert.equal((await exports.proxyBattutaCommunity(request('/auth/me'))).status, 503);
env.BATTUTA_COMMUNITY_BACKEND_ORIGIN = 'https://untrusted.example';
assert.equal((await exports.proxyBattutaCommunity(request('/auth/me'))).status, 503);
env.BATTUTA_COMMUNITY_BACKEND_ORIGIN = 'https://community-api.wormforce.net';
assert.equal((await exports.proxyBattutaCommunity(request('/not-allowed'))).status, 404);
await exports.proxyBattutaCommunity(request('/auth/me', { headers: { cookie: '__Host-battuta-session=abc; unrelated-secret=never-forward', host: 'evil.example' } }));
assert.equal(forwarded.options.headers.get('cookie'), '__Host-battuta-session=abc');
assert.equal(forwarded.options.headers.get('host'), null);
assert.equal(forwarded.options.redirect, 'manual');
assert.equal(forwarded.options.cache, 'no-store');
assert.equal(forwarded.url, 'https://community-api.wormforce.net/api/battuta/community/v1/auth/me');
upstream = () => new Response(null, { status: 303, headers: { Location: 'https://evil.example' } });
assert.equal((await exports.proxyBattutaCommunity(request('/auth/github'))).status, 502);
upstream = () => new Response(null, { status: 303, headers: { Location: 'https://github.com/login/oauth/authorize', 'Set-Cookie': '__Host-battuta-oauth=abc; Path=/; Secure; HttpOnly' } });
const redirect = await exports.proxyBattutaCommunity(request('/auth/github'));
assert.equal(redirect.status, 303);
assert.match(redirect.headers.get('set-cookie'), /__Host-battuta-oauth=/);
assert.equal((await exports.proxyBattutaCommunity(request('/auth/native/start', { method: 'POST', body: 'x'.repeat(17000) }))).status, 413);
upstream = () => new Response('private audio', { headers: { 'Content-Type': 'audio/wav' } });
const reviewAudio = await exports.proxyBattutaCommunity(request('/moderation/submissions/10000000-0000-4000-8000-000000000001/preview.wav', {
  headers: { cookie: '__Host-battuta-session=reviewer; unrelated=hidden' },
}));
assert.equal(reviewAudio.headers.get('cache-control'), 'no-store');
assert.equal(reviewAudio.headers.get('content-type'), 'audio/wav');
assert.equal(await reviewAudio.text(), 'private audio');
assert.equal(forwarded.options.headers.get('cookie'), '__Host-battuta-session=reviewer');
upstream = () => new Response(null, { status: 303, headers: { Location: 'https://github.com' } });
assert.equal((await exports.proxyBattutaCommunity(request('/moderation/submissions'))).status, 502);
const publicPath = '/packs/10000000-0000-4000-8000-000000000001/releases/20000000-0000-4000-8000-000000000002/preview.wav';
assert.equal((await exports.proxyBattutaCommunity(request(publicPath))).status, 502);
upstream = () => new Response('public audio', { headers: { 'Content-Type': 'audio/wav', 'Set-Cookie': '__Host-battuta-session=must-not-set' } });
const publicAudio = await exports.proxyBattutaCommunity(request(publicPath, { headers: { cookie: '__Host-battuta-session=hidden', authorization: 'Bearer hidden' } }));
assert.equal(publicAudio.status, 200);
assert.equal(await publicAudio.text(), 'public audio');
assert.equal(forwarded.options.headers.get('cookie'), null);
assert.equal(forwarded.options.headers.get('authorization'), null);
assert.equal(publicAudio.headers.get('set-cookie'), null);
assert.equal((await exports.proxyBattutaCommunity(request(publicPath, { method: 'POST' }))).status, 404);
upstream = () => new Response('not audio', { headers: { 'Content-Type': 'text/html' } });
assert.equal((await exports.proxyBattutaCommunity(request(publicPath))).status, 502);
upstream = () => new Response(new Uint8Array(1152045), { headers: { 'Content-Type': 'audio/wav' } });
assert.equal((await exports.proxyBattutaCommunity(request(publicPath))).status, 502);
console.log('Community proxy checks passed: fail-closed config, fixed origin/path, minimal cookies, redirect controls, body limits.');
const png = new Uint8Array(100); png.set([137, 80, 78, 71, 13, 10, 26, 10]);
const publicCoverPath = publicPath.replace('/preview.wav', '/cover.png');
const privateCoverPath = '/moderation/submissions/10000000-0000-4000-8000-000000000001/cover.png';
for (const path of [publicCoverPath, privateCoverPath]) {
  upstream = () => new Response(png, { headers: { 'Content-Type': 'image/png', 'Content-Length': '100', 'Set-Cookie': '__Host-battuta-session=never-public' } });
  const result = await exports.proxyBattutaCommunity(request(path, { headers: { cookie: '__Host-battuta-session=reviewer', authorization: 'Bearer not-for-public' } }));
  assert.equal(result.status, 200); assert.deepEqual(new Uint8Array(await result.arrayBuffer()), png);
  assert.equal(result.headers.get('cache-control'), 'no-store'); assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
  assert.match(result.headers.get('content-security-policy'), /sandbox/);
  if (path === publicCoverPath) {
    assert.equal(forwarded.options.headers.get('cookie'), null); assert.equal(forwarded.options.headers.get('authorization'), null);
    assert.equal(result.headers.get('set-cookie'), null);
  } else assert.equal(forwarded.options.headers.get('cookie'), '__Host-battuta-session=reviewer');
  assert.equal((await exports.proxyBattutaCommunity(request(path + '?url=https://evil.invalid'))).status, 404);
  assert.equal((await exports.proxyBattutaCommunity(request(path, { method: 'POST' }))).status, 404);
  for (const headers of [{ 'Content-Type': 'image/svg+xml' }, { 'Content-Type': 'image/png', 'Content-Length': '99' }]) {
    upstream = () => new Response(png, { headers });
    assert.equal((await exports.proxyBattutaCommunity(request(path))).status, 502);
  }
  upstream = () => new Response('<script>not png</script>'.padEnd(100, 'x'), { headers: { 'Content-Type': 'image/png' } });
  assert.equal((await exports.proxyBattutaCommunity(request(path))).status, 502);
  upstream = () => new Response(new Uint8Array(4194305), { headers: { 'Content-Type': 'image/png' } });
  assert.equal((await exports.proxyBattutaCommunity(request(path))).status, 502);
  upstream = () => new Response(null, { status: 303, headers: { Location: 'https://github.com' } });
  assert.equal((await exports.proxyBattutaCommunity(request(path))).status, 502);
}
console.log('Cover proxy checks passed: typed bounded PNG, fixed paths, private reviewer cookies, public credential isolation, no cache/redirects.');
