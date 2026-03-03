# March 2026 Hot Takes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use barts-voice skill for ALL writing. Read the design doc at `docs/plans/2026-03-03-march-hot-takes-design.md` for full context.

**Goal:** Write two blog posts: "Your backend is about to become an agent loop" and "MCPs are so 2025"

**Architecture:** Two standalone markdown files in the repo root, following the pattern of existing posts (see `ai-development-is-the-new-online-advertising.md`, `stop_asking_me_if_saas_is_dead.md` for format/length reference). Each ~600-800 words.

**Tech Stack:** Markdown. Bart's voice skill for tone.

**Voice reference:** Read `.claude/skills/barts-voice/SKILL.md` before writing. Key rules: no em dashes, short paragraphs, parenthetical asides, real numbers, no corporate speak, no fake positivity, fragments are fine.

---

### Task 1: Write Article 1 draft

**Files:**
- Create: `your-backend-is-about-to-become-an-agent-loop.md`
- Reference: `ai-development-is-the-new-online-advertising.md` (for format/length), `stop_asking_me_if_saas_is_dead.md` (for tone on hot takes)

**Step 1: Read reference posts for voice calibration**

Read these existing posts to calibrate Bart's voice before writing:
- `ai-development-is-the-new-online-advertising.md`
- `stop_asking_me_if_saas_is_dead.md`
- `where-are-the-ai-native-engineers.md`

**Step 2: Write the full article**

Write `your-backend-is-about-to-become-an-agent-loop.md` following the design doc structure:

1. Opening provocation: state the 80% claim directly, casual/self-aware tone
2. What's already happening: Stripe, Shopify Roast, Torres/Expedia quote, Gartner 5%->40%
3. Why it makes sense: fuzzy routing, rules engines failed, token cost economics ($20/M -> $0.40/M)
4. Honest counterpoint: Karpathy "slop", Klarna reversal, dev trust gap, hybrid model reality
5. Landing: the 20% deterministic core stays, but the rest is agent territory

Target: ~700 words. Use real numbers throughout.

**Step 3: Commit**

```bash
git add your-backend-is-about-to-become-an-agent-loop.md
git commit -m "Add blog post: your backend is about to become an agent loop"
```

---

### Task 2: Review Article 1

**Step 1: Review against voice skill**

Read the draft and check against barts-voice skill rules:
- No em dashes (use commas, parentheses, periods instead)
- No corporate speak
- Short paragraphs (max 3-4 sentences)
- Real numbers, not vague claims
- Parenthetical asides for humor/personality
- No staccato summation lists ("Built it. Shipped it. Done.")
- Opening matches one of Bart's patterns (personal anecdote, blunt observation, casual meta-statement)
- Closing lands with quiet conviction or small joke, no "final thoughts" section

**Step 2: Fix any voice issues found**

Edit the file to fix any deviations from voice guidelines.

**Step 3: Commit fixes if any**

```bash
git add your-backend-is-about-to-become-an-agent-loop.md
git commit -m "Polish article 1 voice and tone"
```

---

### Task 3: Write Article 2 draft

**Files:**
- Create: `mcps-are-so-2025.md`
- Reference: same posts as Task 1

**Step 1: Read reference posts again (if needed for recalibration)**

**Step 2: Write the full article**

Write `mcps-are-so-2025.md` following the design doc structure:

1. Opening from hands-on experience: the pattern of wrapping APIs in MCPs then wondering why
2. The abstraction tax: token bloat (55K-134K), performance benchmarks (CLI vs MCP), intransparency (further from domain)
3. What works better: native interfaces (CLI, SDK, API), the trend in agentic tools, Anthropic's 98.7% token reduction
4. Fair counterpoint: MCP solved discovery, useful where no CLI exists, Willison's security point applies either way
5. Landing: MCP squeezed from both sides, middleware thinning out

Target: ~650 words. More experiential, slightly more irreverent than article 1.

**Step 3: Commit**

```bash
git add mcps-are-so-2025.md
git commit -m "Add blog post: MCPs are so 2025"
```

---

### Task 4: Review Article 2

**Step 1: Review against voice skill**

Same checklist as Task 2. Additionally check:
- This one should feel more personal/experiential than article 1
- Should not repeat the same evidence framing as article 1
- The irreverence should come through without being forced

**Step 2: Fix any voice issues found**

**Step 3: Commit fixes if any**

```bash
git add mcps-are-so-2025.md
git commit -m "Polish article 2 voice and tone"
```

---

### Task 5: Final cross-check

**Step 1: Read both articles back to back**

Check for:
- No significant overlap in phrasing or examples
- Each stands alone (no assumed reading order)
- Consistent quality level
- Both feel like Bart wrote them, not like an AI doing a Bart impression

**Step 2: Final edits if needed**

**Step 3: Commit any final changes**
