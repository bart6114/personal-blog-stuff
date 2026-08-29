# barts.space

This repository contains three separate things:

- `content/blog/` — Markdown used by the Astro blog. A post can remain unpublished with `draft: true`.
- `content/scratchpad/` — loose drafts that Astro never reads.
- `src/` — the Astro project for barts.space.

The existing `site/` directory still serves stuff.barts.space and `gpx-story/` remains a separate prototype.

## Local development

Use Node 24, then run commands from `src/`:

```sh
npm install
npm run dev
npm run build
npm run verify:content
```

The public site is statically generated and deployed through Cloudflare Workers Static Assets. Published articles keep explicit root-level slugs such as `/loofah-a-vault-free-meeting-transcriber/`.

## Bear import

The initial migration is reproducible:

```sh
cd src
npm run import:bear
```

The importer crawls the public archive serially, caches source responses, mirrors article media locally, and records hashes in `src/scripts/bear-import-manifest.json`. Set `BEAR_REFRESH=1` for the final pre-cutover freshness pass.

After the DNS cutover, edit repository Markdown directly rather than re-importing Bear.
