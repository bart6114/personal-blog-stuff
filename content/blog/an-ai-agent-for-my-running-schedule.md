---
title: "My running coach is a bot, and it's into Norwegian singles"
description: "How I give an AI agent my training history and a running guide, then use a Sunday review to draft the next week's schedule."
slug: "an-ai-agent-for-my-running-schedule"
publishedAt: "2026-10-06T04:00:00.000Z"
draft: false
tags: []
---

I use Hermes<sup><a href="#note-other-assistants" id="ref-other-assistants" data-footnote-ref aria-label="Footnote 1: other assistants" role="doc-noteref">1</a></sup> as an AI running coach. Every Sunday it looks at my workout history and drafts next week's schedule. Once I approve the plan, it goes into my calendar. This is the loop I use; you can try it with your own tools.

Hermes is an always-on agent I talk to over Telegram. I've [written about my broader agent setup](/my-ai-agents-setup-august-2026/); this is how I use it for running.

## What I give the agent

I follow Norwegian Singles<sup><a href="#note-norwegian-singles" id="ref-norwegian-singles" data-footnote-ref aria-label="Footnote 2: Norwegian Singles" role="doc-noteref">2</a></sup>: controlled sub-threshold sessions, with easy running in between, keeping the effort manageable enough to repeat the work week after week. I like its predictable structure and emphasis on consistency.

I maintain [norwegiansingles.run](https://norwegiansingles.run/), a guide to the approach that I [introduced in an earlier post](/from-forum-rabbit-hole-to-running-resource/). Despite the name, it offers very little help finding a date in Oslo.

I point the agent to [norwegiansingles.run/llms.txt](https://norwegiansingles.run/llms.txt), an index linking to the guide's text in a format it can read. That gives it the same reference I use when planning sessions.

The fiddly part is giving the agent access<sup><a href="#note-garmin" id="ref-garmin" data-footnote-ref aria-label="Footnote 3: Garmin access" role="doc-noteref">3</a></sup> to my past workouts. [RunGap](https://www.rungap.com/) stores them as FIT files in iCloud Drive. I mount that folder on my agent server with [rclone](https://rclone.org/iclouddrive/), and Hermes reads the files there. They include duration, distance and heart rate, so it can work from the sessions I actually completed.

Here's a rough view of the workout history the agent can read. It helps it see quieter weeks, gaps and changes in how much I've been running.

<picture>
  <source media="(max-width: 540px)" srcset="/media/an-ai-agent-for-my-running-schedule/running-2026-mobile.svg" width="480" height="540">
  <img src="/media/an-ai-agent-for-my-running-schedule/running-2026.svg" width="720" height="350" alt="Running history in weekly blocks numbered 01 to 52. Lighter blocks show less running, darker blocks show more; future weeks are outlined. Exact dates and totals are omitted.">
</picture>

Each numbered block is roughly a week. Darker means more running; outlined blocks are still ahead.

## The Sunday review

Workout files are only part of the feedback. HRV (heart rate variability), sleep and race results can add context where available. I can also tell Hermes over Telegram how a session felt. If the numbers look fine but my legs disagree, the coach should hear about it.

Hermes runs a [recurring Sunday review](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/cron.md). My request is roughly:

> Every Sunday, review my workout history and draft next week's running schedule using the Norwegian Singles guide. Look back at the week I actually completed and adjust the upcoming week where needed. Keep total training time within 8 hours per week. Increase weekly duration by at most 10%.

Those are my constraints, not numbers to copy into your own plan. Eight hours is the time I can spend. The 10% is an upper limit on increases; holding steady or doing less should be an option too. I review the draft and, once I approve it, the schedule gets added to my calendar.

## Try it with your own setup

Don't worry about Hermes. You should be able to do this with [ChatGPT](https://learn.chatgpt.com/docs/automations) or [Claude](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork) too, as long as it can read your workout history and training reference.

Start with one review of your most recent week. Give the assistant an export of your runs and a training reference it can read, plus the time you have available and anything the files miss, such as a session that felt unusually hard. Ask it to show what you completed before proposing the next week. If the draft is useful, make the review recurring. Connect a calendar if you want the assistant to add the sessions after you approve them.

<section data-footnotes role="doc-endnotes" aria-label="Footnotes">
  <h2>Footnotes</h2>
  <ol>
    <li id="note-other-assistants" role="doc-endnote">
      <p>But you could just as well use ChatGPT or Claude. <a href="#ref-other-assistants" data-footnote-backref aria-label="Back to reference 1" role="doc-backlink">↩</a></p>
    </li>
    <li id="note-norwegian-singles" role="doc-endnote">
      <p>James Copeland (sirpoc) is the person to read on the method itself. His book, <a href="https://mybook.to/XzwWbK3"><em>Norwegian Singles Method: Subthreshold Running Kept Simple</em></a>, gives his full account of the approach. <a href="#ref-norwegian-singles" data-footnote-backref aria-label="Back to reference 2" role="doc-backlink">↩</a></p>
    </li>
    <li id="note-garmin" role="doc-endnote">
      <p>If you're in the Garmin ecosystem, this is surprisingly simple. Community packages such as <a href="https://github.com/cyberjunky/python-garminconnect">python-garminconnect</a> let an agent log in with your Garmin username and password and retrieve workouts, sleep, HRV and plenty more. I'm not in that ecosystem, though. <a href="#ref-garmin" data-footnote-backref aria-label="Back to reference 3" role="doc-backlink">↩</a></p>
    </li>
  </ol>
</section>
