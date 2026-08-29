# stuff.barts.space — static host

This `stuff-site/` folder is the **publish root** for the Cloudflare Pages project
`knowledge-work-atlas`, served at **https://stuff.barts.space** (and
`knowledge-work-atlas.pages.dev`).

```
stuff-site/                 <- publish root (this folder is what gets deployed)
  index.html                <- landing page (lists projects)
  skill-atlas/              <- https://stuff.barts.space/skill-atlas/
    index.html
    tasks.yaml  build.py  README.md
  _redirects                <- 301s the old /knowledge-work-atlas/* path here
  <future-project>/         <- just drop a new folder here -> /<future-project>/
```

## Add a new project

1. Create `stuff-site/<project>/` with at least an `index.html`.
2. Add a card linking to `/<project>/` in `stuff-site/index.html`.
3. Deploy (below). It will be live at `https://stuff.barts.space/<project>/`.

## Deploy / redeploy

From the repo root (`personal-blog/`):

```bash
export CLOUDFLARE_ACCOUNT_ID=6adc50875d0ccd569fe6b0558742e7a0
wrangler pages deploy stuff-site \
  --project-name=knowledge-work-atlas \
  --branch=main \
  --commit-dirty=true
```

> Deploy the **`stuff-site`** directory (not a sub-project), so paths line up with the URLs.

## After editing the atlas catalog

`stuff-site/skill-atlas/tasks.yaml` is the source of truth. If you change it,
regenerate the page before deploying (data is embedded in `index.html`):

```bash
cd stuff-site/skill-atlas && python3 build.py && cd ../..
# then run the deploy command above
```

## One-time setup (already done)

- `wrangler login` (OAuth) — note: this token lacks DNS-edit scope.
- Account has two orgs, so set `CLOUDFLARE_ACCOUNT_ID` (the `bart6114` account, above).
- Project created: `wrangler pages project create knowledge-work-atlas --production-branch=main`.
- Custom domain `stuff.barts.space` added in the Pages dashboard (Custom domains), which
  created the proxied `CNAME stuff -> knowledge-work-atlas.pages.dev` and the TLS cert.

## Notes

- The whole `stuff-site/` tree is public, including each project's `tasks.yaml`, `build.py`,
  `README.md` (intended — open data).
- **Path vs project name:** the public URL path is `/skill-atlas/` (the folder under
  `stuff-site/`), but the Cloudflare **Pages project** is still named `knowledge-work-atlas`
  (its `.pages.dev` subdomain and dashboard entry) — they're independent, so the deploy
  command's `--project-name` stays `knowledge-work-atlas`. `stuff-site/_redirects` 301s the old
  `/knowledge-work-atlas/*` path to `/skill-atlas/*` so prior links keep working.
- **Future-aligned alternative (Workers Static Assets):** a `wrangler.jsonc` with
  `{"name":"...","compatibility_date":"2025-01-01","assets":{"directory":"./stuff-site"}}`
  + `wrangler deploy`. Same free static serving; the path Cloudflare pushes for new projects.
