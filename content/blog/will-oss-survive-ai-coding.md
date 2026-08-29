---
title: "Will OSS survive AI coding?"
description: "I used to open-source a lot of what I built. Mostly tools and utilities that scratched a particular itch. The math was simple enough: let's say building some..."
publishedAt: "2026-04-01T05:07:00.000Z"
updatedAt: "2026-03-31T00:00:00.000Z"
slug: "will-oss-survive-ai-coding"
draft: false
tags: []
---

I used to open-source a lot of what I built. Mostly tools and utilities that scratched a particular itch. The math was simple enough: let's say building something internally took about a week. Open-sourcing it (writing docs, cleaning up the API, adding tests, making the README make sense to someone who didn't write the thing) added another week or two on top. So roughly 2x the effort, but you got something back: community benefit, a bit of recognition, and the general satisfaction of contributing to something bigger than your own codebase.

Then AI coding tools showed up, and that one-week internal build became about 15 minutes. I'm not exaggerating. But the open-sourcing part hasn't gotten any faster. Sure, it doesn't technically *have* to take a week, but the moment you put something in the public eye you want it to be right. Clean docs, decent test coverage, an API that won't embarrass you when someone actually reads it. You want it to look like you care, because you do. That still takes real time.

So the old ratio was roughly 2x to share your work with the world. The new ratio is closer to 100x. I can't justify that anymore, not for a 15-minute script, and not when I know that whoever needs the same thing can also just build it in 15 minutes. I'm not proud of this, but it feels like rational behavior. And I suspect I'm not the only one doing the math.

There's an [economics paper](https://arxiv.org/abs/2601.15494) from earlier this year (Koren, Bekes, Hinz, and Lohmann) that puts numbers on what I've been feeling. Their finding is that as vibe coding adoption rises, software output goes up but human engagement around open source projects shrinks. Downloads increase while bug reports, documentation contributions, and community interaction all decline. At 70% vibe coding adoption, per-user monetization for a typical OSS project drops by 70%, while the AI productivity gains only offset about 12% of development costs.

The researchers call it the "demand-diversion channel" (academics love naming things). But it basically means people are consuming more open source than ever while engaging with it less. They're not filing issues, not reading docs, and not contributing back. Usage is up, but participation is hollow.

The irony is that AI coding tools are themselves built on top of open source. The models were trained on it and the SDKs depend on it. Meanwhile, [93% of applications](https://www.techtarget.com/searchapparchitecture/tip/Vibe-coding-is-killing-open-source-increasing-software-risk) now contain open source components with no development activity in the last two years. Everyone's building faster on top of packages that nobody's maintaining anymore.

The Linux Foundation [puts a number on the stakes](https://www.linuxfoundation.org/press/new-linux-foundation-report-shows-active-open-source-contribution-delivers-2-5x-roi-while-passive-consumption-increases-costly-technical-debt): without OSS, companies would pay roughly 3.5x more for software. That's about $8.8 trillion. Not a small number.

Will open source survive? Of course it will. There's too much institutional weight behind it for it to just disappear. But the old state of open source, the one where contributing made sense and the ecosystem mostly took care of itself, is pretty fragile in the face of a mass shift in how code gets written. Either it becomes less ubiquitous, or people lower their standards for what they put out there. I don't really like either of those options. Less open source, or worse open source. Both feel like a step backwards from the thing that made me passionate about software and its community.
