# stuff.barts.space — static host

This `site/` folder is the **publish root** for the Cloudflare Pages project
`knowledge-work-atlas`, served at **https://stuff.barts.space** (and
`knowledge-work-atlas.pages.dev`).

```
site/                       <- publish root (this folder is what gets deployed)
  index.html                <- landing page (lists projects)
  knowledge-work-atlas/     <- https://stuff.barts.space/knowledge-work-atlas/
    index.html
    tasks.yaml  build.py  README.md
  <future-project>/         <- just drop a new folder here -> /<future-project>/
```

## Add a new project

1. Create `site/<project>/` with at least an `index.html`.
2. Add a card linking to `/<project>/` in `site/index.html`.
3. Deploy (below). It will be live at `https://stuff.barts.space/<project>/`.

## Deploy / redeploy

From the repo root (`personal-blog/`):

```bash
export CLOUDFLARE_ACCOUNT_ID=6adc50875d0ccd569fe6b0558742e7a0
wrangler pages deploy site \
  --project-name=knowledge-work-atlas \
  --branch=main \
  --commit-dirty=true
```

> Deploy the **`site`** directory (not a sub-project), so paths line up with the URLs.

## After editing the atlas catalog

`site/knowledge-work-atlas/tasks.yaml` is the source of truth. If you change it,
regenerate the page before deploying (data is embedded in `index.html`):

```bash
cd site/knowledge-work-atlas && python3 build.py && cd ../..
# then run the deploy command above
```

## One-time setup (already done)

- `wrangler login` (OAuth) — note: this token lacks DNS-edit scope.
- Account has two orgs, so set `CLOUDFLARE_ACCOUNT_ID` (the `bart6114` account, above).
- Project created: `wrangler pages project create knowledge-work-atlas --production-branch=main`.
- Custom domain `stuff.barts.space` added in the Pages dashboard (Custom domains), which
  created the proxied `CNAME stuff -> knowledge-work-atlas.pages.dev` and the TLS cert.

## Notes

- The whole `site/` tree is public, including each project's `tasks.yaml`, `build.py`,
  `README.md` (intended — open data).
- **Future-aligned alternative (Workers Static Assets):** a `wrangler.jsonc` with
  `{"name":"...","compatibility_date":"2025-01-01","assets":{"directory":"./site"}}`
  + `wrangler deploy`. Same free static serving; the path Cloudflare pushes for new projects.
