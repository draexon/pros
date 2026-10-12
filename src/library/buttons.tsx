import { Icon } from "./icons";
import { useEffect, useId, useRef, useState } from "react";
import {
  type ProsProps,
  cx,
  Arrow,
  useToggle,
  useModel,
  useSelectionIndicator,
  ActionMenu,
} from "./core";
/** A solid pill with a sliding arrow capsule. */
export function ArrowButton(p: ProsProps) {
  return (
    <button
      data-pros="ArrowButton"
      type="button"
      className={cx("p-btn p-arrow-button", p.className)}
      style={p.style}
      disabled={p.disabled}
      onClick={() => p.onAction?.("press")}
    >
      {p.label ?? p.title ?? "Make a move"}
      <span>
        <Arrow />
      </span>
    </button>
  );
}
/** A button whose label rolls upward on interaction. */
export function RollingButton(p: ProsProps) {
  const label = p.label ?? p.title ?? "Keep exploring";
  return (
    <button
      data-pros="RollingButton"
      type="button"
      className={cx("p-btn p-rolling-button", p.className)}
      style={p.style}
      disabled={p.disabled}
      onClick={() => p.onAction?.("press")}
    >
      <span>
        <i>{label}</i>
        <i aria-hidden="true">
          {label} <Icon name="arrow" />
        </i>
      </span>
    </button>
  );
}
/** A circular launch control with orbiting decorative text. */
export function OrbitButton(p: ProsProps) {
  const id = useId();
  return (
    <button
      data-pros="OrbitButton"
      type="button"
      className={cx("p-orbit-button", p.className)}
      style={p.style}
      disabled={p.disabled}
      aria-label={p.label ?? p.title ?? "Explore the collection"}
      onClick={() => p.onAction?.("explore")}
    >
      <svg viewBox="0 0 132 132" aria-hidden="true" focusable="false">
        <defs>
          <path
            id={"orbit-" + id}
            d="M66 20a46 46 0 1 1 0 92a46 46 0 1 1 0-92"
          />
        </defs>
        <text>
          <textPath
            href={"#orbit-" + id}
            textLength="276"
            lengthAdjust="spacing"
            startOffset="2%"
          >
            EXPLORE · EXPLORE ·
          </textPath>
        </text>
      </svg>
      <b>
        <Icon name="arrow" />
      </b>
    </button>
  );
}
/** A raised keycap with physical travel on press. */
export function KeycapButton(p: ProsProps) {
  return (
    <button
      data-pros="KeycapButton"
      type="button"
      className={cx("p-keycap", p.className)}
      style={p.style}
      disabled={p.disabled}
      onClick={() => p.onAction?.("press")}
    >
      <span>
        {p.label ?? p.title ?? "Enter"} <kbd>↵</kbd>
      </span>
    </button>
  );
}
/** A two-part control that reveals additional actions. */
export function SplitButton(p: ProsProps) {
  const [open, set] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div
      data-pros="SplitButton"
      className={cx("p-split-button", p.className)}
      style={p.style}
    >
      <div>
        <button
          type="button"
          className="p-btn"
          disabled={p.disabled}
          onClick={() => p.onAction?.("publish")}
        >
          {p.label ?? "Publish"}
        </button>
        <button
          ref={anchor}
          type="button"
          className="p-btn"
          disabled={p.disabled}
          aria-label="More publishing options"
          aria-expanded={open}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              set(true);
            }
          }}
          onClick={() => set(!open)}
        >
          <Icon name="down" />
        </button>
      </div>
      <ActionMenu
        open={open && !p.disabled}
        onClose={() => set(false)}
        anchor={anchor}
        items={
          p.items ??
          ["Save draft", "Schedule", "Export"].map((label) => ({ label }))
        }
        onAction={p.onAction}
      />
    </div>
  );
}
/** A high-contrast bookmark toggle that blooms on selection. */
export function BookmarkButton(p: ProsProps) {
  const [saved, toggle] = useToggle(p);
  return (
    <button
      data-pros="BookmarkButton"
      type="button"
      disabled={p.disabled}
      className={cx("p-bookmark-button", p.className, saved && "is-active")}
      style={p.style}
      aria-pressed={saved}
      onClick={() => toggle()}
    >
      <span>
        {saved ? (
          <>
            <Icon name="bookmark-filled" />
          </>
        ) : (
          <>
            <Icon name="bookmark" />
          </>
        )}
      </span>
      {saved ? "Saved to collection" : (p.label ?? "Save for later")}
    </button>
  );
}
/** A like control with a bouncing counter. */
export function LikeButton(p: ProsProps) {
  const [liked, toggle] = useToggle(p);
  return (
    <button
      data-pros="LikeButton"
      type="button"
      disabled={p.disabled}
      className={cx("p-like-button", p.className, liked && "is-active")}
      style={p.style}
      aria-pressed={liked}
      onClick={() => toggle()}
    >
      <span aria-hidden="true">
        {liked ? (
          <>
            <Icon name="heart-filled" />
          </>
        ) : (
          <>
            <Icon name="heart" />
          </>
        )}
      </span>
      <b key={String(liked)}>{(p.min ?? 128) + (liked ? 1 : 0)}</b>
      <span className="p-sr">{p.label ?? "Like"}</span>
    </button>
  );
}
/** A copy control with honest success and failure feedback. */
export function CopyButton(p: ProsProps) {
  const [status, set] = useState("Copy");
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        p.value ?? p.description ?? "Made with Pros.",
      );
      set("Copied");
      p.onAction?.("copied");
    } catch {
      set("Copy unavailable");
    }
  }
  return (
    <button
      data-pros="CopyButton"
      type="button"
      disabled={p.disabled}
      className={cx("p-btn p-copy-button", p.className)}
      style={p.style}
      onClick={copy}
    >
      <span aria-hidden="true">
        <Icon name="copy" />
      </span>
      <span aria-live="polite">
        {status === "Copy" ? (p.label ?? status) : status}
      </span>
    </button>
  );
}
/** A press-and-hold confirmation with keyboard support. */
export function HoldButton(p: ProsProps) {
  const [state, set] = useState("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    set((s) => (s === "done" ? s : "idle"));
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const start = () => {
    if (p.disabled || timer.current || state === "done") return;
    set("holding");
    timer.current = setTimeout(() => {
      timer.current = null;
      set("done");
      p.onAction?.("confirm");
    }, 900);
  };
  return (
    <button
      data-pros="HoldButton"
      type="button"
      className={cx("p-btn p-hold-button", p.className, "is-" + state)}
      style={p.style}
      disabled={p.disabled}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onBlur={cancel}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") cancel();
      }}
    >
      <i />
      <span aria-live="polite">
        {state === "done" ? (
          <>
            Confirmed <Icon name="check" />
          </>
        ) : (
          (p.label ?? "Hold to confirm")
        )}
      </span>
    </button>
  );
}
/** A download action with externally controlled progress. */
export function DownloadButton(p: ProsProps) {
  const progress = Math.max(0, Math.min(100, Number(p.value) || 0));
  return (
    <button
      data-pros="DownloadButton"
      type="button"
      disabled={p.disabled}
      className={cx("p-btn p-download-button", p.className)}
      style={p.style}
      onClick={() => p.onAction?.("download")}
    >
      <span aria-hidden="true">
        <Icon name="down" />
      </span>
      {p.label ?? "Download asset"}
      {progress > 0 && <span>{progress}%</span>}
      <i style={{ width: progress + "%" }} />
    </button>
  );
}
/** A compact stateful audio toggle. */
export function SoundButton(p: ProsProps) {
  const [on, toggle] = useToggle(p);
  return (
    <button
      data-pros="SoundButton"
      type="button"
      disabled={p.disabled}
      aria-pressed={on}
      aria-label={on ? "Mute sound" : "Enable sound"}
      className={cx("p-sound-button", p.className, on && "is-playing")}
      style={p.style}
      onClick={() => toggle()}
    >
      <span className="p-wave" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i
            key={i}
            style={{
              height: on ? 12 + (i % 3) * 6 + "px" : "2px",
              animationDelay: i * 90 + "ms",
            }}
          />
        ))}
      </span>
      <span>{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
/** A three-position segmented control with a traveling background. */
export function SegmentButton(p: ProsProps) {
  const list = p.items ?? [
    { label: "Day" },
    { label: "Week" },
    { label: "Month" },
  ];
  const [value, set] = useModel(p, list[0]?.label ?? "");
  const selection = useSelectionIndicator(value);
  return (
    <div
      data-pros="SegmentButton"
      ref={selection}
      role="group"
      aria-label={p.label ?? "Time range"}
      className={cx("p-segment p-selection-track", p.className)}
      style={p.style}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          aria-pressed={value === s.label}
          className={value === s.label ? "is-active" : ""}
          onClick={() => set(s.label)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
/** A pill that replaces its text with a confirmation check. */
export function ConfirmButton(p: ProsProps) {
  const [done, toggle] = useToggle(p);
  return (
    <button
      data-pros="ConfirmButton"
      type="button"
      disabled={p.disabled}
      aria-pressed={done}
      className={cx("p-btn p-confirm-button", p.className, done && "is-done")}
      style={p.style}
      onClick={() => {
        toggle();
        p.onAction?.(done ? "undo" : "confirm");
      }}
    >
      <span key={String(done)} className="p-enter">
        {done ? (
          <>
            <Icon name="check" /> All set
          </>
        ) : (
          (p.label ?? "Count me in")
        )}
      </span>
    </button>
  );
}
/** A floating action button that unfolds a labeled action cluster. */
export function FloatingButton(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div
      data-pros="FloatingButton"
      className={cx("p-fab-wrap", p.className)}
      style={p.style}
    >
      {open && (
        <div className="p-fab-actions p-enter">
          {(
            p.items ?? [
              { label: "New note" },
              { label: "Upload file" },
              { label: "Create collection" },
            ]
          ).map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                p.onAction?.(s.label);
                set(false);
              }}
            >
              {s.label} <Icon name="arrow" />
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={p.disabled}
        className={cx("p-fab", open && "is-active")}
        aria-label={p.label ?? "Create"}
        aria-expanded={open}
        onClick={() => set(!open)}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
/** A rotating two-mode switch with a full surface inversion. */
export function InvertButton(p: ProsProps) {
  const [on, toggle] = useToggle(p);
  return (
    <button
      data-pros="InvertButton"
      type="button"
      disabled={p.disabled}
      className={cx("p-invert-button", p.className, on && "is-active")}
      style={p.style}
      aria-pressed={on}
      onClick={() => toggle()}
    >
      <span aria-hidden="true">
        <Icon name="circle" />
      </span>
      {on ? "Light side" : (p.label ?? "Dark side")}
    </button>
  );
}
