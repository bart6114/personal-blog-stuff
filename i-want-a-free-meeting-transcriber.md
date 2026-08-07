# i want a free meeting transcriber

I've gotten into the habit of recording most of my meetings.

Being able to go back to what was actually said has been a pretty serious productivity boost. Even more so now that a transcript isn't just something you search manually. I can throw it at an LLM, query it from a CLI, expose it through MCP, pull decisions into whatever I'm working on, etc.

Once you start doing that, meeting transcripts become pretty useful raw material.

Which also made me increasingly annoyed that meeting transcription is something I'm apparently supposed to keep paying for.

Models like Whisper and Parakeet are really, really good. They run locally. Computers are fast enough. The transcription part of this problem feels pretty solved.

I absolutely understand paying for the stuff around it. If I had a team, I'd happily pay for shared context, permissions, centralized meeting history, integrations and all the other things that make this useful across an organization.

But I'm mostly a one-person team these days.

I want the recording. I want the transcript. I want some notes. And I want the files.

Preferably boring files.

## I like files

I'm a big fan of the whole Markdown-ish, filesystem-first approach to software.

Give me a directory with a bunch of `.md` files and I'm happy. I can grep them. I can git them. I can sync them however I want. My coding agents can read them. If the application disappears tomorrow, the files are still there.

There is something comforting about software where the escape hatch is `cat meeting.md`.

I'd been using [anarlog](https://github.com/fastrepl/anarlog), the open source meeting notetaker from the Fastrepl people, for a while. It worked reasonably well, and thanks to them for building and open sourcing it in the first place.

At some point, anarlog moved its canonical meeting data into SQLite. SQLite is perfectly fine. I use SQLite. This isn't some principled anti-database crusade.

But during that migration I somehow lost the transcription and memos from one of my meetings. I eventually managed to finagle them out of a backup somewhere, but that was more excitement than I wanted from my meeting notes.

At the same time, the project was clearly growing beyond the simple local tool I originally wanted. Cloud sync, sharing and other commercial-ish features started appearing around it. Again, totally fair. There is probably a perfectly good business there, and I respect the hustle.

I'm just not really the customer for it.

So I forked it.

## free meeting transcriber

The result is, with all the creativity you'd expect from me, called [Free Meeting Transcriber](https://github.com/bart6114/free-meeting-transcriber).

It has a deliberately boring set of rules:

* macOS only
* transcription happens locally
* meetings live (mostly) as plain Markdown files on disk
* no accounts, telemetry, billing or upsells
* bring your own LLM if you want summaries or chat
* CLI and MCP access, because obviously I want my coding agents to be able to read my meetings

And it's free as in beer.

The name is partly there to keep future me honest. Putting a pricing page on something called Free Meeting Transcriber would be a tad embarrassing.

Fair warning though: this is software just for me. I'm scratching my own itch and I'm going to optimize it for how I work. If other people find it useful too, great.

## software for one

The part I find more interesting is that I probably wouldn't have done this before AI.

I needed a tool like this, but I didn't *need* it enough to spend weeks maintaining a fork of a reasonably large application. I would have sighed about the SQLite thing, accepted whatever commercial direction the original project took, and moved on with my life.

AI changes the economics of these stupid little personal annoyances quite a bit.

I can take a mature open source project, remove the parts I don't want, change how the storage works, add a CLI, wire up MCP and keep adapting it as my own workflow changes. The audience required to justify that work can literally be one person.

Me.

There's something fun about that.

We've spent a lot of time talking about AI making developers faster at building startups and products. I'm increasingly interested in the much less economically important version: AI making it viable to build software that never needs to become a product at all.

Software for one.

Tiny tools, weird forks, highly opinionated apps and side projects galore.

Most of them will never become companies. I think I'm fine with that.
