# Stop Asking Me If SaaS Is Dead

People keep asking me, especially since it's out in the open that we're building [Cambryo](https://cambryo.com), whether LLMs are going to kill SaaS. Short answer: no. But also, that's the wrong question. Everyone's debating whether SaaS lives or dies, and I think the more interesting shift is happening underneath that debate.

Fair warning: this is my thinking *right now*. I'll probably need to rewrite half of this in a couple of months. That's kind of where we are at the moment.

## The bar to replace you just dropped

The part that interests me most: consumers are already starting to build their own tools. Not all of them, not most of them, but a growing number. And the niches where there's low willingness to pay and only one or two incumbents? Those are exposed.

Think about apps like Strava or TrainingPeaks. (And yes, I'm biased because I use both.) They're fine products. But the old moat was that building something like that required skilled developers, significant investment, and a lot of time. That barrier just collapsed. Someone with a clear idea of what they want can now prompt their way to a decent version of a niche app in a weekend.

Here's the twist though. The AI-native replacements aren't doing great either. Early data suggests they have terrible retention, something like 23% gross revenue retention for sub-$50/month products. So the disruption is real, but the disruptors themselves also struggle. It's chaos all the way down. Maybe the surviving play isn't the *app* at all, but the *platform* people build on (whatever that ends up being). I'm not sure yet.

There's another thing slowing this down that people underestimate: even when someone *can* build their own version of a tool, that doesn't mean their manager wants them to. Someone has to maintain that thing. Someone has to debug it at 2am. Someone has to own it when it breaks. Technically possible and economically rational are very different things, and most organizations still (correctly, I think) prefer paying for software over adopting homegrown solutions nobody wants to be responsible for.

## Building is no longer a moat

This is the thing I keep coming back to. Code used to be scarce because experienced people were scarce. Finding and retaining good engineers was genuinely hard (and expensive). That scarcity made the act of building software a competitive advantage in itself.

That's changed. Writing code is dramatically easier now. Not trivially easy, you still need to know what you're doing, but the gap between "idea" and "working software" has narrowed in a way that would've been unthinkable three years ago.

So if building isn't the moat anymore, what is? Hardware and infrastructure, for one. Physical devices, sensors, real-time pipelines, the boring connective tissue that turns raw inputs into something usable. AI doesn't magically shortcut any of that.

But the bigger one is private data. And I don't just mean training data for models. I mean data that's precious to your *users*, the kind they want to take with them wherever they go. If you're the one providing the infrastructure to collect, own, and carry that data, that's a relationship people don't walk away from easily. The data itself is the moat, but so is the system around it: the collection, the processing, the trust that you'll keep it safe and accessible.

Now, synthetic data generation keeps getting better, and I don't want to pretend that's irrelevant. But I think the "synthetic data will erode all data moats" take is overblown. Private data collected from real users in real contexts is messy, specific, and full of signal that synthetic datasets just can't replicate. (I guess I should hedge everything these days, but on this one I'm more confident than not.)

## Revisiting is the new default

Nobody's talking about this enough.

The idea that you could architect something today and have it be best practice for the next ten years? *Completely* outdated. If you try to do that now, you'll be running behind outrageously within a year. The tools change, the patterns change, the capabilities change. What was a sensible architecture decision six months ago might be holding you back today.

So you need to build flexibly, and you need to be okay with revisiting the whole thing a few months from now. Not just refactoring. Potentially rebuilding. Of course you need a stable foundation, of course you need to serve your users. But "build it right once" is no longer the play.

And that raises a question nobody's really answering yet: what do you keep stable and what do you treat as disposable? Your data layer, your APIs, your core contracts with users, those probably need to endure. But the business logic? The UI? The integration code? Maybe all of that should be written with the assumption that it gets thrown away and regenerated in six months.

That's a weird thing to tell engineering teams. We've spent decades building a culture around craftsmanship, clean code, durability. But while code has always been temporary, what's changed is that it's now *extremely* short-lived. It costs nearly nothing to rewrite, so it doesn't need to be perfect. It just needs to work. That's a hard pill for a lot of engineers, but I think it's closer to the truth than most people are comfortable admitting right now.

## Go-to-market becomes everything

If building costs drop (and they are, fast), the upfront technical spend that used to dominate early-stage budgets shrinks. Great. But it also means the thing that differentiates you isn't the code anymore.

It's the commercial side. Market capture. Audience. Distribution. Brand. All the stuff that a lot of technical founders (myself included, honestly) have historically treated as secondary to the product itself.

I'll be blunt about the uncomfortable implication here. If GTM is the primary differentiator and building costs trend toward zero, the logical endgame is that the best *marketers* win, regardless of product quality. That's a world where attention-hacking matters more than craftsmanship. I don't love that conclusion, but I think it's where things are heading. At least for a while. Maybe it's time startups start offering marketers the same perks as engineers. Free oat milk, a meditation room, and a recruiter who won't stop calling them on LinkedIn.

## So yeah

Look, I'm not pretending I've figured this all out. I'm building again and making bets based on the above. Some of those bets will probably turn out to be wrong.

But if there's one thing I'm fairly confident about, it's that building software is no longer the hard part. And the corollary nobody wants to hear: neither is your code particularly precious anymore. What you build it *around* and how you get it to people matter way more than they used to.
