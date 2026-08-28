# Human-writing checks

Use this after the argument and facts are stable. It adapts the Humanizer project at `brandonwise/humanizer`, commit `4b9b9bee384aea139f599133d2de1e1ceaee71a3` (2026-08-09), for Bart's voice.

The tool is diagnostic, not an oracle. Its analyzer scored the genuine Fishy Operations corpus at 40/100, mostly because technical uses of words such as `robust` overlap with its AI-vocabulary list. Context and density matter more than a single flagged word.

## High-value pass

Look for these patterns and fix only the ones that are actually present:

1. **Importance without evidence.** Remove claims about significance, transformation, legacy, or a wider trend unless the piece proves them. State the local fact.
2. **Promotional fog.** Replace words such as `seamless`, `game-changing`, or `powerful` with the behavior, result, or constraint that earns the description.
3. **Generic setup.** Cut openings that could introduce hundreds of posts. Begin at the event, thing, or frustration.
4. **Vague attribution.** Name the person, source, issue, or observable behavior behind `people say` and `critics argue`. Otherwise remove it.
5. **Formulaic adversity.** Rewrite “despite these challenges” sections around the actual problem and response.
6. **Balanced-looking rhetoric.** Break repeated “not only X but also Y,” “not X, but Y,” three-item slogans, and false ranges when they exist for cadence rather than meaning.
7. **Synonym cycling.** Use the same precise noun again instead of rotating through project, platform, solution, and ecosystem.
8. **Mechanical rhythm.** Vary sentence and paragraph lengths according to the thought. Combine choppy runs; split polished sentences carrying three equal clauses.
9. **Excess structure.** Remove headings, bold labels, and lists that merely decorate a short argument.
10. **Filler and hedging.** Change `in order to` to `to`; replace a pile of qualifiers with one accurate boundary.
11. **Generic conclusion.** Delete the recap, prediction, or inspirational final sentence if the useful ending already happened.
12. **Chatbot residue.** Remove references to the request, knowledge limits, helpfulness, or an offer to do more.

## Bart-specific exceptions

- Do not ban a word merely because a detector lists it. Technical precision wins.
- Parentheses are natural in the corpus, but should carry a real aside rather than simulated spontaneity.
- A three-item list is fine when there are exactly three concrete items. Avoid the rhetorical habit, not the number.
- A direct question can move a tutorial forward. Avoid questions whose only job is manufactured engagement.
- Repetition can be clearer than variation, especially for product and API names.

## Read-aloud test

Read the opening, the longest paragraph, and the ending aloud. Revise anything that sounds like:

- a keynote about a minor update;
- a press release written by nobody in particular;
- a complete and balanced answer instead of Bart thinking in public;
- a deliberate attempt to “sound human.”

The finished text should feel specific enough that another competent writer could not have produced it by swapping the nouns.
