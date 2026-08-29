# Personal Blog

This repository contains two separate websites plus their source content. Keep their build and deployment paths distinct.

## Repository layout

- `src/` is the Astro project for [barts.space](https://barts.space), Bart's main blog. Run its Node, Astro, content verification, feed, and Cloudflare Worker commands from this directory.
- `content/blog/` contains Markdown consumed by the Astro project. Published posts and publication-track drafts both belong here; frontmatter controls whether a post is public.
- `content/scratchpad/` contains loose unpublished writing that Astro must never read or publish.
- `stuff-site/` is the independent static publish root for [stuff.barts.space](https://stuff.barts.space). It is not part of the Astro app and currently deploys to the separate Cloudflare project named `knowledge-work-atlas`.
- `gpx-story/` is a separate prototype and is not part of either website.

## barts.space development (`src/`)

- Run Astro commands from `src/` with Node 24.
- Treat `content/blog/` as the only content collection used by the public site. Posts with `draft: true` must not appear in routes, lists, feeds, or the sitemap.
- Treat `content/scratchpad/` as private working material that must never be included in the Astro build.
- Preserve explicit published slugs and trailing-slash URLs. Do not derive canonical URLs from filenames when frontmatter provides a slug.
- The live Bear version was authoritative during the initial migration. After the production cutover, the repository is authoritative.
- Do not include or deploy `stuff-site/` when working on barts.space.

## stuff.barts.space development (`stuff-site/`)

- Treat `stuff-site/` as the complete static publish root; its subdirectories map directly to public URL paths.
- Follow `stuff-site/DEPLOY.md` for its build and deployment procedure.
- Deploy the entire `stuff-site/` directory, not an individual sub-project.
- Do not include `src/`, `content/`, or `gpx-story/` when deploying stuff.barts.space.
- Keep the external Cloudflare project name `knowledge-work-atlas` unless a separate migration explicitly changes it; the repository directory name does not rename that project.

## Writing guidance

- Use the `barts-voice` skill whenever drafting or revising text that should sound like Bart.
- Preserve the author's point of view, factual claims, examples, and uncertainty. Do not invent personal experiences, measurements, or opinions.
- Keep prose concise and conversational. Prefer normal paragraphs over extra headings and lists unless structure materially improves the piece.

## Repository skills

- Keep repository-scoped skills in `.agents/skills/<skill-name>/SKILL.md` so Codex can discover them.
- Skills must follow the Agent Skills format: a directory containing `SKILL.md` with YAML `name` and `description` fields. Put reusable scripts, references, assets, or product metadata in the standard optional subdirectories only when needed.
- Treat `.agents/skills` as the canonical source. Compatibility paths for other agents should point there rather than contain diverging copies.
