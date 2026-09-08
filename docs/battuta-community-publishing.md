# Battuta community publishing

Battuta Community v1 is a curated, read-only catalog. The Wormforce website owns
the catalog, localized pages, and immutable install-descriptor API. Cloudflare R2
serves approved archives and optional cover/preview media from
`assets.wormforce.net`.

There is deliberately no public upload form, account system, or mutable
“latest” install endpoint in v1. A sound becomes public only after it has been
validated, reviewed, uploaded, and added to the catalog in this repository.

## Production addresses

```text
Catalog:         https://www.wormforce.net/projects/battuta/community
Descriptor API: https://www.wormforce.net/api/battuta/community/v1/packs/<packId>/releases/<releaseId>/install
Archive origin: https://assets.wormforce.net/
Archive path:   battuta/packs/<packId>/releases/<releaseId>/<sha256>.simuboardpack.zip
Deep link:      battuta://community/install/<packId>/<releaseId>
```

The archive origin intentionally ends at the domain root. The required
`battuta/` product namespace is part of `artifact.path` and is checked by the
website, macOS client, and Windows client.

## Publish a release

1. Validate the source package with the current Battuta package validator and
   review its recording provenance, author identity, license, attribution, and
   preview media.
2. Build the canonical ZIP. Never publish the creator's original upload.
3. For a brand-new community pack, generate its canonical lowercase `packId`
   and inner `packageManifestId` once. Keep both IDs stable for every later
   release of that pack. Generate a new `releaseId` for each release and increase
   `releaseSequence`; all three IDs must be pairwise different. A correction is
   always another release, never a replacement of an existing ID.
4. Compute the exact compressed byte count and lowercase SHA-256. Name the file
   `<sha256>.simuboardpack.zip` and upload it to the immutable R2 key shown above.
5. Set these R2 response headers exactly:

   ```http
   Content-Type: application/vnd.battuta.sound-pack+zip;version=1
   Content-Length: <exact compressed byte count>
   Cache-Control: public, max-age=31536000, immutable
   ```

   Do not set a compressed `Content-Encoding`, configure a redirect, or replace
   bytes at an already published key.
6. Put optional cover and preview files below the pinned release path:

   ```text
   battuta/community-media/<packId>/releases/<releaseId>/cover.webp
   battuta/community-media/<packId>/releases/<releaseId>/preview.mp3
   ```

7. Add the pack or release to
   `src/content/battuta-community/catalog.json`. `latestReleaseId` must point to
   one descriptor in `releases`. Set minimum client versions to the first real
   macOS and Windows releases that contain the complete community installer—not
   to an aspirational version.
8. Run the local contract gate, then verify every live R2 object:

   ```bash
   npm run verify:battuta-community
   npm run verify:battuta-community:remote
   npm run lint
   npm run build
   ```

9. Preview both language routes and the descriptor endpoint. Confirm the API
   response is below 64 KiB, has
   `application/vnd.battuta.community-install+json;version=1`, and does not
   redirect.
10. Merge and deploy the website only after a current macOS build and Windows
    build both complete the web-to-app install flow against the production
    objects.

## Catalog shape

Each pack has localized discovery copy and one or more complete immutable
descriptors:

```json
{
  "slug": "url-safe-name",
  "packId": "<canonical lowercase UUID>",
  "name": "Public pack name",
  "summary": { "zh-CN": "...", "en": "..." },
  "description": { "zh-CN": "...", "en": "..." },
  "tags": { "zh-CN": ["..."], "en": ["..."] },
  "coverImage": "https://assets.wormforce.net/battuta/community-media/<packId>/releases/<releaseId>/cover.webp",
  "previewAudio": "https://assets.wormforce.net/battuta/community-media/<packId>/releases/<releaseId>/preview.mp3",
  "latestReleaseId": "<releaseId>",
  "releases": [
    { "schemaVersion": 1, "packId": "<packId>", "releaseId": "<releaseId>" }
  ]
}
```

The shortened descriptor above illustrates placement only. Every catalog
descriptor must include every field in the Battuta transport contract; the
verification script rejects incomplete entries.

## Removal and incident handling

Removing a catalog entry stops new discovery and descriptor resolution after
the website deploys and its cached route is purged. It does not delete an already installed local pack. Keep
the immutable R2 object while investigating so an existing pinned link cannot
silently resolve to different bytes. If a release must be withdrawn urgently,
remove it from the catalog/API and publish any corrected content as a new
release; never overwrite the old object.
