import type { CollectionEntry } from "astro:content";
import type { Marker, Map as LeafletMap } from "leaflet";
type Route = NonNullable<CollectionEntry<"blog">["data"]["route"]>;

export function initRouteStories() {
  document.querySelectorAll<HTMLElement>(".route-story").forEach(root => {
    const route: Route = JSON.parse(root.dataset.route!);
    const details = root.querySelector<HTMLDetailsElement>("details")!;
    const status = root.querySelector<HTMLElement>(".route-status")!;
    const mapElement = root.querySelector<HTMLElement>(".route-map")!;
    const chartElement = root.querySelector<HTMLElement>(".route-chart")!;
    const markers = new Map<string, Marker>();
    let map: LeafletMap | undefined;
    let loading: Promise<boolean> | undefined;
    let selected: string | undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollTo = (element: HTMLElement) => {
      element.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
      element.focus({ preventScroll: true });
    };
    const goToSection = (id: string) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.tabIndex = -1;
      history.pushState(null, "", `#${id}`);
      scrollTo(section);
    };
    const loadMap = () => {
      if (loading) return loading;
      status.textContent = "Loading route…";
      loading = (async () => {
        const [{ default: L }, geometry] = await Promise.all([
          import("leaflet"), import("./route-geometry.js"), import("leaflet/dist/leaflet.css")
        ]);
        const response = await fetch(route.gpx);
        if (!response.ok) throw new Error(`GPX: ${response.status}`);
        const { points } = geometry.parseGpx(await response.text());
        if (points.length < 2) throw new Error("GPX contains no route");
        map = L.map(mapElement, { scrollWheelZoom: false });
        const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        tiles.on("tileerror", () => {
          status.textContent = "The background map could not load. The route line, points and GPX are still available.";
        });
        const latlngs: [number, number][] = points.map(p => [p.lat, p.lon]);
        L.polyline(latlngs, { color: "#ffffff", weight: 7 }).addTo(map);
        const line = L.polyline(latlngs, { color: "#465e8f", weight: 3 }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [28, 28] });
        const stats = geometry.trackStats(points);
        status.textContent = `${(stats.distance / 1000).toFixed(1)} km` +
          (Number.isFinite(stats.min) ? ` · ↑ ${Math.round(stats.gain)} m · ↓ ${Math.round(stats.loss)} m` : " · No elevation data") + " · from the GPX track";
        const chart = new geometry.ElevationChart(chartElement, points, { chartHeight: 145 });
        const hover = L.circleMarker(latlngs[0], { radius: 5, color: "#465e8f", fillOpacity: 1, interactive: false });
        chart.onHover = (point: { lat: number; lon: number } | null) => {
          if (point) hover.setLatLng([point.lat, point.lon]).addTo(map!);
          else hover.remove();
        };
        route.points.forEach((point, index) => {
          const marker = L.marker([point.lat, point.lon], {
            icon: L.divIcon({ className: "route-pin", html: `<span>${index + 1}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] }),
            title: `${index + 1}. ${point.title}`, alt: point.title
          }).addTo(map!);
          const popup = document.createElement("div");
          const title = document.createElement("strong");
          title.textContent = `${index + 1}. ${point.title}`;
          const link = document.createElement("a");
          link.href = `#${point.section}`;
          link.textContent = "Read this section ↘";
          link.addEventListener("click", event => { event.preventDefault(); goToSection(point.section); });
          popup.append(title, document.createElement("br"), link);
          marker.bindPopup(popup, { autoPan: false });
          markers.set(point.id, marker);
          const snapped = geometry.snapToTrack(points, point).point;
          if (snapped && Number.isFinite(snapped.ele)) chart.addMarker({
            dist: snapped.dist, ele: snapped.ele, kind: "note", label: `${index + 1}. ${point.title}`, payload: point
          });
        });
        chart.onMarkerClick = (marker: { payload: Route["points"][number] }) => { void showPoint(marker.payload.id); };
        chart.render();
        return true;
      })().catch(error => {
        console.error("Route map:", error);
        map?.remove(); map = undefined; markers.clear();
        status.textContent = "The map could not load. Use the GPX download or the links to the story. Close and reopen the map to try again.";
        loading = undefined;
        return false;
      });
      return loading;
    };
    const showPoint = async (id: string) => {
      selected = id;
      details.open = true;
      details.tabIndex = -1;
      scrollTo(details);
      if (!(await loadMap()) || selected !== id) return;
      map!.invalidateSize();
      const marker = markers.get(id);
      if (marker) {
        map!.setView(marker.getLatLng(), 15, { animate: !reduceMotion });
        marker.openPopup();
      }
    };
    details.addEventListener("toggle", () => {
      if (details.open) void loadMap().then(() => map?.invalidateSize());
    });
    root.closest("article")!.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#route-point-"]');
      if (!link || (event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey))) return;
      const id = link.hash.slice("#route-point-".length);
      if (!route.points.some(point => point.id === id)) return;
      event.preventDefault();
      history.pushState(null, "", link.hash);
      void showPoint(id);
    });
    const followHash = () => {
      const id = location.hash.slice("#route-point-".length);
      if (location.hash.startsWith("#route-point-") && route.points.some(point => point.id === id)) void showPoint(id);
    };
    window.addEventListener("hashchange", followHash);
    followHash();
    if (window.matchMedia("(min-width: 700px)").matches) details.open = true;
  });
}
