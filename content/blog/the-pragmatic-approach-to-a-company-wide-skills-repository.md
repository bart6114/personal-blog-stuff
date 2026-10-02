---
title: "the pragmatic approach to a company-wide skills repository"
description: "A central Git repository, two entry-point skills, and a practical way to turn how your company works into knowledge that people and agents can use."
slug: "the-pragmatic-approach-to-a-company-wide-skills-repository"
draft: true
tags: []
---

I think people make setting up a company-wide skills repository more complicated than it needs to be. Before you've written a useful skill, you're comparing marketplaces, picking a platform, and figuring out how to distribute everything across different agents.

You can get quite far with a Git repository and two skills. One tells the agent where to find your company's instructions. The other helps people update them. I put together [a small example](https://github.com/bart6114/rubber-duck-industries-skills) using a fictional company, Rubber Duck Industries.

It's worth being clear about why you're doing this, though. A lot of knowledge about how your company works lives in people's heads. How do we prepare a proposal? What should we check before handing over a project? What does a good incident update contain?

You want to get that written down so colleagues can reuse it and agents can follow it. A skill captures the process, the business rules, and the judgement that goes into doing the work properly.

I think of the repository as a knowledge vault. It should become more useful as people use and improve it. That makes portability worth caring about: we'll probably want to keep this knowledge longer than we'll stick with any particular agent.

You can use Anthropic's or OpenAI's infrastructure, buy a dedicated skill-management product, or build something elaborate. For this approach, we'll use the Git service we already have.

## start with a repository and an index

Copy the example into a repository your company controls. It uses GitHub, but Bitbucket or GitLab is fine too, provided your agent can read the files and create pull requests or merge requests there.

Replace the company name and repository URLs in the two entry-point skills. Remove the sample skills you don't need and add a few real ones. You can group them by team:


```text
company-skills/
├── README.md
├── AGENTS.md
├── company-skills/
│   └── SKILL.md
├── company-skills-updater/
│   └── SKILL.md
├── company-wide/
│   └── summarize-meeting/
│       └── SKILL.md
├── hr/
│   └── prepare-onboarding-plan/
│       └── SKILL.md
└── operations/
    └── draft-incident-update/
        └── SKILL.md
```

A skill is a folder with a `SKILL.md`: a name, a description of when to use it, and instructions. References, templates, and scripts can go alongside it when needed. That's the [Agent Skills format](https://agentskills.io/specification).

Use the `README.md` as an index. List each skill, what it's for, the team that owns it, and a link to its instructions. “Prepare a first-month onboarding plan” gives an agent something useful to choose from. “HR helper” doesn't say much.

To write the first skills, ask the people doing the work to explain their process to an agent. Give it an example of a good result and the things they usually have to correct. Have it turn that into instructions, then try those instructions on actual work.

Leave current customer records and other live data in their existing systems. The skill can explain where to find them. You don't need to build a second copy of all your company data to describe how to prepare a proposal.

## install two entry-point skills

Employees install the two entry-point skills. All the other skills stay in the repository.

The first, [`rubber-duck-skills`](https://github.com/bart6114/rubber-duck-industries-skills/blob/main/rubber-duck-skills/SKILL.md), tells the agent to:

1. Read the current `README.md` from the repository's default branch.
2. Find the most relevant company or team skill for the request.
3. Read that skill's `SKILL.md` and follow it.
4. Read supporting files when the selected skill needs them.

Tell it your role and team so it knows where to look first. That helps it choose relevant skills without restricting it to your team's folder.

I'm a fan of making skills visible across teams, wherever access allows. People can learn from each other's approach and reuse things that already work. HR doesn't need its own meeting-summary skill just because the useful one happens to live in operations.

For a one-off task in Codex, you can just point it at the repository and ask it to read the index and relevant skill. Installing the routing skill saves you from repeating that. You can also put that instruction in an `AGENTS.md` that Codex loads; [it supports project and global instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Have it read the current version from the default branch. If it's working from a local checkout, have it update that first.

## let business users propose changes

The second, [`rubber-duck-skills-updater`](https://github.com/bart6114/rubber-duck-industries-skills/blob/main/rubber-duck-skills-updater/SKILL.md), lets someone ask:

> Update our onboarding skill: new colleagues should meet their buddy before their first day. Add that to the preparation steps and open a pull request for HR to review.

It reads the existing skill, creates a branch, makes the change, and opens a pull request explaining what changed and why. It also checks the skill's format and keeps the README up to date. In the example, it needs an explicit request before merging.

The person proposing the change can explain it in normal language. They don't need to learn Git commands to contribute what they know about onboarding. The agent handles that part.

Add instructions for requesting review from the team that owns the skill. Set up repository permissions and branch protection to enforce who can approve and merge.

The example's `AGENTS.md` requires the agent to review the README before every commit. If a skill is added, moved, or changes purpose, its index entry changes too. Otherwise, the next agent is trying to find its way around using an outdated map.

## try it with one colleague

Your agent needs access to the repository. Set that up in the environment people actually use, whether that's Claude Code, Claude Desktop, Codex, or a supported ChatGPT workspace. It needs to read files, and it needs the tools and permissions to create branches and pull requests for updates.

The repo has an [employee setup prompt](https://github.com/bart6114/rubber-duck-industries-skills#employee-install-prompt) you can adapt. It asks the agent to install the two entry-point skills, read the index, and remember the employee's role and team where persistent memory is available. Installation depends on the agent environment, so have it confirm what it actually managed to do.

Then ask one colleague to use a skill on a real task and request a small correction. Check that the agent reads the right instructions and opens the expected pull request. A connector that can read files won't necessarily be able to propose changes, so try both.

Once that works, you have a starting point you can share with the next team.

Keep an owner for each skill. When people repeatedly correct the same output, have them propose an update. As the repository grows, you can add automated checks for valid skill files and broken index links, or a different distribution layer. The source is still ordinary files in Git, so you can change those choices without starting over.
