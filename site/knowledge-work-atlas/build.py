#!/usr/bin/env python3
"""Regenerate index.html + README.md from tasks.yaml.

Dependency-free (no PyYAML needed): a small parser handles the regular YAML
format that this atlas emits. Run it after editing tasks.yaml:

    python3 build.py
"""
import json, html, re, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
YAML_PATH = os.path.join(HERE, "tasks.yaml")

CANON_DOMAINS = [
    "Sales & BizDev", "Marketing & Content", "Customer Success & Support",
    "Finance & Accounting", "HR & People Ops", "Recruiting & Talent",
    "Legal & Compliance", "Operations & Project Mgmt", "Product Management",
    "Business / Functional Analysis", "Research & Competitive Intel",
    "Data & Reporting (BI)", "Procurement & Vendor Mgmt", "Executive / Admin Support",
    "Communications & PR", "Strategy & Consulting", "Learning & Development",
]
STARTER_ROLES = {
    "sdr","account exec","sales manager","founder","marketing manager","content marketer",
    "seo specialist","social media manager","demand gen manager","brand manager","csm",
    "support agent","support manager","accountant","bookkeeper","financial analyst","controller",
    "ap/ar clerk","hr manager","hr business partner","people ops specialist","recruiter",
    "sourcer","legal counsel","paralegal","compliance officer","operations manager",
    "project manager","program manager","product manager","product marketing manager",
    "business analyst","functional analyst","data analyst","bi analyst","procurement specialist",
    "vendor manager","executive assistant","office manager","comms manager","pr specialist",
    "management consultant","strategy analyst","l&d specialist","trainer",
}

LIST_KEYS = {"roles", "inputs", "outputs", "tools"}


def _unquote(s):
    s = s.strip()
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        return s[1:-1].replace('\\"', '"').replace("\\\\", "\\")
    return s


def _parse_flow(s):
    s = s.strip()
    if s.startswith("[") and s.endswith("]"):
        s = s[1:-1].strip()
    if not s:
        return []
    items = re.findall(r'"((?:[^"\\]|\\.)*)"', s)
    if items:
        return [i.replace('\\"', '"').replace("\\\\", "\\") for i in items]
    return [x.strip() for x in s.split(",") if x.strip()]


def parse_yaml(path):
    records, cur = [], None
    for line in open(path):
        raw = line.rstrip("\n")
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        m = re.match(r"- id:\s*(.+)$", raw.strip())
        if m:
            cur = {"id": _unquote(m.group(1))}
            records.append(cur)
            continue
        m = re.match(r"\s+([a-z_]+):\s*(.*)$", raw)
        if m and cur is not None:
            key, val = m.group(1), m.group(2)
            cur[key] = _parse_flow(val) if key in LIST_KEYS else _unquote(val)
    return records


def esc(s):
    return html.escape(str(s), quote=True)


# ----------------------------------------------------------------------------
records = parse_yaml(YAML_PATH)
dom_order = {d: i for i, d in enumerate(CANON_DOMAINS)}
records.sort(key=lambda r: (dom_order.get(r.get("domain", ""), 999), r.get("domain", ""), r.get("title", "").lower()))

dom_counts = collections.Counter(r.get("domain", "?") for r in records)
auto_counts = collections.Counter(r.get("automation", "?") for r in records)
all_roles = sorted({x for r in records for x in r.get("roles", []) if x != "(unspecified)"}, key=str.lower)
discovered = sorted([r for r in all_roles if r.lower() not in STARTER_ROLES], key=str.lower)
domains_sorted = sorted(dom_counts, key=lambda d: dom_order.get(d, 999))

# ---------------- index.html ----------------
DATA_JSON = json.dumps(records, ensure_ascii=False).replace("</", "<\\/")
META_JSON = json.dumps({"domains": domains_sorted, "roles": all_roles}, ensure_ascii=False).replace("</", "<\\/")

