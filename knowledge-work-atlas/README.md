# Automatable Knowledge-Work Atlas

A catalog of **small, automatable tasks** drawn from white-collar / administrative /
knowledge-worker jobs &mdash; explicitly **not** software development. Each task is one
step that a Claude *skill* could perform, tagged with the roles it belongs to and a few
attributes describing how automatable it is today.

The point: instead of asking "can AI do the job of a *functional analyst*?", we catalog
the *parts of the work* (drafting requirements, summarizing interviews, building a
traceability matrix) and tag each with the roles it touches. Many tasks span several
roles, so the task &mdash; not the role &mdash; is the atomic unit.

## At a glance

- **446 tasks** across **17 domains**
- **100 roles** tagged (55 discovered beyond the starter vocabulary)
- Automation mix: **152 high** &middot; **285 medium** &middot; **9 low**

## Explore

Open **`index.html`** in a browser &mdash; it is a single self-contained file (data
embedded, no server needed). Search, filter by domain / role / automation level, and
click any task for inputs, outputs, tools, and an example prompt. Drop it on a blog as-is.

## Tasks by domain

| Domain | Tasks |
|---|---:|
| Sales & BizDev | 26 |
| Marketing & Content | 32 |
| Customer Success & Support | 36 |
| Finance & Accounting | 37 |
| HR & People Ops | 21 |
| Recruiting & Talent | 22 |
| Legal & Compliance | 22 |
| Operations & Project Mgmt | 40 |
| Product Management | 21 |
| Business / Functional Analysis | 20 |
| Research & Competitive Intel | 31 |
| Data & Reporting (BI) | 28 |
| Procurement & Vendor Mgmt | 19 |
| Executive / Admin Support | 19 |
| Communications & PR | 26 |
| Strategy & Consulting | 21 |
| Learning & Development | 25 |

## Schema (`tasks.yaml`)

`tasks.yaml` is the source of truth. Each record:

```yaml
- id: draft-cold-outreach            # kebab-case, unique
  title: Draft cold outreach email   # short imperative phrase
  domain: Sales & BizDev             # one of the domains above
  roles: [SDR, Account Exec]         # 1..n role tags
  description: One-to-two line plain summary.
  inputs: [prospect profile, value prop]
  outputs: [personalized email draft]
  automation: high                   # low | medium | high (how fully automatable today)
  human_in_loop: review-before-send  # none | spot-check | review-before-send | approve | sign-off
  tools: [CRM, email]                # generic system names, no vendors
  frequency: daily                   # ad-hoc | daily | weekly | monthly | quarterly
  trigger: "write a cold email to {prospect}"   # example prompt a person would type
```

## Extending it

1. Add or edit records in `tasks.yaml`.
2. Run `python3 build.py` to regenerate `index.html` and this `README.md`.

No dependencies required &mdash; `build.py` ships its own small YAML reader.

## Newly discovered roles

Beyond the ~45 starter roles, the catalog surfaced these:

Academic Program Coordinator, Admissions Officer, Audit Associate, Business Development Manager, Case Manager, Chief of Staff, Claims Adjuster Assistant, Community Manager, Competitive Intelligence Analyst, Consulting Analyst, Content Operations Manager, Credit Analyst, Customer Education Manager, Customer Onboarding Specialist, Data Steward, Development Officer, Documentation Specialist, Due Diligence Analyst, Editorial Assistant, Events Coordinator, Executive Search Associate, FP&A Analyst, Grant Writer, Grants & Contracts Administrator, Healthcare Administrator, Instructional Designer, Insurance Underwriting Assistant, Knowledge Base Manager, Legal Operations Manager, Librarian / Knowledge Manager, Localization Coordinator, Logistics Coordinator, Market Research Analyst, Market Researcher, Media Planner, Partnerships Manager, Payroll Specialist, Policy Analyst, Production Coordinator, Program Coordinator, Property Manager, Proposal Manager, Public Affairs Officer, Real Estate Transaction Coordinator, Records Manager, Recruiting Coordinator, Registrar, Research Administrator, Retention Specialist, Talent Acquisition Manager, Tax Preparer, Taxonomy Manager, Technical Writer, Treasury Analyst, UX Researcher
