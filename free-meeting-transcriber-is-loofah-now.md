# Free Meeting Transcriber = a vault = Loofah

Twenty days ago I published [a post about a fork I had called Free Meeting Transcriber](https://barts.space/me-want-free-meeting-transcriber/). The repository was on version 0.8.1 at the time. Today it is called [Loofah](https://loofah.io), the latest release is 0.32.4, and yes, this got a little out of hand.

I wanted a meeting recorder that captures my microphone and system audio without sending a bot into the call, transcribes locally on my Mac, and leaves me with files I own. No account, subscription, telemetry or cloud backend. If I want an LLM to turn the transcript into something useful, I bring my own.

## the meeting transcriber became a vault

My vault now contains every note I have taken since 2011, along with meeting transcripts, standalone notes, project context, attachments, research and material created by agents. A session can start with a recording, an imported transcript, something I type, or Markdown an agent writes through the CLI.

Free Meeting Transcriber stopped being a particularly good description somewhere along the way. So: Loofah.

The files remain the point. Notes live as `notes.md`, with metadata and transcripts stored beside them as JSON. There is no database hiding underneath as the real source of truth. Session folders have readable names, files I add myself are left alone, and the whole vault can live in whatever local or synced folder I choose (I use GDrive).

I can open it in Finder, grep it, back it up, point another tool at it, or move on without exporting my own notes from somebody else's service first. Still comforting.

## what actually got added

The CLI was read-only when I wrote the first post. It can now also create and edit notes, import and transcribe recordings, add tags and attachments, and keep track of which agent and skill produced something.

Hermes has full access to Loofah through the [`loof` CLI](https://loofah.io/agents/cli/) in my setup. It uses that access to inject selected research briefs into the vault, as Markdown in standalone sessions that record the agent and skill that produced them. It can also search and retrieve notes, summaries and transcripts whenever it needs context from my knowledge vault. The research happens elsewhere. Loofah is simply the persistent knowledge layer.

The MCP interface stays read-only on purpose. Agents using that route can search and retrieve context without getting permission to quietly rearrange the vault behind my back.

Loofah also gained full-text search across notes, summaries and transcripts, on-device speaker detection, nested tags, better handling of pasted images, multiple vaults, and a fair amount of work to keep thousands of notes fast. Long transcripts no longer make the app sit there contemplating its life when I click on them, which is nice (i.e. it was slooow). The [release notes](https://loofah.io/changelog/) have the less abbreviated version.

There are some boring grown-up bits now too. The Mac build is signed and notarized. There is a [documentation site](https://loofah.io), a proper changelog, and a one-line installer for the `loof` CLI on macOS and Linux. The desktop app is still for Apple Silicon Macs. I am scratching my own itch, and apparently my itch owns a Mac.

Loofah is still built on [anarlog](https://github.com/fastrepl/anarlog). I did not produce a mature desktop application from a blank directory in twenty days. I took a good open source project, forked it, removed the parts that didn't fit, and have been reshaping it around how I work. AI made that realistic for one person. The foundation made it possible at all.

## software for one, with a download button

The previous post ended on the idea of software for one. I still like that framing, although it might sound a bit odd now that the project has a name, docs, releases and a public download button.

Software for one doesn't mean nobody else can use it. It means I don't need a market large enough to justify building it. I needed this thing, so the audience already cleared the minimum threshold of one. If your preferences happen to overlap with mine, great. The app is free, the source is [on GitHub](https://github.com/bart6114/loofah), and it is MIT licensed.

There is no company behind it and no commercial plan waiting offstage. I don't know where the project goes from here, other than that I will keep adapting it as my own work changes.

For now, Loofah records my meetings, holds a good chunk of my working memory, and gives my agents a useful pile of local context without putting another SaaS in the middle.

Software for one. There just happens to be a download button now.
