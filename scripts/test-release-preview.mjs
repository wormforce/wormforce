import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { buildBoxWhiteMigration } from '../../community-server/src/builtin-migration.mjs';
import { unpackArchive } from '../../community-server/src/archive.mjs';
import { buildPackagePreview } from '../../community-server/src/preview.mjs';
import { releasePreview } from '../../community-server/src/release-preview.mjs';

const descriptor = JSON.parse(readFileSync(new URL('../tests/fixtures/battuta-community-install-descriptor.valid.json', import.meta.url)));
const candidate = await buildBoxWhiteMigration(new URL('../../', import.meta.url));
const rendered = buildPackagePreview(unpackArchive(candidate.archive, candidate.manifest.id), candidate.manifest.id);
const data = releasePreview(descriptor, rendered.metadata);
const source = readFileSync(new URL('../src/lib/battuta-release-preview.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
assert.deepEqual(await exports.readReleasePreview(Response.json(data), descriptor), data);
assert.deepEqual(data.peaks, rendered.metadata.peaks);
for (const patch of [{ path: '/other.wav' }, { durationSeconds: 100 }, { peaks: [0] }, { rms: Infinity }, { byteCount: 44 }]) {
  assert.throws(() => exports.parseReleasePreview({ ...data, ...patch }, descriptor));
}
await assert.rejects(exports.readReleasePreview(new Response('unavailable', { status: 404 }), descriptor));
await assert.rejects(exports.readReleasePreview(new Response('x'.repeat(32769), { headers: { 'Content-Type': 'application/json' } }), descriptor), /too_large/);
await assert.rejects(exports.readReleasePreview(new Response(new Uint8Array([255]), { headers: { 'Content-Type': 'application/json' } }), descriptor));
console.log('Real BOX White server preview accepted by frontend; identity, waveform, limits and unavailable responses verified.');
