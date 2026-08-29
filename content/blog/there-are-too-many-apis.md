---
title: "there are too many apis"
description: "ok so this might be controversial but whatever. we have too many apis. like, absurdly too many. and i'm starting to think we played ourselves. automation ..."
publishedAt: "2025-11-13T11:51:00.000Z"
updatedAt: "2025-11-13T00:00:00.000Z"
slug: "there-are-too-many-apis"
draft: false
tags: []
---

ok so this might be controversial but whatever. we have too many apis. like, absurdly too many. and i'm starting to think we played ourselves.

automation platforms like n8n, zapier, all of them... they're useful, sure. but they don't 'really' offer execution environments, right? everything just becomes an api call. and i mean everything. you want to cut a video? that's literally just an ffmpeg command. takes like two seconds locally. but now you're calling an api that wraps ffmpeg. you're adding latency, dependencies, rate limits, probably paying a subscription. to avoid running a single command on your own (hosted?) machine. that's genuinely insane when you think about it.

i know kiss (keep it simple stupid) is kind of a cliché at this point but like... shouldn't we actually keep some things simple? not everything needs to be a microservice with webhooks and rate limits and oauth flows and a status page. sometimes the boring solution is just objectively better.

but here's where it gets interesting, and i'm still working through this... maybe the amount of usecases where frontend actually matters is shrinking in this age of ai? like if everything is just apis talking to apis, or chat interfaces orchestrating services, could you build genuinely successful products with basically no traditional ui?

imagine products that succeed purely because they're good at being composed with other services. you're not building for users clicking buttons, you're building for developers with curl or maybe even just chat interface users asking claude to do something. the react app becomes almost optional, like an afterthought. success measured by how many other services integrate with you, not by whether you shipped that redesign on time.

i still think we have way too many apis. like, objectively we do. but maybe there's something accidentally interesting happening here anyway? maybe we're stumbling toward a world where some products just are apis and that's perfectly valid? idk. just thinking out loud. this whole thing feels broken and promising at the same time.
