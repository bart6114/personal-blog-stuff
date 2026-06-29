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

# Normalize tools in place: lowercase + strip to a single canonical label, written
# back onto each record so search matching (and any future facet) agrees. Collapses
# the casing-dupe groups (e.g. "Spreadsheet" -> "spreadsheet") without touching counts.
for r in records:
    if "tools" in r:
        seen, norm = set(), []
        for t in r["tools"]:
            c = " ".join(str(t).strip().lower().split())
            if c and c not in seen:
                seen.add(c)
                norm.append(c)
        r["tools"] = norm

# Canonicalize role spelling: merge casing-dupe variants (e.g. "Hr Business Partner"
# -> "HR Business Partner") to one display form -- the most frequently used spelling
# wins -- written back onto each record so the role facet, filter, datalist, card chips,
# and the headline count all agree (collapses 614 raw -> 607 distinct, no task lost).
_role_freq = collections.Counter(
    x for r in records for x in r.get("roles", []) if x != "(unspecified)"
)
_role_canon = {}
for name, _ in _role_freq.most_common():  # most common spelling per casefold key wins
    _role_canon.setdefault(name.casefold(), name)
for r in records:
    if "roles" in r:
        seen, norm = set(), []
        for x in r["roles"]:
            disp = x if x == "(unspecified)" else _role_canon.get(x.casefold(), x)
            if disp not in seen:
                seen.add(disp)
                norm.append(disp)
        r["roles"] = norm

dom_counts = collections.Counter(r.get("domain", "?") for r in records)
auto_counts = collections.Counter(r.get("automation", "?") for r in records)
all_roles = sorted({x for r in records for x in r.get("roles", []) if x != "(unspecified)"}, key=lambda s: (s.casefold(), s))
discovered = sorted([r for r in all_roles if r.lower() not in STARTER_ROLES], key=lambda s: (s.casefold(), s))
domains_sorted = sorted(dom_counts, key=lambda d: dom_order.get(d, 999))

# "Highly automatable" = a high-automation task that also runs unattended (no human gate),
# i.e. human_in_loop is none/spot-check. This must match isQuick() in the JS exactly.
QUICK_HIL = {"none", "spot-check"}
def _is_quick(r):
    return r.get("automation") == "high" and str(r.get("human_in_loop", "")).lower() in QUICK_HIL
total_quick = sum(1 for r in records if _is_quick(r))

# Per-domain meta precomputed for the Home overview tiles (count, automation split,
# quick-win count, top roles) so tiles render without recomputation in JS.
dom_meta = {}
for d in domains_sorted:
    drecs = [r for r in records if r.get("domain") == d]
    ac = collections.Counter(r.get("automation", "?") for r in drecs)
    rc = collections.Counter(x for r in drecs for x in r.get("roles", []) if x != "(unspecified)")
    dom_meta[d] = {
        "count": len(drecs),
        "high": ac.get("high", 0),
        "medium": ac.get("medium", 0),
        "low": ac.get("low", 0),
        "quick": sum(1 for r in drecs if _is_quick(r)),
        "topRoles": [name for name, _ in rc.most_common(3)],
    }

# ---------------- index.html ----------------
DATA_JSON = json.dumps(records, ensure_ascii=False).replace("</", "<\\/")
META_JSON = json.dumps({"domains": domains_sorted, "roles": all_roles, "domainMeta": dom_meta}, ensure_ascii=False).replace("</", "<\\/")

