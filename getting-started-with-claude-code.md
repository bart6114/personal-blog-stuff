# getting started with claude code (the practical version)

So I've been onboarding a few people on projects lately and trying to get them into an AI-native workflow. What I noticed is that getting started with Claude Code is genuinely hard, not because the tool is complicated, but because when you search online there's so much shit out there. Half of it was written six months ago and is completely irrelevant now (as will this text be two months from now).

So I put together a short list of stuff I typically walk people through. It's not a grand methodology. I'm not going to tell you to write detailed specs first or follow some five-step framework. Just get going, try things, and let Claude figure out the best approach with you.

## starting a project

- **Greenfield (new project):** tell Claude what functionality you want to build. Be opinionated about the tech stack you want, or ask it to research current best practices first. Let it build a detailed plan, iterate on it until you're happy, then just hit implement
- **Brownfield (existing project):** let it explore first. Point it at the codebase, tell it what you're working on, and give it time to understand what's already there. Then have it update your CLAUDE.md with what it learned. Claude is surprisingly good at grasping project structure if you don't rush it

## think in user functionality, not technical features

This is probably the biggest mindset switch. Don't think "I need to create a database table and an API endpoint and a form component." Think about what the user actually wants to do. "A user should be able to invite teammates to their workspace by email." That's it. Express that as clearly as you can, and let Claude work out the technical side.

Then separately, be opinionated about *how* you want things built. If you care about writing tests for everything, or a specific code style, just tell Claude and have it save that in your CLAUDE.md. That way it sticks. But I keep coming back to this: starting from the user's perspective instead of the technical breakdown produces noticeably better output.

## plugins worth installing

I change my mind about plugins every few weeks (so take this with that caveat), but these three have stuck around:

- **[Superpowers](https://github.com/obra/superpowers):** the one I'd install first. Gives you a brainstorming workflow that actually thinks before coding, plus systematic debugging that traces full data flows instead of guessing. It's opinionated in a good way
- **[Ralph Loop](https://claude.com/plugins/ralph-loop)** (official Anthropic plugin): autonomous dev loops where you define success criteria and let Claude iterate until it gets there. Good for larger refactors where you'd otherwise be babysitting
- **[Code-Simplifier](https://claude.com/plugins/code-simplifier)** (official Anthropic plugin): run this after you've written a bunch of code. It cleans things up and reduces token usage, which matters more than you'd think when you're deep in a session

## things people overthink

- **MCP vs bash tools:** some MCPs are genuinely useful (Supabase MCP is better than the Supabase CLI, for example), but in general just let Claude use bash. It's great with command line tools and it's faster than routing through an MCP server for most things
- **Model selection:** this used to be a whole debate. Honestly, just ignore it now. Claude Code handles routing well on its own. Pick whatever feels right and move on

## workflow habits that help

- **Plan mode (Shift+Tab twice):** use this for complex implementations and tough bugs. It increases thinking intensity and keeps Claude from jumping straight into code when it should be reasoning first
- **CLAUDE.md:** think of this as onboarding a junior colleague. What would you tell them before they touch the codebase? Stupid example: Claude doesn't know your migration files are immutable. It'll happily edit an existing one instead of creating a new one. So you tell it, "migration files are immutable, only create new ones." That kind of thing. Don't write the file yourself though, just tell Claude what you care about and let it write the CLAUDE.md for you
- **`/clear` often:** clear your context when switching tasks. Stale context from a previous task is one of the most common reasons Claude starts producing confused output. Fresh context, better results

Nothing fancy. Just the stuff I would like someone to tell me on day one.
