import { useEffect } from "react";
import { useMotionAllowed } from "./library";

export function SiteMotion({ route }: { route: string }) {
  const enabled = useMotionAllowed();
  useEffect(() => {
    if (!enabled || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const site = document.querySelector<HTMLElement>(".site");
    if (!site) return;
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const index = entry.target.parentElement?.classList.contains(
            "component-grid",
          )
            ? Array.from(entry.target.parentElement.children).indexOf(
                entry.target,
              ) % 3
            : 0;
          animate(
            entry.target,
            [
              { opacity: 0.2, translate: "0 42px", scale: "0.96" },
              { opacity: 1, translate: "0 0", scale: "1" },
            ],
            {
              duration: 780,
              delay: index * 75,
              easing: "cubic-bezier(.16,1,.3,1)",
            },
          );
        });
      },
      { threshold: 0.08 },
    );
    const observe = () => {
      site
        .querySelectorAll(
          ".component-tile, .section-intro, .closing-note, .docs-layout section, .detail-heading, .principle-grid article",
        )
        .forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          observer.observe(element);
        });
    };
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(site, { childList: true, subtree: true });
    const playground = site.querySelector<HTMLElement>(".hero-playground");
    const magnets = new Set<HTMLElement>();
    let frame = 0;
    let active: HTMLElement | null = null;
    let latestX = 0,
      latestY = 0;
    const resetMagnet = () => {
      active?.style.removeProperty("--magnet-x");
      active?.style.removeProperty("--magnet-y");
      active = null;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      latestX = event.clientX;
      latestY = event.clientY;
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              ".big-action, .header-start, .hero-mini-button",
            )
          : null;
      if (target !== active) resetMagnet();
      active = target;
      if (target) magnets.add(target);
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
        if (active) {
          const r = active.getBoundingClientRect();
          active.style.setProperty(
            "--magnet-x",
            (latestX - r.left - r.width / 2) * 0.12 + "px",
          );
          active.style.setProperty(
            "--magnet-y",
            (latestY - r.top - r.height / 2) * 0.22 + "px",
          );
        }
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      resetMagnet();
      playground?.style.removeProperty("--drift-x");
      playground?.style.removeProperty("--drift-y");
    };
    site.addEventListener("pointermove", move, { passive: true });
    site.addEventListener("pointerleave", leave);
    return () => {
      leave();
      mutations.disconnect();
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      magnets.forEach((element) => {
        element.style.removeProperty("--magnet-x");
        element.style.removeProperty("--magnet-y");
      });
      site.removeEventListener("pointermove", move);
      site.removeEventListener("pointerleave", leave);
    };
  }, [enabled, route]);
  return null;
}
