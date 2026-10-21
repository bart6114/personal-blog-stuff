# Route articles

Route stories are ordinary `content/blog/*.md` posts. The optional `route`
frontmatter renders a reusable map. Place `<!-- route -->` on its own line in the
article to choose where the route section appears; text and callouts before that
marker appear above the map. Without a marker, the map precedes the body.
`draft: true` keeps the post out
of production routes, lists, feeds, and sitemap; preview with `npm run dev:drafts`
from `src/` using Node 24. Assets under `public/` are public even for draft posts.

See `content/blog/arete-du-mont-chauffe.md` for the first example. It is an English
article based on `gpx-story/transcript-mont-chauffe.md`, not a verified route
guide. The Pas du Chien and wrong turns have no point assigned: their exact
positions are not established by the transcript. Five points use the
unmodified GPS entries for IMG_7711, IMG_7714, IMG_7725, IMG_7730 and IMG_7747
in the prototype's photos.json. The added technical views are IMG_7725 and
IMG_7730. A sixth point uses IMG_7734, identified by Bart as the descent rope
where he went wrong, from his Google Photos link ending
`AF1QipOzk1rGdTHkyVhqlLZ-1FmNO7Fa8sIlgcTQaGE-`. Google Photos confirms the
filename IMG_7734.DNG and capture time 16 August 2026, 11:02 GMT+02:00.
Its original GPS (46.2890944, 6.7492333) is inaccurate; the map uses the
prototype's interpolated position (46.308619, 6.758111), visibly labelled
approximate. Bart clarified that he started down this descent by mistake;
the article distinguishes that from continuing the whole descent. IMG_7735 is shown inline but not used as an anchor because its GPS
entry was interpolated by the prototype's stale-fix correction script.

Bart ruled out IMG_7717 as the Pas du Chien. Bart also ruled out IMG_7725 and IMG_7726 as the Pas du Chien. OSM node 5732088545 places the
pass at 46.3061116, 6.7514884; IMG_7725's recorded location is about 81 m away,
IMG_7726's about 165 m. Proximity is not proof of the subject in a photograph.
IMG_7727 and IMG_7728 were shot two seconds apart but their positions differ
by about 290 m: even uncorrected photo GPS is not necessarily accurate.
Reference photos were inspected in the 2025 trip report at
https://www.plaisirdescimes.com/2025/08/mont-chauffe-traversee-des-aretes.html;
none of those third-party images have been copied into the article.

The supplied GPX contains route points (`rtept`), with elevations but no timestamps.
It cannot align photos by capture time or establish that Bart's wrong turns are
included. The article therefore calls it a route, not a recorded activity track.

## Add a route

1. Add the GPX and selected photos to `src/public/media/<route>/`.
2. Add `route: {title, gpx, points}` to the article frontmatter. Each point has a
   unique `id`, `title`, numeric `lat`/`lon`, a `section` anchor in the article,
   and `source` describing the coordinate evidence. Order controls numbering.
3. Add an explicit heading anchor, e.g. `<h2 id="ridge">On the ridge</h2>`.
4. Link from any paragraph or caption with `[View on route ↗ 1](#route-point-ridge)`
   where `ridge` is the point ID. Multiple references can use the same point.
5. Use ordinary images/figures. Images under `/media/` get the existing Astro
   responsive optimization. Article text, images and links work without JS.

The map is collapsed on mobile and opens on demand; desktop opens automatically.
Selecting an article reference opens and focuses the numbered point. Map popups
link back to the associated heading; the elevation profile also selects points.
Without JS, route references go to the numbered index and its links to the text.
Missing tiles do not prevent the GPX line or points from rendering. GPX failures
leave the download and text navigation available; reopen the panel to retry.

Leaflet is bundled locally and loaded on demand. OpenStreetMap supplies attributed
background tiles. No CDN scripts or API keys are required. Only route articles
render the route block. `route-geometry.js` adapts the parser, statistics and SVG
profile from the separate `gpx-story` prototype; the prototype stays independent.
GPX distances and elevation totals are estimates, with the prototype's 3 m
hysteresis for elevation change. Do not silently remove detours when importing a recorded track.

Before publication, review the prose, photo captions and point placement. Set
`draft: false` and a publication date only when the article is ready. Run
`npm run build` and `npm run verify:content`; check a draft preview on desktop and
mobile, including text → map → text, keyboard use and network failure.

The opening overview and social preview use IMG_7710, confirmed by Bart as the
full ridge via his Google Photos link ending
`AF1QipMoBVCx_xwAnfAOCc_VUW6NL_SyZlf77NYbW72F`. Google Photos identifies
IMG_7710.DNG, 16 August 2026 at 08:33 GMT+02:00. It is an establishing view from
below, outside the GPX route, so it has no numbered on-route marker.
