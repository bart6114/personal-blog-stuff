---
title: "my AI/agents setup, August 2026"
description: "A snapshot of the providers, coding tools, Hermes agents, Telegram bots and Loofah vault that make up my current AI setup."
publishedAt: "2026-08-30T00:00:00.000Z"
updatedAt: "2026-08-30T00:00:00.000Z"
slug: "my-ai-agents-setup-august-2026"
draft: true
tags: []
---

People have been asking how my AI and agents setup looks these days. The slightly annoying answer is that it looks different every few weeks.

So this is not *the setup*. It is my setup at the end of August 2026. Some of this will probably be out of date by the time I remember I wrote it.

Here is the short version:

![Diagram of Bart's AI setup: Telegram connects to two Hermes agents on a VM; desktop assistants and local coding clients connect to a Loofah knowledge vault. Remote subscription models are the default, while a small Google Gemma model running locally handles note imports and automatic tagging.](/media/my-ai-agents-setup-august-2026/setup-diagram.svg)

There are three parts: models and clients, agents that keep running without me staring at them, and [Loofah](https://loofah.io) in the middle as the place where useful context lives.

The less visible change is that these agents are increasingly becoming the interface to the rest of my computer.

## models and clients

I recently moved from Anthropic back to OpenAI as my main provider. The coding models and desktop apps are close enough for my work that model quality was not really the deciding factor. Client choice was.

I use [ChatGPT Pro, the $200-per-month tier](https://help.openai.com/en/articles/9793128). OpenAI supports signing into Codex with a ChatGPT subscription. I have [Pi](https://github.com/badlogic/pi-mono) and Hermes using that subscription too. In practice that gives me more freedom to use the clients I like without paying for the same models again through API tokens.

Anything ad hoc that does not fit inside a subscription goes through [OpenRouter](https://openrouter.ai). It is easy to wire up, the cost is visible, and I can switch models or underlying providers without changing the rest of the setup. I do not have a grand routing strategy. It is mainly the overflow valve and the place where I try models that are not included in my subscriptions.

## my personal knowledge vault in the middle

My setup increasingly revolves around my personal knowledge vault. That sounds more elaborate than it is. It is a directory of files managed by [Loofah](/loofah-a-vault-free-meeting-transcriber/): every note I have taken since 2011, meeting recordings and transcripts, project material, research and some things produced by agents.

Agents have also made it surprisingly easy to export notes from tools I used before and import them into the vault.

![A blurred Loofah window showing its note list and editor without exposing the contents of the notes.](/media/my-ai-agents-setup-august-2026/loofah-overview.png)

The important bit is that the same material is available to different clients. ChatGPT, Claude Desktop and other tools can search the vault through read-only MCP. Agents that need to create or update material use the [`loof` CLI](https://loofah.io/agents/cli/). Searching my notes does not automatically come with permission to quietly rewrite them.

![Loofah About view showing 3,389 notes, 99 recordings, 308 tags, 63 hours of meeting recordings and notes collected since December 2011.](/media/my-ai-agents-setup-august-2026/loofah-about-stats.png)

This used to be almost entirely personal material. Now it also contains selected AI artifacts: a useful research brief, a business-model analysis, a daily tech-news update I may want to find again. Selected is doing some work in that sentence. I definitely do not want every intermediate thought and generated blob in there.

I do not have a perfect rule for where the line sits yet. "Would I plausibly search for this again?" is roughly where I am today.

## Hermes on a VM

For the more autonomous part I use [Hermes Agent](https://github.com/NousResearch/hermes-agent) on a dedicated VM. I tried [OpenClaw](https://github.com/openclaw/openclaw) as well. Hermes feels less cumbersome and has been less error-prone for me, which is a personal observation based on my setup rather than a useful benchmark of either project.

Hermes has access to the parts of Google Workspace I want it to use: Gmail, Calendar and Drive. It can also search and write to Loofah through the CLI. That gives it enough context to do useful work without turning the VM itself into the source of truth.

I currently have two agents running there.

The first is supposedly a general-purpose agent. It handles Bright Signal podcasting, prepares morning briefs, does tech-news research, supports my advisory work and catches whatever miscellaneous job I send its way.

The advisory part handles time tracking and invoicing. It also keeps track of things I need to follow up on, respond to or have promised to deliver. I should probably give both podcasting and advisory services their own agents. For now they are just more jobs inside the general-purpose one.

The second keeps track of my open-source activity, particularly around Loofah. It monitors mentions, looks for places where the project might be useful, does the occasional bit of outreach and helps with fairly mechanical distribution work. It recently added Loofah to [AlternativeTo](https://alternativeto.net/software/loofah/), for example.

Each agent has its own Telegram bot. That has worked surprisingly well. I can type to it like any other contact, but more importantly I can send a voice recording while I am out running. If an idea appears, I record thirty seconds and ask the general agent to store it or start doing something with it. There is no ceremony, which is probably why I actually use it.

## local clients, mostly remote models

For coding I mostly use [Codex CLI](https://learn.chatgpt.com/docs/codex/cli), with Pi as the other client I keep around. Codex currently needs a little less setup and fits how I work better out of the box. That preference could easily change after a few releases.

"Local" here refers to where the client works, not where the model runs. Codex and Pi operate directly in the repository, but I normally use remote models covered by my subscriptions.

I use smaller local models for a few narrow jobs. For large imports into my knowledge base, I use a small Google Gemma model running locally to tag the notes automatically. That is the exception, not an attempt to move the whole setup onto local inference.

I keep this separate from the long-running agents. Codex and Pi work in the local repository, with the repository instructions and tools available there. Hermes handles the background jobs, schedules and services. They can use the same Loofah context, but I do not need my coding sessions pretending to be permanent employees.

## the agents became my interface

The Telegram bots are the clearest example of a larger shift. The tools underneath the agents are mostly ones I already used: Chrome, email, APIs and other apps and services. But for a growing part of my work, the interface is now an agent. I type or speak, it uses those tools, and I review what comes back.

Two years ago I mostly used AI to improve work I had already done. Now an agent usually makes the first version or takes the first action, and I add the finishing touches. That has been a large productivity gain for me.

At first, working on more things at once came with a lot of context switching. My output went up, but so did the energy it took to keep track of everything.

The longer-running Hermes agents seem to be changing that. Follow-ups and background jobs can keep moving without me holding every open loop in my head. I seem to be getting more done while feeling more at ease. I am not sure yet whether that is a durable change or just how it feels right now. Ask me again in a few months.

## want to get started?

Use this setup as inspiration. It grew around my workflows and the channels I actually use; yours should do the same. A Telegram bot is not very useful if you never open Telegram.

Even if you do none of the agent stuff today, I would start building a personal knowledge vault. Put your notes, meeting transcripts and material you may need again in one place you can search. I use Loofah, obviously, but there are plenty of alternatives. [NoteApps.info](https://noteapps.info/) is useful for comparing note-taking and personal knowledge-management tools. For meeting-first tools such as Granola and Anarlog, [AlternativeTo has a separate list](https://alternativeto.net/software/granola-1/?tag=note-taking). [Loofah](https://loofah.io) does both, but I am not biased at all ;)
