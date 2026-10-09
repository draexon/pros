import { useId, useState } from "react";
import {
  type ProsProps,
  cx,
  DialogSurface,
  itemsOf,
  itemValue,
  Mark,
  Action,
  Arrow,
} from "./core";
/** A searchable command dialog with keyboard-native result buttons. */
export function CommandPalette(p: ProsProps) {
  const [open, set] = useState(false);
  const [query, search] = useState("");
  const list = itemsOf(p).filter((x) =>
    (x.label + " " + x.description).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div data-pros="CommandPalette" className={p.className} style={p.style}>
      <button
        type="button"
        className="p-command-trigger"
        onClick={() => set(true)}
      >
        <span>⌕ {p.label ?? "Find your next move"}</span>
        <kbd>⌘ K</kbd>
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "What would you like to do?"}
        className="p-command-dialog"
      >
        <input
          autoFocus
          aria-label="Search commands"
          placeholder="Type to find a command…"
          value={query}
          onChange={(e) => search(e.target.value)}
        />
        <div className="p-menu">
          {list.map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                p.onAction?.(itemValue(s));
                set(false);
              }}
            >
              <span>
                {s.label}
                <small>{s.description}</small>
              </span>
              <Arrow />
            </button>
          ))}
          {!list.length && <p>No matching commands.</p>}
        </div>
      </DialogSurface>
    </div>
  );
}
/** A side drawer for contextual project information. */
export function SideDrawer(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div data-pros="SideDrawer" className={p.className} style={p.style}>
      <button type="button" className="p-btn" onClick={() => set(true)}>
        {p.label ?? "Open the details"} ↗
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "A closer look."}
        className="p-side-drawer"
      >
        <Mark variant={3} />
        <p>{p.description ?? "All the details, with room to breathe."}</p>
        {p.children ?? (
          <dl className="p-detail-list">
            <div>
              <dt>Collection</dt>
              <dd>Independent objects</dd>
            </div>
            <div>
              <dt>Edition</dt>
              <dd>01 of 100</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>In progress</dd>
            </div>
          </dl>
        )}
        <Action p={p}>Open project</Action>
      </DialogSurface>
    </div>
  );
}
/** A destructive-action dialog requiring an explicit decision. */
export function ConfirmDialog(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div data-pros="ConfirmDialog" className={p.className} style={p.style}>
      <button
        type="button"
        className="p-btn p-soft"
        disabled={p.disabled}
        onClick={() => set(true)}
      >
        {p.label ?? "Archive project"}
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "Make a little space?"}
      >
        <span className="p-dialog-symbol">↘</span>
        <p>
          {p.description ??
            "This project will move to your archive. You can bring it back whenever you like."}
        </p>
        <div className="p-row">
          <button
            type="button"
            className="p-btn p-soft"
            autoFocus
            onClick={() => set(false)}
          >
            Keep it here
          </button>
          <button
            type="button"
            className="p-btn"
            onClick={() => {
              p.onAction?.("confirm");
              set(false);
            }}
          >
            Archive project
          </button>
        </div>
      </DialogSurface>
    </div>
  );
}
/** A centered search overlay with grouped visual results. */
export function SpotlightSearch(p: ProsProps) {
  const [open, set] = useState(false);
  const [query, search] = useState("");
  const list = itemsOf(p).filter((x) =>
    x.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div data-pros="SpotlightSearch" className={p.className} style={p.style}>
      <button
        type="button"
        className="p-spotlight-trigger"
        onClick={() => set(true)}
      >
        ⌕ <span>{p.label ?? "Search the collection"}</span>
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "Follow your curiosity."}
        className="p-spotlight-dialog"
      >
        <input
          autoFocus
          aria-label="Search collection"
          placeholder="Start with a word…"
          value={query}
          onChange={(e) => search(e.target.value)}
        />
        <div className="p-grid">
          {list.map((s, i) => (
            <button
              type="button"
              className="p-search-result"
              key={i}
              onClick={() => {
                p.onAction?.(itemValue(s));
                set(false);
              }}
            >
              <Mark variant={i} />
              <b>{s.label}</b>
            </button>
          ))}
        </div>
        {!list.length && <p>No objects found. Try another word.</p>}
      </DialogSurface>
    </div>
  );
}
/** A zoomable image lightbox with a native modal focus trap. */
export function ImageLightbox(p: ProsProps) {
  const [open, set] = useState(false);
  const [zoom, setZoom] = useState(false);
  return (
    <div data-pros="ImageLightbox" className={p.className} style={p.style}>
      <button
        type="button"
        className="p-lightbox-thumb"
        aria-label={p.label ?? "Enlarge image"}
        onClick={() => set(true)}
      >
        {p.image ? (
          <img src={p.image} alt={p.title ?? "Object study"} />
        ) : (
          <Mark variant={2} />
        )}
        <span>VIEW FULL SIZE ↗</span>
      </button>
      <DialogSurface
        open={open}
        onClose={() => {
          set(false);
          setZoom(false);
        }}
        title={p.title ?? "Object study / 002"}
        className="p-lightbox-dialog"
      >
        <button
          type="button"
          className={cx("p-lightbox-image", zoom && "is-zoomed")}
          aria-label={zoom ? "Zoom out" : "Zoom in"}
          onClick={() => setZoom(!zoom)}
        >
          {p.image ? (
            <img src={p.image} alt={p.title ?? "Object study"} />
          ) : (
            <Mark variant={2} />
          )}
        </button>
        <small>Click image to {zoom ? "zoom out" : "zoom in"}.</small>
      </DialogSurface>
    </div>
  );
}
/** A product quick-view dialog with an adjustable quantity. */
export function QuickView(p: ProsProps) {
  const [open, set] = useState(false);
  const [qty, setQty] = useState(1);
  return (
    <div data-pros="QuickView" className={p.className} style={p.style}>
      <button type="button" className="p-btn" onClick={() => set(true)}>
        {p.label ?? "Take a closer look"} ↗
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "Everyday object."}
        className="p-quick-view"
      >
        <Mark variant={4} />
        <p>{p.description ?? "Made for daily rituals. Designed to stay."}</p>
        <label className="p-between">
          Quantity
          <input
            type="number"
            min={1}
            max={99}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(99, Number(e.target.value))))
            }
          />
        </label>
        <button
          type="button"
          className="p-btn"
          onClick={() => {
            p.onAction?.("add:" + qty);
            set(false);
          }}
        >
          Add to collection +
        </button>
      </DialogSurface>
    </div>
  );
}
/** A right-click context surface with an accessible button alternative. */
export function ContextMenu(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div
      data-pros="ContextMenu"
      className={cx("p-context-surface", p.className)}
      style={p.style}
      onContextMenu={(e) => {
        e.preventDefault();
        set(true);
      }}
    >
      <Mark variant={0} />
      <p>{p.title ?? "Every object has options."}</p>
      <button
        type="button"
        className="p-text-btn"
        aria-expanded={open}
        onClick={() => set(!open)}
      >
        Object options ···
      </button>
      {open && (
        <div
          className="p-menu p-enter"
          onKeyDown={(e) => {
            if (e.key === "Escape") set(false);
          }}
        >
          {(
            p.items ?? [
              { label: "Open" },
              { label: "Duplicate" },
              { label: "Archive" },
            ]
          ).map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                p.onAction?.(itemValue(s));
                set(false);
              }}
            >
              {s.label}
              <Arrow />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
/** A compact action popover built on native disclosure semantics. */
export function PopoverMenu(p: ProsProps) {
  return (
    <details
      data-pros="PopoverMenu"
      className={cx("p-popover-menu", p.className)}
      style={p.style}
    >
      <summary>
        {p.label ?? "A few more options"} <span>+</span>
      </summary>
      <div className="p-menu p-enter">
        {itemsOf(p).map((s, i) => (
          <button
            type="button"
            key={i}
            onClick={(e) => {
              p.onAction?.(itemValue(s));
              e.currentTarget.closest("details")?.removeAttribute("open");
            }}
          >
            {s.label}
            <Arrow />
          </button>
        ))}
      </div>
    </details>
  );
}
/** A contextual tooltip available on hover, focus, and click. */
export function TooltipBubble(p: ProsProps) {
  const id = useId();
  const [open, set] = useState(false);
  return (
    <div
      data-pros="TooltipBubble"
      className={cx("p-tooltip-wrap", p.className)}
      style={p.style}
    >
      <button
        type="button"
        className="p-btn p-soft"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => set(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape") set(false);
        }}
      >
        {p.label ?? "A little context"} ⓘ
      </button>
      <span
        id={id}
        role="tooltip"
        className={cx("p-tooltip", open && "is-open")}
      >
        {p.description ?? "Small details make everything feel considered."}
      </span>
    </div>
  );
}
/** A help drawer with expandable answers. */
export function HelpPanel(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div data-pros="HelpPanel" className={p.className} style={p.style}>
      <button
        type="button"
        className="p-help-trigger"
        onClick={() => set(true)}
      >
        ？ <span>{p.label ?? "A little help?"}</span>
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "Good questions."}
        className="p-side-drawer"
      >
        <p>
          {p.description ?? "A few things that might help you find your way."}
        </p>
        {(
          p.items ?? [
            {
              label: "Where do I begin?",
              description:
                "Start with one component. Make it yours. Build from there.",
            },
            {
              label: "Can I change the motion?",
              description:
                "Yes. Use the motion tokens or switch motion off in the provider.",
            },
            {
              label: "How do I get in touch?",
              description:
                "Use the contact action below to reach your workspace owner.",
            },
          ]
        ).map((s, i) => (
          <details className="p-help-answer" key={i}>
            <summary>{s.label} +</summary>
            <p>{s.description}</p>
          </details>
        ))}
        <Action p={p} action="contact">
          Contact the studio
        </Action>
      </DialogSurface>
    </div>
  );
}
/** A notification stack with individual dismiss and add controls. */
export function ToastStack(p: ProsProps) {
  const [toasts, set] = useState<number[]>([1]);
  const [next, setNext] = useState(2);
  return (
    <div
      data-pros="ToastStack"
      className={cx("p-toast-stack", p.className)}
      style={p.style}
    >
      <div aria-live="polite">
        {toasts.map((id) => (
          <div className="p-toast p-enter" key={id}>
            <span>✓</span>
            <p>{p.title ?? "A small win, saved."}</p>
            <button
              type="button"
              aria-label={"Dismiss notification " + id}
              onClick={() => set(toasts.filter((x) => x !== id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="p-text-btn"
        onClick={() => {
          set([...toasts.slice(-2), next]);
          setNext(next + 1);
        }}
      >
        Make a little toast +
      </button>
    </div>
  );
}
/** A guided introduction with next, back, and finish actions. */
export function SpotlightTour(p: ProsProps) {
  const list = p.items ?? [
    {
      label: "Make yourself at home",
      description: "A place for all the things you are working on.",
    },
    {
      label: "Collect your references",
      description: "Keep the good finds close to your ideas.",
    },
    {
      label: "Make your first move",
      description: "Everything starts with one small step.",
    },
  ];
  const [open, set] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <div data-pros="SpotlightTour" className={p.className} style={p.style}>
      <button
        type="button"
        className="p-btn"
        onClick={() => {
          setIndex(0);
          set(true);
        }}
      >
        {p.label ?? "Show me around"} ↗
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={list[index]?.label ?? "Welcome"}
      >
        <Mark variant={index} />
        <p>{list[index]?.description}</p>
        <div className="p-between">
          <button
            type="button"
            className="p-text-btn"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            ← Back
          </button>
          <small>
            {index + 1}/{list.length}
          </small>
          <button
            type="button"
            className="p-btn"
            onClick={() => {
              if (index >= list.length - 1) {
                set(false);
                p.onAction?.("complete");
              } else setIndex(index + 1);
            }}
          >
            {index >= list.length - 1 ? "Let’s go" : "Next →"}
          </button>
        </div>
      </DialogSurface>
    </div>
  );
}
/** An inbox dialog with mark-all-read state. */
export function NotificationCenter(p: ProsProps) {
  const [open, set] = useState(false);
  const [read, setRead] = useState(false);
  return (
    <div data-pros="NotificationCenter" className={p.className} style={p.style}>
      <button type="button" className="p-btn p-soft" onClick={() => set(true)}>
        {p.label ?? "Your notifications"}{" "}
        <span className="p-pill">{read ? "0" : itemsOf(p).length}</span>
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "In the loop."}
      >
        <button
          type="button"
          className="p-text-btn"
          onClick={() => {
            setRead(true);
            p.onAction?.("read-all");
          }}
        >
          Mark all as read ✓
        </button>
        {itemsOf(p).map((s, i) => (
          <div className="p-notification-row" key={i}>
            <i className={read ? "is-read" : ""} />
            <div>
              <b>{s.label}</b>
              <p>{s.description}</p>
              <small>{i + 1} hours ago</small>
            </div>
          </div>
        ))}
      </DialogSurface>
    </div>
  );
}
/** A sharing dialog that copies a caller-supplied link. */
export function ShareDialog(p: ProsProps) {
  const [open, set] = useState(false);
  const [status, setStatus] = useState("Copy link");
  const link = p.href ?? "https://example.com/your-project";
  return (
    <div data-pros="ShareDialog" className={p.className} style={p.style}>
      <button type="button" className="p-btn" onClick={() => set(true)}>
        {p.label ?? "Pass it on"} ↗
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "Good things are shared."}
      >
        <p>
          {p.description ?? "Send this to someone who would appreciate it."}
        </p>
        <label className="p-field">
          Project link
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
        <button
          type="button"
          className="p-btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setStatus("Link copied ✓");
              p.onAction?.("copied");
            } catch {
              setStatus("Select the link and copy manually");
            }
          }}
        >
          {status}
        </button>
      </DialogSurface>
    </div>
  );
}
/** A full-screen typographic navigation takeover. */
export function FullscreenMenu(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <div data-pros="FullscreenMenu" className={p.className} style={p.style}>
      <button type="button" className="p-btn p-soft" onClick={() => set(true)}>
        {p.label ?? "Explore the studio"} ☰
      </button>
      <DialogSurface
        open={open}
        onClose={() => set(false)}
        title={p.title ?? "Where to?"}
        className="p-fullscreen-menu"
      >
        <nav>
          {itemsOf(p).map((s, i) => (
            <button
              type="button"
              key={i}
              style={{ animationDelay: i * 80 + "ms" }}
              onClick={() => {
                p.onAction?.(itemValue(s));
                set(false);
              }}
            >
              <small>0{i + 1}</small>
              {s.label}
              <Arrow diagonal />
            </button>
          ))}
        </nav>
        <small>INDEPENDENT BY DESIGN.</small>
      </DialogSurface>
    </div>
  );
}
