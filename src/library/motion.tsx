import { Icon } from "./icons";
import { useRef, useState } from "react";
import {
  type ProsProps,
  cx,
  Mark,
  itemsOf,
  useModel,
  useContentTransition,
  useToggle,
  useMotionAllowed,
  Arrow,
} from "./core";
/** A pointer-responsive perspective surface that resets on exit. */
export function TiltSurface(p: ProsProps) {
  const allowed = useMotionAllowed();
  const [tilt, set] = useState({ x: 0, y: 0 });
  return (
    <div
      data-pros="TiltSurface"
      className={cx("p-tilt-stage", p.className)}
      style={p.style}
      onPointerMove={(e) => {
        if (!allowed) return;
        const r = e.currentTarget.getBoundingClientRect();
        set({
          x: ((e.clientY - r.top - r.height / 2) / r.height) * -18,
          y: ((e.clientX - r.left - r.width / 2) / r.width) * 18,
        });
      }}
      onPointerLeave={() => set({ x: 0, y: 0 })}
    >
      <div
        className="p-tilt-surface"
        style={{
          transform: allowed
            ? "rotateX(" + tilt.x + "deg) rotateY(" + tilt.y + "deg)"
            : "none",
        }}
      >
        {p.children ?? (
          <>
            <small>MOVE A LITTLE CLOSER</small>
            <Mark variant={2} />
            <h3>{p.title ?? "A new perspective."}</h3>
          </>
        )}
      </div>
    </div>
  );
}
/** A magnetic action that gently follows a nearby pointer. */
export function MagneticField(p: ProsProps) {
  const allowed = useMotionAllowed();
  const [xy, set] = useState({ x: 0, y: 0 });
  return (
    <div
      data-pros="MagneticField"
      className={cx("p-magnetic-field", p.className)}
      style={p.style}
      onPointerMove={(e) => {
        if (!allowed) return;
        const r = e.currentTarget.getBoundingClientRect();
        set({
          x: (e.clientX - r.left - r.width / 2) * 0.22,
          y: (e.clientY - r.top - r.height / 2) * 0.22,
        });
      }}
      onPointerLeave={() => set({ x: 0, y: 0 })}
    >
      <button
        type="button"
        className="p-magnetic-button"
        style={{
          transform: allowed
            ? "translate(" + xy.x + "px," + xy.y + "px)"
            : "none",
        }}
        onClick={() => p.onAction?.("press")}
        disabled={p.disabled}
      >
        {p.label ?? "Come closer"}
        <Arrow diagonal />
      </button>
    </div>
  );
}
/** A springing stack that cycles a collection with an explicit control. */
export function SpringStack(p: ProsProps) {
  const list = itemsOf(p);
  const [index, set] = useState(0);
  return (
    <div
      data-pros="SpringStack"
      className={cx("p-spring-stack", p.className)}
      style={p.style}
    >
      <div>
        {list.map((s, i) => (
          <article
            key={s.label}
            style={
              {
                "--stack-index": (i - index + list.length) % list.length,
              } as React.CSSProperties
            }
          >
            <small>OBJECT / 0{i + 1}</small>
            <Mark variant={i} />
            <b>{s.label}</b>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="p-action"
        disabled={!list.length}
        onClick={() => {
          set((index + 1) % list.length);
          p.onValueChange?.(String((index + 1) % list.length));
        }}
      >
        Shuffle the stack{" "}
        <span>
          <Icon name="refresh" />
        </span>
      </button>
    </div>
  );
}
/** A two-panel curtain that opens to reveal supplied content. */
export function RevealCurtain(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <div
      data-pros="RevealCurtain"
      className={cx("p-reveal-curtain", p.className, open && "is-open")}
      style={p.style}
    >
      <div className="p-curtain-content" aria-hidden={!open}>
        {p.children ?? (
          <>
            <Mark variant={4} />
            <h3>{p.title ?? "Worth a closer look."}</h3>
          </>
        )}
      </div>
      <div className="p-curtain-left" aria-hidden="true" />
      <div className="p-curtain-right" aria-hidden="true" />
      <button
        type="button"
        className="p-curtain-button"
        aria-expanded={open}
        onClick={() => toggle()}
      >
        {open ? "Close the curtain" : "Reveal something good"}{" "}
        {open ? (
          <>
            <Icon name="minus" />
          </>
        ) : (
          <Icon name="plus" />
        )}
      </button>
    </div>
  );
}
/** A perspective grid that flattens into a readable collection. */
export function PerspectiveGrid(p: ProsProps) {
  const [flat, toggle] = useToggle(p);
  return (
    <div
      data-pros="PerspectiveGrid"
      className={cx("p-perspective-grid", p.className, flat && "is-flat")}
      style={p.style}
    >
      <div>
        {itemsOf(p).map((s, i) => (
          <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
            <Mark variant={i} />
            <b>{s.label}</b>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="p-text-btn"
        aria-pressed={flat}
        onClick={() => toggle()}
      >
        {flat ? (
          <>
            Add perspective <Icon name="arrow" />
          </>
        ) : (
          <>
            Bring it into view <Icon name="southwest" />
          </>
        )}
      </button>
    </div>
  );
}
/** A rotating orbit of objects that can be paused independently. */
export function OrbitGallery(p: ProsProps) {
  const [paused, toggle] = useToggle(p);
  return (
    <div
      data-pros="OrbitGallery"
      className={cx("p-orbit-gallery", p.className, paused && "is-paused")}
      style={p.style}
    >
      <div className="p-orbit-system">
        <b>p.</b>
        {itemsOf(p).map((s, i) => (
          <button
            type="button"
            key={i}
            style={
              {
                "--angle": (i * 360) / itemsOf(p).length + "deg",
              } as React.CSSProperties
            }
            aria-label={s.label}
            onClick={() => p.onAction?.(s.label)}
          >
            <span>
              <Icon
                name={(["media", "flower", "circle", "arrow"] as const)[i % 4]}
              />
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="p-text-btn"
        aria-pressed={paused}
        onClick={() => toggle()}
      >
        {paused ? (
          <>
            Keep moving <Icon name="play" />
          </>
        ) : (
          <>
            A moment of stillness <Icon name="pause" />
          </>
        )}
      </button>
    </div>
  );
}
/** A layered scene whose depth follows pointer position. */
export function ParallaxLayers(p: ProsProps) {
  const allowed = useMotionAllowed();
  const [x, set] = useState(0);
  return (
    <div
      data-pros="ParallaxLayers"
      className={cx("p-parallax-layers", p.className)}
      style={
        {
          ...p.style,
          "--drift": allowed ? x + "px" : "0px",
        } as React.CSSProperties
      }
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        set((e.clientX - r.left - r.width / 2) / 12);
      }}
      onPointerLeave={() => set(0)}
    >
      <span className="p-parallax-back">FORM</span>
      <i className="p-parallax-middle" />
      <div className="p-parallax-front">
        <small>DEPTH, WITHOUT THE NOISE.</small>
        <h3>{p.title ?? "More than meets the eye."}</h3>
      </div>
    </div>
  );
}
/** A moving ribbon of actionable labels with a local pause control. */
export function KineticRibbon(p: ProsProps) {
  const [paused, toggle] = useToggle(p);
  return (
    <div
      data-pros="KineticRibbon"
      className={cx("p-kinetic-ribbon", p.className, paused && "is-paused")}
      style={p.style}
    >
      <div>
        <div>
          {[...itemsOf(p), ...itemsOf(p)].map((s, i) => (
            <button
              type="button"
              key={i}
              aria-hidden={i >= itemsOf(p).length ? true : undefined}
              tabIndex={i >= itemsOf(p).length ? -1 : 0}
              onClick={() => p.onAction?.(s.label)}
            >
              {s.label}{" "}
              <span>
                <Icon name="flower" />
              </span>
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="p-text-btn"
        aria-pressed={paused}
        onClick={() => toggle()}
      >
        {paused ? (
          <>
            Resume ribbon <Icon name="play" />
          </>
        ) : (
          <>
            Pause ribbon <Icon name="pause" />
          </>
        )}
      </button>
    </div>
  );
}
/** A staggered grid entrance that can be replayed without remounting the page. */
export function StaggerGrid(p: ProsProps) {
  const [key, set] = useState(0);
  return (
    <div
      data-pros="StaggerGrid"
      className={cx("p-stagger-grid", p.className)}
      style={p.style}
    >
      <div key={key}>
        {(
          p.items ??
          Array.from({ length: 6 }, (_, i) => ({ label: "0" + (i + 1) }))
        ).map((s, i) => (
          <button
            type="button"
            key={i}
            style={{ animationDelay: i * 90 + "ms" }}
            onClick={() => p.onAction?.(s.label)}
          >
            {s.label}
            <span>
              <Icon
                name={
                  (
                    [
                      "flower",
                      "media",
                      "circle",
                      "arrow",
                      "grid",
                      "circle",
                    ] as const
                  )[i % 6]
                }
              />
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="p-text-btn" onClick={() => set(key + 1)}>
        One more time <Icon name="refresh" />
      </button>
    </div>
  );
}
/** A continuously morphing solid shape with an adjustable speed. */
export function MorphingShape(p: ProsProps) {
  const [value, set] = useModel(p, "5");
  return (
    <div
      data-pros="MorphingShape"
      className={cx("p-morphing-shape", p.className)}
      style={p.style}
    >
      <div style={{ animationDuration: value + "s" }} aria-hidden="true">
        <span>p.</span>
      </div>
      <label>
        {p.title ?? "Find your rhythm"}
        <input
          type="range"
          min={2}
          max={10}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      </label>
      <small>{value} second cycle</small>
    </div>
  );
}
/** An overflow reading surface with a real scroll-linked progress bar. */
export function ScrollProgress(p: ProsProps) {
  const [progress, set] = useState(0);
  return (
    <div
      data-pros="ScrollProgress"
      className={cx("p-scroll-progress", p.className)}
      style={p.style}
    >
      <div className="p-scroll-track">
        <i style={{ width: progress + "%" }} />
      </div>
      <div
        className="p-scroll-body"
        tabIndex={0}
        aria-label="Scrollable reading sample"
        onScroll={(e) => {
          const el = e.currentTarget;
          set(
            (el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) *
              100,
          );
        }}
      >
        <small>SCROLL TO EXPLORE</small>
        <h3>{p.title ?? "Good ideas take a little wandering."}</h3>
        {p.children ??
          [0, 1, 2, 3, 4].map((i) => (
            <p key={i}>
              {p.description ??
                "Start with what you notice. The way light falls across a familiar room. The rhythm of a sentence. A detail that makes an ordinary object feel special. Keep looking. There is more here than you think."}
            </p>
          ))}
      </div>
      <small aria-live="off">{Math.round(progress)}% explored</small>
    </div>
  );
}
/** A draggable rail with pointer capture and keyboard navigation. */
export function DragTrack(p: ProsProps) {
  const [value, set] = useModel(p, "0");
  const start = useRef({ x: 0, value: 0 });
  return (
    <div
      data-pros="DragTrack"
      className={cx("p-drag-track", p.className)}
      style={p.style}
    >
      <div
        role="slider"
        tabIndex={p.disabled ? -1 : 0}
        aria-label={p.label ?? "Explore the track"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(value)}
        onPointerDown={(e) => {
          if (p.disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = { x: e.clientX, value: Number(value) };
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            set(
              String(
                Math.round(
                  Math.max(
                    0,
                    Math.min(
                      100,
                      start.current.value +
                        ((e.clientX - start.current.x) /
                          e.currentTarget.clientWidth) *
                          100,
                    ),
                  ),
                ),
              ),
            );
          }
        }}
        onKeyDown={(e) => {
          if (p.disabled) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            set(
              String(
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? 100
                    : Math.max(
                        0,
                        Math.min(
                          100,
                          Number(value) + (e.key === "ArrowRight" ? 5 : -5),
                        ),
                      ),
              ),
            );
          }
        }}
      >
        <i
          style={{
            left: "calc(" + value + "% - " + Number(value) * 0.6 + "px)",
          }}
        >
          <span>↔</span>
        </i>
      </div>
      <div className="p-between">
        <small>{p.title ?? "DRAG INTO POSSIBILITY"}</small>
        <b>{value}%</b>
      </div>
    </div>
  );
}
/** A filled spotlight reveals a patterned surface under the pointer. */
export function SpotlightReveal(p: ProsProps) {
  const [point, set] = useState({ x: 50, y: 50 });
  return (
    <div
      data-pros="SpotlightReveal"
      tabIndex={0}
      className={cx("p-spotlight-reveal", p.className)}
      style={
        {
          ...p.style,
          "--spot-x": point.x + "%",
          "--spot-y": point.y + "%",
        } as React.CSSProperties
      }
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        set({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      }}
    >
      <div className="p-spotlight-pattern" />
      <small>FOLLOW YOUR CURIOSITY</small>
      <h3>{p.title ?? "There is more beneath the surface."}</h3>
    </div>
  );
}
/** An elastic range control with a readout that follows the thumb. */
export function ElasticSlider(p: ProsProps) {
  const [value, set] = useModel(p, "50");
  const [active, setActive] = useState(false);
  return (
    <div
      data-pros="ElasticSlider"
      className={cx("p-elastic-slider", p.className, active && "is-active")}
      style={p.style}
    >
      <div>
        <span style={{ left: value + "%" }}>{value}</span>
      </div>
      <input
        aria-label={p.label ?? "Elastic value"}
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={p.disabled}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onChange={(e) => set(e.target.value)}
      />
      <small>{p.title ?? "A little give. A little take."}</small>
    </div>
  );
}
/** A direction-aware panel transition with previous and next controls. */
export function SlideSwap(p: ProsProps) {
  const list = itemsOf(p);
  const [index, set] = useState(0);
  const [direction, setDirection] = useState(1);
  const panel = useContentTransition(index);
  const change = (d: number) => {
    setDirection(d);
    set((index + d + list.length) % list.length);
    p.onValueChange?.(String((index + d + list.length) % list.length));
  };
  return (
    <div
      data-pros="SlideSwap"
      className={cx("p-slide-swap", p.className)}
      style={p.style}
    >
      <div
        ref={panel}
        className="p-slide-content"
        style={{ "--direction": direction } as React.CSSProperties}
      >
        <small>ANOTHER PERSPECTIVE / 0{index + 1}</small>
        <Mark variant={index} />
        <h3>{list[index]?.label ?? p.title ?? "An open possibility"}</h3>
        <p>{list[index]?.description}</p>
      </div>
      <div className="p-between">
        <button
          type="button"
          className="p-round"
          aria-label="Previous panel"
          disabled={!list.length}
          onClick={() => change(-1)}
        >
          <Icon name="left" />
        </button>
        <small>
          {list.length ? index + 1 : 0} / {list.length}
        </small>
        <button
          type="button"
          className="p-round"
          aria-label="Next panel"
          disabled={!list.length}
          onClick={() => change(1)}
        >
          <Icon name="right" />
        </button>
      </div>
    </div>
  );
}