HTML = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Automatable Knowledge-Work Atlas</title>
<style>
  :root{
    --bg:#f6f7f9; --card:#fff; --ink:#1c2430; --muted:#6b7682; --line:#e6e9ee;
    --accent:#4b5563; --shadow:0 1px 2px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.04);
  }
  *{box-sizing:border-box}
  body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased}
  a{color:inherit}
  header{max-width:1120px;margin:0 auto;padding:40px 24px 8px}
  h1{margin:0 0 6px;font-size:28px;letter-spacing:-.02em}
  .sub{margin:0;color:var(--muted);max-width:680px}
  .stats{display:flex;gap:18px;margin-top:16px;flex-wrap:wrap}
  .stats span{font-size:13px;color:var(--muted)}
  .stats b{color:var(--ink)}
  .controls{position:sticky;top:0;z-index:5;background:rgba(246,247,249,.92);backdrop-filter:blur(8px);
            border-bottom:1px solid var(--line)}
  .controls .inner{max-width:1120px;margin:0 auto;padding:14px 24px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .controls input,.controls select{font:inherit;padding:9px 12px;border:1px solid var(--line);border-radius:9px;
            background:#fff;color:var(--ink);outline:none}
  .controls input{flex:1;min-width:220px}
  .controls input:focus,.controls select:focus{border-color:#aab4c2}
  .controls button{font:inherit;padding:9px 14px;border:1px solid var(--line);border-radius:9px;background:#fff;cursor:pointer;color:var(--muted)}
  .controls button:hover{color:var(--ink);border-color:#aab4c2}
  .count{max-width:1120px;margin:18px auto 0;padding:0 24px;color:var(--muted);font-size:13px}
  .grid{max-width:1120px;margin:12px auto 60px;padding:0 24px;display:grid;
        grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
  .card{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:12px;
        padding:16px;cursor:pointer;box-shadow:var(--shadow);transition:transform .08s ease,box-shadow .12s ease}
  .card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(16,24,40,.10)}
  .card-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
  .domain{font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--accent);text-transform:uppercase}
  h3{margin:0 0 6px;font-size:16px;line-height:1.3}
  .desc{margin:0 0 12px;color:var(--muted);font-size:13.5px}
  .chips{display:flex;gap:6px;flex-wrap:wrap}
  .chip{font-size:11.5px;padding:2px 9px;border-radius:999px;background:#eef1f5;color:#475063;white-space:nowrap}
  .chip.more{background:transparent;color:var(--muted)}
  .badge{font-size:11px;font-weight:600;padding:2px 9px;border-radius:999px;text-transform:capitalize}
  .a-high{background:#e7f6ec;color:#1a7f43}
  .a-med{background:#fdf3e2;color:#a76a16}
  .a-low{background:#eef1f5;color:#5b6573}
  .overlay{position:fixed;inset:0;background:rgba(16,24,40,.45);display:flex;align-items:center;justify-content:center;padding:24px;z-index:20}
  .overlay[hidden]{display:none}
  .modal{background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:86vh;overflow:auto;padding:26px 28px;position:relative;box-shadow:0 20px 60px rgba(16,24,40,.3)}
  .modal .close{position:absolute;top:14px;right:16px;border:none;background:none;font-size:26px;line-height:1;color:var(--muted);cursor:pointer}
  .modal h2{margin:12px 0 8px;font-size:21px;letter-spacing:-.01em}
  .modal .desc{font-size:14.5px;margin-bottom:18px}
  .modal .domain{margin-right:10px}
  .row{display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--line)}
  .row .k{flex:0 0 120px;color:var(--muted);font-size:13px;padding-top:2px}
  .row .v{flex:1;display:flex;gap:6px;flex-wrap:wrap}
  .trigger{margin-top:16px;border-top:1px solid var(--line);padding-top:14px}
  .trigger .k{display:block;color:var(--muted);font-size:13px;margin-bottom:6px}
  .trigger code{display:block;background:#0f1722;color:#d7e0ec;padding:12px 14px;border-radius:10px;font-size:13px;line-height:1.5;white-space:pre-wrap}
  footer{max-width:1120px;margin:0 auto;padding:24px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--line)}
</style>
</head>
<body>
<header>
  <h1>Automatable Knowledge-Work Atlas</h1>
  <p class="sub">Small, automatable steps of white-collar work &mdash; the kind of admin and knowledge tasks an AI <em>skill</em> could take off your plate. Browse by domain, filter by role, see how automatable each one is today.</p>
  <div class="stats" id="stats"></div>
</header>
<div class="controls"><div class="inner">
  <input id="q" type="search" placeholder="Search tasks, descriptions, roles, tools&hellip;" autocomplete="off">
  <select id="fdomain"></select>
  <select id="frole"></select>
  <select id="fauto"></select>
  <button id="clear">Reset</button>
</div></div>
<div class="count" id="count"></div>
<main class="grid" id="grid"></main>
<div class="overlay" id="overlay" hidden><div class="modal" id="modal"></div></div>
<footer>
  A living catalog. Source of truth is <code>tasks.yaml</code>; this page is generated by <code>build.py</code>.
  Tasks are deliberately scoped to single, automatable, non-development steps.
</footer>
<script>
const DATA = /*__DATA__*/;
const META = /*__META__*/;
const $ = s => document.querySelector(s);
const fq=$('#q'), fd=$('#fdomain'), fr=$('#frole'), fa=$('#fauto');
const grid=$('#grid'), countEl=$('#count');
const PALETTE=['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#6366f1','#14b8a6','#f97316','#a855f7','#0ea5e9','#84cc16','#e11d48','#22c55e','#eab308','#64748b'];
const domColor={}; META.domains.forEach((d,i)=>domColor[d]=PALETTE[i%PALETTE.length]);
const autoClass={high:'a-high',medium:'a-med',low:'a-low'};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function opt(v,l){const o=document.createElement('option');o.value=v;o.textContent=l;return o;}
fd.appendChild(opt('','All domains')); META.domains.forEach(d=>fd.appendChild(opt(d,d)));
fr.appendChild(opt('','All roles')); META.roles.forEach(r=>fr.appendChild(opt(r,r)));
fa.appendChild(opt('','All automation')); ['high','medium','low'].forEach(a=>fa.appendChild(opt(a,a[0].toUpperCase()+a.slice(1))));
$('#stats').innerHTML=`<span><b>${DATA.length}</b> tasks</span><span><b>${META.domains.length}</b> domains</span><span><b>${META.roles.length}</b> roles</span>`;
function matches(t){
  const q=fq.value.trim().toLowerCase();
  if(fd.value && t.domain!==fd.value) return false;
  if(fr.value && !(t.roles||[]).includes(fr.value)) return false;
  if(fa.value && t.automation!==fa.value) return false;
  if(q){const hay=(t.title+' '+t.description+' '+t.trigger+' '+(t.roles||[]).join(' ')+' '+(t.tools||[]).join(' ')).toLowerCase(); if(!hay.includes(q)) return false;}
  return true;
}
function render(){
  const items=DATA.filter(matches);
  countEl.textContent=`Showing ${items.length} of ${DATA.length} tasks`;
  const frag=document.createDocumentFragment();
  items.forEach(t=>{
    const c=document.createElement('article');
    c.className='card'; c.style.setProperty('--accent',domColor[t.domain]||'#888');
    const roles=t.roles||[];
    c.innerHTML=`<div class="card-top"><span class="domain">${esc(t.domain)}</span><span class="badge ${autoClass[t.automation]||''}">${esc(t.automation)}</span></div>`+
      `<h3>${esc(t.title)}</h3><p class="desc">${esc(t.description)}</p>`+
      `<div class="chips">${roles.slice(0,4).map(r=>`<span class="chip">${esc(r)}</span>`).join('')}${roles.length>4?`<span class="chip more">+${roles.length-4}</span>`:''}</div>`;
    c.addEventListener('click',()=>openModal(t));
    frag.appendChild(c);
  });
  grid.innerHTML=''; grid.appendChild(frag);
}
function rowList(label,arr){if(!arr||!arr.length)return ''; return `<div class="row"><span class="k">${label}</span><span class="v">${arr.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</span></div>`;}
function rowText(label,val){if(!val)return ''; return `<div class="row"><span class="k">${label}</span><span class="v">${esc(val)}</span></div>`;}
function openModal(t){
  $('#modal').innerHTML=`<button class="close" id="close">&times;</button>`+
    `<span class="domain" style="color:${domColor[t.domain]||'#888'}">${esc(t.domain)}</span>`+
    `<span class="badge ${autoClass[t.automation]||''}">${esc(t.automation)} automation</span>`+
    `<h2>${esc(t.title)}</h2><p class="desc">${esc(t.description)}</p>`+
    rowList('Roles',t.roles)+rowList('Inputs',t.inputs)+rowList('Outputs',t.outputs)+rowList('Tools',t.tools)+
    rowText('Human in loop',t.human_in_loop)+rowText('Frequency',t.frequency)+
    `<div class="trigger"><span class="k">Example prompt</span><code>${esc(t.trigger)}</code></div>`;
  $('#overlay').hidden=false; $('#close').addEventListener('click',closeModal);
}
function closeModal(){$('#overlay').hidden=true;}
$('#overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
[fq,fd,fr,fa].forEach(el=>el.addEventListener('input',render));
$('#clear').addEventListener('click',()=>{fq.value='';fd.value='';fr.value='';fa.value='';render();});
render();
</script>
</body>
</html>
"""

html_out = HTML.replace("/*__DATA__*/", DATA_JSON).replace("/*__META__*/", META_JSON)
with open(os.path.join(HERE, "index.html"), "w") as fh:
    fh.write(html_out)

# ---------------- README.md ----------------
domain_table = "\n".join(f"| {d} | {dom_counts[d]} |" for d in domains_sorted)
readme = f"""# Automatable Knowledge-Work Atlas

A catalog of **small, automatable tasks** drawn from white-collar / administrative /
knowledge-worker jobs &mdash; explicitly **not** software development. Each task is one
step that a Claude *skill* could perform, tagged with the roles it belongs to and a few
attributes describing how automatable it is today.

The point: instead of asking "can AI do the job of a *functional analyst*?", we catalog
the *parts of the work* (drafting requirements, summarizing interviews, building a
traceability matrix) and tag each with the roles it touches. Many tasks span several
roles, so the task &mdash; not the role &mdash; is the atomic unit.

## At a glance

- **{len(records)} tasks** across **{len(dom_counts)} domains**
- **{len(all_roles)} roles** tagged ({len(discovered)} discovered beyond the starter vocabulary)
- Automation mix: **{auto_counts.get('high',0)} high** &middot; **{auto_counts.get('medium',0)} medium** &middot; **{auto_counts.get('low',0)} low**

## Explore

Open **`index.html`** in a browser &mdash; it is a single self-contained file (data
embedded, no server needed). Search, filter by domain / role / automation level, and
click any task for inputs, outputs, tools, and an example prompt. Drop it on a blog as-is.

## Tasks by domain

| Domain | Tasks |
|---|---:|
{domain_table}

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
  trigger: "write a cold email to {{prospect}}"   # example prompt a person would type
```

## Extending it

1. Add or edit records in `tasks.yaml`.
2. Run `python3 build.py` to regenerate `index.html` and this `README.md`.

No dependencies required &mdash; `build.py` ships its own small YAML reader.

## Newly discovered roles

Beyond the ~45 starter roles, the catalog surfaced these:

{', '.join(discovered) if discovered else '(none yet)'}
"""
with open(os.path.join(HERE, "README.md"), "w") as fh:
    fh.write(readme)

print(f"built index.html ({len(records)} tasks) and README.md")
print(f"domains={len(dom_counts)} roles={len(all_roles)} discovered={len(discovered)}")
