---
title: "Software as we know it is dead"
description: "Building tools for Bright Signal made me realise how little I now need to know about the software underneath, and how much that could matter to the companies providing it."
slug: "software-as-we-know-it-is-dead"
draft: true
tags: []
---

For [Bright Signal](https://brightsignal.fm), we recently built a guest pipeline and the infrastructure for our newsletter with a few prompts. It works. And for the first time, I don't feel much need to understand how it works underneath.

That's a strange feeling. I'm used to wanting to know how things are set up, where the data lives, and what happens when something breaks. With these tools, I'm mostly interested in whether they do what we need. I can use the result, ask for changes, and get on with running the podcast.

For a whole category of software, this changes what I expect building it to involve: the small tools we use to organise work, keep track of something, or give a team a useful view of its data.

With ChatGPT Sites and Claude Artifacts, describing a problem can get you a working interface for it. You can see what the system understood, click around, and explain what's missing. A tool that would once have required choosing a product or starting a development project becomes something you can work out in a conversation.

The visual part matters. It's much easier to react to something you can use than to specify all your requirements upfront. You discover what you need while trying it. For a lot of everyday problems, that's a very natural way to build.

And the plumbing increasingly comes with it. [Sites includes hosted storage and sign-in options](https://learn.chatgpt.com/docs/sites/data-and-connections), with [controls for sharing a tool with other people](https://learn.chatgpt.com/docs/sites/publishing-and-sharing). [Claude Artifacts can store data between sessions](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them), with personal storage for each user or shared storage for people working with the same information. They have different capabilities and limits, but both are moving beyond generating a nice screen that forgets everything when you close it.

That makes it much easier to stop thinking about the infrastructure. I can ask for a tool that remembers things and that other people can use, without first deciding how to assemble all the parts myself.

There are things I build where I want much more control. With [Loofah](https://loofah.io), I care about how everything is set up. I'm building a product that people should be able to depend on, and I want to understand the decisions that make that possible.

A small tool for running a podcast has a different job. It needs to work, keep its data safe, and give access to the right people. I can live with some rough edges in the interface. I don't need to design it as if I'm about to sell it to thousands of customers. Having the provider handle storage and sign-in takes a substantial part of that work off my hands, even though I still need to check that the result behaves properly.

Once I can trust the data is safe and get it out in a usable form, I also feel less pressure to choose the perfect solution. The guest information matters more than the particular screen around it. If our needs change, rebuilding that screen becomes a reasonable option.

Getting data out is a condition here, though. Hosted storage doesn't automatically mean easy export, and moving a workflow can involve more than moving its records. I still want an exit. But with one available, I can spend a lot less time wondering whether this is the best possible tool for the next five years. It can just be useful for the next few months.

This feels like Anthropic and OpenAI building a Lovable 2.0 inside the products people already use. [Lovable already bundles hosting, a database, authentication, and storage](https://docs.lovable.dev/features/cloud). The interesting development is having that kind of capability inside the assistant where you're already discussing the work. You describe a problem, and a usable tool can become part of the answer.

I think that could strengthen their position considerably. A team might initially choose an AI provider for the quality of its answers. Once it has a handful of useful internal tools running there, it has another reason to stay. Those tools are part of how the team works.

Each little "let's use this for a few months" solution gives you another reason to bring colleagues onto the same platform. Keeping everyone in one place becomes convenient. When the next problem comes along, asking the same assistant to solve it is an obvious place to start.

So even if rebuilding individual tools gets easier, a team can still become more dependent on the provider hosting them. Exporting the data won't necessarily move the accounts, permissions, and habits that have grown around it. I can see myself happily accepting that convenience for a small tool. I can also see how a collection of small tools turns into a fairly strong reason to keep paying the supplier.

I suspect our kids will find the way we approached software rather odd. We started with lines of code and learned how to turn them into something useful. They'll be able to start with a problem, describe what would help, and try the result. Some will want to understand every layer underneath. For plenty of the things they'll make, they won't need to.

The guest pipeline already feels like that to me. I wanted a way to help us run Bright Signal. We described what we needed, and now we have one.
