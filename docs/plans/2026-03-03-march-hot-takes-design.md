# Design: March 2026 Hot Takes (Two Articles)

## Overview

Two separate blog posts, provocation-first style, aimed at technical founders and engineers already building with AI. Both ~600-800 words in Bart's voice.

---

## Article 1: "Your backend is about to become an agent loop"

### Thesis

In five years, 80% of backend business logic will be an agentic loop with the right tools at hand. The backend doesn't disappear, it retreats to governance (auth, permissions, audit logging) while the agent handles decision-making, routing, and orchestration.

### Structure

1. **Opening (provocation):** State the claim directly. "ok so here's a take that might age terribly." Five years from now, most backend business logic is an agent loop. Not the database. Not auth. The business logic, the if/then/else spaghetti in controllers and services.

2. **What's already happening:**
   - Stripe's Agentic Commerce Suite: agents orchestrate checkout, payment tokenization, inventory
   - Shopify's Roast framework: AI workflows interleaved with deterministic code
   - Rafael Torres (Expedia, InfoQ Oct 2025): "the LLM is no longer just generating intent, it's acting on it"
   - Gartner: 5% of enterprise apps have task-specific agents in 2025, predicted 40% in 2026

3. **Why this makes sense:**
   - Business logic is mostly fuzzy routing and edge-case handling
   - Rules engines tried to solve this and mostly sucked
   - Token costs dropping 10x/year ($20/M tokens in 2022 to $0.40 in 2025) makes it economically viable
   - Declarative > imperative for most business logic

4. **The honest counterpoint:**
   - Karpathy: "agents are slop", decade not year
   - Klarna: replaced 700 humans, customer satisfaction dropped, reversed course
   - 46% of developers distrust AI tool accuracy (Stack Overflow 2025)
   - Non-determinism, debugging difficulty, audit concerns
   - Hybrid model (agent orchestrator + deterministic tools) is what actually works

5. **Landing:** The 20% that stays deterministic isn't going away. But the messy, branching, "it depends" logic that makes up most backends? Agent territory. Economics only going one direction.

### Tone
Confident but self-aware. Real numbers. Acknowledge this could be wrong.

### Key data points to include
- Gartner 5% -> 40% in one year
- Token cost decline: $20/M (2022) -> $0.40/M (2025)
- Klarna's reversal as cautionary tale
- Karpathy's "decade of agents" framing

---

## Article 2: "MCPs are so 2025"

### Thesis

MCP was a useful stepping stone, but agents perform better when they talk directly to APIs, SDKs, and CLIs. MCP adds intransparency, token bloat, and security surface area. The ecosystem is already moving past it.

### Structure

1. **Opening (hands-on experience):** Start from building experience. "I've been building with MCPs for a while now and I'm kinda over it." The pattern: build MCP wrapper around API, agent calls wrapper, debug wrapper, wonder why agent isn't just calling the API directly.

2. **The abstraction tax:**
   - Token bloat: 5 servers / 58 tools = 55K tokens before asking a question. Some hit 134K (half of Claude's context window on tool definitions alone)
   - Performance: benchmarks show CLI tools (tmux $0.37/task) outperform MCP ($0.48/task)
   - Intransparency: further from domain knowledge. SDK docs, error messages, domain concepts get abstracted away

3. **What works better:**
   - Let agents use native interfaces: CLI, SDK, API
   - Claude Code's Bash tool, Cursor's terminal, Devin's shell: the trend is broader execution capabilities, not narrower tool definitions
   - Anthropic's own code execution approach: 98.7% token reduction (150K -> 2K tokens)
   - Cloudflare's Code Mode: give agents an entire API in 1,000 tokens

4. **The fair counterpoint:**
   - MCP solved a real discovery problem (how does an agent know what tools exist?)
   - Where there's no good CLI or SDK, MCP wrappers make sense
   - Raw shell access has its own risks (Willison's "lethal trifecta")
   - MCP still useful for tool distribution and standardization

5. **Landing:** MCP was the right idea at the right time. But like a lot of middleware, it's getting squeezed: agents getting smart enough for native tools, native tools getting more agent-friendly. That middle layer thins out fast.

### Tone
More experiential than article 1. Comes from building, not reading reports. Slightly more irreverent.

### Key data points to include
- 55K-134K tokens consumed by MCP tool definitions before conversation starts
- 98.7% token reduction with code execution approach
- CLI vs MCP benchmark ($0.37 vs $0.48)
- Willison's security criticisms as fair counterpoint

---

## Research Sources

### Agentic Backends
- Stripe Agentic Commerce Suite (stripe.com/blog/agentic-commerce-suite)
- Shopify Roast (shopify.engineering/introducing-roast)
- InfoQ: "The Architectural Shift: AI Agents Become Execution Engines" (Oct 2025)
- Gartner: 40% enterprise apps with agents by 2026
- Epoch AI: LLM inference price trends
- a16z: LLMflation
- Karpathy "agents are slop" (The Dwarkesh Podcast, Oct 2025)
- Klarna AI reversal (Fast Company)

### MCP vs Direct Access
- Anthropic Engineering: Code Execution with MCP (Nov 2025)
- Cloudflare: Code Mode MCP
- FlowHunt: "The End of MCP for AI Agents?"
- Waleed Kadous: "MCP Went Sideways"
- Simon Willison: MCP prompt injection security problems
- terminalcp benchmark: MCP vs CLI cost comparison
- The New Stack: "10 strategies to reduce MCP token bloat"

## Voice
Both articles use Bart's full casual/opinion voice. Short paragraphs, conversational, real numbers, parenthetical asides, self-deprecating where appropriate. No em dashes. No corporate speak.
