# Wormforce Website v1

Official team website for `wormforce.net`, built with Next.js App Router, TypeScript, Tailwind CSS, and Vercel Analytics.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Vercel Analytics

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run start` - run production server

## Content Configuration

All editable content for the v1 site is in code:

- Team profile: `src/content/site.ts`
- Member profiles: `src/content/members.ts`
- Project profiles: `src/content/projects.ts`
- Battuta release and search guides: `src/content/battuta.ts`, `src/content/battuta-guides.ts`
- Battuta curated community catalog: `src/content/battuta-community/catalog.json`

Replace placeholder text, links, and avatar files when production content is ready.

## Route Map

- `/` - home (Hero, Projects, Members, Team and Mission, Contact)
- `/members/[slug]` - member profile pages
- `/projects` - project directory
- `/projects/[slug]` - project detail pages
- `/projects/battuta/guides/[slug]` - Battuta platform setup guides
- `/projects/battuta/community` and `/en/projects/battuta/community` - curated community catalog
- `/projects/battuta/community/packs/[slug]` - localized community sound details
- `/api/battuta/community/v1/packs/[packId]/releases/[releaseId]/install` - immutable install descriptors
- `/projects/battuta/privacy` - Battuta privacy policy
- `not-found` - custom 404
- `/robots.txt` and `/sitemap.xml` via metadata routes

## Battuta Community

Community v1 is published from a reviewed static catalog. Website builds run
`npm run verify:battuta-community` before Next.js compilation, so malformed IDs,
versions, hashes, paths, sizes, dates, localized fields, or descriptors fail the
deployment. Use `npm run verify:battuta-community:remote` to verify the exact R2
headers, byte count, and SHA-256 after uploading an archive.

See [`docs/battuta-community-publishing.md`](docs/battuta-community-publishing.md)
for the R2 layout, immutable-release rules, catalog shape, and release checklist.

## CI

GitHub Actions workflow:

- `.github/workflows/ci.yml`
- Runs `npm ci`, `npm run lint`, and `npm run build` on PRs and `main` pushes.

## Deploy to Vercel

1. Import repo `https://github.com/wormforce/wormforce` in Vercel.
2. Keep framework preset as `Next.js`.
3. Set production branch to `main`.
4. Add domains:
   - `wormforce.net`
   - `www.wormforce.net`
5. Configure DNS records following Vercel dashboard instructions.
6. Verify SSL certificate status is active.

## Branch Protection (GitHub)

Recommended `main` protections:

- Disable force pushes
- Require status check for CI workflow before merging
