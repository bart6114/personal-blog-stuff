---
title: "tell them what you want, not how you want it"
description: "When working with AI agents, start with the outcome. You don't need to design the integration before asking for help."
slug: "tell-them-what-you-want-not-how"
publishedAt: "2026-09-20T00:00:00.000Z"
draft: true
tags: []
---

I see people getting started with agents and doing half the implementation in their head before asking for anything. They work out which API to use, where the script should run, and how to connect everything. By the time they prompt the agent, they've already designed its job.

Or they never get started. I see this especially with people who don't have a technical background. They have something they'd like to automate, but they don't know how to build it. So they stick to things like “help me draft this email” in ChatGPT. Asking an agent to actually set something up feels like a different category of work. Something you'd need to understand technically before attempting it.

But you don't need to know which API to use, or even what an API is, to start that conversation. “I'm spending too much time reviewing small expenses. Help me automate some of that. Here's the tool we use.” That's enough to get going. You can work out the rules and the practical details with the agent, rather than treating them as homework you need to finish before asking.

The models have become more capable, and so has the software around them, usually called a harness. With the right tools and permissions, an agent can read documentation, run commands and interact with a browser. It can inspect the result and try a different approach when something fails.[^1]

Say you want to stop manually approving small office expenses. You could start with:

> Write a Python script that polls our expense tool's API every five minutes. Check the category and amount, then trigger a Zapier webhook to handle the approval and post a notification in Slack.

You've already made quite a few decisions there. The agent hasn't even looked at what your expense tool supports yet.

I'd start here:

> Whenever an office-supply expense under €50 comes in with a receipt, I want it approved automatically. Leave everything else for me to review. We use Pleo for expenses and Slack for communication. Send me a weekly summary. Help me set this up. Test it on past expenses without changing anything first.

The result might still involve Python and a webhook. Fine. It might also turn out that an existing approval setting does most of the work. Let the agent investigate before handing it an architecture.

What counts as an office expense? What happens when a receipt is missing? Which decisions must stay with a human? Those are useful things to spend your attention on. The agent shouldn't invent your approval policy just because you left the implementation open.

You can still have strong opinions about how it gets built. Use the infrastructure we already have. Don't add another paid service. Give it those constraints, and review what it produces. For approvals, I'd want the limits enforced by the tool or code, and check the test results before switching anything on.

You also don't need a perfect specification before starting. "I'm tired of reviewing these receipts. Help me work out which ones we could automate" is a perfectly reasonable first message. You can work out the rules together. The API can wait until you've actually asked for help.

[^1]: Anthropic, [Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk) and [Computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool). The expense workflow above is an illustrative request, not a tested Pleo integration.
