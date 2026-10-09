import { useRef, useState } from "react";
import {
  type ProsProps,
  cx,
  Mark,
  itemsOf,
  useModel,
  useToggle,
  Arrow,
} from "./core";
/** A horizontal image accordion with explicit panel selection. */
export function ImageAccordion(p: ProsProps) {
  const [value, set] = useModel(p, "0");
  return (
    <div
      data-pros="ImageAccordion"
      className={cx("p-image-accordion", p.className)}
      style={p.style}
    >
      {itemsOf(p).map((s, i) => (
        <button
          type="button"
          key={i}
          className={value === String(i) ? "is-active" : ""}
          aria-expanded={value === String(i)}
          onClick={() => set(String(i))}
        >
          {s.image ? <img src={s.image} alt={s.label} /> : <Mark variant={i} />}
          <span>
            <small>0{i + 1}</small>
            <b>{s.label}</b>
          </span>
        </button>
      ))}
    </div>
  );
}
/** A horizontally scrollable filmstrip with previous and next controls. */
export function Filmstrip(p: ProsProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      data-pros="Filmstrip"
      className={cx("p-filmstrip", p.className)}
      style={p.style}
    >
      <div ref={ref} className="p-filmstrip-track">
        {itemsOf(p).map((s, i) => (
          <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
            <small>PROS / {String(i + 1).padStart(3, "0")}</small>
            {s.image ? (
              <img src={s.image} alt={s.label} />
            ) : (
              <Mark variant={i + 2} />
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      <div className="p-between">
        <small>{p.title ?? "A roll of good finds."}</small>
        <span>
          <button
            type="button"
            className="p-icon-button"
            aria-label="Previous frames"
            onClick={() =>
              ref.current?.scrollBy({ left: -230, behavior: "smooth" })
            }
          >
            ←
          </button>
          <button
            type="button"
            className="p-icon-button"
            aria-label="Next frames"
            onClick={() =>
              ref.current?.scrollBy({ left: 230, behavior: "smooth" })
            }
          >
            →
          </button>
        </span>
      </div>
    </div>
  );
}
/** A before-and-after comparison controlled by a labeled native slider. */
export function ImageCompare(p: ProsProps) {
  const [value, set] = useModel(p, "50");
  return (
    <div
      data-pros="ImageCompare"
      className={cx("p-image-compare", p.className)}
      style={p.style}
    >
      <div className="p-compare-images">
        <div>
          <Mark variant={0} />
          <small>BEFORE</small>
        </div>
        <div
          style={{ clipPath: "inset(0 " + (100 - Number(value)) + "% 0 0)" }}
        >
          <Mark variant={5} />
          <small>AFTER</small>
        </div>
        <i style={{ left: value + "%" }}>↔</i>
      </div>
      <label>
        {p.label ?? "Drag to compare"}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      </label>
    </div>
  );
}
/** A zoomable canvas with bounded zoom and reset controls. */
export function ZoomCanvas(p: ProsProps) {
  const [zoom, set] = useState(1);
  return (
    <div
      data-pros="ZoomCanvas"
      className={cx("p-zoom-canvas", p.className)}
      style={p.style}
    >
      <div className="p-canvas-viewport">
        <div style={{ transform: "scale(" + zoom + ")" }}>
          {p.image ? (
            <img src={p.image} alt={p.title ?? "Canvas artwork"} />
          ) : (
            <Mark variant={3} />
          )}
        </div>
      </div>
      <div className="p-canvas-controls">
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
          onClick={() => set(Math.max(0.5, zoom - 0.25))}
        >
          −
        </button>
        <button type="button" aria-label="Reset zoom" onClick={() => set(1)}>
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= 2}
          onClick={() => set(Math.min(2, zoom + 0.25))}
        >
          +
        </button>
      </div>
    </div>
  );
}
/** A four-up gallery with a focused item caption. */
export function GalleryGrid(p: ProsProps) {
  const list = p.items ?? [
    { label: "Balance" },
    { label: "Rhythm" },
    { label: "Space" },
    { label: "Form" },
  ];
  const [value, set] = useModel(p, "0");
  return (
    <div
      data-pros="GalleryGrid"
      className={cx("p-gallery-grid", p.className)}
      style={p.style}
    >
      <div>
        {list.map((s, i) => (
          <button
            type="button"
            key={i}
            aria-pressed={value === String(i)}
            onClick={() => set(String(i))}
          >
            {s.image ? (
              <img src={s.image} alt={s.label} />
            ) : (
              <Mark variant={i} />
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite">
        <span>SELECTED STUDY</span> {list[Number(value)]?.label ?? "None"} ↗
      </p>
    </div>
  );
}
/** A tilting instant-photo frame with an editable handwritten caption. */
export function Polaroid(p: ProsProps) {
  const [value, set] = useModel(p, p.title ?? "Somewhere, slowly.");
  return (
    <figure
      data-pros="Polaroid"
      className={cx("p-polaroid", p.className)}
      style={p.style}
    >
      {p.image ? (
        <img src={p.image} alt={p.description ?? "Collected memory"} />
      ) : (
        <div className="p-polaroid-art">
          <Mark variant={4} />
        </div>
      )}
      <figcaption>
        <input
          aria-label="Photo caption"
          disabled={p.disabled}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
        <small>01 / KEEP THIS MOMENT</small>
      </figcaption>
    </figure>
  );
}
/** A video frame that uses native playback when a source is provided. */
export function VideoFrame(p: ProsProps) {
  return (
    <figure
      data-pros="VideoFrame"
      className={cx("p-video-frame", p.className)}
      style={p.style}
    >
      {p.href ? (
        <video
          controls
          preload="metadata"
          poster={p.image}
          src={p.href}
          aria-label={p.title ?? "Featured video"}
        />
      ) : (
        <div className="p-video-placeholder">
          <Mark variant={2} />
          <button
            type="button"
            className="p-round"
            aria-label="Request video playback"
            onClick={() => p.onAction?.("play")}
          >
            ▶
          </button>
          <small>CONNECT A VIDEO SOURCE</small>
        </div>
      )}
      <figcaption>
        <b>{p.title ?? "A study in movement."}</b>
        <small>{p.description ?? "FILM / 001"}</small>
      </figcaption>
    </figure>
  );
}
/** A minimal native audio player in a sleeve-like frame. */
export function AudioPlayer(p: ProsProps) {
  return (
    <div
      data-pros="AudioPlayer"
      className={cx("p-audio-player", p.className)}
      style={p.style}
    >
      <div className="p-record" aria-hidden="true">
        <i />
      </div>
      <div>
        <small>NOW IN YOUR ROTATION</small>
        <h3>{p.title ?? "Quiet frequencies."}</h3>
        {p.href ? (
          <audio
            controls
            preload="metadata"
            src={p.href}
            aria-label={p.title ?? "Audio track"}
          />
        ) : (
          <p>{p.description ?? "Pass an audio URL through href to listen."}</p>
        )}
      </div>
    </div>
  );
}
/** Overlapping avatars that expand into individually labeled people. */
export function AvatarStack(p: ProsProps) {
  const list = p.items ?? [
    { label: "Alex" },
    { label: "Sam" },
    { label: "Jules" },
    { label: "Morgan" },
  ];
  return (
    <div
      data-pros="AvatarStack"
      className={cx("p-avatar-stack", p.className)}
      style={p.style}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          aria-label={"View " + s.label}
          onClick={() => p.onAction?.(s.label)}
        >
          {s.image ? (
            <img src={s.image} alt="" />
          ) : (
            <span>{s.label.slice(0, 1)}</span>
          )}
          <small>{s.label}</small>
        </button>
      ))}
      <b>{p.title ?? "Better together."}</b>
    </div>
  );
}
/** A record-sleeve composition that slips its disc out on interaction. */
export function CoverArt(p: ProsProps) {
  const [out, toggle] = useToggle(p);
  return (
    <button
      data-pros="CoverArt"
      type="button"
      className={cx("p-cover-art", p.className, out && "is-active")}
      style={p.style}
      aria-pressed={out}
      onClick={() => toggle()}
    >
      <span className="p-record">
        <i />
      </span>
      <span className="p-sleeve">
        <small>PROS / SOUND STUDIES</small>
        <Mark variant={1} />
        <b>{p.title ?? "IN GOOD TIME"}</b>
      </span>
    </button>
  );
}
/** A gallery-style poster with oversized typographic artwork. */
export function PosterFrame(p: ProsProps) {
  return (
    <figure
      data-pros="PosterFrame"
      className={cx("p-poster-frame", p.className)}
      style={p.style}
    >
      <div>
        <small>AN EXERCISE IN</small>
        <strong>{p.title ?? "GOOD FORM"}</strong>
        <Mark variant={5} />
        <span>STUDY 001 · INDEPENDENT BY DESIGN</span>
      </div>
      <figcaption>
        {p.description ?? "Printed matter. Moving ideas."}
      </figcaption>
    </figure>
  );
}
/** A single-slide carousel with bounded controls and accessible status. */
export function Carousel(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, "0");
  const index = Math.max(0, Math.min(list.length - 1, Number(value) || 0));
  const s = list[index];
  return (
    <div
      data-pros="Carousel"
      className={cx("p-carousel", p.className)}
      style={p.style}
      aria-roledescription="carousel"
      aria-label={p.label ?? "Object studies"}
    >
      <div className="p-carousel-slide p-enter" key={index}>
        {s?.image ? (
          <img src={s.image} alt={s.label} />
        ) : (
          <Mark variant={index} />
        )}
        <h3>{s?.label ?? "No slides"}</h3>
        <p>{s?.description}</p>
      </div>
      <div className="p-between">
        <button
          type="button"
          className="p-round"
          aria-label="Previous slide"
          disabled={!list.length || p.disabled}
          onClick={() => set(String((index - 1 + list.length) % list.length))}
        >
          ←
        </button>
        <span aria-live="polite">
          {list.length ? index + 1 : 0} / {list.length}
        </span>
        <button
          type="button"
          className="p-round"
          aria-label="Next slide"
          disabled={!list.length || p.disabled}
          onClick={() => set(String((index + 1) % list.length))}
        >
          →
        </button>
      </div>
    </div>
  );
}
/** A monochrome wordmark wall with staggered hover movement. */
export function LogoWall(p: ProsProps) {
  return (
    <div
      data-pros="LogoWall"
      className={cx("p-logo-wall", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          { label: "FORM." },
          { label: "ordinary" },
          { label: "STILL" },
          { label: "room" },
          { label: "OFFSET" },
          { label: "somewhere" },
        ]
      ).map((s, i) => (
        <button
          type="button"
          key={i}
          onClick={() => p.onAction?.(s.label)}
          style={{ animationDelay: i * 60 + "ms" }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
/** A media caption with expandable technical metadata. */
export function MediaCaption(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div
      data-pros="MediaCaption"
      className={cx("p-media-caption", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <div>
          <small>PLATE {p.value ?? "004"}</small>
          <h3>{p.title ?? "The shape of quiet."}</h3>
        </div>
        <button
          type="button"
          className="p-round"
          aria-label="Toggle image information"
          aria-expanded={open}
          onClick={() => set(!open)}
        >
          {open ? "−" : "i"}
        </button>
      </div>
      {open && (
        <p className="p-enter">
          {p.description ?? "Studio study · Natural light · Edition of 25"}
        </p>
      )}
    </div>
  );
}
/** An asymmetric image mosaic with caption overlays and actionable tiles. */
export function MosaicGallery(p: ProsProps) {
  return (
    <div
      data-pros="MosaicGallery"
      className={cx("p-mosaic-gallery", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          { label: "Form study" },
          { label: "Soft edges" },
          { label: "A new angle" },
        ]
      ).map((s, i) => (
        <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
          {s.image ? (
            <img src={s.image} alt={s.label} />
          ) : (
            <Mark variant={i + 3} />
          )}
          <span>
            {s.label}
            <Arrow diagonal />
          </span>
        </button>
      ))}
    </div>
  );
}
