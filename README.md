# barts.space

This repository contains two websites plus their source content:

- `content/blog/` — Markdown used by the Astro blog. A post can remain unpublished with `draft: true`.
- `content/scratchpad/` — loose drafts that Astro never reads.
- `src/` — the Astro and Cloudflare Worker project for barts.space.
- `stuff-site/` — the independent static publish root for stuff.barts.space.
- `gpx-story/` — a separate prototype.

The `src/` and `stuff-site/` deployment paths are unrelated. See `src/DEPLOY.md` and `stuff-site/DEPLOY.md` respectively.

## Local development

Use Node 24, then run commands from `src/`:

```sh
npm install
npm run dev
npm run build
npm run verify:content
```

To preview drafts in routes and post lists, run `npm run dev:drafts` (equivalent to `SHOW_DRAFTS=true npm run dev`). Drafts appear first and are labelled. For a specific port, use `npm run dev:drafts -- --host 127.0.0.1 --port 4322`.

The flag only applies during development. Production builds and feeds always exclude drafts, and scratchpad content is never loaded.

The public site is statically generated and deployed through Cloudflare Workers Static Assets. Published articles keep explicit root-level slugs such as `/loofah-a-vault-free-meeting-transcriber/`.

## Bear import

The initial migration is reproducible:

```sh
cd src
npm run import:bear
```

The importer crawls the public archive serially, caches source responses, mirrors article media locally, and records hashes in `src/scripts/bear-import-manifest.json`. Set `BEAR_REFRESH=1` for the final pre-cutover freshness pass.

After the DNS cutover, edit repository Markdown directly rather than re-importing Bear.
