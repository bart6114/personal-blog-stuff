---
title: "My running coach is a bot"
description: "How I give an AI agent my training history and a running guide, then use a Sunday review to draft the next week's schedule."
slug: "an-ai-agent-for-my-running-schedule"
publishedAt: "2026-10-06T04:00:00.000Z"
draft: false
tags: []
---

I use Hermes as an AI running coach. Every Sunday it looks at my workout history and drafts next week's schedule. Once I approve the plan, it goes into my calendar. This is the loop I use; you can try it with your own tools.

Hermes is an always-on agent I talk to over Telegram. I've [written about my broader agent setup](/my-ai-agents-setup-august-2026/); this is how I use it for running.

## What I give the agent

I follow Norwegian Singles: controlled sub-threshold sessions, with easy running in between, keeping the effort manageable enough to repeat the work week after week. I like its predictable structure and emphasis on consistency.

James Copeland (sirpoc) is the person to read on the method itself. His book, [*Norwegian Singles Method: Subthreshold Running Kept Simple*](https://mybook.to/XzwWbK3), gives his full account of the approach.

I maintain [norwegiansingles.run](https://norwegiansingles.run/), a guide to the approach that I [introduced in an earlier post](/from-forum-rabbit-hole-to-running-resource/). Despite the name, it offers very little help finding a date in Oslo.

I point the agent to [norwegiansingles.run/llms.txt](https://norwegiansingles.run/llms.txt), an index linking to the guide's text in a format it can read. That gives it the same reference I use when planning sessions.

The fiddly part is giving the agent access to my past workouts. [RunGap](https://www.rungap.com/) stores them as FIT files in iCloud Drive. I mount that folder on my agent server with [rclone](https://rclone.org/iclouddrive/), and Hermes reads the files there. They include duration, distance and heart rate, so it can work from the sessions I actually completed.

For a sense of the history it can see, here are my runs from 1 January through 1 October 2026: 144 runs on 139 days, covering 1,323 km in 135 hours and 28 minutes.

<picture>
  <source media="(max-width: 540px)" srcset="/media/an-ai-agent-for-my-running-schedule/running-2026-mobile.svg" width="480" height="628">
  <img src="/media/an-ai-agent-for-my-running-schedule/running-2026.svg" width="720" height="450" alt="52 weekly blocks of my 2026 running through 1 October. Darker sage blocks mean more running hours in that period; future periods are outlined. Totals: 144 runs, 1,323 km and 135 hours 28 minutes.">
</picture>

The blocks are seven-day slices starting on 1 January, separate from my Sunday planning weeks. The final block includes 31 December too; future blocks are outlined.

## The Sunday review

Workout files are only part of the feedback. HRV (heart rate variability), sleep and race results can add context where available. I can also tell Hermes over Telegram how a session felt. If the numbers look fine but my legs disagree, the coach should hear about it.

Hermes runs a [recurring Sunday review](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/cron.md). My request is roughly:

> Every Sunday, review my workout history and draft next week's running schedule using the Norwegian Singles guide. Look back at the week I actually completed and adjust the upcoming week where needed. Keep total training time within 8 hours per week. Increase weekly duration by at most 10%.

Those are my constraints, not numbers to copy into your own plan. Eight hours is the time I can spend. The 10% is an upper limit on increases; holding steady or doing less should be an option too. I review the draft and, once I approve it, the schedule gets added to my calendar.

## Try it with your own setup

Don't worry about Hermes. You should be able to do this with [ChatGPT](https://learn.chatgpt.com/docs/automations) or [Claude](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork) too, as long as it can read your workout history and training reference.

Start with one review of your most recent week. Give the assistant an export of your runs and a training reference it can read, plus the time you have available and anything the files miss, such as a session that felt unusually hard. Ask it to show what you completed before proposing the next week. If the draft is useful, make the review recurring. Connect a calendar if you want the assistant to add the sessions after you approve them.
