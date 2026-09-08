import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "src/content/battuta-community/catalog.json");
const referencePath = path.join(root, "tests/fixtures/battuta-community-install-descriptor.valid.json");
const descriptorMediaType = "application/vnd.battuta.community-install+json;version=1";
const archiveMediaType = "application/vnd.battuta.sound-pack+zip;version=1";
const assetOrigin = "https://assets.wormforce.net/";
const remote = process.argv.includes("--remote");

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const shaPattern = /^[0-9a-f]{64}$/;
const semverPattern = /^(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})(?:-(?:0|[1-9][0-9]{0,8}|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]{0,8}|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const publishedAtPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,7})?Z$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const spdxPattern = /^[A-Za-z0-9.+-]+$/;

function fail(context, message) {
  throw new Error(`${context}: ${message}`);
}

function assert(condition, context, message) {
  if (!condition) fail(context, message);
}

function assertRecord(value, context, required, optional = []) {
  assert(value && typeof value === "object" && !Array.isArray(value), context, "must be an object");
  const allowed = new Set([...required, ...optional]);
  for (const key of required) assert(Object.hasOwn(value, key), context, `missing ${key}`);
  for (const key of Object.keys(value)) assert(allowed.has(key), context, `unexpected property ${key}`);
}

function assertText(value, context, maxLength) {
  assert(typeof value === "string", context, "must be a string");
  assert(value.length > 0, context, "must not be empty");
  assert(Array.from(value).length <= maxLength, context, `must contain at most ${maxLength} Unicode scalars`);
  assert(!/[\u0000-\u001f\u007f-\u009f]/u.test(value), context, "must not contain control characters");
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      assert(next >= 0xdc00 && next <= 0xdfff, context, "contains an unpaired surrogate");
      index += 1;
    } else {
      assert(code < 0xdc00 || code > 0xdfff, context, "contains an unpaired surrogate");
    }
  }
}

function assertUuid(value, context) {
  assert(typeof value === "string" && uuidPattern.test(value), context, "must be a canonical lowercase UUID");
}

function assertSemver(value, context) {
  assert(typeof value === "string" && value.length <= 80 && semverPattern.test(value), context, "must be a supported SemVer string");
}

function assertPublishedAt(value, context) {
  assert(typeof value === "string" && value.length <= 40, context, "must be a short UTC timestamp");
  const match = publishedAtPattern.exec(value);
  assert(match, context, "must be canonical RFC 3339 UTC time");
  const [, year, month, day, hour, minute, second] = match;
  const fields = [year, month, day, hour, minute, second].map(Number);
  const date = new Date(Date.UTC(...fields.slice(0, 3).map((part, index) => index === 1 ? part - 1 : part), ...fields.slice(3)));
  assert(
    date.getUTCFullYear() === fields[0]
      && date.getUTCMonth() + 1 === fields[1]
      && date.getUTCDate() === fields[2]
      && date.getUTCHours() === fields[3]
      && date.getUTCMinutes() === fields[4]
      && date.getUTCSeconds() === fields[5],
    context,
    "must be a real UTC calendar instant",
  );
}

function assertCalendarDate(value, context) {
  assert(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value), context, "must use YYYY-MM-DD");
  const parsed = new Date(`${value}T00:00:00Z`);
  assert(!Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value, context, "must be a real calendar date");
}

function assertHttpsUrl(value, context) {
  assert(typeof value === "string" && value.length <= 512, context, "must be an HTTPS URL no longer than 512 characters");
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(context, "must be an absolute URL");
  }
  assert(parsed.protocol === "https:" && parsed.hostname, context, "must use HTTPS with a non-empty host");
  assert(!parsed.username && !parsed.password, context, "must not contain credentials");
  return parsed;
}

