import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Synthetic protocol-only fixture. Actual PCM rendering is verified separately
// by test:battuta-preview-integration in the two-repository development workspace.
const release = { packId: '10000000-0000-4000-8000-000000000001', releaseId: '20000000-0000-4000-8000-000000000002' };
const hash = 'a'.repeat(64);
const preview = { schemaVersion: 1, recipe: 'slow-eight-keys-v1', sha256: hash,
  byteCount: 96044, path: `battuta/packs/${release.packId}/releases/${release.releaseId}/${hash}.preview.wav`,
  sampleRate: 48000, bitDepth: 16, channelCount: 1, durationSeconds: 1,
  peak: 0.5, rms: 0.25, peaks: Array(256).fill(0.5) };
const source = readFileSync(new URL('../src/lib/battuta-release-preview.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
assert.deepEqual(exports.parseReleasePreview(preview, release), preview);
assert.deepEqual(await exports.readReleasePreview(Response.json(preview), release), preview);
for (const patch of [{ schemaVersion: 2 }, { recipe: 'untrusted' }, { sha256: 'invalid' },
  { path: '/other.wav' }, { durationSeconds: 100 }, { durationSeconds: 0.9 },
  { byteCount: 96045 }, { byteCount: 44 }, { bitDepth: 24 }, { sampleRate: 44100 },
  { channelCount: 2 }, { rms: Infinity }, { peak: -1 }, { rms: 0.6 },
  { peaks: [0.5] }, { peaks: Array(256).fill(0.6) }, { peaks: Array(256).fill(NaN) }]) {
  assert.throws(() => exports.parseReleasePreview({ ...preview, ...patch }, release));
}
assert.throws(() => exports.parseReleasePreview(preview, { ...release, releaseId: release.packId }));
await assert.rejects(exports.readReleasePreview(new Response('unavailable', { status: 404 }), release));
await assert.rejects(exports.readReleasePreview(new Response('{}', { headers: { 'Content-Type': 'text/html' } }), release));
await assert.rejects(exports.readReleasePreview(new Response(new Uint8Array([255]), { headers: { 'Content-Type': 'application/json' } }), release));
let cancelled = false;
await assert.rejects(exports.readReleasePreview(new Response(new ReadableStream({
  pull(controller) { controller.enqueue(new Uint8Array(32769)); }, cancel() { cancelled = true; },
}), { headers: { 'Content-Type': 'application/json' } }), release), /preview_too_large/);
assert.equal(cancelled, true);
console.log('Preview protocol unit checks passed: identity, PCM shape, measurements, bounded decoding and stream cancellation.');
