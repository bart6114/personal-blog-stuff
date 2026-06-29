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

- **1343 tasks** across **17 domains**
- **476 roles** tagged (430 discovered beyond the starter vocabulary)
- Automation mix: **425 high** &middot; **839 medium** &middot; **79 low**

## Explore

Open **`index.html`** in a browser &mdash; it is a single self-contained file (data
embedded, no server needed). Search, filter by domain / role / automation level, and
click any task for inputs, outputs, tools, and an example prompt. Drop it on a blog as-is.

## Tasks by domain

| Domain | Tasks |
|---|---:|
| Sales & BizDev | 49 |
| Marketing & Content | 63 |
| Customer Success & Support | 97 |
| Finance & Accounting | 140 |
| HR & People Ops | 56 |
| Recruiting & Talent | 44 |
| Legal & Compliance | 126 |
| Operations & Project Mgmt | 211 |
| Product Management | 45 |
| Business / Functional Analysis | 57 |
| Research & Competitive Intel | 62 |
| Data & Reporting (BI) | 121 |
| Procurement & Vendor Mgmt | 59 |
| Executive / Admin Support | 51 |
| Communications & PR | 59 |
| Strategy & Consulting | 48 |
| Learning & Development | 55 |

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

Academic Program Coordinator, Accessibility Specialist, Account Executive, Accounting Manager, Accounts Payable Analyst, Accreditation Coordinator, Actuarial Analyst, Ad Operations Specialist, Ad-fund / co-op marketing coordinator, Administrative Assistant, Admissions Officer, Admissions Operations Coordinator, Agricultural export documentation clerk, AI / Content Governance Reviewer, Airline Crew Scheduling Assistant, Airport Operations Coordinator, Analytics Manager, Annual Giving Officer, AP Controls Analyst, AP Specialist, Appraisal Coordinator, Archival cataloguer, Assessment Specialist, Asset/DAM Librarian, Associate, Athlete & medical records administrator, Audit Associate, Audit Coordinator, Audit Senior, Banquet & Events Planner, BD Coordinator, BD Lead, Benefits Administrator, Benefits Eligibility Specialist, BI Administrator, Bid Coordinator, Bill-of-lading documentation clerk, Billing & Timekeeping Coordinator, Billing Coordinator, BizDev Manager, Board Liaison, BOM & Engineering Change Coordinator, BOM & Engineering-Change Clerk, Box-office & patron services analyst, Branch Operations Officer, Brand Asset Manager, Brand Compliance Specialist, Broadcast Traffic & Scheduling Manager, Broking Account Handler, Bunker procurement coordinator, Business Development Manager, Bylaws and governance clerk, CAM Reconciliation Analyst, Capture & Proposal Manager (GovCon), Carbon Accounting Specialist, Card Operations Specialist, Carrier-Relations Analyst, Case Manager, Category Manager, Change Manager, Channel Manager, Chapter relations coordinator, Chapter Relations Manager, Charge Capture Auditor, Charter Flight Operations Coordinator, Chartering assistant, Chief of Staff, CI Analyst, Claims Adjuster Assistant, Claims Denial & Appeals Specialist, Claims Examiner, Class & personal-training scheduling coordinator, Client Onboarding (KYC/AML) Analyst, Clinical Data Manager, Clinical Documentation Improvement (CDI) Specialist, Clinical Trial Coordinator, Collateral Management Analyst, Collections registrar coordinator, Collections Specialist, Commissions Analyst, Commodity trade support clerk, Communications Coordinator, Communications Manager, Communications Specialist, Community Manager, Compensation Analyst, Compensation Partner, Competitive Intelligence Analyst, Competitive Intelligence Manager, Compliance Analyst, Compliance Coordinator, Compliance Specialist, Compliance Training Specialist, Conflicts-Check Analyst, Congregation administrator, Constituent Services Representative, Construction Estimator, Consultant, Consulting Analyst, Content Manager, Content Operations Manager, Content Operations Specialist, Contract Manager, Contracting / Procurement Officer, Contracts Compliance Administrator (FAR/DFARS), Corporate Actions Analyst, Corporate Secretary, Corporate Travel Coordinator, Course Operations Specialist, Creative Traffic Coordinator, Credentialing & Provider Enrollment Specialist, Credit Analyst, Crop insurance claims processor, Cruise & Maritime Documentation Clerk, CS Operations Analyst, Curriculum Coordinator, Customer Education Manager, Customer Marketing Manager, Customer Onboarding Specialist, Customer Success Manager, Customer Success Operations Analyst, Customs & Import/Export Documentation Specialist, Customs & Trade Compliance Coordinator, Data Governance Lead, Data Operations Analyst, Data Steward, Deal Desk Analyst, DEI Partner, DEI partner, DEI Specialist, Delivery Lead, Demand Response Program Coordinator, Demurrage & Detention Claims Analyst, Demurrage and laytime analyst, Denial Management Specialist, Dental & Veterinary Practice Administrator, Development Officer, Digital Accessibility Specialist, Digital Marketing Specialist, Dispatch & Route Planner, Dispute/Chargeback Analyst, Division order analyst, Documentation Specialist, Donor Relations Manager, Drilling & AFE cost analyst, Due Diligence Analyst, E-commerce Operations Specialist, Editorial Assistant, EHS Compliance Coordinator, Email Marketing Manager, Employee Engagement Specialist, Employee Relations Specialist, Employer brand specialist, Energy Markets Analyst, Engagement Manager, Engagement Operations Manager, Engagement-Letter Administrator, Enrollment / Registrar Specialist, Entitlements & Development Coordinator, Environmental permit coordinator, Equity Compensation Administrator, ESG / Sustainability Analyst, ESG / Sustainability Reporting Analyst, Events Coordinator, Executive Search Associate, Exhibitions coordinator, F&B Purchasing Clerk, Facilitator, Facilities Work-Order Coordinator, Facility booking coordinator, Farm/cooperative administrator, Field audit & brand compliance coordinator, Financial Crime Analyst, Financial-Aid Counselor, Fleet Administrator, FOIA & Records Officer, Food-safety compliance coordinator, FP&A Analyst, Franchise development coordinator, Franchise disclosure (FDD) administrator, Freight forwarding customs coordinator, Freight/3PL Coordinator, GL Accountant, Governance Lead, Government Budget Analyst, Grain elevator settlement clerk, Grain merchandiser back-office clerk, Grant Writer, Grants & Contracts Administrator, Grants & sponsorship administrator, Grants Compliance Officer, Grants Management Specialist, GRC Analyst, Grid Scheduling Coordinator, Group PM, Group Product Manager, Group Sales Coordinator, Guest Relations Coordinator, Healthcare Administrator, HOA Community Manager, Hotel Night Auditor, Hotel Revenue Manager, HR Compliance Specialist, HR Coordinator, HR Generalist, HR Operations Analyst, HR operations specialist, HR Operations Specialist, HRBP, HRIS Analyst, Incident Communications Lead, Indirect Tax Specialist, Influencer Marketing Manager, Instructional Designer, Insurance Claims Examiner, Insurance Underwriting Assistant, Intercompany Accountant, Internal Audit Associate, Internal Communications Manager, Investor Relations Analyst, Joint-venture (JV) accountant, Knowledge Base Manager, Knowledge Manager, Knowledge Worker, L&D Analyst, L&D Coordinator, L&D Operations Analyst, Land & lease administrator, League & club operations coordinator, Learning Operations, Lease Administration Analyst, Leave of Absence Specialist, Leave Specialist, Legal Operations Analyst, Legal Operations Manager, Legal/Compliance Liaison, Librarian / Knowledge Manager, Listing Coordinator, LMS Administrator, Loan Servicing Specialist, Localization & Subtitling Specialist, Localization Coordinator, Localization Program Manager, Logistics & Transportation Coordinator, Logistics Coordinator, Loss-Control Coordinator, Loyalty Program Administrator, Market Research Analyst, Market Researcher, Marketing Operations Manager, Marketing Operations Specialist, Marketplace Listing Manager, Materials & MRP Analyst, Materials Buyer / Purchasing Specialist, Media Planner, Media Relations Specialist, Medical Information Specialist, Medical Writer (Medical Affairs), Member care coordinator, Membership & development officer, Membership Coordinator, Membership engagement coordinator, Membership retention analyst, MICE & Group Travel Coordinator, Move Management Coordinator, Multi-unit operations analyst, Municipal Clerk, Music & Footage Clearance Coordinator, New-location onboarding coordinator, Onboarding specialist, Onboarding Specialist, Onboarding/AML Reviewer, Online Merchandiser, Operations Coordinator, Order Management Specialist, Partner, Partner Manager, Partnerships Manager, Partnerships Operations Manager, Patient Access & Scheduling Coordinator, Patient Financial Counselor, Payments Operations Analyst, Payroll Analyst, Payroll Specialist, People Analytics Specialist, Performance Management Specialist, Permit Expeditor, Personal Assistant, Pharmacovigilance / Drug Safety Associate, Pharmacy Operations Technician (Administrative), Photo Editor / Researcher, PMO Analyst, Policy Administration Clerk, Policy Analyst, Policy Owner Liaison, Port-agency coordinator, PR Analyst, PR Coordinator, PR Editor, PR Manager, Press Officer, Pricing Analyst, Prior Authorization Coordinator, Privacy / Data Protection Program Manager, Privacy Analyst, Process Analyst, Procurement Analyst, Procurement Liaison, Product Analyst, Product Liaison, Product Operations, Product Operations Manager, Product Owner, Production & revenue accountant, Production Coordinator, Production Planner / Scheduler, Program Coordinator, Program Impact Analyst, Programmatic Campaign Analyst, Project Analyst, Project Document Controller, Property Manager, Property Tax Assessment Analyst, Proposal Manager, Public Affairs Officer, Public Information Officer, QA Analyst, QA Documentation Specialist, QA Lead, Quality & CAPA Coordinator, Real Estate Portfolio Analyst, Real Estate Transaction Coordinator, Records Manager, Recruiting coordinator, Recruiting Coordinator, Recruiting manager, Recruiting Operations, Recruiting operations analyst, Referral Coordinator, Registrar, Regulatory Affairs Coordinator, Regulatory Affairs Specialist, Regulatory Reporting Analyst, Reinsurance Analyst, Release of Information (ROI) Specialist, Reporting Analyst, Research Administrator, Research Analyst, Research Operations, Reservations Coordinator, Resource Manager, Retention Specialist, Returns/RMA Coordinator, Revenue Operations, Revenue Operations Analyst, Reverse Logistics Coordinator, Rights & Clearances Coordinator, Rights & reproductions coordinator, Rights & Royalties Analyst, Risk & Compliance Lead, Royalty & fee reconciliation clerk, Royalty analyst, Sales & Operations Planning (S&OP) Analyst, Sales Enablement, Sales Enablement Manager, Sales Operations, Sales Representative, Scrum Master, Senior Accountant, Senior Product Manager, Service Delivery Manager, Sponsorship & activation coordinator, Sponsorship Coordinator, Staff Accountant, Store Operations Analyst, Strategy Consultant, Student-Success Advisor, Subcontractor Coordinator, Subcontracts Administrator (GovCon), Subject Matter Expert, Submittal/RFI Coordinator, Subscriptions & Circulation Analyst, Supplier Diversity Lead, Supplier Quality Coordinator, Support Content Editor, Support Operations Manager, Support Quality Lead, Support Team Lead, Systems Analyst, Talent & Booking Coordinator, Talent Acquisition Manager, Talent Acquisition Partner, Talent acquisition specialist, Tax Analyst, Tax Associate, Tax Preparer, Taxonomy Manager, Team Coordinator, Technical Program Manager, Technical Writer, Telecom Provisioning & Order-Management Coordinator, Tenant Improvement Coordinator, Tenant Relations Coordinator, Title Examiner, Trade Settlement Analyst, Training Coordinator, Training Manager, Transaction Coordinator, Transfer Agency Specialist, Travel Coordinator, Treasury Analyst, Trust & Safety Analyst, UAT Coordinator, Underwriting Assistant, Union dues and benefits administrator, Utility Billing Analyst, Utilization Review Coordinator, UX Researcher, UX Writer, Vendor Master Data Analyst, Vendor Performance Manager, Vendor Risk Coordinator, Vessel operations coordinator, Volunteer Coordinator, Volunteer scheduling coordinator, Warehouse Operations Analyst, Warranty Claims Analyst, Wealth Client-Service Associate, Youth program & camp registration administrator, Zoning & Permitting Coordinator
