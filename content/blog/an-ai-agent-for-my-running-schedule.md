---
title: "My AI running coach setup"
description: "How I use Hermes, Telegram, my RunGap workout history and Norwegian Singles to plan my running, with real training stats and a 2026 heatmap."
slug: "an-ai-agent-for-my-running-schedule"
draft: true
tags: []
---

I use Hermes as an AI running coach. I've given it access to my workout history and asked it to review my training and draft next week's schedule every Sunday.

Hermes is an always-on agent I talk to over Telegram. I've [written about my broader agent setup](/my-ai-agents-setup-august-2026/); this is how I use it for running.

## The running part

I follow Norwegian Singles: controlled sub-threshold sessions, with easy running in between, keeping the effort manageable enough to repeat the work week after week. I maintain [norwegiansingles.run](https://norwegiansingles.run/), a guide to the approach that I [introduced in an earlier post](/from-forum-rabbit-hole-to-running-resource/). Despite the name, it offers very little help finding a date in Oslo.

I like the predictable structure and the emphasis on consistency. Two things I could use a little more of elsewhere in my life, too 😉.

I point the agent to [norwegiansingles.run/llms.txt](https://norwegiansingles.run/llms.txt), an index linking to the guide's text in a format it can read. That gives it the same reference I use when planning sessions.

## Giving the coach my training history

The fiddly part is giving the agent access to my past workouts. You can do that through Strava. I use [RunGap](https://www.rungap.com/), an app for collecting and exporting workout data, to export my workouts as FIT files into iCloud Drive. I make those files available directly to my agents.

The files contain the recorded sessions, including duration, distance and heart rate, so the agent can build a profile from what I've actually done. They also give a concrete picture of my running: from 1 January through 1 October 2026, I've recorded 144 runs on 139 days, covering 1,323 km in 135 hours and 28 minutes. September accounts for 25 of those runs: 262 km in about 23 hours.

<picture>
  <source media="(max-width: 540px)" srcset="/media/an-ai-agent-for-my-running-schedule/running-2026-mobile.svg">
  <img src="/media/an-ai-agent-for-my-running-schedule/running-2026.svg" width="720" height="1065" alt="Calendar heatmap of my 2026 runs through 1 October. Darker sage squares mean more running minutes that day. September has 25 running days; future dates are outlined. Totals: 144 runs, 1,323 km and 135 hours 28 minutes.">
</picture>

Each square shows recorded running time that day, with multiple runs added together. These figures use the FIT session's distance and timer duration, with dates in Brussels time. Other sports are excluded; a blank day means no recorded run. The [daily totals and calculation notes](/media/an-ai-agent-for-my-running-schedule/running-2026-summary.json) are available too.

## The Sunday review

My standing request is roughly:

> Every Sunday, review my workout history and draft next week's running schedule using the Norwegian Singles guide. Look back at the week I actually completed and adjust the upcoming week where needed. Keep total training time within 8 hours per week. Increase weekly duration by at most 10%.

The 8 hours is my time budget. The 10% is an upper limit on increases; holding steady or doing less should be an option too. The weekly review gives the agent a chance to revise its plan based on how the training went.

I think about the feedback much like I do with coding agents. Give the agent useful information to check its work against. Workout files are a start; HRV (heart rate variability), sleep and race results add context where available. How a session felt matters too, and Telegram gives me a place to pass that along. If the numbers look fine but my legs disagree, the coach should hear about it.