function validateDescriptor(descriptor, expectedPackId, context) {
  assertRecord(descriptor, context, [
    "schemaVersion", "packId", "releaseId", "releaseSequence", "displayVersion", "name",
    "author", "license", "packageManifestId", "artifact", "minimumBattutaVersion", "publishedAt",
  ]);
  assert(descriptor.schemaVersion === 1, `${context}.schemaVersion`, "must equal 1");
  assertUuid(descriptor.packId, `${context}.packId`);
  assertUuid(descriptor.releaseId, `${context}.releaseId`);
  assertUuid(descriptor.packageManifestId, `${context}.packageManifestId`);
  assert(descriptor.packId === expectedPackId, `${context}.packId`, "must match its catalog pack");
  assert(new Set([descriptor.packId, descriptor.releaseId, descriptor.packageManifestId]).size === 3, context, "packId, releaseId, and packageManifestId must be pairwise distinct");
  assert(Number.isSafeInteger(descriptor.releaseSequence) && descriptor.releaseSequence >= 1, `${context}.releaseSequence`, "must be a positive safe integer");
  assertSemver(descriptor.displayVersion, `${context}.displayVersion`);
  assertText(descriptor.name, `${context}.name`, 120);

  assertRecord(descriptor.author, `${context}.author`, ["id", "displayName"]);
  assertUuid(descriptor.author.id, `${context}.author.id`);
  assertText(descriptor.author.displayName, `${context}.author.displayName`, 80);

  assertRecord(descriptor.license, `${context}.license`, ["name"], ["spdxId", "url", "attribution"]);
  assertText(descriptor.license.name, `${context}.license.name`, 120);
  if (descriptor.license.spdxId !== undefined) {
    assert(typeof descriptor.license.spdxId === "string" && descriptor.license.spdxId.length <= 80 && spdxPattern.test(descriptor.license.spdxId), `${context}.license.spdxId`, "is invalid");
  }
  if (descriptor.license.url !== undefined) assertHttpsUrl(descriptor.license.url, `${context}.license.url`);
  if (descriptor.license.attribution !== undefined) assertText(descriptor.license.attribution, `${context}.license.attribution`, 1000);

  assertRecord(descriptor.artifact, `${context}.artifact`, ["path", "byteCount", "sha256"]);
  assert(typeof descriptor.artifact.sha256 === "string" && shaPattern.test(descriptor.artifact.sha256), `${context}.artifact.sha256`, "must be a lowercase SHA-256");
  const expectedPath = `battuta/packs/${descriptor.packId}/releases/${descriptor.releaseId}/${descriptor.artifact.sha256}.simuboardpack.zip`;
  assert(descriptor.artifact.path === expectedPath, `${context}.artifact.path`, `must equal ${expectedPath}`);
  assert(Number.isSafeInteger(descriptor.artifact.byteCount) && descriptor.artifact.byteCount >= 1 && descriptor.artifact.byteCount <= 134_217_728, `${context}.artifact.byteCount`, "must be between 1 byte and 128 MiB");

  assertRecord(descriptor.minimumBattutaVersion, `${context}.minimumBattutaVersion`, ["macos", "windows"]);
  assertSemver(descriptor.minimumBattutaVersion.macos, `${context}.minimumBattutaVersion.macos`);
  assertSemver(descriptor.minimumBattutaVersion.windows, `${context}.minimumBattutaVersion.windows`);
  assertPublishedAt(descriptor.publishedAt, `${context}.publishedAt`);
  assert(Buffer.byteLength(JSON.stringify(descriptor)) <= 65_536, context, "serialized descriptor exceeds 64 KiB");
}

function validateLocalizedText(value, context, maxLength) {
  assertRecord(value, context, ["zh-CN", "en"]);
  assertText(value["zh-CN"], `${context}.zh-CN`, maxLength);
  assertText(value.en, `${context}.en`, maxLength);
}

function validateMediaUrl(value, pack, context) {
  const url = assertHttpsUrl(value, context);
  const prefix = `/battuta/community-media/${pack.packId}/releases/${pack.latestReleaseId}/`;
  assert(url.hostname === "assets.wormforce.net" && url.pathname.startsWith(prefix), context, `must stay below https://assets.wormforce.net${prefix}`);
}

