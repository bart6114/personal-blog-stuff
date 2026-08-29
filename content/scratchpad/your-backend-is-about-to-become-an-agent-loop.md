# Your Backend Is About to Become an Agent Loop

Ok so here's a take that might age terribly.

Five years from now, 80% of backend business logic is an agent loop. Not the database layer. Not auth. Not the API gateway. The business logic. The if/then/else spaghetti that lives in your controllers and services, the stuff that routes requests, handles edge cases, and implements whatever "it depends" logic your product actually runs on.

I realize this sounds like the kind of thing people say at conferences right before getting dunked on for the next decade. But hear me out.

## it's already happening

Stripe just launched their Agentic Commerce Suite. Agents orchestrating checkout flows, handling payment tokenization, verifying inventory, executing orders. Not a research demo. Production infrastructure from a company that processes hundreds of billions in payments annually.

Shopify built Roast, a framework for structured AI workflows interleaved with deterministic code. The interesting part isn't that it uses AI. It's that the AI and the traditional code are peers in the execution flow, not bolted-on afterthoughts.

Rafael Torres at Expedia put it pretty directly at InfoQ last October: "the LLM is no longer just generating intent, it's acting on it." His framing is that the backend becomes governance-focused while agents become the execution engines. The backend doesn't disappear. It just changes jobs.

And the numbers are moving fast. Gartner pegged task-specific agents at about 5% of enterprise apps in 2025, with a prediction of 40% in 2026. That's an 8x jump in a single year. Even if they're off by half, that's still a massive shift.

## why this actually makes sense

Most business logic is fuzzy. It's routing decisions, exception handling, "well if the customer is in Europe and their order is over 500 EUR but they have a pending dispute then we..." You know the code I'm talking about. Everyone's codebase has a version of it, and it's always the part nobody wants to touch.

Rules engines tried to solve this for decades. They mostly sucked. (Sorry to everyone who spent years configuring Drools. I feel your pain.)

What's different now is the economics. Token costs have dropped roughly 10x per year. Late 2022, you were looking at about $20 per million tokens. By 2025, that's somewhere around $0.40 per million.

If that trajectory holds (big if, but still), what costs $100/day in agent inference today costs maybe $0.50/day in two years. At some point the math just works, even for boring CRUD-adjacent business logic.

There's also a design argument. Declarative beats imperative for most business logic. "Describe what should happen" is closer to how business people think about their processes than "code every possible branch." We've been trying to close that gap forever. Agents might actually do it.

## the honest counterpoint

Andrej Karpathy called current agents "slop" and described this as a "decade of agents," not a year of agents. He's probably right about the timeline.

Klarna replaced 700 customer service workers with AI agents, then watched customer satisfaction drop and had to reverse course. Turns out "technically possible" and "actually good" are still different things.

46% of developers say they distrust AI tool accuracy, according to Stack Overflow's 2025 survey. These are the people building this stuff. That's not a great sign.

And the core technical problem is real: agents are non-deterministic. They fail silently, enter loops, pick the wrong tools. Debugging an agent that made a bad decision three steps ago is genuinely hard. Way harder than debugging a bad if-statement.

What actually works in production right now is the hybrid model. An agent orchestrator handling the fuzzy routing and decision-making, calling into deterministic tools for the parts that need to be exact. It's less "agents replace your backend" and more "agents become the connective tissue between your existing services." Less sexy, but more honest.

## so where does this land

The 20% that stays deterministic isn't going away. Financial calculations need to be exact. Compliance rules can't be "probably right." Data integrity constraints don't get to hallucinate.

But the other 80%, the messy, branching, "it depends" logic that makes up most of what backends actually do? That's agent territory. And the economics are only going in one direction.

I could be completely wrong about the timeline. Karpathy's "decade" framing feels more realistic than the breathless "everything changes this year" energy coming out of most AI companies right now. But the direction? I'm pretty confident about the direction.

I guess we'll see.
