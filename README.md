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

Replace placeholder text, links, and avatar files when production content is ready.

## Route Map

- `/` - home (Hero, Team, Members, Projects preview, Contact)
- `/members/[slug]` - member profile pages
- `/projects` - projects placeholder page
- `not-found` - custom 404
- `/robots.txt` and `/sitemap.xml` via metadata routes

## CI

GitHub Actions workflow:

- `.github/workflows/ci.yml`
- Runs `npm ci`, `npm run lint`, and `npm run build` on PRs and `main` pushes.

## Deploy to Vercel

1. Import repo `https://github.com/7b7b7b/wormforce` in Vercel.
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