function validateCatalog(catalog) {
  assertRecord(catalog, "catalog", ["schemaVersion", "updatedAt", "packs"]);
  assert(catalog.schemaVersion === 1, "catalog.schemaVersion", "must equal 1");
  assertCalendarDate(catalog.updatedAt, "catalog.updatedAt");
  assert(Array.isArray(catalog.packs), "catalog.packs", "must be an array");

  const slugs = new Set();
  const packIds = new Set();
  const releaseIds = new Set();
  for (const [index, pack] of catalog.packs.entries()) {
    const context = `catalog.packs[${index}]`;
    assertRecord(pack, context, ["slug", "packId", "name", "summary", "description", "tags", "latestReleaseId", "releases"], ["coverImage", "previewAudio"]);
    assert(typeof pack.slug === "string" && slugPattern.test(pack.slug), `${context}.slug`, "must be a lowercase URL slug");
    assert(!slugs.has(pack.slug), `${context}.slug`, "must be unique");
    slugs.add(pack.slug);
    assertUuid(pack.packId, `${context}.packId`);
    assert(!packIds.has(pack.packId), `${context}.packId`, "must be unique");
    packIds.add(pack.packId);
    assertText(pack.name, `${context}.name`, 120);
    validateLocalizedText(pack.summary, `${context}.summary`, 240);
    validateLocalizedText(pack.description, `${context}.description`, 4000);
    assertRecord(pack.tags, `${context}.tags`, ["zh-CN", "en"]);
    for (const locale of ["zh-CN", "en"]) {
      assert(Array.isArray(pack.tags[locale]) && pack.tags[locale].length <= 12, `${context}.tags.${locale}`, "must contain at most 12 tags");
      for (const [tagIndex, tag] of pack.tags[locale].entries()) assertText(tag, `${context}.tags.${locale}[${tagIndex}]`, 40);
    }
    assertUuid(pack.latestReleaseId, `${context}.latestReleaseId`);
    assert(Array.isArray(pack.releases) && pack.releases.length >= 1, `${context}.releases`, "must contain at least one approved release");
    const sequences = new Set();
    let packageManifestId;
    for (const [releaseIndex, release] of pack.releases.entries()) {
      const releaseContext = `${context}.releases[${releaseIndex}]`;
      validateDescriptor(release, pack.packId, releaseContext);
      assert(!releaseIds.has(release.releaseId), `${releaseContext}.releaseId`, "must be globally unique");
      releaseIds.add(release.releaseId);
      assert(!sequences.has(release.releaseSequence), `${releaseContext}.releaseSequence`, "must be unique within the pack");
      sequences.add(release.releaseSequence);
      assert(release.name === pack.name, `${releaseContext}.name`, "must match the catalog pack name");
      packageManifestId ??= release.packageManifestId;
      assert(release.packageManifestId === packageManifestId, `${releaseContext}.packageManifestId`, "must stay stable across every release of one pack");
    }
    assert(pack.releases.some((release) => release.releaseId === pack.latestReleaseId), `${context}.latestReleaseId`, "must reference a published release");
    const latestRelease = pack.releases.find((release) => release.releaseId === pack.latestReleaseId);
    assert(latestRelease.releaseSequence === Math.max(...pack.releases.map((release) => release.releaseSequence)), `${context}.latestReleaseId`, "must reference the greatest releaseSequence");
    if (pack.coverImage !== undefined) {
      validateMediaUrl(pack.coverImage, pack, `${context}.coverImage`);
      assert(/\.(?:avif|webp|png|jpe?g)$/i.test(new URL(pack.coverImage).pathname), `${context}.coverImage`, "must use a supported image extension");
    }
    if (pack.previewAudio !== undefined) {
      validateMediaUrl(pack.previewAudio, pack, `${context}.previewAudio`);
      assert(/\.(?:mp3|m4a|ogg|wav)$/i.test(new URL(pack.previewAudio).pathname), `${context}.previewAudio`, "must use a supported audio extension");
    }
  }
}

