# gpx-story

Show a GPX track on an interactive map with an elevation profile, clickable photo
miniatures and text annotations along the track. Built for hike write-ups on a blog.

Zero build step: two files (`src/gpx-story.js` + `src/gpx-story.css`) on top of
[Leaflet](https://leafletjs.com). No other dependencies.

## Why not an existing library?

Researched Aug 2026 — nothing does the full combo as an embeddable library:

- **leaflet-elevation (Raruto)** — GPX + synced elevation chart, but no photos/annotations, GPL-3.0, heavy (d3).
- **leaflet-gpx (mpetazzoni)** — GPX parsing + track only, no chart. BSD-2, active.
- **gpx.studio / wanderer / TrailReplay** — full apps, not embeddable widgets.
- **Leaflet.Photo** — photo markers only, dormant since ~2014.
- MapLibre ecosystem: MapTiler's elevation profile control needs an API key; nothing key-free and standalone.

So: hand-rolled parsing + SVG chart (~450 lines), permissive license, tiny bundle.

## Usage

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="gpx-story.css">
<div id="story"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="gpx-story.js"></script>
<script>
GpxStory.create({
  target: '#story',
  gpx: 'route.gpx',              // or gpxString: '<gpx>...'
  photos: 'photos.json',         // or inline array, see below
  notes: [
    { lat: 46.3066, lon: 6.7705, title: 'High point', text: 'Lunch with a view.' },
  ],
  timeZone: 'Europe/Zurich',     // for photo timestamps in the lightbox
});
</script>
```

Photo entries: `{ lat, lon, thumb, full, caption?, time? }`. Photos are placed at
their own GPS position (from EXIF), snapped to the nearest track point for the
elevation-chart dot, and clustered into one marker when within `groupRadius`
(default 80 m) of each other. Photos farther than `offTrackMax` (default 500 m)
from the track are hidden (set `offTrackMax: null` to show everything).

Other options: `title`, `trackColor`, `tiles: { url, options }` (defaults to
OpenTopoMap), `chartHeight`.

`create()` resolves to `{ map, chart, stats, points, destroy() }`.

## Features

- Parses `<trkpt>` tracks and `<rtept>` routes, plus `<wpt>` waypoints (exposed via `GpxStory.parseGpx`)
- Stats bar: distance, elevation gain/loss (3 m hysteresis smoothing), min–max altitude
- SVG elevation profile with hover crosshair synced to a marker on the map
- Photo thumbnails as circular markers with count badges; click → lightbox with
  prev/next, keyboard navigation (←/→/Esc), caption + local time
- Text notes as small cards on the map, with orange dots on the profile (click pans the map)
- Blue dots on the profile mark photo groups (click opens the lightbox)

## Generating photo data (macOS)

Convert RAW/DNG to web sizes and extract GPS with no extra tools:

```sh
sips -s format jpeg -s formatOptions 75 -Z 1600 IMG.DNG --out full/IMG.jpg   # full
sips -s format jpeg -s formatOptions 70 -Z 320  IMG.DNG --out thumb/IMG.jpg  # thumb
mdls -name kMDItemLatitude -name kMDItemLongitude -name kMDItemContentCreationDate IMG.DNG
```

`demo/` contains a script-free worked example (Mont Chouffe, 16 Aug 2026):

```sh
python3 -m http.server 8734   # from the gpx-story/ root
open http://localhost:8734/demo/
```
