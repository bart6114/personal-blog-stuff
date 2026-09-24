---
title: "Give everyone at work a way to build with AI"
description: "Give people the tools, access, and shared space to build useful AI skills. Keep the technical setup small and let the people who know the work decide what to build."
slug: "give-everyone-at-work-a-way-to-build-with-ai"
publishedAt: "2026-09-25T06:15:00+02:00"
draft: false
tags: []
---

Put everyone in a room to decide the technical setup *and* all the things people might build with it, and the conversation goes everywhere. Someone asks how an agent will access support tickets. Someone else wants to design the whole support process. Half an hour later you're debating authentication, escalation rules, and which model to use, with nothing anyone can try.

I think the technical team's first job is smaller: make sure people can start building useful capabilities around their own work.

Give people a desktop agent they can actually use, whether that's [Claude Cowork](https://support.claude.com/en/articles/10065433-install-claude-desktop) or [ChatGPT Work](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex). Help them connect the documents, code, meetings, conversations, and operational systems they already work with. Before building an integration yourself, check whether the tool already has a connector, official plugin, MCP server, or CLI. Let people start there, using their own accounts and existing permissions. Only start building a custom connection when a real task shows you what's missing.

Then give people somewhere to keep and share what they build. A shared repository can hold skills: reusable instructions, examples, and small tools for recurring tasks. It gives colleagues a way to review a change, improve it, publish a version, and find it again later. GitHub is fine; you don't need a custom skills platform.

I'd also set up one path to background automation: a ticket change or schedule starts an agent and leaves a visible result and run log. Use a trivial task to prove it works.

Once that minimum setup is in place, let the people who do the work start building. They know which parts of a process are worth improving and what a good result looks like. Let them experiment with their agent and the tools they already use. When they have a capability that works, they can ask the agent to turn it into a skill, then review and publish it in the shared repository for colleagues to use and improve.

Keep those conversations separate. The technical team gets the minimum setup working across the company. The people in each role decide what capabilities to build with it. They can call on the technical team when a real task exposes a missing connection or needs a safer way to act. They don't need to settle every hypothetical workflow before anyone starts. Otherwise, you'll have exponentially more meetings than skills.
