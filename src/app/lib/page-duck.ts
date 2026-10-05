// A hand-drawn 32 × 28 sprite. No images, animation library, or network requests.
const colors: Record<string, string> = {
  x: "#232333", g: "#a6b488", G: "#79865f", w: "#ffffff",
  b: "#836858", B: "#665044", p: "#fac7aa", s: "#465e8f", r: "#c78382",
  o: "#dc8a52", // The spritz and its orange slice.
};
const sprite = [
  "..............xxxxx.....",
  ".............xgggggx....",
  "............xgggggggx...",
  "............xggggwxgx...",
  "............xgggggggxxxx",
  "............xGGggggxpppx",
  "............xGGggggxxxx.",
  ".............xwwwgx.....",
  "...xx.......xxbbbx......",
  "...xwx...xxxbbbbbx......",
  "....xwxxxbbbbbbbbbx.....",
  "....xwwbbbbBBBBbbbx.....",
  ".....xwbbbBsswwBbbx.....",
  ".....xwbbbbBBBBbbbx.....",
  "......xwwbbbbbbbx.......",
  ".......xxxxxxxxx........",
];

export type Action = "walk" | "sleep" | "shoot" | "poop" | "flap" | "peck" | "love" | "spritz" | "smoke" | "read" | "music" | "fish";
export const activities: Record<Action, { seconds: number; caption: string; label: string }> = {
  walk: { seconds: 24, caption: "", label: "Play with the duck" },
  sleep: { seconds: 18, caption: "z z z", label: "Duck is sleeping. Click to wake it up" },
  shoot: { seconds: 1.8, caption: "", label: "Duck is causing trouble" },
  poop: { seconds: 2.6, caption: "...", label: "Duck needs a moment" },
  flap: { seconds: 2.6, caption: "quack!", label: "Duck is flapping" },
  peck: { seconds: 5.4, caption: "", label: "Duck is pecking breadcrumbs off the floor" },
  love: { seconds: 3.6, caption: "", label: "Duck is blushing and sending you hearts" },
  spritz: { seconds: 7, caption: "aperitivo", label: "Duck is sipping an Aperol spritz" },
  smoke: { seconds: 7, caption: "", label: "Duck is taking a smoke break" },
  read: { seconds: 7, caption: "the daily quack", label: "Duck is reading a tiny newspaper" },
  fish: { seconds: 12, caption: "gone fishing", label: "Duck is fishing" },
  music: { seconds: 7, caption: "♪ now playing", label: "Duck is listening to music on headphones" },
};

// Eight poses: planted foot, push-off, bent knee, raised foot, then heel strike.
// The rear leg runs half a stride behind the front leg.
const steps = [
  [2, 23, 3, 25], [0, 24, 1, 25], [-2, 23, -2, 25], [-3, 22, -4, 24],
  [-2, 22, -3, 23], [0, 22, 0, 22], [2, 22, 3, 23], [3, 23, 4, 24],
];

// Each row is [left, top, width]: stepped feather silhouettes across a flap.
const wingPoses = [
  [[9, 3, 2], [8, 4, 4], [8, 5, 5], [9, 6, 5], [9, 7, 6], [10, 8, 5], [10, 9, 6], [11, 10, 5], [11, 11, 5], [12, 12, 4], [12, 13, 4], [13, 14, 3], [13, 15, 3]],
  [[5, 8, 3], [5, 9, 5], [6, 10, 6], [7, 11, 7], [8, 12, 7], [10, 13, 6], [11, 14, 5], [13, 15, 3]],
  [[3, 13, 5], [3, 14, 10], [4, 15, 12], [5, 16, 11], [7, 17, 8], [11, 18, 3]],
  [[12, 14, 4], [11, 15, 6], [10, 16, 7], [9, 17, 7], [8, 18, 7], [7, 19, 7], [6, 20, 6], [6, 21, 5], [7, 22, 3]],
  [[12, 14, 4], [11, 15, 6], [10, 16, 7], [10, 17, 6], [11, 18, 4], [12, 19, 2]],
  [[12, 12, 3], [11, 13, 5], [11, 14, 6], [12, 15, 5], [13, 16, 3]],
];

