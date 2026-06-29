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

- **729 tasks** across **17 domains**
- **263 roles** tagged (218 discovered beyond the starter vocabulary)
- Automation mix: **245 high** &middot; **461 medium** &middot; **23 low**

## Explore

Open **`index.html`** in a browser &mdash; it is a single self-contained file (data
embedded, no server needed). Search, filter by domain / role / automation level, and
click any task for inputs, outputs, tools, and an example prompt. Drop it on a blog as-is.

## Tasks by domain

| Domain | Tasks |
|---|---:|
| Sales & BizDev | 37 |
| Marketing & Content | 47 |
| Customer Success & Support | 56 |
| Finance & Accounting | 62 |
| HR & People Ops | 39 |
| Recruiting & Talent | 29 |
| Legal & Compliance | 48 |
| Operations & Project Mgmt | 86 |
| Product Management | 29 |
| Business / Functional Analysis | 31 |
| Research & Competitive Intel | 42 |
| Data & Reporting (BI) | 58 |
| Procurement & Vendor Mgmt | 33 |
| Executive / Admin Support | 27 |
| Communications & PR | 39 |
| Strategy & Consulting | 30 |
| Learning & Development | 36 |

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

Academic Program Coordinator, Account Executive, Accounting Manager, Accounts Payable Analyst, Ad Operations Specialist, Administrative Assistant, Admissions Officer, AI / Content Governance Reviewer, Analytics Manager, AP Controls Analyst, AP Specialist, Asset/DAM Librarian, Audit Associate, Audit Coordinator, BD Coordinator, BD Lead, Benefits Administrator, Benefits Eligibility Specialist, BI Administrator, Billing Coordinator, BizDev Manager, Board Liaison, BOM & Engineering Change Coordinator, Brand Asset Manager, Brand Compliance Specialist, Business Development Manager, CAM Reconciliation Analyst, Case Manager, Category Manager, Change Manager, Channel Manager, Chief of Staff, CI Analyst, Claims Adjuster Assistant, Claims Denial & Appeals Specialist, Clinical Documentation Improvement (CDI) Specialist, Collateral Management Analyst, Commissions Analyst, Communications Coordinator, Communications Manager, Communications Specialist, Community Manager, Compensation Analyst, Compensation Partner, Competitive Intelligence Analyst, Competitive Intelligence Manager, Compliance Analyst, Compliance Training Specialist, Constituent Services Representative, Consultant, Consulting Analyst, Content Manager, Content Operations Manager, Content Operations Specialist, Contract Manager, Corporate Actions Analyst, Creative Traffic Coordinator, Credentialing & Provider Enrollment Specialist, Credit Analyst, CS Operations Analyst, Customer Education Manager, Customer Marketing Manager, Customer Onboarding Specialist, Customer Success Manager, Customer Success Operations Analyst, Data Governance Lead, Data Operations Analyst, Data Steward, Deal Desk Analyst, DEI Partner, Delivery Lead, Development Officer, Digital Marketing Specialist, Documentation Specialist, Due Diligence Analyst, Editorial Assistant, Email Marketing Manager, Employee Engagement Specialist, Engagement Manager, Equity Compensation Administrator, ESG / Sustainability Analyst, Events Coordinator, Executive Search Associate, Financial Crime Analyst, FP&A Analyst, GL Accountant, Governance Lead, Grant Writer, Grants & Contracts Administrator, Grants Management Specialist, GRC Analyst, Group Product Manager, Healthcare Administrator, HR Compliance Specialist, HR Operations Specialist, HRBP, HRIS Analyst, Incident Communications Lead, Indirect Tax Specialist, Influencer Marketing Manager, Instructional Designer, Insurance Claims Examiner, Insurance Underwriting Assistant, Intercompany Accountant, Internal Communications Manager, Knowledge Base Manager, Knowledge Manager, L&D Coordinator, L&D Operations Analyst, Leave of Absence Specialist, Legal Operations Analyst, Legal Operations Manager, Legal/Compliance Liaison, Librarian / Knowledge Manager, Loan Servicing Specialist, Localization & Subtitling Specialist, Localization Coordinator, Logistics & Transportation Coordinator, Logistics Coordinator, Market Research Analyst, Market Researcher, Marketing Operations Manager, Marketing Operations Specialist, Materials Buyer / Purchasing Specialist, Media Planner, Media Relations Specialist, Move Management Coordinator, Municipal Clerk, Onboarding Specialist, Operations Coordinator, Order Management Specialist, Partner, Partner Manager, Partnerships Manager, Partnerships Operations Manager, Patient Financial Counselor, Payroll Analyst, Payroll Specialist, People Analytics Specialist, Performance Management Specialist, Photo Editor / Researcher, PMO Analyst, Policy Analyst, Policy Owner Liaison, PR Analyst, PR Coordinator, PR Editor, PR Manager, Press Officer, Privacy / Data Protection Program Manager, Procurement Analyst, Procurement Liaison, Product Liaison, Product Operations Manager, Product Owner, Production Coordinator, Program Coordinator, Programmatic Campaign Analyst, Property Manager, Property Tax Assessment Analyst, Proposal Manager, Public Affairs Officer, Public Information Officer, QA Analyst, QA Lead, Real Estate Portfolio Analyst, Real Estate Transaction Coordinator, Records Manager, Recruiting Coordinator, Recruiting Operations, Referral Coordinator, Registrar, Regulatory Reporting Analyst, Release of Information (ROI) Specialist, Reporting Analyst, Research Administrator, Research Analyst, Research Operations, Resource Manager, Retention Specialist, Revenue Operations, Revenue Operations Analyst, Reverse Logistics Coordinator, Rights & Clearances Coordinator, Risk & Compliance Lead, Sales & Operations Planning (S&OP) Analyst, Sales Enablement, Sales Enablement Manager, Sales Operations, Senior Accountant, Senior Product Manager, Service Delivery Manager, Staff Accountant, Supplier Diversity Lead, Support Content Editor, Support Operations Manager, Support Quality Lead, Support Team Lead, Talent Acquisition Manager, Tax Analyst, Tax Preparer, Taxonomy Manager, Technical Program Manager, Technical Writer, Tenant Improvement Coordinator, Title Examiner, Trade Settlement Analyst, Training Manager, Transfer Agency Specialist, Treasury Analyst, UAT Coordinator, Utilization Review Coordinator, UX Researcher, Vendor Master Data Analyst, Vendor Performance Manager, Vendor Risk Coordinator, Warehouse Operations Analyst, Zoning & Permitting Coordinator
