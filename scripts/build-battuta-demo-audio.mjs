import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const battutaRoot = resolve(process.env.BATTUTA_SOURCE_DIR ?? join(scriptDirectory, '..', '..'));
const builtInRoot = join(battutaRoot, 'shared', 'audio', 'builtin');
const bcpRoot = join(
  battutaRoot,
  'shared',
  'soundpacks',
  'bundled',
  '15d04652-5265-4ea7-a376-8a7e11ff6813.simuboardpack',
);
const finalOutputRoot = join(scriptDirectory, '..', 'public', 'battuta', 'demo-audio');
mkdirSync(dirname(finalOutputRoot), { recursive: true });
const outputRoot = mkdtempSync(join(dirname(finalOutputRoot), '.demo-audio-build-'));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'battuta-web-audio-'));
const sampleRate = 48_000;
const execFileAsync = promisify(execFile);

const profileCatalog = [
  ['holypanda', 'Holy Panda', '段落', '饱满、集中'],
  ['mxbrown', 'Cherry MX Brown', '段落', '温和、均衡'],
  ['mxclear', 'Cherry MX Clear', '段落', '扎实、段落明显'],
  ['g915brown', 'Logitech G915 TKL Brown', '段落', '轻薄、利落'],
  ['studiotactile', 'Studio Tactile', '段落', '近场、细腻'],
  ['mxblue', 'Cherry MX Blue', '点击', '清脆、经典'],
  ['boxnavy', 'Kailh BOX Navy', '点击', '厚重、响亮'],
  ['boxwhite', 'Kailh BOX White', '点击', '短促、清亮'],
  ['lowprofileblue', 'Kailh Low-profile Blue', '点击', '薄脆、双向点击'],
  ['bluealps', 'SKCM Blue Alps', '点击', '复古、锐利'],
  ['studioclicky', 'Studio Clicky', '点击', '明快、颗粒感'],
  ['cream', 'NovelKeys Cream', '线性', '顺滑、奶油'],
  ['alpaca', 'Alpaca', '线性', '干净、柔和'],
  ['blackink', 'Gateron Black Ink', '线性', '低沉、扎实'],
  ['redink', 'Gateron Red Ink', '线性', '轻快、圆润'],
  ['mxblack', 'Cherry MX Black', '线性', '沉稳、硬朗'],
  ['turquoise', 'Turquoise Tealios', '线性', '明亮、顺滑'],
  ['keychronred', 'Keychron Red Linear', '线性', '干净、轻快', {
    author: 'C40115',
    licenseName: 'CC BY 4.0',
  }],
  ['topre', 'Topre', '静电容', '柔韧、闷响'],
  ['buckling', 'IBM Buckling Spring', '屈曲弹簧', '复古、金属感'],
];

function fail(message) {
  throw new Error(`[battuta demo audio] ${message}`);
}

function wavFrameCount(filePath) {
  const bytes = readFileSync(filePath);
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') {
    fail(`not a WAV file: ${filePath}`);
  }

  let offset = 12;
  let blockAlign = 0;
  let dataSize = 0;
  while (offset + 8 <= bytes.length) {
    const chunkID = bytes.toString('ascii', offset, offset + 4);
    const chunkSize = bytes.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkID === 'fmt ') {
      blockAlign = bytes.readUInt16LE(chunkStart + 12);
    } else if (chunkID === 'data') {
      dataSize = chunkSize;
      break;
    }
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!blockAlign || !dataSize) fail(`missing PCM chunks: ${filePath}`);
  return Math.floor(dataSize / blockAlign);
}

function findNamedSample(directory, baseName) {
  if (!existsSync(directory)) return null;
  const extensionPriority = new Map([['wav', 0], ['mp3', 1], ['m4a', 2], ['ogg', 3]]);
  const match = readdirSync(directory)
    .filter((entry) => entry.replace(/\.[^.]+$/, '') === baseName)
    .sort((left, right) => {
      const leftExtension = left.split('.').at(-1)?.toLowerCase() ?? '';
      const rightExtension = right.split('.').at(-1)?.toLowerCase() ?? '';
      return (extensionPriority.get(leftExtension) ?? 99) - (extensionPriority.get(rightExtension) ?? 99)
        || left.localeCompare(right);
    })[0];
  return match ? join(directory, match) : null;
}

async function convertSample(sourcePath, destinationPath) {
  await execFileAsync('ffmpeg', [
    '-nostdin', '-y', '-v', 'error', '-i', sourcePath,
    '-map_metadata', '-1', '-ac', '1', '-ar', String(sampleRate),
    '-c:a', 'pcm_s16le', destinationPath,
  ]);
}

