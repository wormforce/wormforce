# Battuta community publishing

The website reads the live community API. Listening demos and legacy static
catalog entries are not proof that a community package has been published.
Switch manufacturer, recording author and uploading account are distinct;
a brand label does not imply an official manufacturer submission.

## Current rollout status

As of October 4, 2026, the server supports validated private submissions,
explicit human moderation, separately authorized publication, real previews,
reviewed cover images and pinned install descriptors. Uploads remain closed
while native acceptance and production publication are unfinished. Both R2
buckets are private. Do not treat test fixtures, approved-only submissions or
an empty catalog as a successful end-to-end migration.

The new native cover-selection source has been built, but the released clients
and both-platform web-to-app flow still require acceptance. Existing bundled
sounds must not be removed until their published replacements work on both
platforms and old settings/personal-pack dependencies have a verified migration.

## Addresses and identities

```text
Community: https://www.wormforce.net/projects/battuta/community
Review:    https://www.wormforce.net/projects/battuta/community/review
API:       https://www.wormforce.net/api/battuta/community/v1
Install:   /packs/<packId>/releases/<releaseId>/install
Cover:     /packs/<packId>/releases/<releaseId>/cover.png
Preview:   /packs/<packId>/releases/<releaseId>/preview.json or preview.wav
Deep link: battuta://community/install/<packId>/<releaseId>
```

Archive origin is `https://assets.wormforce.net/`, which requires its own verified
DNS/HTTPS setup. `artifact.path` supplies the required `battuta/` namespace:

```text
battuta/packs/<packId>/releases/<releaseId>/<sha256>.simuboardpack.zip
```

The API resolves an exact published release and reads the private bucket using
separate read-only credentials. Never turn the bucket public to repair a failed
download or expose quarantine keys to browsers. No arbitrary media URL is accepted.

The package manifest ID and work ID remain stable across versions. Each actual
release receives a distinct release ID and increasing sequence, never an
overwrite or mutable “latest” descriptor. Minimum client versions must name
actual accepted releases, not aspirational versions or test-fixture values.

## Submission, review and publication

1. A creator explicitly selects a personal pack in the native app, signs in,
   supplies recording provenance/license/presentation and confirms sharing rights.
   Optional photo selection is separate; no neighboring files, typing statistics
   or unrelated local content are collected. A confirmed immutable upload snapshot
   includes the exact compressed byte count and SHA-256; retry uses that snapshot.
2. The private upload may carry one `cover.png` or `cover.jpg`, at most 4 MiB.
   The sequential worker validates audio, mappings, paths, bounds and hash. It
   decodes the image with bounded pixels, rejects animation/corruption, applies
   orientation, fits to 1024 without cropping/upscaling and strips source metadata.
   It saves only the derived PNG for review. The canonical native install ZIP
   contains audio, manifest and licenses, not the cover image.
3. An explicitly authorized human reviewer uses the review page to inspect
   mappings, provenance, license, actual audio and any processed photo. A photo
   must load before the UI permits approval. Approval or rejection records an
   actor and reason; approval alone does not make the work public.
4. A separately authorized publisher copies verified canonical archive, preview
   and cover with conditional writes and destination hash readback. Only after
   storage succeeds does a transaction commit a release and publication audit.
   Copy failure leaves the submission approved but unpublished. Do not insert
   fake reviewer records, synthetic releases or catalog entries to bypass this.
5. Live catalog responses separate `presentations` text from release-keyed,
   validated `covers`. Cards use reviewed creator photos when available and
   clearly labeled illustrations otherwise. Failed cover loading is not silently
   presented as a creator photo. The native install descriptor remains unchanged.
6. The website offers the pinned install link; the native app shows information
   and asks for confirmation before downloading, hashing and installing locally.
   Verify cancellation/retry, updates, repeat installation, failure rollback and
   offline playback on both Mac and Windows before slimming or shipping clients.

## Media and withdrawal

Private review media requires an active permitted browser session. Public
preview/cover requests do not forward browser cookies or authorization headers.
Fixed-host proxies reject redirects, unexpected MIME and oversized bodies;
cover responses additionally check PNG signature and declared length. Covers
are unoptimized and `no-store`, preventing an image optimizer/CDN cache from
bypassing the API's visibility checks. The API rechecks visibility after storage
reads; withdrawn works, releases or disabled authors must not serve media or
descriptors. Do not overwrite immutable objects or delete already installed packs.

## Website checks

```sh
npm run test:battuta-community
npm run lint
npm run build
```

The local contract gate still validates the legacy static catalog. It does not
prove live publication, R2 permissions, human review or native installation.
Use the current server rollout/migration records and actual production/native
acceptance for those gates. Preserve source licenses and attribution throughout.
