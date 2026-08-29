# Personal Blog

This repository contains the content and Astro implementation for [barts.space](https://barts.space), Bart's main content site. The Astro project lives in `src/`. Published and publication-track Markdown lives in `content/blog/`; loose unpublished drafts live in `content/scratchpad/`. The unrelated static host for stuff.barts.space remains in `site/`.

## Site development

- Run Astro commands from `src/` with Node 24.
- Treat `content/blog/` as the only content collection used by the public site. Posts with `draft: true` must not appear in routes, lists, feeds, or the sitemap.
- Treat `content/scratchpad/` as private working material that must never be included in the Astro build.
- Preserve explicit published slugs and trailing-slash URLs. Do not derive canonical URLs from filenames when frontmatter provides a slug.
- The live Bear version was authoritative during the initial migration. After the production cutover, the repository is authoritative.
- Do not repurpose or deploy `site/` when working on barts.space; it serves a different domain and Cloudflare Pages project.

## Writing guidance

- Use the `barts-voice` skill whenever drafting or revising text that should sound like Bart.
- Preserve the author's point of view, factual claims, examples, and uncertainty. Do not invent personal experiences, measurements, or opinions.
- Keep prose concise and conversational. Prefer normal paragraphs over extra headings and lists unless structure materially improves the piece.

## Repository skills

- Keep repository-scoped skills in `.agents/skills/<skill-name>/SKILL.md` so Codex can discover them.
- Skills must follow the Agent Skills format: a directory containing `SKILL.md` with YAML `name` and `description` fields. Put reusable scripts, references, assets, or product metadata in the standard optional subdirectories only when needed.
- Treat `.agents/skills` as the canonical source. Compatibility paths for other agents should point there rather than contain diverging copies.
