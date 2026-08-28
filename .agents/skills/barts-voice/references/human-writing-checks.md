# Human-writing checks

Use this after the argument and facts are stable. It adapts several public Humanizer skills for Bart's voice; source revisions are recorded below.

The tool is diagnostic, not an oracle. Its analyzer scored the genuine Fishy Operations corpus at 40/100, mostly because technical uses of words such as `robust` overlap with its AI-vocabulary list. Context and density matter more than a single flagged word.

## High-value pass

Look for these patterns and fix only the ones that are actually present:

1. **Importance without evidence.** Remove claims about significance, transformation, legacy, or a wider trend unless the piece proves them. State the local fact.
2. **Promotional fog.** Replace words such as `seamless`, `game-changing`, or `powerful` with the behavior, result, or constraint that earns the description.
3. **Generic setup.** Cut openings that could introduce hundreds of posts. Begin at the event, thing, or frustration.
4. **Narrated continuity and sincerity.** Cut sentences such as `That part hasn't changed`, `This still matters`, or `That remains the point` when they only label the preceding thought. Remove stage directions such as `One concrete example:`, `The idea is simple`, and `I want to be clear` when the next sentence can simply demonstrate the example, simplicity, or sincerity. Keep a callback only when it returns to a concrete detail or changes how the reader understands it.
5. **Vague attribution.** Name the person, source, issue, or observable behavior behind `people say` and `critics argue`. Otherwise remove it.
6. **Formulaic adversity.** Rewrite “despite these challenges” sections around the actual problem and response.
7. **Balanced-looking rhetoric.** Break repeated “not only X but also Y,” “not X, but Y,” three-item slogans, and false ranges when they exist for cadence rather than meaning.
8. **Synonym cycling.** Use the same precise noun again instead of rotating through project, platform, solution, and ecosystem.
9. **Mechanical rhythm.** Vary sentence and paragraph lengths according to the thought. Combine choppy runs; split polished sentences carrying three equal clauses.
10. **The treadmill.** Ask what each sentence adds. Delete local recaps, paraphrases, and `in other words` passages that circle an idea instead of advancing it.
11. **Interchangeable paragraphs.** If two body paragraphs can swap places without changing the argument, they may be parallel mini-theses rather than a progression. Connect, merge, reorder, or cut them.
12. **Heading echoes.** When the first sentence below a heading merely restates the heading, delete it or replace it with the first concrete fact.
13. **Excess structure.** Remove headings, bold labels, and lists that merely decorate a short argument.
14. **Filler and hedging.** Change `in order to` to `to`; replace a pile of qualifiers with one accurate boundary.
15. **Manufactured landings.** Check one-line paragraph closers and section-ending zingers that could be pasted into another post. Keep a punchy line when it adds a specific joke, fact, or piece of Bart's perspective; otherwise end on the concrete sentence before it.
16. **Generic conclusion.** Delete the recap, prediction, or inspirational final sentence if the useful ending already happened.
17. **Chatbot residue.** Remove references to the request, knowledge limits, helpfulness, or an offer to do more.

## Bart-specific exceptions

- Do not ban a word merely because a detector lists it. Technical precision wins.
- Parentheses are natural in the corpus, but should carry a real aside rather than simulated spontaneity.
- A three-item list is fine when there are exactly three concrete items. Avoid the rhetorical habit, not the number.
- A direct question can move a tutorial forward. Avoid questions whose only job is manufactured engagement.
- Repetition can be clearer than variation, especially for product and API names.
- Preserve intentional roughness, detours, and uneven paragraph shapes when they carry Bart's voice. Humanizing is not the same as making every paragraph equally tidy.
- Content-bearing callbacks and earned punchlines are allowed. The test is whether they add something specific, not whether they are short.

## Read-aloud test

Read the opening, the longest paragraph, and the ending aloud. Revise anything that sounds like:

- a keynote about a minor update;
- a press release written by nobody in particular;
- a complete and balanced answer instead of Bart thinking in public;
- a deliberate attempt to “sound human.”

The finished text should feel specific enough that another competent writer could not have produced it by swapping the nouns.

## Source revisions

Reviewed on 2026-08-28:

- `brandonwise/humanizer` at `4b9b9bee384aea139f599133d2de1e1ceaee71a3`;
- `harshaneel/humanize` at `4ec797314537ec9c2105f276d4561d240a0390ba`;
- `ryanmaule/humanize` at `4a8bbcf74984dad5bdad10177afe766e32bc7633`;
- `shir-danishyar/humanize` at `454179265115bea6c2eeb96e6b4191fa8873c4b1`;
- `milock/humanizer` at `d8345bf85788dab162e703ff9a14961baacdbe7d`;
- `Aboudjem/humanizer-skill` at `17bb5bbd74d4d7c5f3e5e7a93e1b97597eab3cf8`.
