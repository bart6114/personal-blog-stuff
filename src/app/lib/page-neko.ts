// Adapted from https://github.com/adryd325/oneko.js (Copyright © 2022 adryd).
// MIT license and pinned source details: public/assets/oneko/{LICENSE,SOURCE.txt}.
// Preserve the original artwork, directional poses, idle routines and 100ms tick.
const spriteSets = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  scratchWallN: [[0, 0], [0, -1]],
  scratchWallS: [[-7, -1], [-6, -2]],
  scratchWallE: [[-2, -2], [-2, -3]],
  scratchWallW: [[-4, 0], [-4, -1]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
} as const;
type Sprite = keyof typeof spriteSets;
type IdleAnimation = "sleeping" | "scratchSelf" | "scratchWallN" | "scratchWallS" | "scratchWallE" | "scratchWallW";

export function initPageNeko(button: HTMLButtonElement) {
  if (button.dataset.ready) return;
  button.dataset.ready = "true";
  const sprite = button.querySelector<HTMLElement>(".neko-sprite")!;
  const desktop = matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const { signal } = events;
  let following = false;
  let x = 36;
  let y = innerHeight - 36;
  let target = { x, y };
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation: IdleAnimation | null = null;
  let idleFrame = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  function setSprite(name: Sprite, frame = 0) {
    const [column, row] = spriteSets[name][frame % spriteSets[name].length];
    sprite.style.backgroundPosition = `${column * 32}px ${row * 32}px`;
  }

  function place() {
    x = Math.min(Math.max(24, x), innerWidth - 24);
    y = Math.min(Math.max(24, y), innerHeight - 24);
    button.style.transform = `translate(${Math.round(x - 24)}px, ${Math.round(y - 24)}px)`;
  }

  function resetIdle() {
    idleAnimation = null;
    idleFrame = 0;
  }

  function idle() {
    idleTime++;
    if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
      const available: IdleAnimation[] = ["sleeping", "scratchSelf"];
      if (x < 40) available.push("scratchWallW");
      if (y < 40) available.push("scratchWallN");
      if (x > innerWidth - 40) available.push("scratchWallE");
      if (y > innerHeight - 40) available.push("scratchWallS");
      idleAnimation = available[Math.floor(Math.random() * available.length)];
    }
    if (idleAnimation === "sleeping") {
      setSprite(idleFrame < 8 ? "tired" : "sleeping", idleFrame < 8 ? 0 : Math.floor(idleFrame / 4));
      if (idleFrame > 192) resetIdle();
    } else if (idleAnimation) {
      setSprite(idleAnimation, idleFrame);
      if (idleFrame > 9) resetIdle();
    } else {
      setSprite("idle");
      return;
    }
    idleFrame++;
  }

  function frame() {
    frameCount++;
    const dx = x - target.x;
    const dy = y - target.y;
    const distance = Math.hypot(dx, dy);
    if (!following || distance < 48) { idle(); return; }
    resetIdle();
    if (idleTime > 1) {
      setSprite("alert");
      idleTime = Math.min(idleTime, 7) - 1;
      return;
    }
    let direction = dy / distance > 0.5 ? "N" : "";
    direction += dy / distance < -0.5 ? "S" : "";
    direction += dx / distance > 0.5 ? "W" : "";
    direction += dx / distance < -0.5 ? "E" : "";
    setSprite(direction as Sprite, frameCount);
    x -= dx / distance * 10;
    y -= dy / distance * 10;
    place();
  }

  function home() {
    following = false;
    x = 36;
    y = innerHeight - 36;
    target = { x, y };
    idleTime = 0;
    resetIdle();
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", reduced.matches ? "Cat resting (reduced motion enabled)" : "Let the cat follow your cursor");
    button.title = reduced.matches ? "Resting with reduced motion enabled" : "Click for a little company";
    setSprite("idle");
    place();
  }

  function sync() {
    clearInterval(timer);
    button.hidden = !desktop.matches;
    button.setAttribute("aria-disabled", String(reduced.matches));
    if (!desktop.matches || reduced.matches) home();
    if (desktop.matches && !document.hidden && !reduced.matches) timer = setInterval(frame, 100);
  }

  button.addEventListener("click", (event) => {
    if (reduced.matches) return;
    if (following) { home(); return; }
    following = true;
    idleTime = 7;
    resetIdle();
    target = event.detail ? { x: event.clientX, y: event.clientY } : { x, y };
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Send the cat back to its corner");
    button.title = "Click to go home · Esc works too";
    setSprite("alert");
  }, { signal });
  window.addEventListener("pointermove", (event) => {
    if (following && event.pointerType !== "touch") target = { x: event.clientX, y: event.clientY };
  }, { signal, passive: true });
  window.addEventListener("keydown", (event) => { if (event.key === "Escape") home(); }, { signal });
  window.addEventListener("resize", () => { if (following) place(); else home(); }, { signal });
  document.addEventListener("visibilitychange", sync, { signal });
  desktop.addEventListener("change", sync, { signal });
  reduced.addEventListener("change", () => { home(); sync(); }, { signal });
  window.addEventListener("pagehide", () => clearInterval(timer), { signal });
  window.addEventListener("pageshow", sync, { signal });
  document.addEventListener("astro:before-swap", () => {
    clearInterval(timer);
    events.abort();
  }, { once: true, signal });
  home();
  sync();
}
