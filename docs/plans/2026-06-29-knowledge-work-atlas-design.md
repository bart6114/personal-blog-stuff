# Automatable Knowledge-Work Atlas — Design

**Date:** 2026-06-29
**Status:** Approved design — awaiting spec review before implementation
**Owner:** Bart

## 1. Purpose

Build a maintainable, shareable catalog of **small, automatable tasks** drawn from
white-collar / administrative / knowledge-worker jobs — explicitly **not** software
development work. Each task is one automatable step of a real workflow (e.g. "draft a
cold outreach email", "summarize a discovery call", "reconcile a vendor invoice"), and
each is described in enough granularity that it could later be turned into a Claude
*skill* (instructions + optional scripts).

The catalog is the foundation; on top of it sits an interactive visualization that
people can explore, and that Bart can publish on [barts.space](https://barts.space).

### Design decisions already made (with the user)

- **Atomic unit = task, tagged by role** — not a rigid per-role tree. Many tasks span
  several roles, so a tree would force duplication. Tasks are grouped by *domain* for
  browsing and carry *role* tags for cross-cutting filtering.
- **Storage = a single flat `tasks.yaml`** — human-readable and machine-parseable, so
  it is easy to maintain, diff, read, and share, and the visualization can read it
  directly.
- **Depth = rich metadata for every task** (not full skill instructions for all). Each
  record carries enough structure to drive the map and to generate a real skill later.
- **Visualization = a single self-contained interactive HTML explorer** (searchable,
  filterable card grid) — no server, drop-in for the blog.
- **Scale = ~120–150 tasks** across ~17 domains ("at least a hundred").

### Non-goals (YAGNI)

- No full, ready-to-run `SKILL.md` instructions for every task in this pass (the
  metadata is enough to author one on demand). A small number of exemplars MAY be added
  later, but are out of scope for v1.
- No backend, database, or build pipeline. The explorer is one static file.
- No software-development tasks (coding, code review, CI/CD, etc.).
- No live integrations / no actually executing any of the tasks.

## 2. Taxonomy

### 2.1 Domains (top-level grouping, controlled vocabulary)

Browsing groups. Every task belongs to exactly **one** domain.

1. Sales & BizDev
2. Marketing & Content
3. Customer Success & Support
4. Finance & Accounting
5. HR & People Ops
6. Recruiting & Talent
7. Legal & Compliance
8. Operations & Project Mgmt
9. Product Management
10. Business / Functional Analysis
11. Research & Competitive Intel
12. Data & Reporting (BI)
13. Procurement & Vendor Mgmt
14. Executive / Admin Support
15. Communications & PR
16. Strategy & Consulting
17. Learning & Development

### 2.2 Roles (controlled vocabulary for tags)

Tasks carry one or more role tags. Roles are cross-cutting (a task may be tagged with
roles from outside its domain). Target ~40 roles. Initial list (extendable during
generation, but normalized to this vocabulary at the end):

SDR, Account Exec, Sales Manager, Founder, Marketing Manager, Content Marketer,
SEO Specialist, Social Media Manager, Demand Gen Manager, Brand Manager, CSM,
Support Agent, Support Manager, Accountant, Bookkeeper, Financial Analyst, Controller,
AP/AR Clerk, HR Manager, HR Business Partner, People Ops Specialist, Recruiter,
Sourcer, Legal Counsel, Paralegal, Compliance Officer, Operations Manager,
Project Manager, Program Manager, Product Manager, Product Marketing Manager,
Business Analyst, Functional Analyst, Data Analyst, BI Analyst, Procurement Specialist,
Vendor Manager, Executive Assistant, Office Manager, Comms Manager, PR Specialist,
Management Consultant, Strategy Analyst, L&D Specialist, Trainer.

## 3. Data Model

### 3.1 `tasks.yaml` — schema per record

```yaml
- id: draft-cold-outreach            # kebab-case, globally unique
  title: Draft cold outreach email   # short imperative phrase
  domain: Sales & BizDev             # exactly one, from domain vocabulary
  roles: [SDR, Account Exec, Founder]# 1..n, from role vocabulary
  description: >                     # 1-2 plain-language lines
    Turn a prospect profile and value prop into a personalized first-touch email.
  inputs: [prospect profile, value prop, ICP notes]   # what the task consumes
  outputs: [personalized email draft]                 # what it produces
  automation: high                   # low | medium | high (how fully automatable today)
  human_in_loop: review-before-send  # none | spot-check | review-before-send | approve | sign-off
  tools: [CRM, email]                # systems/data the task touches (generic names)
  frequency: daily                   # ad-hoc | daily | weekly | monthly | quarterly
  trigger: "write a cold email to {prospect}"   # example natural-language invocation
```

### 3.2 Field rules / enums

- `id` — kebab-case, unique across the file; derived from the title.
- `domain` — exactly one value from §2.1.
- `roles` — non-empty list, each from §2.2.
- `automation` — one of `low | medium | high`.
  - `high` = the model can produce the deliverable end-to-end with minimal human input.
  - `medium` = solid draft, but needs human judgment/data to finish.
  - `low` = useful assist, but the human still does most of the work.
- `human_in_loop` — one of `none | spot-check | review-before-send | approve | sign-off`.
- `frequency` — one of `ad-hoc | daily | weekly | monthly | quarterly`.
- `tools` — generic system names (CRM, email, spreadsheet, calendar, docs, ATS,
  ticketing, ERP, BI tool, e-signature, etc.). No vendor names.
- All free-text fields are short; `description` is at most two lines.

### 3.3 Quality bar per record

- The task is a **single automatable step**, not a whole job ("draft the QBR deck
  outline", not "run customer success").
- It is genuinely **non-development** knowledge/admin work.
- `automation`, `human_in_loop`, and `frequency` are realistic, not aspirational.
- `trigger` reads like something a person would actually type to Claude.

## 4. Generation Workflow (multi-phase)

Implemented with the Workflow tool (ultracode). Phases:

1. **Generate** — one agent per domain (~17), each returns 8–12 fully-populated task
   records conforming to the schema (structured output). Yields ~150 raw tasks.
2. **Completeness critic** — one agent per domain reviews its domain's set against the
   global title list and proposes missing high-value automatable tasks (captures the
   tail). New tasks are appended.
3. **Normalize & dedupe** — script-side: enforce domain/role vocabularies, kebab-case
   and de-collide `id`s, validate enums, drop exact duplicates; one agent does a
   semantic-merge pass over near-duplicate titles and returns the merged set.
4. **Assemble** — emit the three artifacts (§6).

Scaling: agents run concurrently within the workflow's cap. Role/domain vocabularies are
passed into every generator prompt so tags stay consistent. The critic and dedupe passes
are what push quality past a naive single-shot generation.

## 5. Visualization

A single **self-contained `index.html`**:

- **Data embedded inline** as a JSON blob generated from `tasks.yaml` (so the file works
  with no server and can be shared/published as one file).
- **Controls:** free-text search (title + description), and filters for Domain, Role,
  and Automation level.
- **Main view:** responsive card grid. Each card shows title, domain, automation badge,
  and role chips.
- **Detail:** clicking a card opens a panel/expansion with description, inputs, outputs,
  tools, human-in-loop, frequency, and the trigger phrase.
- **Footer:** live count of matching tasks ("showing 42 of 150"), and a short note on
  what the atlas is + a link back to the source `tasks.yaml`.
- Pure HTML/CSS/vanilla JS, no external dependencies/CDNs (keeps it portable and
  publishable).

`tasks.yaml` is the source of truth. The HTML embeds a generated copy of the data; a
short note in the README explains how to regenerate the embed if the YAML changes.

## 6. Artifacts & File Layout

```
knowledge-work-atlas/
  tasks.yaml     # source of truth (the catalog)
  index.html     # self-contained interactive explorer (data embedded)
  README.md      # what this is, the schema, domain/role vocab, how to extend/regenerate
docs/plans/2026-06-29-knowledge-work-atlas-design.md   # this spec
```

## 7. Success Criteria

- `tasks.yaml` contains ~120–150 records, all schema-valid, no duplicate ids, all
  domains represented, roles drawn from the controlled vocabulary.
- Tasks are realistic, single-step, non-dev, with sensible automation ratings.
- `index.html` opens directly in a browser, filters/search work, and is one portable
  file.
- The whole thing is easy to read and extend by hand (add a YAML record → re-embed).

## 8. Open Questions / Future Work

- Optional later pass: author ~8–10 full `SKILL.md` exemplars for standout tasks.
- Optional later: a second visualization view (sunburst or network graph) toggled in the
  same HTML.
- Optional: an `automation`-weighted "where to start" view (highest value × highest
  automatability).