async function mapWithConcurrency(items, concurrency, operation) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await operation(items[index], index);
    }
  }));
  return results;
}

async function writeSprite(profileID, sourceEntries) {
  const profileTemp = join(temporaryRoot, profileID);
  mkdirSync(profileTemp, { recursive: true });
  const samples = {};
  const concatLines = [];
  let offsetFrames = 0;
  const guardFrames = 96;
  const guardPath = join(profileTemp, 'guard.wav');

  const converted = await mapWithConcurrency(sourceEntries, 8, async ({ id, sourcePath }, index) => {
    const convertedPath = join(profileTemp, `${String(index).padStart(3, '0')}.wav`);
    await convertSample(sourcePath, convertedPath);
    const frameCount = wavFrameCount(convertedPath);
    return { id, convertedPath, frameCount };
  });

  await execFileAsync('ffmpeg', [
    '-nostdin', '-y', '-v', 'error', '-f', 'lavfi',
    '-i', `anullsrc=r=${sampleRate}:cl=mono`, '-t', String(guardFrames / sampleRate),
    '-c:a', 'pcm_s16le', guardPath,
  ]);
  if (wavFrameCount(guardPath) !== guardFrames) fail(`${profileID} guard frame mismatch`);

  converted.forEach(({ id, convertedPath, frameCount }, index) => {
    samples[id] = { offsetFrames, frameCount };
    offsetFrames += frameCount;
    concatLines.push(`file '${convertedPath.replaceAll("'", "'\\''")}'`);
    if (index < converted.length - 1) {
      concatLines.push(`file '${guardPath.replaceAll("'", "'\\''")}'`);
      offsetFrames += guardFrames;
    }
  });

  const concatPath = join(profileTemp, 'concat.txt');
  writeFileSync(concatPath, `${concatLines.join('\n')}\n`);
  const temporarySpriteName = `${profileID}.building.wav`;
  const spritePath = join(outputRoot, temporarySpriteName);
  await execFileAsync('ffmpeg', [
    '-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', concatPath,
    '-map_metadata', '-1', '-ac', '1', '-ar', String(sampleRate),
    '-c:a', 'pcm_s16le', spritePath,
  ]);

  const actualFrames = wavFrameCount(spritePath);
  if (actualFrames !== offsetFrames) {
    fail(`${profileID} sprite frame mismatch: expected ${offsetFrames}, got ${actualFrames}`);
  }

  const contentHash = createHash('sha256').update(readFileSync(spritePath)).digest('hex').slice(0, 12);
  const spriteName = `${profileID}.${contentHash}.wav`;
  renameSync(spritePath, join(outputRoot, spriteName));
  return { sprite: `/battuta/demo-audio/${spriteName}`, samples };
}

function builtInPhase(profileRoot, phase) {
  const directory = join(profileRoot, phase);
  const entries = [];
  const map = { rows: {}, specials: {} };

  for (let row = 0; row <= 4; row += 1) {
    const sampleName = `GENERIC_R${row}`;
    const sourcePath = findNamedSample(directory, sampleName);
    if (!sourcePath) continue;
    const id = `${phase}:${sampleName}`;
    entries.push({ id, sourcePath });
    map.rows[`R${row}`] = id;
  }

  const genericPath = findNamedSample(directory, 'GENERIC');
  if (genericPath) {
    map.generic = `${phase}:GENERIC`;
    entries.push({ id: map.generic, sourcePath: genericPath });
  }

  for (const [special, filename] of [
    ['space', 'SPACE'],
    ['enter', 'ENTER'],
    ['backspace', 'BACKSPACE'],
  ]) {
    const sourcePath = findNamedSample(directory, filename);
    if (!sourcePath) continue;
    const id = `${phase}:${filename}`;
    entries.push({ id, sourcePath });
    map.specials[special] = id;
  }

  return { entries, map };
}

async function buildBuiltInProfile([id, displayName, family, tone, attribution]) {
  const profileRoot = join(builtInRoot, id);
  if (!existsSync(profileRoot)) fail(`missing built-in profile: ${id}`);
  const press = builtInPhase(profileRoot, 'press');
  const release = builtInPhase(profileRoot, 'release');
  const sprite = await writeSprite(id, [...press.entries, ...release.entries]);
  return {
    id,
    displayName,
    family,
    tone,
    attribution: attribution ?? null,
    ...sprite,
    press: press.map,
    release: release.map,
  };
}

function assetReference(reference) {
  return reference?.kind === 'asset' ? reference.assetID : undefined;
}

