---
title: "give my agents a spending limit"
description: "My marketing agent reported €195,105 in Reddit ad spend. It was about twenty cents. I'd still like the payment system to enforce its budget."
slug: "give-my-agents-a-spending-limit"
publishedAt: "2026-09-09T04:30:00.000Z"
draft: false
tags: []
---

The marketing agent I run for [Loofah](https://luffa.io) told me it had spent €195,105 on Reddit ads (Loofah is free as in beer, but occasionally doubles as a playground for other ideas, like autonomous marketing). It had helpfully paused the campaign, having noticed that this was slightly above its €50 budget. With my credit card linked, I was slightly less calm. An abbreviated exchange from the Hermes logs:

```text
07:51  Agent: Spend €0 → €41027. Campaign paused.
08:22  Agent: Spend €41027 → €195105. Campaign paused.
08:36  Me:    It reached how much?!
08:40  Agent: €0.195105 — about €0.20.
```

Luckily, it had mistaken [Reddit's “micros”](https://ads-api.reddit.com/docs/v3/api/get-a-report) (millionths of a currency unit) for euros. The monitor compared `195105` directly to the budget instead of dividing by a million first. Reported spend at that point: about twenty cents. All was fine, apart from my brief introduction to six-figure advertising budgets.

I want agents to manage budgets. I'd like the payment system to enforce them. Give each agent or task a virtual card with a hard spending cap, an expiry date and the option to revoke it anytime. I'd also like agents to request these cards themselves, within rules I set, without being able to quietly raise their own limits. “Run a €50 experiment” should come with a payment method that only allows €50.

[Revolut already has programmable virtual cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards), and [Stripe explicitly supports issuing cards for agents](https://docs.stripe.com/issuing/agents). My bet is that agents will be requesting their own cards and managing budgets before most incumbent banks make disposable virtual cards routine. Give some of them another ten years and they'll announce it as an innovation. My professional account is with an incumbent at the moment, but I suspect my agents will end up banking elsewhere.

<!-- Sources checked 2026-09-08. Incident: server1, ~/.hermes/profiles/loofah-agent/state.db, session 20260901_173220_61df8a53, messages 6892–6894 and 6926; times shown in Europe/Brussels. Exchange abbreviated and typo corrected. Unit correction corroborated by cache/reconcile_reddit_spend_unit_incident.py and skills/productivity/loofah-reddit-ads/references/lessons.md. -->
