import { Icon } from "./icons";
import { useId, useState } from "react";
import {
  type ProsProps,
  cx,
  useModel,
  useContentTransition,
  Arrow,
} from "./core";
/** A staggered word reveal that replays on demand. */
export function WordReveal(p: ProsProps) {
  const [key, set] = useState(0);
  return (
    <div
      data-pros="WordReveal"
      className={cx("p-word-reveal", p.className)}
      style={p.style}
    >
      <h3 key={key} aria-label={p.title ?? "Make room for the unexpected."}>
        {(p.title ?? "Make room for the unexpected.")
          .split(" ")
          .map((word, i) => (
            <span
              aria-hidden="true"
              key={i}
              style={{ animationDelay: i * 90 + "ms" }}
            >
              {word}{" "}
            </span>
          ))}
      </h3>
      <button type="button" className="p-text-btn" onClick={() => set(key + 1)}>
        Replay <Icon name="refresh" />
      </button>
    </div>
  );
}
/** A looping typographic band with a pause-on-hover affordance. */
export function MarqueeText(p: ProsProps) {
  const text = p.title ?? "GOOD THINGS TAKE MOVEMENT";
  return (
    <div
      data-pros="MarqueeText"
      className={cx("p-marquee-text", p.className)}
      style={p.style}
      aria-label={text}
    >
      <div aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>
            {text}{" "}
            <b>
              <Icon name="flower" />
            </b>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
/** A monumental numeral with a small editorial annotation. */
export function MonumentNumber(p: ProsProps) {
  return (
    <div
      data-pros="MonumentNumber"
      className={cx("p-monument-number", p.className)}
      style={p.style}
    >
      <span>
        {p.value ?? "210"}
        <i>
          <Icon name="arrow" />
        </i>
      </span>
      <p>{p.title ?? "Small details. Big difference."}</p>
    </div>
  );
}
/** A sentence whose emphasized word changes when pressed. */
export function RotatingWord(p: ProsProps) {
  const list = p.items ?? [
    { label: "alive." },
    { label: "human." },
    { label: "yours." },
  ];
  const [index, set] = useState(0);
  return (
    <div
      data-pros="RotatingWord"
      className={cx("p-rotating-word", p.className)}
      style={p.style}
    >
      <h3>
        {p.title ?? "Make it feel"}
        <button
          type="button"
          disabled={p.disabled || !list.length}
          onClick={() => {
            set((index + 1) % list.length);
            p.onValueChange?.(list[(index + 1) % list.length]?.label ?? "");
          }}
        >
          <span key={index} className="p-enter">
            {list[index]?.label ?? "alive."}
          </span>
          <small>
            <Icon name="refresh" />
          </small>
        </button>
      </h3>
    </div>
  );
}
/** An outlined headline that fills with ink on hover or focus. */
export function InkHeadline(p: ProsProps) {
  return (
    <div
      data-pros="InkHeadline"
      tabIndex={0}
      className={cx("p-ink-headline", p.className)}
      style={p.style}
    >
      {p.title ?? "FEEL SOMETHING."}
    </div>
  );
}
/** A monospace typewriter reveal with a replay button. */
export function TypewriterText(p: ProsProps) {
  const [key, set] = useState(0);
  return (
    <div
      data-pros="TypewriterText"
      className={cx("p-typewriter-text", p.className)}
      style={p.style}
    >
      <small>TRANSMISSION 001</small>
      <p key={key}>{p.title ?? "A new idea is taking shape."}</p>
      <button type="button" className="p-text-btn" onClick={() => set(key + 1)}>
        Read again <Icon name="refresh" />
      </button>
    </div>
  );
}
/** A compact editorial heading with a numbered eyebrow. */
export function SectionHeading(p: ProsProps) {
  return (
    <div
      data-pros="SectionHeading"
      className={cx("p-section-heading", p.className)}
      style={p.style}
    >
      <span className="p-eyebrow">{p.label ?? "01 / THE COLLECTION"}</span>
      <div>
        <h3>{p.title ?? "A different kind of ordinary."}</h3>
        <Arrow diagonal />
      </div>
      <p>
        {p.description ?? "Thoughtful details for things people use every day."}
      </p>
    </div>
  );
}
/** An oversized opening letter that anchors a reading excerpt. */
export function DropcapText(p: ProsProps) {
  const text =
    p.description ??
    "Every great idea begins with a small observation. Something slightly out of place. A familiar thing seen from an unfamiliar angle. This is where we start.";
  return (
    <p
      data-pros="DropcapText"
      className={cx("p-dropcap-text", p.className)}
      style={p.style}
    >
      {text}
    </p>
  );
}
/** A solid marker highlight that sweeps underneath a phrase. */
export function HighlightText(p: ProsProps) {
  return (
    <p
      data-pros="HighlightText"
      className={cx("p-highlight-text", p.className)}
      style={p.style}
    >
      {p.description ?? "Design for the moments that"}{" "}
      <mark>{p.title ?? "make you stop."}</mark>
    </p>
  );
}
/** A circular text seal rendered as responsive vector type. */
export function CircularText(p: ProsProps) {
  const id = useId();
  return (
    <div
      data-pros="CircularText"
      className={cx("p-circular-text", p.className)}
      style={p.style}
    >
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={p.title ?? "Independent by design"}
      >
        <defs>
          <path id={"circle-" + id} d="M100 20a80 80 0 1 1-.01 0" />
        </defs>
        <text>
          <textPath href={"#circle-" + id}>
            {(p.title ?? "INDEPENDENT BY DESIGN • MADE TO MOVE •") + " "}
          </textPath>
        </text>
      </svg>
      <b aria-hidden="true">
        <Icon name="flower" />
      </b>
    </div>
  );
}
/** An editorial text pair split into bold and soft columns. */
export function SplitStatement(p: ProsProps) {
  return (
    <div
      data-pros="SplitStatement"
      className={cx("p-split-statement", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "Less noise."}</h3>
      <p>
        {p.description ??
          "More character. More intention. More of the things that matter."}
      </p>
    </div>
  );
}
/** An animated status word paired with an active indicator. */
export function StatusText(p: ProsProps) {
  const [value, set] = useModel(p, "Available");
  const panel = useContentTransition<HTMLSpanElement>(value);
  return (
    <button
      data-pros="StatusText"
      type="button"
      disabled={p.disabled}
      className={cx(
        "p-status-text",
        p.className,
        value === "Available" && "is-active",
      )}
      style={p.style}
      onClick={() => set(value === "Available" ? "Focused" : "Available")}
    >
      <i />
      <span ref={panel}>{p.title ?? value}</span>
      <small>
        FOR GOOD IDEAS <Icon name="arrow" />
      </small>
    </button>
  );
}
/** A caption strip with its own tiny reading progress motif. */
export function CaptionStrip(p: ProsProps) {
  return (
    <div
      data-pros="CaptionStrip"
      className={cx("p-caption-strip", p.className)}
      style={p.style}
    >
      <span>FIG. {p.value ?? "01"}</span>
      <p>{p.title ?? "A study in balance and motion."}</p>
      <i aria-hidden="true" />
    </div>
  );
}
/** A staggered letter composition with a playful raised character. */
export function LetterScatter(p: ProsProps) {
  const text = p.title ?? "PLAY";
  return (
    <div
      data-pros="LetterScatter"
      className={cx("p-letter-scatter", p.className)}
      style={p.style}
      aria-label={text}
    >
      {text.split("").map((letter, i) => (
        <span
          aria-hidden="true"
          key={i}
          style={{ "--letter-index": i } as React.CSSProperties}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
/** A text disclosure that smoothly reveals a longer explanation. */
export function ReadMoreText(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div
      data-pros="ReadMoreText"
      className={cx("p-read-more", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "There is always more."}</h3>
      <p>
        {p.description ?? "Start with curiosity. Follow the interesting edges."}
      </p>
      <div className={cx("p-reveal-region", open && "is-open")}>
        <div>
          {p.children ?? (
            <p>
              Try a different rhythm. Give the idea some breathing room. Keep
              the parts that make you feel something, and let the rest fall
              away.
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        className="p-action"
        aria-expanded={open}
        onClick={() => set(!open)}
      >
        {open ? "A little less" : "Keep reading"}
        <span>
          {open ? (
            <>
              <Icon name="minus" />
            </>
          ) : (
            <Icon name="plus" />
          )}
        </span>
      </button>
    </div>
  );
}
