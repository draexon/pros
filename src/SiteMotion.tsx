import { useLayoutEffect, useRef } from "react";
import { useMotionAllowed } from "./library";

export function SiteMotion({ route }: { route: string }) {
  const enabled = useMotionAllowed();
  const revealedRoute = useRef<string | null>(null);
  // Layout timing hides incoming elements before the browser paints them.
  useLayoutEffect(() => {
    if (!enabled || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const site = document.querySelector<HTMLElement>(".site");
    if (!site) return;
    // Turning motion back on should not replay entrances already on screen.
    const replay = revealedRoute.current !== route;
    revealedRoute.current = route;
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const animate = (
      element: Element,
      frames: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const animation = element.animate(frames, options);
      animations.add(animation);
      animation.finished.then(
        () => animations.delete(animation),
        () => animations.delete(animation),
      );
    };
    const selector =
      ".component-tile, .section-intro, .closing-note, .docs-layout section, .detail-heading, .principle-grid article";
    const pending = new Set<HTMLElement>();
    const reveal = (element: HTMLElement) => {
      const index = element.parentElement?.classList.contains("component-grid")
        ? Array.from(element.parentElement.children).indexOf(element) % 3
        : 0;
      pending.delete(element);
      element.style.removeProperty("opacity");
      // Backwards fill keeps staggered elements hidden through their delay.
      animate(
        element,
        [
          { opacity: 0, translate: "0 16px" },
          { opacity: 1, translate: "0 0" },
        ],
        {
          duration: 520,
          delay: index * 45,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        },
      );
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          reveal(entry.target as HTMLElement);
        });
      },
      { threshold: 0.08 },
    );
    // Mutation callbacks run before paint, so new elements never flash at full opacity.
    const observe = () => {
      site
        .querySelectorAll<HTMLElement>(selector)
        .forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          const rect = element.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < innerHeight && rect.height > 0) {
            reveal(element);
            return;
          }
          element.style.opacity = "0";
          pending.add(element);
          observer.observe(element);
        });
    };
    if (!replay)
      site.querySelectorAll(selector).forEach((element) => seen.add(element));
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(site, { childList: true, subtree: true });
    const playground = site.querySelector<HTMLElement>(".hero-playground");
    let frame = 0;
    let latestX = 0,
      latestY = 0;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      latestX = event.clientX;
      latestY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (playground) {
          const r = playground.getBoundingClientRect();
          const inside =
            latestX > r.left - 100 &&
            latestX < r.right + 100 &&
            latestY > r.top - 80 &&
            latestY < r.bottom + 80;
          playground.style.setProperty(
            "--drift-x",
            inside
              ? ((latestX - r.left - r.width / 2) / r.width) * 26 + "px"
              : "0px",
          );
          playground.style.setProperty(
            "--drift-y",
            inside
              ? ((latestY - r.top - r.height / 2) / r.height) * 22 + "px"
              : "0px",
          );
        }
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      playground?.style.removeProperty("--drift-x");
      playground?.style.removeProperty("--drift-y");
    };
    site.addEventListener("pointermove", move, { passive: true });
    site.addEventListener("pointerleave", leave);
    return () => {
      leave();
      mutations.disconnect();
      observer.disconnect();
      pending.forEach((element) => element.style.removeProperty("opacity"));
      animations.forEach((animation) => animation.cancel());
      site.removeEventListener("pointermove", move);
      site.removeEventListener("pointerleave", leave);
    };
  }, [enabled, route]);
  return null;
}
