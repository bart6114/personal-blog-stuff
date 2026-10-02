---
title: "the pragmatic approach to a company-wide skills repository"
description: "A central Git repository, two entry-point skills, and a practical way to turn how your company works into knowledge that people and agents can use."
slug: "the-pragmatic-approach-to-a-company-wide-skills-repository"
draft: true
tags: []
---

I often see organizations overcomplicate setting up a company-wide skills repository. The conversation moves to marketplaces, platforms, licenses, and distribution before anyone has written a useful skill. I'd start with a KISS approach: keep it simple.

The reason to build one is fairly practical. People know how to prepare a proposal, handle an incident, or onboard a colleague, but much of that knowledge lives in their heads. Colleagues have to find the right person and ask. Agents need those instructions made accessible too.

A skills repository is a specific kind of knowledge vault: it holds instructions for how the company's workflows should be done. Writing down the process and judgement makes that knowledge available to colleagues and gives agents something they can interpret and follow.

Organize it around the work people do, rather than dividing it by technical and nontechnical roles or by department. I expect technical and domain boundaries to start fading to some extent anyway. Start with shared knowledge that everyone can use and contribute to.<sup><a href="#note-sharing-knowledge" id="ref-sharing-knowledge" data-footnote-ref aria-label="Footnote 1: sharing knowledge" role="doc-noteref">1</a></sup>

It should become more useful as people use it,<sup><a href="#note-governance" id="ref-governance" data-footnote-ref aria-label="Footnote 2: governance" role="doc-noteref">2</a></sup> spot gaps, and improve it. I'd keep that knowledge somewhere portable, because we'll probably want it longer than we'll stick with any particular agent. I'm also a fan of sharing it across teams so people can learn from each other's approach.

## keep the setup simple

You can get quite far by keeping your skills in a Git repository and making it easy for people to use and improve them through their agent. Use the Git service you already have, whether that's GitHub, Bitbucket, or GitLab.

The repository can hold lots of skills. The average user only needs two entry-point skills installed in their agent.<sup><a href="#note-installed-skills" id="ref-installed-skills" data-footnote-ref aria-label="Footnote 3: installing skills" role="doc-noteref">3</a></sup>

The first explains where the repository is and how to read its index. The agent checks which skills are available, reads the relevant instructions, and uses them for the task. Tell it your role and team to help it choose, without restricting it to your team's folder.

The second explains how to update the skills and the governance around changes. Someone can say, “Add a buddy meeting to our onboarding process,” and the agent creates a branch, edits the skill, updates the index, and opens a pull request. The team that owns the skill reviews it. Business users can contribute what they know without learning Git commands.

Your agent needs repository access and the tools to read files and propose changes. Set up permissions and branch protection to enforce who can approve and merge. The two skills describe the workflow; they don't provide those permissions.

## start with a repository and an index

I put together [Rubber Duck Industries Skills](https://github.com/bart6114/rubber-duck-industries-skills), a small example for a fictional company. Its structure looks roughly like this<sup><a href="#note-skill-hierarchy" id="ref-skill-hierarchy" data-footnote-ref aria-label="Footnote 4: skill hierarchy" role="doc-noteref">4</a></sup>:

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
└── hr/
    └── prepare-onboarding-plan/
        └── SKILL.md
```

Each skill is a folder with a `SKILL.md` containing its name, when to use it, and instructions. Templates and references can go alongside it. That's the [Agent Skills format](https://agentskills.io/specification).

The `README.md` lists the skills, what they're for, which team owns them, and where to find them. The `AGENTS.md` tells agents how to maintain the repository, including keeping that index up to date when a skill changes.

Copy the example into your company's repository, replace the company name and URLs in the two entry-point skills, and swap the sample skills for a few real ones. The repo includes an [employee setup prompt](https://github.com/bart6114/rubber-duck-industries-skills#employee-install-prompt) you can adapt.

Ask someone who knows a process to explain it to their agent, with an example of a good result. Turn that into your first skill. Leave live company data in its existing systems; the instructions can explain where to find it.

## how to use it

With the routing skill named `company-skills`, you can ask Claude Code: `/company-skills prepare an onboarding plan`. [Skills can be invoked by name](https://code.claude.com/docs/en/skills), and the router reads the index and loads the relevant instructions. Where persistent memory is supported, ask: “Remember that our company guidance is available through `/company-skills`. Use it when we're doing company work, and check its current index.”

Working directly with Git can be a technical hurdle. A setup prompt can walk people through connecting their account, installing the two skills, and saving that preference. It should also tell the agent to ask whether a correction is just for the current task or should be shared with the team. Shared changes go through `company-skills-updater` as a pull request for review.

<section data-footnotes role="doc-endnotes" aria-label="Footnotes">
  <h2>notes</h2>
  <ol>
    <li id="note-sharing-knowledge" role="doc-endnote">
      <p>I've always valued sharing knowledge. If you're considering separate repositories by department or role, ask why a company-wide one wouldn't work. Have a strong reason for splitting it. <a href="#ref-sharing-knowledge" data-footnote-backref aria-label="Back to reference 1" role="doc-backlink">↩</a></p>
    </li>
    <li id="note-governance" role="doc-endnote">
      <p>As more people use and update the skills, agree who owns them, who reviews changes, and who can approve them. <a href="#ref-governance" data-footnote-backref aria-label="Back to reference 2" role="doc-backlink">↩</a></p>
    </li>
    <li id="note-installed-skills" role="doc-endnote">
      <p>Installing a skill helps the agent discover it. You can also point it at the instructions directly: “Read this skill and follow it.” With the necessary access and tools, it can use either approach. <a href="#ref-installed-skills" data-footnote-backref aria-label="Back to reference 3" role="doc-backlink">↩</a></p>
    </li>
    <li id="note-skill-hierarchy" role="doc-endnote">
      <p>I like department folders with shared company skills. Use whatever hierarchy works for your team. <a href="#ref-skill-hierarchy" data-footnote-backref aria-label="Back to reference 4" role="doc-backlink">↩</a></p>
    </li>
  </ol>
</section>
