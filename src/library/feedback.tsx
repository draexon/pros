import { useState } from "react";
import { type ProsProps, cx, useModel, Mark, Arrow } from "./core";
/** A dismissible announcement that slides away when acknowledged. */
export function AnnouncementBanner(p: ProsProps) {
  const [dismissed, set] = useState(false);
  return (
    <div
      data-pros="AnnouncementBanner"
      className={cx("p-announcement-wrap", p.className)}
      style={p.style}
    >
      {dismissed ? (
        <button type="button" className="p-text-btn" onClick={() => set(false)}>
          Show announcement ↻
        </button>
      ) : (
        <aside className="p-announcement" role="status">
          <span>✳</span>
          <p>{p.title ?? "Something good just landed."}</p>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => {
              set(true);
              p.onAction?.("dismiss");
            }}
          >
            ×
          </button>
        </aside>
      )}
    </div>
  );
}
/** A success message with a drawn check and acknowledgment action. */
export function SuccessNotice(p: ProsProps) {
  return (
    <div
      data-pros="SuccessNotice"
      className={cx("p-notice p-success-notice", p.className)}
      style={p.style}
      role="status"
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" />
        <path d="m13 24 8 8 15-16" />
      </svg>
      <div>
        <h3>{p.title ?? "Nicely done."}</h3>
        <p>{p.description ?? "Your changes are saved and ready to go."}</p>
      </div>
    </div>
  );
}
/** An error message with a retry action delegated to the host. */
export function ErrorNotice(p: ProsProps) {
  return (
    <div
      data-pros="ErrorNotice"
      className={cx("p-notice p-error-notice", p.className)}
      style={p.style}
      role="alert"
    >
      <span className="p-notice-icon">!</span>
      <div>
        <h3>{p.title ?? "A small interruption."}</h3>
        <p>
          {p.description ?? "That did not go through. Give it another try."}
        </p>
        <button
          type="button"
          className="p-action"
          disabled={p.disabled}
          onClick={() => p.onAction?.("retry")}
        >
          Try again <Arrow />
        </button>
      </div>
    </div>
  );
}
/** A friendly warning with explicit confirm and dismiss actions. */
export function WarningNotice(p: ProsProps) {
  const [dismissed, set] = useState(false);
  return (
    <div
      data-pros="WarningNotice"
      className={cx("p-warning-notice", p.className)}
      style={p.style}
    >
      {dismissed ? (
        <button type="button" className="p-text-btn" onClick={() => set(false)}>
          Show reminder ↻
        </button>
      ) : (
        <>
          <span className="p-pill">A QUICK HEADS-UP</span>
          <h3>{p.title ?? "A little room to grow."}</h3>
          <p>{p.description ?? "You are close to your storage limit."}</p>
          <div className="p-row">
            <button
              type="button"
              className="p-btn"
              onClick={() => p.onAction?.("manage")}
            >
              Manage space
            </button>
            <button
              type="button"
              className="p-text-btn"
              onClick={() => set(true)}
            >
              Later
            </button>
          </div>
        </>
      )}
    </div>
  );
}
/** A quiet loading skeleton with a wide traveling wash. */
export function SkeletonCard(p: ProsProps) {
  return (
    <div
      data-pros="SkeletonCard"
      role="status"
      aria-label={p.label ?? "Loading content"}
      className={cx("p-skeleton", p.className)}
      style={p.style}
    >
      <div />
      <i />
      <i />
      <i />
      <span className="p-sr">Loading…</span>
    </div>
  );
}
/** Three bouncing dots for compact waiting states. */
export function DotLoader(p: ProsProps) {
  return (
    <div
      data-pros="DotLoader"
      className={cx("p-dot-loader", p.className)}
      style={p.style}
      role="status"
    >
      <span aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <small>{p.label ?? p.title ?? "Good things are coming"}</small>
    </div>
  );
}
/** A morphing four-square loader for larger loading surfaces. */
export function BlockLoader(p: ProsProps) {
  return (
    <div
      data-pros="BlockLoader"
      className={cx("p-block-loader", p.className)}
      style={p.style}
      role="status"
    >
      <div aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <small>{p.label ?? "Finding the right shape…"}</small>
    </div>
  );
}
/** A large numeric progress meter with an accessible native track. */
export function ProgressMeter(p: ProsProps) {
  const progress = Math.max(0, Math.min(100, Number(p.value ?? "72") || 0));
  return (
    <div
      data-pros="ProgressMeter"
      className={cx("p-progress-meter", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <b>{p.title ?? "Taking shape"}</b>
        <span className="p-number">
          {progress}
          <small>%</small>
        </span>
      </div>
      <progress aria-label={p.label ?? "Progress"} max={100} value={progress} />
      <small>{p.description ?? "Every small step counts."}</small>
    </div>
  );
}
/** A circular gauge whose solid arc tracks a supplied value. */
export function RingProgress(p: ProsProps) {
  const value = Math.max(0, Math.min(100, Number(p.value ?? "84") || 0));
  return (
    <div
      data-pros="RingProgress"
      className={cx("p-ring-progress", p.className)}
      style={p.style}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={p.label ?? "Completion"}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="50" />
        <circle
          cx="60"
          cy="60"
          r="50"
          strokeDasharray="314.16"
          strokeDashoffset={314.16 * (1 - value / 100)}
        />
      </svg>
      <span>
        <b>{value}%</b>
        <small>{p.title ?? "COMPLETE"}</small>
      </span>
    </div>
  );
}
/** An empty collection state with an inviting first action. */
export function EmptyCollection(p: ProsProps) {
  return (
    <div
      data-pros="EmptyCollection"
      className={cx("p-empty-collection", p.className)}
      style={p.style}
    >
      <Mark variant={1} />
      <h3>{p.title ?? "A fresh beginning."}</h3>
      <p>
        {p.description ?? "This space is waiting for your first good find."}
      </p>
      <button
        type="button"
        className="p-btn"
        onClick={() => p.onAction?.("create")}
      >
        {p.label ?? "Add something"} +
      </button>
    </div>
  );
}
/** A no-results state that exposes a clear-filters action. */
export function NoResults(p: ProsProps) {
  return (
    <div
      data-pros="NoResults"
      className={cx("p-no-results", p.className)}
      style={p.style}
    >
      <span aria-hidden="true">⌕</span>
      <h3>{p.title ?? "Nothing here. Yet."}</h3>
      <p>
        {p.description ?? "Try a different word or give your search more room."}
      </p>
      <button
        type="button"
        className="p-action"
        onClick={() => p.onAction?.("clear")}
      >
        Clear filters <span>↻</span>
      </button>
    </div>
  );
}
/** A save status chip with controlled or local workflow states. */
export function SaveIndicator(p: ProsProps) {
  const [value, set] = useModel(p, "Saved");
  return (
    <button
      data-pros="SaveIndicator"
      type="button"
      className={cx("p-save-indicator", p.className)}
      style={p.style}
      disabled={p.disabled}
      onClick={() => {
        set(value === "Saved" ? "Unsaved changes" : "Saved");
        p.onAction?.("save");
      }}
    >
      <i className={value === "Saved" ? "is-saved" : ""} />
      <span aria-live="polite">{value}</span>
      <small>↻</small>
    </button>
  );
}
/** A connection indicator with a reconnect callback. */
export function ConnectionStatus(p: ProsProps) {
  const online = p.value !== "offline";
  return (
    <div
      data-pros="ConnectionStatus"
      className={cx("p-connection-status", p.className, online && "is-online")}
      style={p.style}
      role="status"
    >
      <span>
        <i />
        <b>{online ? "All systems connected" : "Connection interrupted"}</b>
      </span>
      <small>
        {p.description ??
          (online
            ? "Everything is in sync."
            : "Your changes are safe locally.")}
      </small>
      {!online && (
        <button
          type="button"
          className="p-action"
          onClick={() => p.onAction?.("reconnect")}
        >
          Reconnect ↻
        </button>
      )}
    </div>
  );
}
/** A stacked notification preview with an unread counter. */
export function InboxNotice(p: ProsProps) {
  const [read, set] = useState(false);
  return (
    <button
      data-pros="InboxNotice"
      type="button"
      className={cx("p-inbox-notice", p.className, read && "is-read")}
      style={p.style}
      aria-pressed={read}
      onClick={() => {
        set(!read);
        p.onAction?.(read ? "unread" : "read");
      }}
    >
      <span className="p-inbox-symbol">
        ↳<i>{read ? "✓" : (p.value ?? "3")}</i>
      </span>
      <span>
        <b>{p.title ?? "You are in the loop."}</b>
        <small>
          {read
            ? "All caught up"
            : (p.description ?? "Three new things worth a look.")}
        </small>
      </span>
      <Arrow />
    </button>
  );
}
/** A celebratory milestone with a bounded burst of confetti. */
export function MilestoneNotice(p: ProsProps) {
  const [key, set] = useState(0);
  return (
    <div
      data-pros="MilestoneNotice"
      className={cx("p-milestone", p.className)}
      style={p.style}
    >
      <div key={key} className="p-confetti" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <span className="p-milestone-star">✳</span>
      <h3>{p.title ?? "Look how far you came."}</h3>
      <p>{p.description ?? "Your first 100. Here is to the next chapter."}</p>
      <button
        type="button"
        className="p-text-btn"
        onClick={() => {
          set(key + 1);
          p.onAction?.("celebrate");
        }}
      >
        A little celebration ↗
      </button>
    </div>
  );
}
