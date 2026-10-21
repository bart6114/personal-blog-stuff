// Adapted from the standalone gpx-story prototype: geometry and SVG elevation profile.
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
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) throw new Error('Invalid GPX coordinates');
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
    let ref = points.find(p => Number.isFinite(p.ele))?.ele ?? 0;
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
      this.observer = new ResizeObserver(this._resize);
      this.observer.observe(container);
    }

    destroy() { this.observer.disconnect(); }

    addMarker(m) { this.markers.push(m); }

    _scales(w) {
      const pts = this.points;
      const maxDist = pts[pts.length - 1].dist || 1;
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
        const g = svgEl('g', { class: 'gpxs-chart-marker gpxs-chart-marker-' + m.kind, tabindex: 0, role: 'button', 'aria-label': m.label || 'Show route point' });
        g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.onMarkerClick?.(m); } });
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


export { parseGpx, trackStats, snapToTrack, ElevationChart };