async function verifyRemoteArtifact(descriptor, context) {
  const url = new URL(descriptor.artifact.path, assetOrigin);
  const headers = { Accept: archiveMediaType, "Accept-Encoding": "identity" };
  const head = await fetch(url, { method: "HEAD", headers, redirect: "error" });
  assert(head.ok && !head.redirected, context, `HEAD ${url} must return 200 without redirect`);
  assert(head.headers.get("content-type") === archiveMediaType, context, `Content-Type must equal ${archiveMediaType}`);
  assert(head.headers.get("content-length") === String(descriptor.artifact.byteCount), context, "Content-Length must match artifact.byteCount");
  assert(!head.headers.get("content-encoding") || head.headers.get("content-encoding") === "identity", context, "compressed Content-Encoding is forbidden");
  assertPublicImmutableCache(head.headers.get("cache-control"), `${context} HEAD`);

  const response = await fetch(url, { headers, redirect: "error" });
  assert(response.ok && !response.redirected, context, `GET ${url} must return 200 without redirect`);
  assert(response.headers.get("content-type") === archiveMediaType, context, `GET Content-Type must equal ${archiveMediaType}`);
  assert(response.headers.get("content-length") === String(descriptor.artifact.byteCount), context, "GET Content-Length must match artifact.byteCount");
  assert(!response.headers.get("content-encoding") || response.headers.get("content-encoding") === "identity", context, "GET compressed Content-Encoding is forbidden");
  assertPublicImmutableCache(response.headers.get("cache-control"), `${context} GET`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.byteLength === descriptor.artifact.byteCount, context, "downloaded byte count does not match the descriptor");
  assert(createHash("sha256").update(bytes).digest("hex") === descriptor.artifact.sha256, context, "downloaded SHA-256 does not match the descriptor");
}

function assertPublicImmutableCache(value, context) {
  const directives = new Set((value ?? "").toLowerCase().split(",").map((part) => part.trim()).filter(Boolean));
  assert(directives.has("public"), context, "Cache-Control must include public");
  assert(directives.has("max-age=31536000"), context, "Cache-Control must include max-age=31536000");
  assert(directives.has("immutable"), context, "Cache-Control must include immutable");
  for (const forbidden of ["private", "no-store", "no-cache"]) {
    assert(!directives.has(forbidden), context, `Cache-Control must not include ${forbidden}`);
  }
}

async function verifyRemoteMedia(value, kind, context) {
  const response = await fetch(value, { method: "HEAD", redirect: "error" });
  assert(response.ok && !response.redirected, context, `HEAD ${value} must return 200 without redirect`);
  const contentType = response.headers.get("content-type") ?? "";
  assert(contentType.startsWith(`${kind}/`), context, `Content-Type must be ${kind}/*`);
  assertPublicImmutableCache(response.headers.get("cache-control"), context);
}

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const referenceDescriptor = JSON.parse(await readFile(referencePath, "utf8"));
validateCatalog(catalog);
validateDescriptor(referenceDescriptor, referenceDescriptor.packId, "referenceDescriptor");

if (remote) {
  for (const [packIndex, pack] of catalog.packs.entries()) {
    for (const [releaseIndex, release] of pack.releases.entries()) {
      await verifyRemoteArtifact(release, `catalog.packs[${packIndex}].releases[${releaseIndex}]`);
    }
    if (pack.coverImage) await verifyRemoteMedia(pack.coverImage, "image", `catalog.packs[${packIndex}].coverImage`);
    if (pack.previewAudio) await verifyRemoteMedia(pack.previewAudio, "audio", `catalog.packs[${packIndex}].previewAudio`);
  }
}

console.log(`Battuta community verified: ${catalog.packs.length} pack(s), ${catalog.packs.reduce((count, pack) => count + pack.releases.length, 0)} catalog release(s), 1 reference descriptor${remote ? ", remote artifacts checked" : ""}.`);
console.log(`Descriptor media type: ${descriptorMediaType}`);
