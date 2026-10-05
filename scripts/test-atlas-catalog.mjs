import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/battuta-atlas-catalog.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const { atlasCatalogQuery, matchesAtlasCreator, mergeAtlasEntries, releaseSwitchIllustration } = exports;
const query = (...args) => new URLSearchParams(atlasCatalogQuery(...args));
assert.equal(query('  recorder  ', 'kailh', '点击').get('q'), 'recorder');
assert.equal(query('', 'kailh', '点击').get('manufacturer'), 'Kailh');
assert.equal(query('', 'kailh', '点击').get('switchType'), 'clicky');
for (const [label, value] of [['静音', 'silent'], ['磁轴', 'magnetic'], ['其他', 'other'], ['屈曲弹簧', 'other']]) {
  assert.equal(query('', 'all', label).get('switchType'), value);
}
assert.equal(atlasCatalogQuery('', 'all', 'all'), '');
assert.equal(query('', 'more', 'all').has('manufacturer'), false);
assert.equal(query('', 'cherry', 'all', '  Personal Studio  ').get('manufacturer'), 'Personal Studio');
assert.equal(query('a & b / c', 'all', 'all').get('q'), 'a & b / c');
const combined = query(' BOX White ', 'kailh', '点击', '', ' Mange / 7b7b7b ');
assert.deepEqual(Object.fromEntries(combined), {
  q: 'BOX White', manufacturer: 'Kailh', switchType: 'clicky', author: 'Mange / 7b7b7b',
});
assert.equal(query('', 'all', 'all', '', 'A & B / c?').get('author'), 'A & B / c?');
assert.equal(query('', 'all', 'all', '', '   ').has('author'), false);
assert.equal(matchesAtlasCreator('Mange/clicketyclack contributors', ' CLICKETYCLACK '), true);
assert.equal(matchesAtlasCreator('Mange/clicketyclack contributors', 'Kailh'), false);
assert.equal(matchesAtlasCreator(undefined, 'Battuta demo'), false);
assert.equal(matchesAtlasCreator('   ', 'Battuta'), false);
assert.equal(matchesAtlasCreator(undefined, '   '), true);

const librarySource = readFileSync(new URL('../src/components/battuta-sound-library.tsx', import.meta.url), 'utf8');
assert.match(librarySource, /atlasCatalogQuery\(query, brandFilter, family, manufacturerQuery, creatorQuery\)/);
assert.match(librarySource, /matchesAtlasCreator\(profile\.attribution\?\.author, creatorQuery\)/);
assert.match(librarySource, /maxLength=\{160\} value=\{creatorQuery\}/);
// Both clear-all paths and the individual chip must remove the creator filter.
assert.equal((librarySource.match(/setCreatorQuery\(""\)/g) ?? []).length, 3);

const release = JSON.parse(readFileSync(new URL('../tests/fixtures/battuta-community-install-descriptor.valid.json', import.meta.url)));
const other = { ...release, releaseId: '22222222-2222-4222-8222-222222222222', packId: '33333333-3333-4333-8333-333333333333', name: 'A personal recording' };
const presentations = { [release.releaseId]: { manufacturer: 'CHERRY', recordingAuthor: 'Actual recorder' } };
const demos = [{ kind: 'demo', id: 'demo:mxblue', name: 'Z demo', brand: 'CHERRY', profile: { id: 'mxblue' } }];
const merged = mergeAtlasEntries(demos, [release, other], presentations, 'name');
assert.equal(merged.length, 3);
assert.equal(merged[0].release, other);
assert.equal(merged.find(item => item.kind === 'release' && item.release === release).presentation, presentations[release.releaseId]);
assert.equal(merged.find(item => item.kind === 'demo').profile, demos[0].profile);
assert.equal(mergeAtlasEntries(demos, [release], presentations, 'curated')[0].kind, 'release');
assert.deepEqual(demos, [{ kind: 'demo', id: 'demo:mxblue', name: 'Z demo', brand: 'CHERRY', profile: { id: 'mxblue' } }]);
assert.equal(mergeAtlasEntries(demos, [], {}, 'curated').length, 1);
assert.equal(mergeAtlasEntries([], [], {}, 'curated').length, 0);
assert.equal(mergeAtlasEntries([], [other], {}, 'curated')[0].brand, '');
assert.equal(releaseSwitchIllustration(), null);
assert.equal(releaseSwitchIllustration({ manufacturer: 'Personal studio', switchModel: 'MX Blue' }), null);
assert.equal(releaseSwitchIllustration({ manufacturer: 'CHERRY', switchModel: 'unknown' }), null);
assert.equal(releaseSwitchIllustration({ manufacturer: 'CHERRY' }), null);
assert.equal(releaseSwitchIllustration({ manufacturer: ' cherry ', switchModel: ' MX Blue ' }), '/battuta/community/switches/cherry-mx-blue.png');
console.log('Atlas adapter tests passed: real query mapping, personal manufacturers, merged sorting, identity and no guessed hardware.');