function bcpPhase(source) {
  return {
    generic: assetReference(source.generic),
    rows: source.rows ?? {},
    specials: source.specials ?? {},
    keyOverrides: Object.fromEntries(
      Object.entries(source.keyOverrides ?? {})
        .map(([key, reference]) => [key, assetReference(reference)])
        .filter(([, assetID]) => Boolean(assetID)),
    ),
  };
}

async function buildBCPProfile() {
  const manifest = JSON.parse(readFileSync(join(bcpRoot, 'manifest.json'), 'utf8'));
  const entries = Object.values(manifest.assets)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((asset) => ({
      id: asset.id,
      sourcePath: join(bcpRoot, asset.relativePath),
    }));
  const sprite = await writeSprite('bcp-suit80', entries);
  return {
    id: 'bcp-suit80',
    displayName: 'BCP (Suit80)',
    family: manifest.family ?? '线性',
    tone: '厚实、木感',
    recommended: true,
    baseProfileID: manifest.baseProfileID ?? 'holypanda',
    attribution: manifest.attributions?.[0] ?? null,
    ...sprite,
    press: bcpPhase(manifest.press),
    release: bcpPhase(manifest.release),
  };
}

try {
  if (!existsSync(builtInRoot) || !existsSync(bcpRoot)) {
    fail(`Battuta sources not found under ${battutaRoot}`);
  }
  const profiles = [await buildBCPProfile()];
  console.log('Generated BCP (Suit80) web sprite');
  for (const profileDefinition of profileCatalog) {
    const profile = await buildBuiltInProfile(profileDefinition);
    profiles.push(profile);
    console.log(`Generated ${profile.displayName} web sprite`);
  }
  const manifest = {
    version: 1,
    sampleRate,
    generatedFrom: 'wormforce/battuta shared audio assets',
    profiles,
  };
  writeFileSync(join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const previousManifestPath = join(finalOutputRoot, 'manifest.json');
  if (existsSync(previousManifestPath)) {
    const currentSpriteNames = new Set(profiles.map((profile) => profile.sprite.split('/').at(-1)));
    const previousManifest = JSON.parse(readFileSync(previousManifestPath, 'utf8'));
    for (const previousProfile of previousManifest.profiles ?? []) {
      const previousSpriteName = previousProfile.sprite?.split('/').at(-1);
      const previousSpritePath = previousSpriteName ? join(finalOutputRoot, previousSpriteName) : null;
      if (
        previousSpriteName
        && !currentSpriteNames.has(previousSpriteName)
        && previousSpritePath
        && existsSync(previousSpritePath)
      ) {
        copyFileSync(previousSpritePath, join(outputRoot, previousSpriteName));
      }
    }
  }

  const permissionSource = join(bcpRoot, 'licenses', 'BCP-Suit80-PERMISSION.txt');
  if (existsSync(permissionSource)) {
    writeFileSync(join(outputRoot, 'BCP-Suit80-PERMISSION.txt'), readFileSync(permissionSource));
  }

  for (const [sourcePath, outputName] of [
    [join(battutaRoot, 'shared', 'licenses', 'AUDIO_SOURCES.md'), 'AUDIO-SOURCES.md'],
    [join(battutaRoot, 'THIRD_PARTY_NOTICES.md'), 'AUDIO-THIRD-PARTY-NOTICES.md'],
  ]) {
    if (existsSync(sourcePath)) writeFileSync(join(outputRoot, outputName), readFileSync(sourcePath));
  }

  const bytes = profiles.reduce((sum, profile) => {
    const spritePath = join(outputRoot, profile.sprite.split('/').at(-1));
    return sum + readFileSync(spritePath).byteLength;
  }, 0);
  const backupOutputRoot = `${finalOutputRoot}.previous`;
  rmSync(backupOutputRoot, { recursive: true, force: true });
  let movedPreviousOutput = false;
  try {
    if (existsSync(finalOutputRoot)) {
      renameSync(finalOutputRoot, backupOutputRoot);
      movedPreviousOutput = true;
    }
    renameSync(outputRoot, finalOutputRoot);
    if (movedPreviousOutput) rmSync(backupOutputRoot, { recursive: true, force: true });
  } catch (error) {
    if (!existsSync(finalOutputRoot) && movedPreviousOutput && existsSync(backupOutputRoot)) {
      renameSync(backupOutputRoot, finalOutputRoot);
    }
    throw error;
  }
  console.log(`Generated ${profiles.length} Battuta demo profiles (${bytes} bytes) in ${finalOutputRoot}`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  rmSync(outputRoot, { recursive: true, force: true });
}
