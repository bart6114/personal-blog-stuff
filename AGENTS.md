# Personal Blog

This repository contains blog post drafts for [barts.space](https://barts.space), Bart's main content site. Drafts live as Markdown files in the repository root; the publishing site lives in `site/`.

## Writing guidance

- Use the `barts-voice` skill whenever drafting or revising text that should sound like Bart.
- Preserve the author's point of view, factual claims, examples, and uncertainty. Do not invent personal experiences, measurements, or opinions.
- Keep prose concise and conversational. Prefer normal paragraphs over extra headings and lists unless structure materially improves the piece.

## Repository skills

- Keep repository-scoped skills in `.agents/skills/<skill-name>/SKILL.md` so Codex can discover them.
- Skills must follow the Agent Skills format: a directory containing `SKILL.md` with YAML `name` and `description` fields. Put reusable scripts, references, assets, or product metadata in the standard optional subdirectories only when needed.
- Treat `.agents/skills` as the canonical source. Compatibility paths for other agents should point there rather than contain diverging copies.