export function initPageDuck(root: HTMLElement) {
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  const preview = root.dataset.preview as Action | undefined;
  const viewportWidth = () => preview ? root.clientWidth : innerWidth;
  const viewportHeight = () => preview ? root.clientHeight : innerHeight;
  const viewportTop = () => preview ? 0 : scrollY;
  const pet = root.querySelector<HTMLButtonElement>(".duck-pet")!;
  const canvas = root.querySelector<HTMLCanvasElement>(".duck-pet canvas")!;
  const ctx = canvas.getContext("2d");
  const fishing = root.querySelector<HTMLCanvasElement>(".duck-fishing")!;
  const water = fishing.getContext("2d");
  if (!ctx) return;
  const bubble = root.querySelector<HTMLElement>(".duck-bubble")!;
  const toggle = root.querySelector<HTMLButtonElement>(".duck-toggle")!;
  const effects = root.querySelector<HTMLElement>(".duck-effects")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
  let paused = !preview;
  let x = Math.min(80, Math.max(0, viewportWidth() - 64));
  let y = viewportTop() + viewportHeight() * 0.55;
  let worldHeight = document.documentElement.scrollHeight;
  let targetX = x + 160;
  let targetY = y - 60;
  let direction = 1;
  let action: Action = preview ?? (reduced.matches ? "sleep" : "walk");
  let catchAt = 0;
  let sleepUntilWoken = false;
  let elapsed = 0;
  let duration = 5;
  let fired = false;
  let last = 0;
  let lastPaint = 0;
  let pointer: { id: number; startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean } | null = null;
  let lastTap: { time: number; x: number; y: number } | null = null;
  let suppressClick = false;
  let raf = 0;
  const marks: { node: HTMLElement; expires: number }[] = [];
  const routines: Action[] = ["sleep", "spritz", "smoke", "read", "music", "fish", "shoot", "poop", "flap", "peck"];
  let bag: Action[] = [];

  const rect = (color: string, a: number, b: number, w: number, h: number) => {
    ctx.fillStyle = colors[color]; ctx.fillRect(a, b, w, h);
  };
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 32, 28);
    ctx.save();
    if (direction < 0) { ctx.translate(32, 0); ctx.scale(-1, 1); }
    const frame = reduced.matches ? 0 : Math.floor(elapsed / 0.09);
    const moving = action === "walk" && !reduced.matches;
    const bob = moving ? [0, 0, 1, 1, 0, 0, 1, 1][frame % 8] : 0;
    const hop = action === "flap" && !reduced.matches ? Math.round(Math.sin(Math.min(1, elapsed / duration) * Math.PI) * 5) : 0;
    const wing = wingPoses[reduced.matches ? 2 : Math.floor(elapsed / 0.1) % wingPoses.length];
    const drawWing = (far: boolean) => {
      wing.forEach(([wx, wy, width], row) => {
        rect("x", wx + (far ? 4 : 0), wy, width, 1);
        if (row > 0 && row < wing.length - 1 && width > 2) {
          rect(far ? "G" : row > wing.length * 0.65 ? "s" : "w", wx + (far ? 5 : 1), wy, width - 2, 1);
        }
      });
    };
    ctx.translate(action === "shoot" && elapsed > 0.65 && elapsed < 0.85 ? -2 : 0, bob - hop);
    const headBob = action === "music" && !reduced.matches ? Math.floor(elapsed * 4) % 2 : 0;
    ctx.save();
    if (action === "sleep") ctx.translate(0, 3 + (reduced.matches ? 0 : Math.floor(elapsed % 3 / 1.5)));
    if (action === "poop") ctx.translate(0, 2);
    const peckPhase = reduced.matches ? 0 : elapsed % 0.9;
    const dip = peckPhase < 0.18 ? 0 : peckPhase < 0.36 ? (peckPhase - 0.18) / 0.18
      : peckPhase < 0.56 ? 1 : Math.max(0, (0.76 - peckPhase) / 0.2);
    const peckPose = Math.round(dip * 3) / 3;
    if (action === "flap") drawWing(true);
    sprite.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel !== "." && ((action !== "sleep" && action !== "peck") || y >= 8)) {
        rect(pixel, x + 2, y + 5 + (y < 8 ? headBob : 0), 1, 1);
      }
    }));
    if (action === "peck") {
      if (peckPose > 0) {
        rect("x", 18, 12, 4, 6); rect("G", 19, 13, 2, 4);
      }
      // Rotate the actual head sprite around the neck. Inverse sampling keeps
      // its outline, eye, bill and shading intact without holes or blurry pixels.
      const angle = peckPose * Math.PI / 2;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const shift = Math.round(peckPose * 4);
      for (let py = 0; py < 27; py++) {
        for (let px = 10; px < 32; px++) {
          const dx = px + 0.5 - (17 + shift);
          const dy = py + 0.5 - (12 + shift);
          const sourceX = Math.floor(17 + dx * cosine + dy * sine) - 2;
          const sourceY = Math.floor(12 - dx * sine + dy * cosine) - 5;
          const pixel = sourceY >= 0 && sourceY < 8 ? sprite[sourceY][sourceX] : undefined;
          if (pixel && pixel !== ".") rect(pixel, px, py, 1, 1);
        }
      }
      const crumbs = [[24, 26], [27, 25], [22, 25], [29, 26], [26, 27], [30, 24]];
      const eaten = Math.max(0, Math.floor((elapsed + 0.3) / 0.9));
      crumbs.forEach(([cx, cy], i) => {
        if (i >= eaten) {
          rect("b", cx, cy, 2, 1); rect("p", cx, cy - 1, 1, 1);
        }
      });
    }
    if (action === "sleep") {
      // Head tucked into the wing, closed eye, feet hidden under the body.
      rect("x", 15, 11, 8, 7); rect("G", 16, 12, 6, 5);
      rect("g", 17, 12, 5, 3); rect("x", 18, 14, 3, 1);
      rect("p", 14, 16, 4, 1); rect("b", 13, 17, 7, 2);
    }
    if (action === "flap") {
      // Cover the folded wing before drawing the near wing's full sweep.
      rect("b", 11, 16, 7, 3);
      drawWing(false);
    }
    ctx.restore();
    if (action !== "sleep" && action !== "flap") {
      if (moving) {
        // Draw articulated legs rather than swapping two flat feet.
        for (const [hip, phase, color] of [[12, 4, "b"], [17, 0, "p"]] as const) {
          const [kneeX, kneeY, footX, footY] = steps[(frame + phase) % 8];
          // Rasterize both segments on the sprite grid to keep square pixels.
          const segment = (ax: number, ay: number, bx: number, by: number) => {
            const length = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
            for (let i = 0; i <= length; i++) {
              rect(color, Math.round(ax + (bx - ax) * i / length), Math.round(ay + (by - ay) * i / length), 1, 1);
            }
          };
          segment(hip, 21, hip + kneeX, kneeY - bob);
          segment(hip + kneeX, kneeY - bob, hip + footX, footY - bob);
          rect(color, hip + footX - 1, footY - bob, 4, 1);
        }
      } else {
        rect("p", 11, 21, 2, 3); rect("p", 18, 21, 2, 3);
        rect("b", 11, 24, 4, 1); rect("b", 16, 24 - headBob, 4, 1);
      }
    }
    if (action === "shoot") {
      rect("x", 20, 14, 10, 3); rect("s", 22, 14, 7, 1);
      rect("x", 21, 17, 3, 4); rect("b", 22, 17, 1, 3);
      if (elapsed > 0.65 && elapsed < 0.85 && !reduced.matches) {
        rect("p", 30, 13, 2, 5); rect("r", 31, 15, 1, 1);
      }
    }
    if (action === "love") {
      // A contented closed eye and rosy cheek keep the reaction on the duck.
      rect("g", 19, 8, 3, 2); rect("x", 19, 9, 3, 1); rect("r", 20, 11, 2, 1);
      const heart = [".xx.xx.", "xxxxxxx", "xxxxxxx", ".xxxxx.", "..xxx..", "...x..."];
      for (let i = 0; i < 3; i++) {
        const phase = reduced.matches ? i * 0.25 : (elapsed * 0.65 + i / 3) % 1;
        const hx = [3, 12, 25][i];
        const hy = Math.round(8 - phase * 8);
        ctx.save(); ctx.globalAlpha = phase > 0.75 ? (1 - phase) * 4 : 1;
        heart.forEach((row, yy) => [...row].forEach((pixel, xx) => {
          if (pixel === "x") rect("r", hx + xx, hy + yy, 1, 1);
        }));
        ctx.restore();
      }
    }
    if (action === "spritz") {
      // Raise the stemmed glass to the bill twice, then lower it again.
      const sip = elapsed % 2.8;
      const lift = reduced.matches ? 2 : sip > 0.8 && sip < 1.9 ? 5 : sip > 0.5 && sip < 2.2 ? 3 : 0;
      ctx.save(); ctx.translate(0, -lift);
      rect("s", 24, 15, 7, 1); rect("s", 24, 16, 1, 4); rect("s", 30, 16, 1, 4);
      rect("o", 25, 17, 5, 3); rect("p", 26, 17, 1, 1); rect("w", 28, 16, 1, 2);
      rect("s", 25, 20, 5, 1); rect("s", 27, 21, 1, 3); rect("s", 25, 24, 5, 1);
      rect("o", 29, 14, 2, 3); rect("p", 30, 14, 1, 2);
      rect("b", 20, 19, 4, 2); rect("b", 23, 20, 3, 1);
      ctx.restore();
    }
    if (action === "smoke") {
      const cycle = reduced.matches ? 1 : elapsed % 3.2;
      const dragging = cycle > 0.55 && cycle < 1.35;
      const cigaretteY = dragging ? 10 : cycle > 0.3 && cycle < 1.6 ? 13 : 17;
      // A white paper cigarette, peach filter and glowing ember. The wing
      // lifts it to the bill for a drag, then lowers it before the exhale.
      rect("b", 20, 17, 4, 2);
      rect("b", 23, cigaretteY + 1, 2, 18 - cigaretteY);
      rect("B", 24, cigaretteY + 1, 7, 1);
      rect("p", 24, cigaretteY, 2, 1);
      rect("w", 26, cigaretteY, 4, 1);
      rect(dragging ? "o" : "r", 30, cigaretteY, 1, 1);

      ctx.save();
      // Thin, broken wisps curl upward from the lit tip. No outlined rings.
      for (let i = 0; i < 7; i++) {
        const rise = reduced.matches ? i : (elapsed * 4 + i * 1.4) % 10;
        const drift = Math.round(Math.sin(rise * 0.7 + elapsed * 0.6));
        ctx.globalAlpha = 0.35 * (1 - rise / 11);
        rect("x", 29 + drift, Math.round(cigaretteY - 2 - rise), 1, 2);
      }
      if (cycle > 1.6) {
        const exhale = (cycle - 1.6) / 1.6;
        for (let i = 0; i < 5; i++) {
          ctx.globalAlpha = (1 - exhale) * 0.3;
          const drift = Math.round(25 + exhale * 4 + Math.sin(i + exhale * 4));
          rect("x", drift, Math.round(9 - exhale * 6 - i), i % 2 ? 2 : 1, 1);
        }
      }
      ctx.restore();
    }
    if (action === "read") {
      const turn = !reduced.matches && elapsed % 2.5 > 2;
      // Profile view: paper held in front of the bill, readable side toward
      // the duck. We see a single outside cover and a narrow folded edge.
      rect("b", 21, 15, 2, 8); rect("w", 22, 15, 1, 7);
      rect("x", 23, 13, 8, 11); rect("w", 24, 14, 6, 9);
      rect("x", 24, 15, 5, 1); // Cover masthead.
      rect("G", 25, 17, 3, 3); // One cover illustration, not facing columns.
      rect("b", 25, 21, 4, 1);
      if (turn) {
        // The page lifts on the inside, behind the visible cover.
        rect("b", 21, 11, 2, 4); rect("w", 22, 11, 2, 3);
        rect("w", 23, 12, 3, 1);
      }
      rect("b", 18, 18, 3, 2); rect("b", 20, 19, 5, 2);
      // Downward gaze through reading glasses.
      rect("g", 19, 8, 3, 2); rect("x", 20, 9, 1, 1);
      rect("x", 19, 8, 4, 1); rect("x", 19, 10, 4, 1); rect("x", 19, 8, 1, 3);
    }
    if (action === "music") {
      // Side view: the visible earcup sits behind the eye, not on the bill.
      ctx.save(); ctx.translate(0, headBob);
      rect("x", 17, 3, 4, 2);
      rect("s", 18, 3, 3, 1);
      rect("x", 16, 5, 2, 3);
      rect("x", 16, 8, 4, 4);
      rect("s", 17, 9, 2, 2);
      rect("r", 17, 9, 1, 1);
      ctx.restore();
    }
    ctx.restore();
    drawFishing();
    pet.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  function drawFishing() {
    fishing.hidden = action !== "fish";
    if (action !== "fish" || !water) return;
    fishing.style.left = `${Math.round(direction > 0 ? x : x - 128)}px`;
    fishing.style.top = `${Math.round(y - 24)}px`;
    water.clearRect(0, 0, 96, 56);
    water.save();
    if (direction < 0) { water.translate(96, 0); water.scale(-1, 1); }
    const pixel = (color: string, px: number, py: number, w = 1, h = 1) => {
      water.fillStyle = colors[color]; water.fillRect(Math.round(px), Math.round(py), w, h);
    };
    const line = (color: string, ax: number, ay: number, bx: number, by: number) => {
      const length = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
      for (let i = 0; i <= length; i++) pixel(color, ax + (bx - ax) * i / length, ay + (by - ay) * i / length);
    };
    const time = reduced.matches ? 0 : elapsed;
    const reveal = reduced.matches ? 1 : Math.min(1, elapsed / 0.6, (duration - elapsed) / 0.7);
    water.save();
    water.translate(65, 42); water.scale(Math.max(0, reveal), Math.max(0, reveal));
    // Stepped pool outline, blue water and moving pale ripples.
    pixel("G", -17, -7, 34, 1); pixel("G", -23, -5, 46, 10); pixel("G", -18, 5, 36, 2);
    pixel("s", -18, -6, 36, 12); pixel("s", -22, -4, 44, 8);
    water.globalAlpha = 0.55;
    for (let i = 0; i < 4; i++) {
      const drift = Math.round(Math.sin(time * 2 + i) * 3);
      pixel("w", -16 + i * 8 + drift, -3 + i % 2 * 5, 5, 1);
    }
    water.restore();
    const caught = elapsed >= catchAt;
    const reel = reduced.matches ? (caught ? 1 : 0) : Math.max(0, Math.min(1, (elapsed - catchAt) / 1.8));
    const tipX = 42 - reel * 8;
    const tipY = 6 - reel * 4;
    line("B", 22, 31, tipX, tipY);
    line("p", 23, 30, tipX + 1, tipY);
    pixel("b", 19, 29, 6, 3); pixel("s", 23, 30, 3, 3);
    const cast = reduced.matches ? 1 : Math.min(1, elapsed / 1.1);
    const hookX = caught ? 66 - reel * 25 : tipX + (66 - tipX) * cast;
    const hookY = caught ? 39 - reel * 24 : tipY + (39 - tipY) * cast;
    line("x", tipX, tipY, hookX, hookY);
    if (!caught) {
      const dip = elapsed > catchAt - 0.6 ? 2 : Math.round(Math.sin(time * 3));
      pixel("w", hookX - 1, hookY - 2 + dip, 3, 2);
      pixel("r", hookX - 1, hookY + dip, 3, 2);
    } else {
      // A flapping fish rises on the line; droplets fall back into the pool.
      const wiggle = reduced.matches ? 0 : Math.round(Math.sin(time * 16));
      pixel("x", hookX - 4, hookY + 2, 8, 4);
      pixel("p", hookX - 3, hookY + 1, 6, 6);
      pixel("r", hookX - 2, hookY + 3, 5, 2);
      pixel("x", hookX + 1, hookY + 2, 1, 1);
      pixel("s", hookX - 6, hookY + 1 + wiggle, 2, 6);
      if (elapsed < catchAt + 0.8 && !reduced.matches) {
        for (let i = 0; i < 4; i++) pixel("s", 61 + i * 4, 33 - Math.sin(reel * Math.PI * 2) * (5 + i), 2, 2);
      }
    }
    water.restore();
  }

  function mark(kind: "hole" | "poop") {
    const node = document.createElement("span");
    node.className = "duck-mark";
    const target = kind === "hole" ? x + 16 + direction * (90 + Math.random() * 100) : x + (direction > 0 ? 2 : 42);
    node.style.left = `${Math.max(2, Math.min(viewportWidth() - 34, target))}px`;
    node.style.top = `${y + (kind === "hole" ? 15 : 40)}px`;
    node.innerHTML = kind === "hole"
      ? '<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="#836858" opacity=".35" d="M5 1h5v2h3v3h2v5h-3v3H5v-2H2V9H0V5h3V3h2z"/><path fill="#232333" d="M5 4h5v2h2v5H9v2H5v-2H3V7h2z"/><path fill="#465e8f" d="M5 4h5v2H6v3H3V7h2z"/><path fill="#ffffff" d="M5 13h4v1H5zM12 7h1v4h-1z"/></svg>'
      : '<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="#665044" d="M7 3h2v3h2v3h2v4H2v-3h2V7h3z"/><path fill="#836858" d="M7 5h2v2H7zM5 8h5v2H5zM3 11h8v1H3z"/></svg>';
    effects.append(node);
    marks.push({ node, expires: performance.now() + 18000 });
    if (marks.length > 6) marks.shift()!.node.remove();
  }

  function chooseDestination() {
    const right = Math.max(4, viewportWidth() - 68);
    const low = Math.max(0, Math.min(worldHeight - 70, viewportTop() + 64));
    const high = Math.max(low, Math.min(worldHeight - 70, viewportTop() + viewportHeight() - 90));
    const minimumDistance = Math.min(240, Math.hypot(right - 4, high - low) * 0.4);
    let bestDistance = -1;
    // Prefer a proper stroll across the visible page over a few tiny steps.
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidateX = 4 + Math.random() * (right - 4);
      const candidateY = low + Math.random() * (high - low);
      const distance = Math.hypot(candidateX - x, candidateY - y);
      if (distance > bestDistance) {
        targetX = candidateX; targetY = candidateY; bestDistance = distance;
      }
      if (distance >= minimumDistance) break;
    }
  }

  function start(next: Action, resetPreview = true, holdSleep = false) {
    action = next; elapsed = 0; fired = false;
    sleepUntilWoken = next === "sleep" && holdSleep;
    duration = next === "walk" ? 14 + Math.random() * 10 : activities[next].seconds;
    if (next === "walk") chooseDestination();
    if (next === "fish") {
      catchAt = 5 + Math.random() * 6;
      duration = catchAt + 4;
      direction = x + 192 <= viewportWidth() ? 1 : -1;
      if (direction < 0 && x < 128) { x = 20; direction = 1; }
      y = Math.min(y, worldHeight - 90);
    }
    if (preview && resetPreview && next !== "walk") {
      x = next === "fish" ? Math.max(4, (viewportWidth() - 192) / 2) : (viewportWidth() - 64) / 2;
      y = 92;
      direction = 1;
    }
    bubble.textContent = activities[next].caption;
    pet.dataset.activity = next;
    pet.setAttribute("aria-label", activities[next].label);
    pet.title = next === "sleep" ? "Click to wake me up · drag to move" : "Drag to move · double-click to sleep";
    draw();
  }
  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 0.06) : 0;
    last = now;
    for (let i = marks.length - 1; i >= 0; i--) {
      if (marks[i].expires <= now) { marks[i].node.remove(); marks.splice(i, 1); }
    }
    if ((!paused || action === "sleep") && !pointer) {
      elapsed += dt;
      if (action === "walk" && !reduced.matches) {
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.hypot(dx, dy);
        const step = Math.min(distance, dt * 34);
        if (distance > 1) {
          x += dx / distance * step;
          y += dy / distance * step;
          if (Math.abs(dx) > 1) direction = dx > 0 ? 1 : -1;
        } else chooseDestination();
      }
      if (!fired && ((action === "shoot" && elapsed > 0.65) || (action === "poop" && elapsed > 1.2))) {
        mark(action === "shoot" ? "hole" : "poop"); fired = true;
      }
      if (action === "fish" && elapsed >= catchAt && !fired) {
        fired = true;
        bubble.textContent = "got one!";
        pet.setAttribute("aria-label", "Duck caught a fish");
      }
      if (elapsed > duration && !sleepUntilWoken) {
        if (preview) start(preview);
        else if (action !== "walk") start(reduced.matches ? "sleep" : "walk");
        else if (!reduced.matches) {
          if (!bag.length) {
            bag = [...routines];
            for (let i = bag.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [bag[i], bag[j]] = [bag[j], bag[i]];
            }
          }
          start(bag.pop()!);
        }
      }
    }
    if (now - lastPaint > 65) { draw(); lastPaint = now; }
    raf = requestAnimationFrame(tick);
  }
  function syncToggle() {
    toggle.textContent = paused ? "resume duck" : "pause duck";
    toggle.setAttribute("aria-pressed", String(paused));
  }
  toggle.addEventListener("click", () => {
    if (paused) { resume(); start("flap", false); }
    else sleep();
  });
  root.querySelector(".duck-replay")?.addEventListener("click", () => {
    paused = false; syncToggle();
    if (preview) start(preview);
  });
  function resume() {
    paused = false; syncToggle();
  }
  function sleep() {
    paused = true; syncToggle();
    start("sleep", false, true);
  }
  pet.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || pointer) return;
    const bounds = root.getBoundingClientRect();
    suppressClick = false;
    pointer = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      offsetX: event.clientX - bounds.left - x,
      offsetY: event.clientY - bounds.top - y, moved: false,
    };
    pet.setPointerCapture(event.pointerId);
  });
  pet.addEventListener("pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5) pointer.moved = true;
    if (!pointer.moved) return;
    const bounds = root.getBoundingClientRect();
    x = Math.max(0, Math.min(viewportWidth() - 64, event.clientX - bounds.left - pointer.offsetX));
    y = Math.max(0, Math.min(worldHeight - 70, event.clientY - bounds.top - pointer.offsetY));
    pet.dataset.dragging = "true";
    draw();
  });
  function releasePointer(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const moved = pointer.moved;
    pointer = null;
    delete pet.dataset.dragging;
    if (pet.hasPointerCapture(event.pointerId)) pet.releasePointerCapture(event.pointerId);
    suppressClick = moved || event.type !== "pointerup";
    if (suppressClick) {
      lastTap = null;
      if (action === "walk") { elapsed = 0; chooseDestination(); }
      return;
    }
    const now = performance.now();
    if (lastTap && now - lastTap.time < 350 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 20) {
      lastTap = null;
      suppressClick = true;
      sleep();
    } else lastTap = { time: now, x: event.clientX, y: event.clientY };
  }
  pet.addEventListener("pointerup", releasePointer);
  pet.addEventListener("pointercancel", releasePointer);
  pet.addEventListener("lostpointercapture", releasePointer);
  pet.addEventListener("click", (event) => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    if (action === "sleep") { resume(); start("flap", false); }
  });
  pet.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "s") {
      event.preventDefault(); sleep();
    }
    const move = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[event.key];
    if (move) {
      event.preventDefault();
      x = Math.max(0, Math.min(viewportWidth() - 64, x + move[0]));
      y = Math.max(0, Math.min(worldHeight - 70, y + move[1]));
      if (action === "walk") chooseDestination();
      draw();
    }
  });
  function resizeWorld() {
    if (!root) return;
    worldHeight = preview ? root.clientHeight : Math.max(document.body.getBoundingClientRect().height, viewportHeight());
    if (!preview) root.style.height = `${worldHeight}px`;
    x = Math.min(x, Math.max(0, viewportWidth() - 64));
    y = Math.min(y, Math.max(0, worldHeight - 70));
    targetX = Math.min(targetX, Math.max(0, viewportWidth() - 64));
    targetY = Math.min(targetY, Math.max(0, worldHeight - 70));
    draw();
  }
  window.addEventListener("resize", resizeWorld);
  new ResizeObserver(resizeWorld).observe(preview ? root : document.body);
  reduced.addEventListener("change", () => {
    if (!paused) start(preview ?? (reduced.matches ? "sleep" : "walk"));
  });
  function syncAnimation() {
    cancelAnimationFrame(raf);
    if (!document.hidden && (preview || desktop.matches)) { last = 0; raf = requestAnimationFrame(tick); }
  }
  document.addEventListener("visibilitychange", syncAnimation);
  desktop.addEventListener("change", syncAnimation);
  root.hidden = false;
  resizeWorld();
  syncToggle(); start(paused ? "sleep" : action, true, paused);
  syncAnimation();
}
