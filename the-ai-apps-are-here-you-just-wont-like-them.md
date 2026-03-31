# The AI apps are here. You just won't like them.

Answer.AI recently published a piece called ["So Where Are All the AI Apps?"](https://www.answer.ai/posts/2026-03-12-so-where-are-all-the-ai-apps.html) where they looked at PyPI package creation rates and concluded that AI hasn't actually led to more software being built. No inflection point after ChatGPT. No flood. Their data is solid, but the conclusion is wrong. And I think it's wrong in a way that's actually a bit dangerous.

Measuring PyPI packages to see if AI is producing more software is like measuring bookstore openings to figure out if people still read. You're looking at the wrong thing. The flood isn't happening in Python package registries. It's happening in app stores, GitHub repos, startup batches, and private codebases. And it's massive.

## the flood is very much real

GenAI app downloads hit [1.5 billion in 2024](https://sensortower.com/blog/state-of-ai-apps-market-overview-2025) (that's a 92% increase year over year), and then 1.7 billion in just the first half of 2025. Revenue from AI apps reached [$4.5 billion in 2024](https://www.businessofapps.com/data/ai-app-market/), a 136% jump. Consumer spending on AI apps grew [37x in two years](https://land.appfigures.com/rise-of-ai-apps-report-2025). On GitHub, nearly [700,000 new AI projects](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) were created in a single 12-month period, up 178% year over year. Over a million public repos now import an LLM SDK.

It's not just code. Over 60% of recent Y Combinator batches are AI companies. [87% of the top Product Hunt launches in 2025](https://www.producthunt.com/leaderboard/yearly/2025) were tagged "Artificial Intelligence." Corporate investment in AI hit [$252.3 billion in 2024](https://hai.stanford.edu/ai-index/2025-ai-index-report).

So yeah. There's a flood. You just have to look somewhere other than PyPI.

## but here's the thing

The flood is real. Answer.AI got that wrong. But honestly? I kinda wish they'd been right. Because when you actually look at what's flooding the market, the picture is a lot less exciting than the download numbers suggest.

## most of it is crap

RevenueCat's [2026 State of Subscription Apps report](https://www.revenuecat.com/state-of-subscription-apps/) (based on over a billion transactions across 75,000+ developers) paints a pretty clear picture. AI app subscribers cancel their annual subscriptions [30% faster](https://techcrunch.com/2026/03/10/ai-powered-apps-struggle-with-long-term-retention-new-report-shows/) than non-AI app subscribers. Annual retention sits at 21.1% for AI apps versus 30.7% for everything else. Monthly retention: 6.1% versus 9.5%. Refund rates are 20% higher.

But here's the telling part: AI apps convert free trials to paid subscriptions 52% better than non-AI apps. Strong first impression, no lasting value. The classic pattern of something that demos well and falls apart in practice. (Sound familiar? It should. It's the story of most AI products right now.)

90% of AI startups fail within their first year, compared to the already brutal ~70% for traditional tech. And one of the most successful AI apps out there? [ChatOn](https://appfigures.com/resources/insights/20250131?f=1), a thin wrapper on top of ChatGPT, which grossed $135M in two years. That's what winning looks like in this market. As Sam Altman himself put it: "If you're just wrapping GPT-4, we're going to steamroll you." He's probably right. But for now, the wrappers keep coming.

## why i stopped open-sourcing things

ok so this is the part that I think the original article should've been about.

I used to do a lot of open source. Not at the scale of a major project or anything, but I'd regularly build tools and utilities and think "hey, other people could use this." The math was pretty straightforward. Building something internally for a project took about a week. Open-sourcing it (writing proper docs, cleaning up the code, adding tests, making sure it follows best practices) added maybe another week or two. So you'd spend roughly 2x the effort, but you got something back: community benefit, a bit of recognition, the satisfaction of contributing to something bigger. And let's be honest, it was just cool. Being an open source developer felt good.

Here's what changed. That one-week internal build? With AI coding tools, it's now 15 minutes. I'm not exaggerating. The kinds of utilities and scripts and small tools that I would've previously spent days on, I can get a working version of in a fraction of an afternoon.

But the open-sourcing overhead hasn't changed. You still need to write docs. You still need to clean up the API. You still need tests, examples, a README that makes sense to someone who didn't write the thing. That's still a week or two of work.

The old ratio was roughly 2x extra effort to share your work with the world. The new ratio is closer to 100x. And I just can't justify that anymore. Not for a 15-minute script. Not when I know that if someone else needs the same thing, they can also build it in 15 minutes.

I'm not proud of this. But it's rational behavior. And that's exactly the problem.

## and it's not just me

The open source ecosystem is getting squeezed from both sides.

On one end, valuable contributions are declining because the math doesn't work anymore (see above). On the other end, low-effort AI slop contributions are exploding. Daniel Stenberg [killed cURL's 6-year bug bounty program](https://www.theregister.com/2026/01/21/curl_ends_bug_bounty/) because AI-generated reports made it unsustainable. At its worst, only 1 in 20-30 submissions was legitimate. Mitchell Hashimoto [banned AI-generated pull requests](https://itsfoss.com/news/mitchell-hashimoto-vouch/) from Ghostty entirely, calling it "not an anti-AI stance, but an anti-idiot stance." The Godot game engine is [drowning in AI slop PRs](https://www.theregister.com/2026/02/18/godot_maintainers_struggle_with_draining/), with maintainers calling it "increasingly draining and demoralizing." They're sitting on 4,681 open pull requests.

Across the board, PR volumes [jumped 40%](https://techcrunch.com/2026/02/19/for-open-source-programs-ai-coding-tools-are-a-mixed-blessing/) year over year, but merge rates actually declined. Maintainers are spending more time explaining why AI-generated code doesn't fit than writing features themselves.

And here's the number that ties it all together: on GitHub, [private repositories grew 33%](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) year over year versus 19% for public ones. The code is being written. It's just not being shared. Developers are generating utility functions on demand with AI instead of importing open source libraries, and the solutions live in private codebases instead of being contributed back.

More code, less sharing. More PRs, less quality. That's the actual story.

## so where does this land

The question was never "where are all the AI apps?" The apps are here. 1.7 billion downloads in six months. $4.5 billion in revenue. 700,000 new GitHub projects. The flood is enormous and it's only accelerating.

The real question is what happens to the ecosystem that used to make software good. Open source was how we built a shared foundation. If contributing doesn't make economic sense anymore, and slop drowns out whatever's left, that foundation erodes. Not dramatically, not overnight. Quietly.

I don't have a fix for this. I'm not even sure there is one. But I know the answer isn't "there's no flood." There is. It's just not the kind worth celebrating.
