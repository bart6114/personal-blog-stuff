# Deploying the Atlas (Cloudflare Pages)

The explorer is a single self-contained `index.html`, so deploying is just uploading
this folder as static assets. Live at **https://knowledge-work-atlas.pages.dev**.

> Why Pages? Cloudflare Pages is **not** deprecated (only the older "Workers Sites" is).
> Cloudflare recommends Workers Static Assets for *new* projects, but for a single static
> page Pages is the lowest-friction option. See the migration note at the bottom.

## One-time setup

1. Install Wrangler (Cloudflare CLI) and log in:
   ```bash
   npm i -g wrangler        # or: brew install cloudflare-wrangler
   wrangler login           # completes via browser OAuth
   wrangler whoami          # confirm you're logged in
   ```

2. This account has **multiple Cloudflare accounts**, so Wrangler can't auto-pick one in
   non-interactive mode. Set the account ID (personal `bart6114` account):
   ```bash
   export CLOUDFLARE_ACCOUNT_ID=6adc50875d0ccd569fe6b0558742e7a0
   ```

3. Create the Pages project once:
   ```bash
   wrangler pages project create knowledge-work-atlas --production-branch=main
   ```

## Deploy / redeploy

From the repo root (`personal-blog/`):

```bash
export CLOUDFLARE_ACCOUNT_ID=6adc50875d0ccd569fe6b0558742e7a0
wrangler pages deploy knowledge-work-atlas \
  --project-name=knowledge-work-atlas \
  --branch=main \
  --commit-dirty=true
```

Each deploy prints a production URL (`knowledge-work-atlas.pages.dev`) and a unique
preview URL (`<hash>.knowledge-work-atlas.pages.dev`).

## After editing the catalog

`tasks.yaml` is the source of truth. If you change it, regenerate the page **before**
deploying (the data is embedded in `index.html`):

```bash
cd knowledge-work-atlas && python3 build.py && cd ..
# then run the deploy command above
```

## Notes

- The whole folder is published, so `tasks.yaml`, `build.py`, and `README.md` are also
  served publicly (intended — it's open data). To publish only the page, deploy a
  directory containing just `index.html`.
- **Future-aligned alternative (Workers Static Assets):** add a `wrangler.jsonc` with
  `{"name":"knowledge-work-atlas","compatibility_date":"2025-01-01","assets":{"directory":"."}}`
  in this folder and run `wrangler deploy`. Same free static-asset serving; this is the
  path Cloudflare is investing in for new projects.