HTML = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Automatable Knowledge-Work Atlas</title>
<style>
  :root{
    --bg:#f6f7f9; --card:#fff; --ink:#1c2430; --muted:#586473; --line:#e6e9ee;
    --accent:#4b5563; --shadow:0 1px 2px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.04);
    --a-high:#1a7f43; --a-med:#875400; --a-low:#5b6573;
  }
  *{box-sizing:border-box}
  body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased}
  a{color:inherit}
  :focus-visible{outline:2px solid #4b5563;outline-offset:2px}
  header{max-width:1120px;margin:0 auto;padding:40px 24px 8px}
  h1{margin:0 0 6px;font-size:28px;letter-spacing:-.02em}
  .sub{margin:0;color:var(--muted);max-width:680px}
  .stats{display:flex;gap:18px;margin-top:16px;flex-wrap:wrap}
  .stats span{font-size:13px;color:var(--muted)}
  .stats b{color:var(--ink)}
  /* agent CTA callout (above the sticky controls) */
  .agent-cta{max-width:1120px;margin:14px auto 2px;padding:0 24px}
  .cta-inner{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--accent);
             border-radius:12px;padding:18px 20px;box-shadow:var(--shadow)}
  .cta-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .cta-head h2{margin:0;font-size:17px;letter-spacing:-.01em}
  .cta-sub{margin:8px 0 0;color:var(--muted);font-size:13.5px;max-width:780px}
  .cta-yaml{color:var(--accent);text-decoration:none;font-weight:600;white-space:nowrap}
  .cta-yaml:hover{text-decoration:underline}
  .cta-copy{font:inherit;font-size:13px;font-weight:600;padding:8px 16px;border-radius:9px;border:1px solid var(--ink);
            background:var(--ink);color:#fff;cursor:pointer;white-space:nowrap}
  .cta-copy:hover{filter:brightness(1.12)}
  .cta-copy.ok{background:var(--a-high);border-color:var(--a-high)}
  .controls{position:sticky;top:0;z-index:5;background:rgba(246,247,249,.92);backdrop-filter:blur(8px);
            border-bottom:1px solid var(--line)}
  .controls .inner{max-width:1120px;margin:0 auto;padding:14px 24px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .controls input,.controls select{font:inherit;padding:9px 12px;border:1px solid var(--line);border-radius:9px;
            background:#fff;color:var(--ink);outline:none}
  .controls input{flex:1;min-width:220px}
  .controls input:focus,.controls select:focus{border-color:#aab4c2}
  .controls input:focus-visible,.controls select:focus-visible{outline:2px solid #4b5563;outline-offset:2px}
  .controls button{font:inherit;padding:9px 14px;border:1px solid var(--line);border-radius:9px;background:#fff;cursor:pointer;color:var(--muted)}
  .controls button:hover{color:var(--ink);border-color:#aab4c2}
  .grid{max-width:1120px;margin:12px auto 60px;padding:0 24px;display:grid;
        grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr));gap:14px}
  .card{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--dc,var(--accent));border-radius:12px;
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
  .a-med{background:#fdf3e2;color:#875400}
  .a-low{background:#eef1f5;color:#5b6573}
  .overlay{position:fixed;inset:0;background:rgba(16,24,40,.45);display:flex;align-items:center;justify-content:center;padding:24px;z-index:20}
  .overlay[hidden]{display:none}
  .modal{background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:86vh;overflow:auto;padding:26px 28px;position:relative;box-shadow:0 20px 60px rgba(16,24,40,.3)}
  .modal .close{position:absolute;top:8px;right:10px;border:none;background:none;font-size:26px;line-height:1;
                color:var(--muted);cursor:pointer;padding:6px;min-width:44px;min-height:44px;border-radius:8px}
  .modal .close:hover{color:var(--ink)}
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
  /* filters group (shown only in domain / results views) */
  .filters{display:flex;gap:10px;align-items:center}
  .filters[hidden]{display:none}
  .controls #frole{flex:0 1 220px;min-width:160px}
  /* Home overview */
  .home{max-width:1120px;margin:18px auto 60px;padding:0 24px}
  .home[hidden]{display:none}
  .home-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
  .chip-btn{font:inherit;font-size:13px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);
            background:#fff;color:var(--ink);cursor:pointer;text-decoration:none;display:inline-flex;gap:6px;align-items:center}
  .chip-btn:hover{border-color:#aab4c2}
  .chip-btn.qw{background:#e7f6ec;border-color:#bfe6cd;color:#1a7f43;font-weight:600}
  .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
  .tile{text-align:left;font:inherit;color:inherit;background:var(--card);border:1px solid var(--line);
        border-radius:12px;padding:16px;cursor:pointer;box-shadow:var(--shadow);transition:transform .08s ease,box-shadow .12s ease}
  .tile:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(16,24,40,.10)}
  .tile-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
  .tname{font-size:15px;font-weight:600;line-height:1.25}
  .tcount{font-size:24px;font-weight:700;letter-spacing:-.02em}
  .minibar{display:flex;height:6px;border-radius:999px;overflow:hidden;margin:12px 0 10px;background:#eef1f5}
  .minibar i{display:block}
  .minibar .mh{background:var(--a-high)} .minibar .mm{background:var(--a-med)} .minibar .ml{background:var(--a-low)}
  .tquick{display:inline-block;font-size:12.5px;font-weight:600;color:var(--a-high);margin:0 0 8px}
  .troles{font-size:12.5px;color:var(--muted);min-height:1.2em}
  .leg{font-size:12px;color:var(--muted);display:inline-flex;align-items:center;gap:5px}
  .leg i{width:10px;height:10px;border-radius:2px;display:inline-block}
  .rolehint{font-size:12px;color:var(--muted);white-space:nowrap}
  /* breadcrumb + domain/results header */
  .crumb{max-width:1120px;margin:18px auto 0;padding:0 24px}
  .crumb[hidden]{display:none}
  .bc{font-size:13px;color:var(--muted)}
  .bc a{color:var(--accent);text-decoration:none}
  .bc a:hover{text-decoration:underline}
  .crumb-head{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:8px}
  .crumb-head h2{margin:0;font-size:22px;letter-spacing:-.01em}
  .crumb-head .dc{color:var(--muted);font-size:14px}
  .copy{font:inherit;font-size:13px;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:#fff;cursor:pointer;color:var(--muted)}
  .copy:hover{color:var(--ink);border-color:#aab4c2}
  /* sticky domain group-headers in cross-domain results */
  .group-h{grid-column:1/-1;position:sticky;top:var(--ctrlh,62px);z-index:3;margin:6px 0 0;padding:10px 0 10px 10px;
           border-left:3px solid var(--dc,var(--accent));border-bottom:1px solid var(--line);
           background:rgba(246,247,249,.94);backdrop-filter:blur(8px);font-size:13px;font-weight:600;color:var(--ink)}
  .group-h span{color:var(--muted);font-weight:500}
  /* per-card human-in-loop badge */
  .badge2{font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:999px;white-space:nowrap}
  .b-auto-on{background:#eef6ff;color:#1d4ed8}
  .b-human{background:#f4eefb;color:#7c3aed}
  .empty{grid-column:1/-1;color:var(--muted);padding:28px 4px;font-size:14px}
  #sentinel{height:1px}
</style>
</head>
<body>
<header>
  <h1>Automatable Knowledge-Work Atlas</h1>
  <p class="sub">Small, automatable steps of white-collar work &mdash; the kind of admin and knowledge tasks an AI <em>skill</em> could take off your plate. Browse by domain, filter by role, see how automatable each one is today.</p>
  <div class="stats" id="stats"></div>
</header>
<section class="agent-cta">
  <div class="cta-inner">
    <div class="cta-head">
      <h2>&#129302; Hand it to your own agent</h2>
      <button class="cta-copy" id="ctaCopy" type="button">Copy prompt</button>
    </div>
    <p class="cta-sub">Scrolling __NTASKS__ tasks to find the one that fits your week is a chore. So don't. Copy the prompt, paste it into Claude Code (or whatever agent you run), and it'll pull this whole catalog, ask you a few questions about your actual work, and come back with one skill worth building. The atlas is the inspiration, not the menu. <a class="cta-yaml" href="tasks.yaml" target="_blank" rel="noopener">the raw tasks.yaml &rarr;</a></p>
    <pre id="ctaPrompt" hidden>You're going to help me find one concrete task in my work that's worth handing
to an AI skill, and shape it into a proposal I could actually build.

First, fetch this file. It's a catalog of ~2,800 small, automatable
knowledge-work tasks, each tagged with domain, roles, inputs/outputs, tools, how
automatable it is, and how much human oversight it needs:

  https://stuff.barts.space/knowledge-work-atlas/tasks.yaml

It's ~2MB, so download and skim or sample it rather than reading every line. Use
it as inspiration for the shape of a good automatable task, not as a fixed menu.
The right answer for me might not be in there at all.

Then interview me. Ask one question at a time, and use each answer to steer the
next question. Start broad, then get specific. Worth digging into:
  - My role, and what a normal week actually looks like
  - Which tasks are repetitive, boring, or eat time I'd rather spend elsewhere
  - The tools and systems I live in day to day
  - Where the same kind of work comes back again and again (daily/weekly/monthly)
  - What I'd happily hand off, and what has to stay under my control

Keep going until you have a clear picture. Don't rush to an answer after one or
two questions.

When you understand my work well enough, propose ONE skill. Keep it concrete and
well-scoped (one task, not "automate my job"). Cover:
  - The task, in one or two plain sentences
  - Why it fits me specifically (tie it back to what I told you)
  - The inputs it needs and the outputs it produces
  - How automatable it really is, and where a human should stay in the loop
  - Roughly how it'd be triggered (what I'd type, or what kicks it off)

If a task from the atlas fits, borrow from it. If something better came out of
our conversation, go with that instead.

Then stop and ask if I like the proposal. If I do, offer to draft the skill for me.</pre>
  </div>
</section>
<div class="controls"><div class="inner">
  <input id="q" type="search" placeholder="Search tasks, descriptions, roles, tools&hellip;" autocomplete="off" aria-label="Search tasks">
  <span class="filters" id="filters" hidden>
    <input id="frole" list="rolelist" placeholder="Any role&hellip;" autocomplete="off" aria-label="Filter by role">
    <datalist id="rolelist"></datalist>
    <span class="rolehint" id="rolehint" aria-live="polite"></span>
    <select id="fauto" aria-label="Filter by automation level"></select>
  </span>
  <button id="clear">Reset</button>
</div></div>
<section class="home" id="home" hidden></section>
<div class="crumb" id="crumb" hidden></div>
<main class="grid" id="grid" aria-live="polite"></main>
<div id="sentinel"></div>
<div class="overlay" id="overlay" hidden><div class="modal" id="modal"></div></div>
<footer>
  A living catalog. Source of truth is <code>tasks.yaml</code>; this page is generated by <code>build.py</code>.
  Tasks are deliberately scoped to single, automatable, non-development steps.
</footer>
<script>
const DATA = /*__DATA__*/;
const META = /*__META__*/;
const $ = s => document.querySelector(s);
const fq=$('#q'), fr=$('#frole'), fa=$('#fauto');
const grid=$('#grid'), homeEl=$('#home'), crumbEl=$('#crumb'), controlsEl=$('.controls'),
      filtersEl=$('#filters'), sentinel=$('#sentinel'), dlRole=$('#rolelist'), overlay=$('#overlay'),
      roleHintEl=$('#rolehint');
const PALETTE=['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#6366f1','#14b8a6','#f97316','#a855f7','#0ea5e9','#84cc16','#e11d48','#22c55e','#eab308','#64748b'];
const domColor={}; META.domains.forEach((d,i)=>domColor[d]=PALETTE[i%PALETTE.length]);
const autoClass={high:'a-high',medium:'a-med',low:'a-low'};
const DM=META.domainMeta||{};
const byId={}; DATA.forEach(t=>{byId[t.id]=t;});
/* Role canonicalization: collapse casing-duplicate role tags (e.g. "HR Business Partner"
   vs "HR business partner") for the facet + filter, picking the most-common casing as the
   display label, without mutating the embedded data or the headline role count. */
const ROLE_KEY=r=>String(r).toLowerCase();
const ROLE_DISPLAY=(()=>{
  const cnt={},disp={};
  DATA.forEach(t=>(t.roles||[]).forEach(r=>{ if(r==='(unspecified)')return;
    const k=ROLE_KEY(r); (cnt[k]=cnt[k]||{})[r]=(cnt[k][r]||0)+1; }));
  Object.keys(cnt).forEach(k=>{ let best=null,bn=-1;
    for(const v in cnt[k]){ if(cnt[k][v]>bn){bn=cnt[k][v];best=v;} } disp[k]=best; });
  return disp;
})();
const ROLESET=new Set(Object.keys(ROLE_DISPLAY));
let lastRC={};
// "Highly automatable" = high automation AND runs unattended (no human gate). Mirrors the
// "runs unattended" badge on the cards and _is_quick() in build.py. Keep all three in sync.
const QUICK_HIL=new Set(['none','spot-check']);
function isQuick(t){return t.automation==='high' && QUICK_HIL.has((t.human_in_loop||'').toLowerCase());}
const TOTAL_QUICK=DATA.filter(isQuick).length;
const TILE_ORDER=META.domains.slice().sort((a,b)=>((DM[b]||{}).count||0)-((DM[a]||{}).count||0));
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
fa.innerHTML='<option value="">All automation</option>'+['high','medium','low'].map(a=>`<option value="${a}">${a[0].toUpperCase()+a.slice(1)}</option>`).join('');
$('#stats').innerHTML=`<span><b>${DATA.length}</b> tasks</span><span><b>${META.domains.length}</b> domains</span><span><b>${META.roles.length}</b> roles</span>`;

/* ---------------- hash router ---------------- */
let curD='', curQuick=false;
function parseHash(){
  const o={d:'',role:'',auto:'',q:'',t:'',all:false,quick:false};
  location.hash.replace(/^#/,'').split('&').forEach(p=>{
    if(!p) return;
    const i=p.indexOf('='), k=i<0?p:p.slice(0,i);
    let v=''; if(i>=0){ const raw=p.slice(i+1).replace(/\+/g,' '); try{ v=decodeURIComponent(raw); }catch(_){ v=raw; } }
    if(k==='d')o.d=v; else if(k==='role')o.role=v; else if(k==='auto')o.auto=v;
    else if(k==='q')o.q=v; else if(k==='t')o.t=v; else if(k==='all')o.all=true;
    else if(k==='quick'||k==='quickwins')o.quick=true;
  });
  return o;
}
function buildHash(){
  const p=[];
  if(curQuick) p.push('quick');
  if(curD) p.push('d='+encodeURIComponent(curD));
  if(fr.value) p.push('role='+encodeURIComponent(fr.value));
  if(fa.value) p.push('auto='+encodeURIComponent(fa.value));
  const q=fq.value.trim(); if(q) p.push('q='+encodeURIComponent(q));
  return p.join('&');
}
function navPush(h){ if(location.hash===('#'+h)||(h===''&&(location.hash===''||location.hash==='#'))){ render(); } else { location.hash=h; } }
function navReplace(h){ history.replaceState(null,'','#'+(h||'')); render(); }
function setVal(el,v){ v=v||''; if(el.value!==v && document.activeElement!==el) el.value=v; }

/* ---------------- filtering ---------------- */
function searchHay(t){return (t.title+' '+t.description+' '+(t.trigger||'')+' '+(t.roles||[]).join(' ')+' '+(t.tools||[]).join(' ')).toLowerCase();}
function filterTasks(domain){
  const q=fq.value.trim().toLowerCase(), auto=fa.value, out=[];
  // The role filter only engages once the typed text resolves to a known role, so
  // partial typing ("Recru") never blanks the grid. Matching is casing-insensitive.
  const roleKey=fr.value?ROLE_KEY(fr.value):'', roleOk=roleKey&&ROLESET.has(roleKey);
  for(const t of DATA){
    if(domain && t.domain!==domain) continue;
    if(curQuick && !isQuick(t)) continue;
    if(roleOk && !(t.roles||[]).some(r=>ROLE_KEY(r)===roleKey)) continue;
    if(auto && t.automation!==auto) continue;
    if(q && !searchHay(t).includes(q)) continue;
    out.push(t);
  }
  return out;
}

/* ---------------- cards ---------------- */
function cardEl(t){
  const c=document.createElement('article');
  c.className='card'; c.style.setProperty('--dc',domColor[t.domain]||'#888');
  c.tabIndex=0; c.setAttribute('role','button'); c.dataset.id=t.id;
  c.setAttribute('aria-label',t.title+' — open task details');
  const roles=t.roles||[];
  const hil=(t.human_in_loop||'').toLowerCase();
  const unattended=(hil==='none'||hil==='spot-check');
  const hb=unattended?'<span class="badge2 b-auto-on">runs unattended</span>':'<span class="badge2 b-human">keep a human</span>';
  c.innerHTML=`<div class="card-top"><span class="domain">${esc(t.domain)}</span><span class="badge ${autoClass[t.automation]||''}">${esc(t.automation)}</span></div>`+
    `<h3>${esc(t.title)}</h3><p class="desc">${esc(t.description)}</p>`+
    `<div class="chips">${roles.slice(0,4).map(r=>`<span class="chip">${esc(r)}</span>`).join('')}${roles.length>4?`<span class="chip more">+${roles.length-4}</span>`:''}${hb}</div>`;
  c.addEventListener('click',()=>openTask(t.id));
  c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openTask(t.id); } });
  return c;
}

/* ---------------- windowed rendering ---------------- */
const win={items:[],n:0,grouped:false,counts:{},last:null};
function groupHeader(d,n){
  const e=document.createElement('div'); e.className='group-h';
  e.style.setProperty('--dc',domColor[d]||'#888');
  e.innerHTML=`${esc(d)} <span>&mdash; ${n}</span>`; return e;
}
function appendMore(){
  if(win.n>=win.items.length) return;
  const end=Math.min(win.n+60, win.items.length), frag=document.createDocumentFragment();
  for(let i=win.n;i<end;i++){
    const t=win.items[i];
    if(win.grouped && t.domain!==win.last){ frag.appendChild(groupHeader(t.domain,win.counts[t.domain]||0)); win.last=t.domain; }
    frag.appendChild(cardEl(t));
  }
  win.n=end; grid.appendChild(frag);
}
function setWindow(items,grouped){
  win.items=items; win.n=0; win.grouped=grouped; win.last=null; win.counts={};
  if(grouped){ items.forEach(t=>{ win.counts[t.domain]=(win.counts[t.domain]||0)+1; }); }
  grid.innerHTML='';
  if(!items.length){ grid.innerHTML='<p class="empty">No tasks match these filters. Try clearing the role or automation filter.</p>'; return; }
  appendMore();
}
const io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting) appendMore(); }); },{rootMargin:'600px'});
io.observe(sentinel);

/* ---------------- facets (scoped) ---------------- */
function populateFacets(scope){
  const q=fq.value.trim().toLowerCase();
  const base=DATA.filter(t=>{
    if(scope && t.domain!==scope) return false;
    if(curQuick && !isQuick(t)) return false;
    if(q && !searchHay(t).includes(q)) return false;
    return true;
  });
  // Count roles by normalized key so casing-duplicate tags collapse into one option.
  const rc={}; base.forEach(t=>(t.roles||[]).forEach(r=>{ if(r==='(unspecified)')return;
    const k=ROLE_KEY(r); rc[k]=(rc[k]||0)+1; }));
  lastRC=rc;
  // Don't rebuild the datalist while the user is typing into it (the suggestion list
  // depends only on scope+search, never on the role value, and rebuilding flickers it).
  if(document.activeElement!==fr){
    const keys=Object.keys(rc).sort((a,b)=>rc[b]-rc[a]||a.localeCompare(b));
    dlRole.innerHTML=keys.map(k=>{const d=ROLE_DISPLAY[k]||k; return `<option value="${esc(d)}" label="${esc(d)} (${rc[k]})"></option>`;}).join('');
  }
  const ac={high:0,medium:0,low:0}; base.forEach(t=>{ if(ac[t.automation]!=null) ac[t.automation]++; });
  const cur=fa.value;
  fa.innerHTML='<option value="">All automation</option>'+['high','medium','low'].map(a=>`<option value="${a}">${a[0].toUpperCase()+a.slice(1)} (${ac[a]})</option>`).join('');
  fa.value=cur;
  updateRoleHint();
}
function updateRoleHint(){
  if(!roleHintEl) return;
  const k=fr.value?ROLE_KEY(fr.value):'';
  if(k && lastRC[k]!=null){ const n=lastRC[k]; roleHintEl.textContent=n+' task'+(n===1?'':'s'); }
  else { const n=Object.keys(lastRC).length; roleHintEl.textContent=n+' role'+(n===1?'':'s'); }
}

/* ---------------- views ---------------- */
function renderHome(){
  curD=''; curQuick=false;
  homeEl.hidden=false; crumbEl.hidden=true; filtersEl.hidden=true;
  win.items=[]; win.n=0; grid.innerHTML='';
  const bar=`<div class="home-bar"><a class="chip-btn qw" href="#quick">&#9889; Highly automatable (${TOTAL_QUICK})</a>`+
            `<a class="chip-btn" href="#all">Browse everything &rarr;</a>`+
            `<span class="leg">Automation: <i style="background:var(--a-high)"></i>high `+
            `<i style="background:var(--a-med)"></i>medium <i style="background:var(--a-low)"></i>low</span></div>`;
  const tiles=TILE_ORDER.map(d=>{
    const m=DM[d]||{count:0,high:0,medium:0,low:0,quick:0,topRoles:[]};
    const seg=(cls,n)=> n?`<i class="${cls}" style="flex:${n}"></i>`:'';
    const barTitle=`High ${m.high} · Medium ${m.medium} · Low ${m.low}`;
    const mb=`<div class="minibar" title="${esc(barTitle)}">${seg('mh',m.high)}${seg('mm',m.medium)}${seg('ml',m.low)}</div>`;
    const roles=(m.topRoles||[]).join(' · ');
    const qw=m.quick?`<span class="tquick" title="High automation potential, runs unattended (no human gate)">&#9889; ${m.quick} highly automatable</span>`:'';
    const al=`${d}: ${m.count} tasks, ${m.quick} highly automatable. ${barTitle} automation.${roles?' Top roles: '+roles+'.':''}`;
    return `<button class="tile" data-d="${esc(d)}" aria-label="${esc(al)}"><div class="tile-top"><span class="tname">${esc(d)}</span>`+
           `<span class="tcount">${m.count}</span></div>${mb}${qw}<div class="troles">${esc(roles)}</div></button>`;
  }).join('');
  homeEl.innerHTML=bar+`<div class="tiles">${tiles}</div>`;
  homeEl.querySelectorAll('.tile').forEach(b=>b.addEventListener('click',()=>navPush('d='+encodeURIComponent(b.dataset.d))));
}
function renderDomain(d){
  curD=d;
  homeEl.hidden=true; crumbEl.hidden=false; filtersEl.hidden=false;
  const items=filterTasks(d);
  crumbEl.innerHTML=`<div class="bc"><a href="#">Overview</a> / ${esc(d)}</div>`+
    `<div class="crumb-head"><h2>${esc(d)}</h2>`+
    `<span class="dc">${items.length} task${items.length===1?'':'s'}</span>`+
    `<button class="copy" id="copyl">Copy link</button></div>`;
  $('#copyl').addEventListener('click',copyLink);
  populateFacets(d);
  setWindow(items,false);
}
function renderResults(){
  curD='';
  homeEl.hidden=true; crumbEl.hidden=false; filtersEl.hidden=false;
  const items=filterTasks('');
  const q=fq.value.trim();
  const ndom=new Set(items.map(t=>t.domain)).size;
  const crumbLabel=q?`Search: &ldquo;${esc(q)}&rdquo;`:'Browse everything';
  crumbEl.innerHTML=`<div class="bc"><a href="#">Overview</a> / ${crumbLabel}</div>`+
    `<div class="crumb-head"><h2>${q?'Results':'Browse everything'}</h2>`+
    `<span class="dc">${items.length} task${items.length===1?'':'s'} across ${ndom} domain${ndom===1?'':'s'}</span>`+
    `<button class="copy" id="copyl">Copy link</button></div>`;
  $('#copyl').addEventListener('click',copyLink);
  populateFacets('');
  setWindow(items,true);
}
function renderQuick(){
  curD='';
  homeEl.hidden=true; crumbEl.hidden=false; filtersEl.hidden=false;
  const items=filterTasks('');
  const ndom=new Set(items.map(t=>t.domain)).size;
  crumbEl.innerHTML=`<div class="bc"><a href="#">Overview</a> / &#9889; Highly automatable</div>`+
    `<div class="crumb-head"><h2>&#9889; Highly automatable</h2>`+
    `<span class="dc">${items.length} task${items.length===1?'':'s'} across ${ndom} domain${ndom===1?'':'s'}</span>`+
    `<button class="copy" id="copyl">Copy link</button></div>`+
    `<p class="sub">High automation potential, end-to-end with no human gate.</p>`;
  $('#copyl').addEventListener('click',copyLink);
  populateFacets('');
  setWindow(items,true);
}

/* ---------------- task modal ---------------- */
function rowList(label,arr){if(!arr||!arr.length)return ''; return `<div class="row"><span class="k">${label}</span><span class="v">${arr.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</span></div>`;}
function rowText(label,val){if(!val)return ''; return `<div class="row"><span class="k">${label}</span><span class="v">${esc(val)}</span></div>`;}
let lastTaskId='';
function openTask(id){ const base=buildHash(); navPush(base?base+'&t='+encodeURIComponent(id):'t='+encodeURIComponent(id)); }
function openModalEl(t){
  const modal=$('#modal');
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-labelledby','modalTitle'); modal.tabIndex=-1;
  modal.innerHTML=`<button class="close" id="close" type="button" aria-label="Close">&times;</button>`+
    `<span class="domain">${esc(t.domain)}</span>`+
    `<span class="badge ${autoClass[t.automation]||''}">${esc(t.automation)} automation</span>`+
    `<h2 id="modalTitle">${esc(t.title)}</h2><p class="desc">${esc(t.description)}</p>`+
    rowList('Roles',t.roles)+rowList('Inputs',t.inputs)+rowList('Outputs',t.outputs)+rowList('Tools',t.tools)+
    rowText('Human in loop',t.human_in_loop)+rowText('Frequency',t.frequency)+
    `<div class="trigger"><span class="k">Example prompt</span><code>${esc(t.trigger)}</code></div>`;
  const wasOpen=!overlay.hidden;
  overlay.hidden=false; document.body.style.overflow='hidden';
  $('#close').addEventListener('click',closeModal);
  if(!wasOpen) modal.focus();
}
function trapFocus(e){
  if(e.key!=='Tab' || overlay.hidden) return;
  const f=$('#modal').querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if(!f.length) return;
  const first=f[0], last=f[f.length-1];
  if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
}
function closeModal(){
  document.body.style.overflow='';
  // Replace (not push) the current #...&t= entry so closing doesn't leave a duplicate
  // history step that Back would re-open. render() runs synchronously here.
  navReplace(buildHash());
  const id=lastTaskId; lastTaskId='';
  let target=null;
  if(id){ try{ target=grid.querySelector('[data-id="'+(window.CSS&&CSS.escape?CSS.escape(id):id)+'"]'); }catch(_){} }
  (target||fq).focus();
}
function copyLink(){
  const u=location.href;
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(u);
  const b=$('#copyl'); if(b){ const o=b.textContent; b.textContent='Copied!'; setTimeout(()=>{b.textContent=o;},1200); }
}

/* ---------------- main render from hash ---------------- */
function render(){
  const h=parseHash();
  curQuick=h.quick;
  setVal(fq,h.q); setVal(fr,h.role); setVal(fa,h.auto);
  if(h.d){ renderDomain(h.d); }
  else if(h.quick){ renderQuick(); }
  else if(h.all||h.q||h.role||h.auto){ renderResults(); }
  else { renderHome(); }
  if(h.t && byId[h.t]){ lastTaskId=h.t; openModalEl(byId[h.t]); }
  else { overlay.hidden=true; document.body.style.overflow=''; }
  setCtrlH();
}

/* Track the real controls-bar height so sticky group headers offset correctly even when
   the bar wraps to 2-3 rows on narrow screens. */
function setCtrlH(){ document.documentElement.style.setProperty('--ctrlh', controlsEl.offsetHeight+'px'); }
window.addEventListener('resize',setCtrlH);

overlay.addEventListener('click',e=>{ if(e.target.id==='overlay') closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !overlay.hidden){ e.preventDefault(); closeModal(); } });
$('#modal').addEventListener('keydown',trapFocus);
[fq,fr,fa].forEach(el=>el.addEventListener('input',()=>{ updateRoleHint(); navReplace(buildHash()); }));
$('#clear').addEventListener('click',()=>{ fq.value='';fr.value='';fa.value='';
  const p=[]; if(curQuick)p.push('quick'); if(curD)p.push('d='+encodeURIComponent(curD));
  navPush(p.join('&')); });
/* agent CTA: copy the meta-prompt to the clipboard */
(function(){ const btn=$('#ctaCopy'), pre=$('#ctaPrompt'); if(!btn||!pre) return;
  btn.addEventListener('click',()=>{ const text=pre.textContent.trim();
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text);
    const o=btn.textContent; btn.textContent='Copied!'; btn.classList.add('ok');
    setTimeout(()=>{ btn.textContent=o; btn.classList.remove('ok'); },1200); }); })();
window.addEventListener('hashchange',render);
render();
setCtrlH();
</script>
</body>
</html>
"""

html_out = (HTML.replace("/*__DATA__*/", DATA_JSON)
                .replace("/*__META__*/", META_JSON)
                .replace("__NTASKS__", f"{len(records):,}"))
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
embedded, no server needed, opens straight from `file://`).

It lands on an **overview**: a grid of the {len(dom_counts)} domains, each tile showing its
task count, a high/medium/low automation mini-bar, and its top roles. From there:

- **Drill into a domain** to see its tasks, with role (type-ahead) and automation
  filters scoped to that domain and a facet count on every option.
- **Search** from the pinned box for cross-domain results, grouped under sticky
  domain headers.
- Jump straight to the **&#9889; Highly automatable** set (the {total_quick} tasks that are
  both high-automation **and** run unattended &mdash; no human gate) or **Browse everything**
  in one flat, grouped list.
- Click any task for inputs, outputs, tools, human-in-loop, and an example prompt.

Every view is **shareable**: the URL hash captures the domain, filters, search, and the
open task (e.g. `#quick&d=Recruiting%20%26%20Talent`), so **Copy link** and the
browser Back/Forward buttons just work. Drop it on a blog as-is.

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
