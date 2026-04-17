# Robust was what we could afford

I was re-reading Taleb's [*Antifragile*](https://www.amazon.com/Antifragile-Things-That-Disorder-Incerto/dp/0812979680) last weekend, and it gave me a name for a tradeoff I've been making in code without one: robust vs antifragile. I think AI coding just tipped the balance away from robust, and most of us haven't updated our instincts yet.

Quick recap for anyone who hasn't read Antifragile (or been cornered by someone who has). He splits systems into three types. Fragile things break under stress. Robust things don't break, but they don't improve either. Antifragile things actually get *better* when you stress them. Muscles and immune systems work this way, and so does a good postmortem culture (if you've got one).

Then there's extremistan vs mediocristan. Mediocristan is where errors average out. Things like height or marathon times. Add one more sample and the mean barely moves. Extremistan is where one outlier eats everything. Wealth distribution is the canonical example, and book sales work the same way. If Jeff Bezos walks into a bar, the average net worth of everyone in that bar is now completely meaningless.

Hold on to both of those for a minute.

## The old regime

For most of my career, the binding constraint in software engineering was developer time. You couldn't rewrite that module, because nobody had three weeks to do it cleanly. You couldn't experiment with four architectures, because you'd only have time to build one. So the rational response was robustness. Build it once, build it to last, because you're not getting another shot at it.

The whole set of "good engineering" instincts we all absorbed flows from this. Defensive programming, long-lived abstractions, big up-front design, careful extension points because you know you'll never get to rewrite. Get the interfaces right, because they'll outlive you.

None of this was wrong. It was just the optimal strategy under a specific constraint.

Taleb would probably point out that robustness-as-default is actually an *extremistan* bet. You make one big upfront investment and you hope it survives everything the future throws at it. One design, one shot, absorb all the variance. When the world happens to stay close to what you anticipated, it pays off beautifully. When the world moves, you get a legacy codebase and a rewrite project nobody wants to own.

We kinda knew this. That's why every senior engineer eventually writes a blog post about YAGNI, or about how the most battle-tested system they ever built started out as a dumb script that nobody wanted to touch.

## The constraint moved

Agents change the math. I'm not going to rehash the "AI is so productive" argument because everyone's bored of it by now. The specific thing I care about is this: the cost of *replacing* a chunk of code has collapsed. Writing new code was already getting cheaper for years. What changed is how cheap it is to rip something out and redo it next Tuesday.

Simon Willison called this "writing code is cheap now." Steve Yegge went further and said software is basically throwaway, less than a year of shelf life, stop trying to preserve things. That second framing is where I want to push back a little.

Antifragile systems need a feedback loop. Cheap rewrites without one are just fast fragility. Feels fine until it doesn't.

The actual antifragile move is to let stressors (bugs, incidents, requirement changes, a PM showing up on Slack on a Wednesday) feed back into sharper tests, tighter specs, cleaner interfaces. Then you use the cheap regeneration to act on that feedback. The *code* can be ephemeral. The learning has to compound somewhere.

So the durable artifacts shift. Your tests and specs carry the weight, and so do the interface contracts between modules. The implementation underneath them is allowed to be a bit crap, because it's going to get replaced anyway, and the replacement will be informed by whatever the last version taught you.

This is the mediocristan version of engineering. Many small components, each only OK on its own, but with a feedback loop that compounds across rewrites. Errors average out because you get many swings. No single swing has to be perfect, because no single swing is the whole system.

Compare that to the old model, which was: swing once, hard, and hope.

## Where this breaks

I don't want to oversell it. There are a few real limits.

The data layer is not antifragile. Your schema migrations, your production database, your user records, those are one-way doors in Amazon's sense. You don't get to "just rewrite" them. The antifragile posture belongs to the code *around* durable state, not the state itself.

Cross-service contracts and public APIs have the same property. Once something else depends on you, your freedom to rewrite collapses. Those edges deserve real robustness, up-front design, all the stuff we learned in the old regime.

Same thing with security boundaries. "It's fine, we'll just rewrite it if there's a bug" is not a sentence you want showing up in an incident report.

And there's the honest criticism that AI-generated code is often more fragile at the component level. You get inconsistent patterns, APIs that don't actually exist, subtle bugs nobody notices until they do. I think that's fine *if* the system around it (tests, specs, monitoring) captures the signal when things go wrong. It's not fine if the feedback loop is missing, because then you just have fragile code getting regenerated into more fragile code, faster.

Basically: don't be antifragile about the things that can't recover. Be antifragile about the things that can.

## What I'm doing differently

Mostly I'm spending more time on tests and specs and less time on internal abstractions. I let modules be uglier than I would've tolerated two years ago, because I know I'll regenerate them three times before they settle. I'm more willing to delete. I treat the interface between two pieces of code as more important than either piece.

I don't have a clean theory of this yet. Some of what I just wrote will look naive in a year, probably. But the shape of the tradeoff feels real to me. Robust was the right answer when rewriting was expensive. It's the wrong answer when it isn't, and "antifragile" is the closest name I've got for what it should be replaced with.

Cheers.
