# Deploy barts.space

This Astro build deploys as a Cloudflare Worker with Static Assets named `barts-space`. It is not a Cloudflare Pages project and does not use the deprecated Workers Sites/KV asset flow.

It must never replace the existing `knowledge-work-atlas` project serving `stuff.barts.space`.

From this directory, using Node 24:

```sh
npm run build
npm run verify:content
npm run worker:preview
```

For a brand-new Worker, `npm run deploy` creates the initial deployed version. After that bootstrap, the preview upload creates a versioned Workers preview without sending production traffic to it. Validate the preview URL, copy the returned Version ID, then promote that exact version:

```sh
npm run worker:promote -- <VERSION_ID>@100% -y
```

The Worker configuration serves `dist/` through a Static Assets binding and uses Astro’s generated `404.html`. A small Worker handler preserves Bear’s feed URLs: `/feed/` serves Atom and `/feed/?type=rss` serves RSS. The explicit `/feed/atom.xml` and `/rss.xml` build outputs remain available as well.

## Domain cutover

Bart handles the DNS change. Once the Worker preview and production `workers.dev` route pass validation, remove only the existing Bear apex A/AAAA records and add `barts.space` as a Worker Custom Domain. Cloudflare will create the replacement DNS record and certificate.

Configure `www.barts.space` as a Cloudflare Bulk Redirect to `https://barts.space`, preserving path and query string, with status 301. If Cloudflare requires a proxied DNS record for that redirect, use the documentation-only address `192.0.2.0`.

Do not touch nameservers, mail records, TXT records, `stuff` DNS, or the `knowledge-work-atlas` deployment.

Keep Bear intact until the apex and www routes, HTTPS, all canonical pages, feeds, sitemap, robots, analytics, and `stuff.barts.space` regression checks pass.

## Scheduled publishing

Posts are included in a production build when `draft` is `false` and `publishedAt` is either omitted or no later than the build time. Future-dated posts remain absent from routes, lists, feeds, and the sitemap until a later build.

The `Scheduled publish` GitHub Actions workflow builds, verifies, and deploys the `main` branch every day at 06:30 Europe/Brussels. GitHub may delay scheduled runs, so this is the trigger time rather than a guaranteed publication time. It can also be run manually. Configure these GitHub Actions repository secrets before enabling it:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`, scoped to deploy the `barts-space` Worker
