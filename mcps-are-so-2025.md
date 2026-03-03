# MCPs are so 2025

I've been building with MCPs for a while now and I'm kinda over it. The pattern keeps repeating: you find some API you want your agent to use, you build (or install) an MCP server that wraps that API, the agent calls the wrapper, something breaks, you debug the wrapper, and at some point you're sitting there thinking "why isn't the agent just calling the API directly?"

Because it can. It literally can just call the API. Or use the CLI. Or talk to the SDK. And most of the time, that works better.

## the abstraction tax

Look, MCP is just another layer on top of an existing API. And that layer isn't free.

Start with the token bloat. 5 MCP servers with 58 tools will eat about 55K tokens before you've even asked a question. Some setups I've seen hit 134K tokens in tool definitions alone. That's roughly half of Claude's entire context window gone on describing what the agent *could* do, before it's done anything at all. Pretty wild.

Then there's the performance side. Benchmarks comparing standard CLI tools to MCP equivalents show the difference. Using tmux directly costs about $0.37 per task. The MCP equivalent? $0.48. Not a huge gap on any single task, but it adds up when you're running hundreds of agentic loops a day.

And then there's the thing that bothers me most: you lose proximity to the domain. When you wrap an API in MCP, you're one more layer removed from the original SDK documentation, the actual error messages, the domain-specific concepts. The agent ends up interacting with a simplified proxy of the thing instead of the thing itself. It's like explaining a recipe by describing a photograph of the dish.

## what works better

Let the agent use whatever native interface is already there. CLI, SDK, API directly.

This is where the industry is clearly heading. Claude Code gives agents a Bash tool. Cursor has terminal access. Devin gets a full shell. Everyone is converging on the same insight: give agents broader execution capabilities, not narrower tool definitions. The smart ones figured out that a general-purpose shell is more powerful than a thousand hand-crafted tool wrappers.

Even Anthropic (who created MCP!) published a code execution approach showing a 98.7% token reduction compared to standard MCP tool calls. 150K tokens down to 2K. That's not an incremental improvement, that's a "maybe we should rethink the whole approach" kind of number.

Cloudflare did something similar with their Code Mode: give agents access to an entire API in about 1,000 tokens. Not 1,000 tokens per tool, 1,000 tokens for the whole thing.

When agents talk directly to the original SDK or API, they're closer to the actual domain knowledge. Documentation is richer. Error messages make sense. The agent can work with the real mental model of the service instead of a flattened version of it.

## to be fair

MCP solved a real problem. Discovery. How does an agent know what tools exist? What can it call? What parameters does it need? That's genuinely hard, and MCP gave it structure. I don't want to pretend that's nothing.

For APIs that don't have a good CLI or SDK, an MCP wrapper still makes sense. Sometimes the wrapper *is* the best interface available.

And yes, giving agents raw shell access comes with its own risks. Simon Willison calls it the "lethal trifecta": private data access combined with untrusted content combined with external communication. That's a real concern. (Though to be honest, the security issues don't go away just because you use MCP instead of a shell. You're just rearranging where the trust boundary sits.)

## where this goes

MCP was the right idea at the right time. Agents needed a way to discover and call tools, and MCP gave them one. But it's getting squeezed from both sides now. Agents are getting smart enough to use native tools directly, and the native tools are getting better at being agent-friendly.

That middle layer is going to thin out fast. I guess most middleware does, eventually.
