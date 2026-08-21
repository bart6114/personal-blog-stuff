/*!
 * gpx-story — show a GPX track on a map with an elevation profile,
 * clickable photo miniatures and text annotations along the track.
 *
 * Depends on Leaflet (https://leafletjs.com), loaded globally as `L`.
 *
 * Usage:
 *   GpxStory.create({
 *     target: '#story',                 // element or selector
 *     gpx: 'route.gpx',                 // url, or a raw GPX string via { gpxString }
 *     photos: [{ lat, lon, thumb, full, caption?, time? }, ...] | 'photos.json',
 *     notes:  [{ lat, lon, text, title? }, ...],
 *     tiles:  { url, options },         // optional Leaflet tile layer config
 *     trackColor: '#e8590c',
 *     offTrackMax: 500,                 // hide photos/notes farther than this (m) from the track; null = show all
 *     groupRadius: 80,                  // cluster photos within this many meters into one marker
 *   })
 */
(function (global) {
  'use strict';

  // ---------- geometry ----------

  const R = 6371000;
  function haversine(a, b) {
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // ---------- gpx parsing ----------

  function parseGpx(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('gpx-story: could not parse GPX');

    let ptEls = doc.querySelectorAll('trkpt');
    if (!ptEls.length) ptEls = doc.querySelectorAll('rtept');

    const points = [];
    let dist = 0;
    ptEls.forEach(el => {
      const p = {
        lat: parseFloat(el.getAttribute('lat')),
        lon: parseFloat(el.getAttribute('lon')),
        ele: parseFloat(el.querySelector('ele')?.textContent ?? 'NaN'),
      };
      if (points.length) dist += haversine(points[points.length - 1], p);
      p.dist = dist;
      points.push(p);
    });

    const waypoints = [...doc.querySelectorAll('wpt')].map(el => ({
      lat: parseFloat(el.getAttribute('lat')),
      lon: parseFloat(el.getAttribute('lon')),
      name: el.querySelector('name')?.textContent || '',
      type: el.querySelector('type')?.textContent || '',
    }));

    const name = doc.querySelector('metadata > name, trk > name, rte > name')?.textContent || '';
    return { points, waypoints, name };
  }

  function trackStats(points) {
    let gain = 0, loss = 0, min = Infinity, max = -Infinity;
    // hysteresis smoothing so GPS noise doesn't inflate the numbers
    const TH = 3;
    let ref = points[0]?.ele ?? 0;
    for (const p of points) {
      if (!isFinite(p.ele)) continue;
      if (p.ele < min) min = p.ele;
      if (p.ele > max) max = p.ele;
      const d = p.ele - ref;
      if (d >= TH) { gain += d; ref = p.ele; }
      else if (d <= -TH) { loss -= d; ref = p.ele; }
    }
    return { distance: points[points.length - 1]?.dist ?? 0, gain, loss, min, max };
  }

  // nearest track point to a lat/lon (linear scan is fine at GPX sizes)
  function snapToTrack(points, ll) {
    let best = null, bestD = Infinity;
    for (const p of points) {
      const d = haversine(p, ll);
      if (d < bestD) { bestD = d; best = p; }
    }
    return { point: best, offset: bestD };
  }

  // ---------- elevation chart (plain SVG) ----------

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function niceStep(range, maxTicks) {
    const raw = range / maxTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 5, 10]) if (raw <= m * mag) return m * mag;
    return 10 * mag;
  }

  class ElevationChart {
    constructor(container, points, opts) {
      this.container = container;
      this.points = points.filter(p => isFinite(p.ele));
      this.opts = opts;
      this.markers = [];           // {dist, ele, kind: 'photo'|'note', payload}
      this.onHover = null;         // (point|null) => void
      this.onMarkerClick = null;   // (marker) => void
      this.pad = { l: 44, r: 12, t: 14, b: 22 };
      this.height = opts.chartHeight || 170;
      this._resize = () => this.render();
      new ResizeObserver(this._resize).observe(container);
    }

    addMarker(m) { this.markers.push(m); }

    _scales(w) {
      const pts = this.points;
      const maxDist = pts[pts.length - 1].dist;
      let minE = Infinity, maxE = -Infinity;
      for (const p of pts) { if (p.ele < minE) minE = p.ele; if (p.ele > maxE) maxE = p.ele; }
      const padE = (maxE - minE) * 0.08 || 10;
      minE -= padE; maxE += padE;
      const { l, r, t, b } = this.pad;
      const x = d => l + (d / maxDist) * (w - l - r);
      const y = e => t + (1 - (e - minE) / (maxE - minE)) * (this.height - t - b);
      return { x, y, maxDist, minE, maxE };
    }

    render() {
      const w = this.container.clientWidth;
      if (!w || this.points.length < 2) return;
      this.container.innerHTML = '';
      const { x, y, maxDist, minE, maxE } = this._scales(w);
      this._sc = { x, y, maxDist };
      const h = this.height;
      const svg = svgEl('svg', { width: w, height: h, class: 'gpxs-chart-svg' });

      // horizontal gridlines + elevation labels
      const eStep = niceStep(maxE - minE, 4);
      for (let e = Math.ceil(minE / eStep) * eStep; e <= maxE; e += eStep) {
        svg.appendChild(svgEl('line', { x1: this.pad.l, x2: w - this.pad.r, y1: y(e), y2: y(e), class: 'gpxs-grid' }));
        const lbl = svgEl('text', { x: this.pad.l - 6, y: y(e) + 3.5, class: 'gpxs-tick gpxs-tick-y' });
        lbl.textContent = Math.round(e) + ' m';
        svg.appendChild(lbl);
      }
      // distance ticks
      const dStep = niceStep(maxDist / 1000, 6) * 1000;
      for (let d = 0; d <= maxDist; d += dStep) {
        const lbl = svgEl('text', { x: x(d), y: h - 6, class: 'gpxs-tick gpxs-tick-x' });
        lbl.textContent = (d / 1000) + ' km';
        svg.appendChild(lbl);
      }

      // area + line
      let line = '', area = `M ${x(0)} ${y(this.points[0].ele)}`;
      for (const p of this.points) {
        const seg = `${x(p.dist).toFixed(1)} ${y(p.ele).toFixed(1)}`;
        line += (line ? ' L ' : 'M ') + seg;
        area += ' L ' + seg;
      }
      area += ` L ${x(maxDist)} ${h - this.pad.b} L ${x(0)} ${h - this.pad.b} Z`;
      svg.appendChild(svgEl('path', { d: area, class: 'gpxs-area' }));
      svg.appendChild(svgEl('path', { d: line, class: 'gpxs-line' }));

      // markers (photos / notes) on the profile
      for (const m of this.markers) {
        const g = svgEl('g', { class: 'gpxs-chart-marker gpxs-chart-marker-' + m.kind });
        const cx = x(m.dist), cy = y(m.ele);
        g.appendChild(svgEl('line', { x1: cx, x2: cx, y1: cy, y2: cy - 8, class: 'gpxs-marker-stem' }));
        g.appendChild(svgEl('circle', { cx, cy: cy - 11, r: 4.5 }));
        g.addEventListener('click', ev => { ev.stopPropagation(); this.onMarkerClick && this.onMarkerClick(m); });
        svg.appendChild(g);
      }

      // hover crosshair
      const cross = svgEl('g', { class: 'gpxs-cross', visibility: 'hidden' });
      const crossLine = svgEl('line', { y1: this.pad.t, y2: h - this.pad.b, class: 'gpxs-cross-line' });
      const crossDot = svgEl('circle', { r: 4, class: 'gpxs-cross-dot' });
      const crossLbl = svgEl('text', { class: 'gpxs-cross-label', 'text-anchor': 'middle' });
      cross.append(crossLine, crossDot, crossLbl);
      svg.appendChild(cross);

      svg.addEventListener('pointermove', ev => {
        const rect = svg.getBoundingClientRect();
        const d = ((ev.clientX - rect.left) - this.pad.l) / (w - this.pad.l - this.pad.r) * maxDist;
        const p = this._nearestByDist(Math.max(0, Math.min(maxDist, d)));
        cross.setAttribute('visibility', 'visible');
        crossLine.setAttribute('x1', x(p.dist)); crossLine.setAttribute('x2', x(p.dist));
        crossDot.setAttribute('cx', x(p.dist)); crossDot.setAttribute('cy', y(p.ele));
        crossLbl.textContent = `${(p.dist / 1000).toFixed(1)} km · ${Math.round(p.ele)} m`;
        const lx = Math.max(this.pad.l + 40, Math.min(w - this.pad.r - 40, x(p.dist)));
        crossLbl.setAttribute('x', lx); crossLbl.setAttribute('y', this.pad.t - 2);
        this.onHover && this.onHover(p);
      });
      svg.addEventListener('pointerleave', () => {
        cross.setAttribute('visibility', 'hidden');
        this.onHover && this.onHover(null);
      });

      this.container.appendChild(svg);
    }

    _nearestByDist(d) {
      // binary search over monotonically increasing dist
      const pts = this.points;
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        (pts[mid].dist < d) ? lo = mid : hi = mid;
      }
      return (d - pts[lo].dist < pts[hi].dist - d) ? pts[lo] : pts[hi];
    }
  }

  // ---------- lightbox ----------

  class Lightbox {
    constructor() {
      this.el = document.createElement('div');
      this.el.className = 'gpxs-lightbox';
      this.el.innerHTML =
        '<button class="gpxs-lb-close" aria-label="Close">&times;</button>' +
        '<button class="gpxs-lb-prev" aria-label="Previous">&#8249;</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button class="gpxs-lb-next" aria-label="Next">&#8250;</button>';
      document.body.appendChild(this.el);
      this.img = this.el.querySelector('img');
      this.caption = this.el.querySelector('figcaption');
      this.items = []; this.idx = 0;

      this.el.querySelector('.gpxs-lb-close').addEventListener('click', () => this.close());
      this.el.querySelector('.gpxs-lb-prev').addEventListener('click', e => { e.stopPropagation(); this.show(this.idx - 1); });
      this.el.querySelector('.gpxs-lb-next').addEventListener('click', e => { e.stopPropagation(); this.show(this.idx + 1); });
      this.el.addEventListener('click', e => { if (e.target === this.el) this.close(); });
      this._onKey = e => {
        if (!this.el.classList.contains('gpxs-open')) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.show(this.idx - 1);
        if (e.key === 'ArrowRight') this.show(this.idx + 1);
      };
      document.addEventListener('keydown', this._onKey);
    }

    open(items, idx) {
      this.items = items;
      this.el.classList.add('gpxs-open');
      this.show(idx || 0);
    }

    show(idx) {
      if (!this.items.length) return;
      this.idx = (idx + this.items.length) % this.items.length;
      const it = this.items[this.idx];
      this.img.src = it.full;
      const parts = [];
      if (it.caption) parts.push(it.caption);
      if (it.timeLabel) parts.push(it.timeLabel);
      if (this.items.length > 1) parts.push(`${this.idx + 1}/${this.items.length}`);
      this.caption.textContent = parts.join('  ·  ');
    }

    close() { this.el.classList.remove('gpxs-open'); this.img.src = ''; }
    destroy() { document.removeEventListener('keydown', this._onKey); this.el.remove(); }
  }

  // ---------- main ----------

  const DEFAULT_TILES = {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      attribution: 'map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        'tiles © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    },
  };

  async function create(opts) {
    const root = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
    if (!root) throw new Error('gpx-story: target not found');
    const trackColor = opts.trackColor || '#e8590c';
    const offTrackMax = opts.offTrackMax === undefined ? 500 : opts.offTrackMax;
    const groupRadius = opts.groupRadius === undefined ? 80 : opts.groupRadius;

    // load data
    const gpxText = opts.gpxString || await (await fetch(opts.gpx)).text();
    let photos = opts.photos || [];
    if (typeof photos === 'string') photos = await (await fetch(photos)).json();
    const notes = opts.notes || [];

    const { points, name } = parseGpx(gpxText);
    if (points.length < 2) throw new Error('gpx-story: no track/route points in GPX');
    const stats = trackStats(points);

    // scaffold
    root.classList.add('gpxs');
    root.innerHTML =
      '<div class="gpxs-header"><span class="gpxs-title"></span><span class="gpxs-stats"></span></div>' +
      '<div class="gpxs-map"></div><div class="gpxs-chart"></div>';
    root.querySelector('.gpxs-title').textContent = opts.title || name;
    root.querySelector('.gpxs-stats').textContent =
      `${(stats.distance / 1000).toFixed(1)} km · ↑ ${Math.round(stats.gain)} m · ↓ ${Math.round(stats.loss)} m` +
      ` · ${Math.round(stats.min)}–${Math.round(stats.max)} m`;

    // map + track
    const map = L.map(root.querySelector('.gpxs-map'), { scrollWheelZoom: false });
    const tiles = opts.tiles || DEFAULT_TILES;
    L.tileLayer(tiles.url, tiles.options).addTo(map);

    // optional Waymarked Trails overlay: marked hiking/alpine routes
    let trailLayer = null;
    if (opts.trailOverlay) {
      trailLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        maxZoom: 18, opacity: 0.75,
        attribution: 'trails © <a href="https://hiking.waymarkedtrails.org">Waymarked Trails</a> (CC-BY-SA)',
      }).addTo(map);
    }
    const latlngs = points.map(p => [p.lat, p.lon]);
    L.polyline(latlngs, { color: '#fff', weight: 7, opacity: 0.8 }).addTo(map);
    const line = L.polyline(latlngs, { color: trackColor, weight: 3.5 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [30, 30] });

    L.circleMarker(latlngs[0], { radius: 6, color: '#fff', weight: 2, fillColor: '#2f9e44', fillOpacity: 1 })
      .addTo(map).bindTooltip('Start');
    L.circleMarker(latlngs[latlngs.length - 1], { radius: 6, color: '#fff', weight: 2, fillColor: '#e03131', fillOpacity: 1 })
      .addTo(map).bindTooltip('Finish');

    // chart
    const chart = new ElevationChart(root.querySelector('.gpxs-chart'), points, opts);
    const hoverDot = L.circleMarker(latlngs[0], {
      radius: 7, color: '#fff', weight: 2, fillColor: trackColor, fillOpacity: 1, interactive: false,
    });
    chart.onHover = p => {
      if (p) { hoverDot.setLatLng([p.lat, p.lon]); if (!map.hasLayer(hoverDot)) hoverDot.addTo(map); }
      else if (map.hasLayer(hoverDot)) map.removeLayer(hoverDot);
    };

    const lightbox = new Lightbox();

    // layers so photos / notes can be toggled off to inspect the bare trace
    const photoLayer = L.layerGroup().addTo(map);
    const noteLayer = L.layerGroup().addTo(map);

    // photos: snap to track, drop far-away ones, cluster the rest
    const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', timeZone: opts.timeZone });
    const snapped = [];
    for (const ph of photos) {
      const { point, offset } = snapToTrack(points, ph);
      if (offTrackMax != null && offset > offTrackMax) continue;
      snapped.push({ ...ph, snap: point, timeLabel: ph.time ? timeFmt.format(new Date(ph.time)) : null });
    }
    snapped.sort((a, b) => a.snap.dist - b.snap.dist);

    const groups = [];
    for (const ph of snapped) {
      const g = groups[groups.length - 1];
      if (g && haversine(g.anchor, ph) < groupRadius) g.items.push(ph);
      else groups.push({ anchor: { lat: ph.lat, lon: ph.lon }, snap: ph.snap, items: [ph] });
    }

    for (const g of groups) {
      const badge = g.items.length > 1 ? `<span class="gpxs-photo-count">${g.items.length}</span>` : '';
      const icon = L.divIcon({
        className: 'gpxs-photo-icon',
        html: `<div class="gpxs-photo-thumb"><img src="${g.items[0].thumb}" alt=""></div>${badge}`,
        iconSize: [52, 52], iconAnchor: [26, 26],
      });
      L.marker([g.anchor.lat, g.anchor.lon], { icon, riseOnHover: true })
        .addTo(photoLayer)
        .on('click', () => lightbox.open(g.items, 0));
      chart.addMarker({ dist: g.snap.dist, ele: g.snap.ele, kind: 'photo', payload: g });
    }

    // text notes
    for (const n of notes) {
      const { point, offset } = snapToTrack(points, n);
      const icon = L.divIcon({
        className: 'gpxs-note-icon',
        html: `<div class="gpxs-note">${n.title ? `<strong>${n.title}</strong>` : ''}<span>${n.text}</span></div>`,
        iconSize: null,
      });
      L.marker([n.lat, n.lon], { icon }).addTo(noteLayer);
      if (offTrackMax == null || offset <= offTrackMax) {
        chart.addMarker({ dist: point.dist, ele: point.ele, kind: 'note', payload: n });
      }
    }

    // toggle control (top-right): show/hide photo thumbs, note cards, trail overlay
    if (groups.length || notes.length || trailLayer) {
      const ctl = L.control({ position: 'topright' });
      ctl.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-bar gpxs-toggles');
        const mkBtn = (label, title, layer) => {
          const a = L.DomUtil.create('a', 'gpxs-toggle gpxs-toggle-on', div);
          a.href = '#'; a.textContent = label; a.title = title;
          a.setAttribute('role', 'button'); a.setAttribute('aria-pressed', 'true');
          L.DomEvent.on(a, 'click', e => {
            L.DomEvent.stop(e);
            const on = map.hasLayer(layer);
            on ? map.removeLayer(layer) : layer.addTo(map);
            a.classList.toggle('gpxs-toggle-on', !on);
            a.setAttribute('aria-pressed', String(!on));
          });
        };
        if (groups.length) mkBtn('📷', 'Show/hide photos', photoLayer);
        if (notes.length) mkBtn('💬', 'Show/hide notes', noteLayer);
        if (trailLayer) mkBtn('🥾', 'Show/hide marked hiking trails', trailLayer);
        L.DomEvent.disableClickPropagation(div);
        return div;
      };
      ctl.addTo(map);
    }

    chart.onMarkerClick = m => {
      if (m.kind === 'photo') lightbox.open(m.payload.items, 0);
      else map.panTo([m.payload.lat, m.payload.lon]);
    };

    chart.render();

    return {
      map, chart, stats, points,
      destroy() { lightbox.destroy(); map.remove(); root.innerHTML = ''; },
    };
  }

  global.GpxStory = { create, parseGpx };
})(window);
