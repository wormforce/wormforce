import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createHash } from 'node:crypto';

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
// A deterministic PCM fixture with two phases in the inspected window and
// another loud hit outside it: card measurements must not use full-demo RMS.
const pcm = Buffer.alloc(44 + 48000 * 2);
pcm.write('RIFF'); pcm.writeUInt32LE(pcm.length - 8, 4); pcm.write('WAVEfmt ', 8);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(48000, 24); pcm.writeUInt32LE(96000, 28);
pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(pcm.length - 44, 40);
pcm.writeInt16LE(8192, 44 + 12000 * 2);
pcm.writeInt16LE(-4096, 44 + 17760 * 2);
pcm.writeInt16LE(16384, 44 + 40000 * 2);
const measured = { ...preview, sha256: createHash('sha256').update(pcm).digest('hex') };
const inspection = exports.inspectReleasePCM(pcm, measured);
assert.equal(inspection.durationSeconds, 0.25);
assert.equal(inspection.peak, 0.25);
assert.equal(inspection.rms, Math.sqrt((0.25 ** 2 + 0.125 ** 2) / 12000));
assert.equal(inspection.points.length, 1024);
assert.equal(Math.max(...inspection.points), 1);
assert.equal(inspection.markers.length, 2);
assert.match(exports.releaseEnvelopePath(inspection.points), /^M.*Z$/);
assert.equal(exports.releaseEnvelopePath([]), '');
assert.deepEqual(await exports.readReleaseInspection(new Response(pcm, { headers: { 'Content-Type': 'audio/wav' } }), measured), inspection);
await assert.rejects(exports.readReleaseInspection(new Response(pcm, { headers: { 'Content-Type': 'audio/wav' } }), preview), /checksum/);
await assert.rejects(exports.readReleaseInspection(new Response(pcm.subarray(0, 44), { headers: { 'Content-Type': 'audio/wav' } }), measured));
await assert.rejects(exports.readReleaseInspection(new Response(pcm, { headers: { 'Content-Type': 'text/html' } }), measured));
const silent = Buffer.from(pcm); silent.fill(0, 44);
assert.equal(exports.inspectReleasePCM(silent, measured).rms, 0);
assert.ok(exports.inspectReleasePCM(silent, measured).points.every(point => point === 0));
const malformed = Buffer.from(pcm); malformed.writeUInt16LE(24, 34);
assert.throws(() => exports.inspectReleasePCM(malformed, measured), /invalid_preview_pcm/);
let pcmCancelled = false;
await assert.rejects(exports.readReleaseInspection(new Response(new ReadableStream({
  pull(controller) { controller.enqueue(new Uint8Array(measured.byteCount + 1)); }, cancel() { pcmCancelled = true; },
}), { headers: { 'Content-Type': 'audio/wav' } }), measured), /too_large/);
assert.equal(pcmCancelled, true);
console.log('Preview protocol unit checks passed: identity, PCM shape, measurements, bounded decoding and stream cancellation.');
