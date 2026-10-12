import { Icon } from "./icons";
import { useState } from "react";
import {
  type ProsProps,
  cx,
  Mark,
  Action,
  itemsOf,
  useModel,
  useContentTransition,
  Arrow,
} from "./core";
/** A purpose-built asymmetric feature grid with actionable cells. */
export function BentoGrid(p: ProsProps) {
  const list = p.items ?? [
    { label: "Room to think", description: "A little space goes a long way." },
    { label: "Make your move", description: "Good ideas keep moving." },
    { label: "All together", description: "Everything in its place." },
  ];
  return (
    <div
      data-pros="BentoGrid"
      className={cx("p-bento-grid", p.className)}
      style={p.style}
    >
      {list.map((s, i) => (
        <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
          <small>0{i + 1} / PROS</small>
          <Mark variant={i} />
          <h3>{s.label}</h3>
          <p>{s.description}</p>
          <Arrow diagonal />
        </button>
      ))}
    </div>
  );
}
/** An editorial split layout with an independent visual panel. */
export function SplitPanel(p: ProsProps) {
  return (
    <section
      data-pros="SplitPanel"
      className={cx("p-split-panel", p.className)}
      style={p.style}
    >
      <div>
        <small>OPPOSITES, TOGETHER.</small>
        <h3>{p.title ?? "Find a little balance."}</h3>
        <p>
          {p.description ??
            "Bold enough to be noticed. Quiet enough to make room."}
        </p>
        <Action p={p}>Explore the idea</Action>
      </div>
      <div>{p.children ?? <Mark variant={2} />}</div>
    </section>
  );
}
/** An accessible accordion with native, independently open sections. */
export function AccordionPanel(p: ProsProps) {
  return (
    <div
      data-pros="AccordionPanel"
      className={cx("p-accordion-panel", p.className)}
      style={p.style}
    >
      {itemsOf(p).map((s, i) => (
        <details key={i} open={i === 0 ? true : undefined}>
          <summary>
            <small>0{i + 1}</small>
            <b>{s.label}</b>
            <span>
              <Icon name="plus" />
            </span>
          </summary>
          <div>
            <p>
              {s.description ??
                "A space for the details that make a difference."}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
/** A tabbed workspace with a large document surface and local selection. */
export function TabbedPanel(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, "0");
  const panel = useContentTransition<HTMLElement>(value);
  return (
    <div
      data-pros="TabbedPanel"
      className={cx("p-tabbed-panel", p.className)}
      style={p.style}
    >
      <div
        className="p-tabbed-toolbar"
        role="group"
        aria-label={p.label ?? "Open documents"}
      >
        {list.map((s, i) => (
          <button
            type="button"
            key={i}
            aria-pressed={value === String(i)}
            onClick={() => set(String(i))}
          >
            <span>▧</span>
            {s.label}
          </button>
        ))}
      </div>
      <article ref={panel}>
        <small>WORKING DOCUMENT / 00{Number(value) + 1}</small>
        <h3>{list[Number(value)]?.label ?? p.title ?? "Untitled"}</h3>
        <p>
          {list[Number(value)]?.description ??
            p.description ??
            "A place to put your next thought."}
        </p>
        {p.children ?? (
          <div className="p-document-lines">
            <i />
            <i />
            <i />
          </div>
        )}
      </article>
    </div>
  );
}
/** Two panels with a keyboard-accessible width adjustment. */
export function ResizablePanel(p: ProsProps) {
  const [value, set] = useModel(p, "42");
  return (
    <div
      data-pros="ResizablePanel"
      className={cx("p-resizable-panel", p.className)}
      style={p.style}
    >
      <div
        style={{
          gridTemplateColumns: value + "fr " + (100 - Number(value)) + "fr",
        }}
      >
        <section>
          <b>{p.title ?? "A little space."}</b>
          <small>LEFT PANEL</small>
        </section>
        <section>{p.children ?? <Mark variant={3} />}</section>
      </div>
      <label>
        Find the right proportions
        <input
          type="range"
          min={25}
          max={75}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      </label>
    </div>
  );
}
/** A collapsible workspace sidebar with usable icon-only labels. */
export function CollapsibleSidebar(p: ProsProps) {
  const [collapsed, set] = useState(false);
  const [active, setActive] = useState(0);
  return (
    <aside
      data-pros="CollapsibleSidebar"
      className={cx(
        "p-collapsible-sidebar",
        p.className,
        collapsed && "is-collapsed",
      )}
      style={p.style}
    >
      <button
        type="button"
        className="p-sidebar-toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        onClick={() => set(!collapsed)}
      >
        <b>p.</b>
        <span>
          {collapsed ? (
            <>
              <Icon name="right" />
            </>
          ) : (
            <>
              <Icon name="left" />
            </>
          )}
        </span>
      </button>
      <nav aria-label={p.label ?? "Sidebar"}>
        {itemsOf(p).map((s, i) => (
          <button
            type="button"
            key={i}
            title={collapsed ? s.label : undefined}
            aria-label={s.label}
            aria-current={active === i ? "page" : undefined}
            onClick={() => {
              setActive(i);
              p.onAction?.(s.label);
            }}
          >
            <b aria-hidden="true">
              <Icon name={(["grid", "media", "list"] as const)[i % 3]} />
            </b>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
/** A staggered research board that keeps each item in reading order. */
export function MasonryBoard(p: ProsProps) {
  return (
    <div
      data-pros="MasonryBoard"
      className={cx("p-masonry-board", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          {
            label: "Make room",
            description: "For something you have not tried yet.",
          },
          { label: "01 / Collected forms" },
          {
            label: "Good friction",
            description: "A little tension keeps it interesting.",
          },
          { label: "02 / New perspectives" },
        ]
      ).map((s, i) => (
        <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
          {i % 2 === 1 && <Mark variant={i} />}
          <h3>{s.label}</h3>
          {s.description && <p>{s.description}</p>}
          <small>REFERENCE / 00{i + 1}</small>
        </button>
      ))}
    </div>
  );
}
/** An editable sticky note with a folded paper corner. */
export function StickyNote(p: ProsProps) {
  const [value, set] = useModel(
    p,
    p.description ?? "Leave a little room for the unexpected.",
  );
  return (
    <div
      data-pros="StickyNote"
      className={cx("p-sticky-note", p.className)}
      style={p.style}
    >
      <small>{p.title ?? "NOTE TO SELF"}</small>
      <textarea
        aria-label={p.label ?? "Note content"}
        disabled={p.disabled}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
      <span>
        <Icon name="flower" />
      </span>
    </div>
  );
}
/** A desktop-window frame with a working minimize control. */
export function WindowFrame(p: ProsProps) {
  const [min, set] = useState(false);
  return (
    <div
      data-pros="WindowFrame"
      className={cx("p-window-frame", p.className)}
      style={p.style}
    >
      <header>
        <span aria-hidden="true">● ● ●</span>
        <small>{p.title ?? "untitled-ideas"}</small>
        <button
          type="button"
          aria-label={min ? "Restore window" : "Minimize window"}
          aria-expanded={!min}
          onClick={() => set(!min)}
        >
          {min ? (
            <Icon name="plus" />
          ) : (
            <>
              <Icon name="minus" />
            </>
          )}
        </button>
      </header>
      {!min && (
        <div className="p-window-content p-enter">
          {p.children ?? (
            <>
              <Mark variant={0} />
              <p>{p.description ?? "An open window. A new possibility."}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
/** A browser preview frame with a replayable page transition. */
export function BrowserFrame(p: ProsProps) {
  const [key, set] = useState(0);
  const panel = useContentTransition(key);
  return (
    <div
      data-pros="BrowserFrame"
      className={cx("p-browser-frame", p.className)}
      style={p.style}
    >
      <header>
        <button
          type="button"
          aria-label="Reload preview"
          onClick={() => {
            set(key + 1);
            p.onAction?.("reload");
          }}
        >
          <Icon name="refresh" />
        </button>
        <span>{p.title ?? "your-next-idea.studio"}</span>
        <b>
          <Icon name="arrow" />
        </b>
      </header>
      <div ref={panel} className="p-browser-page">
        {p.children ?? (
          <>
            <small>INDEPENDENT BY DESIGN</small>
            <h3>
              A place
              <br />
              for possibility.
            </h3>
            <Mark variant={5} />
          </>
        )}
      </div>
    </div>
  );
}
/** A vertical milestone layout with animated entry markers. */
export function VerticalTimeline(p: ProsProps) {
  return (
    <ol
      data-pros="VerticalTimeline"
      className={cx("p-vertical-timeline", p.className)}
      style={p.style}
    >
      {itemsOf(p).map((s, i) => (
        <li key={i}>
          <span>0{i + 1}</span>
          <div>
            <small>CHAPTER {i + 1}</small>
            <h3>{s.label}</h3>
            <p>{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
/** A three-feature grid with large symbolic illustrations. */
export function FeatureGrid(p: ProsProps) {
  return (
    <div
      data-pros="FeatureGrid"
      className={cx("p-feature-grid", p.className)}
      style={p.style}
    >
      {itemsOf(p).map((s, i) => (
        <section key={i}>
          <span aria-hidden="true">
            <Icon name={(["flower", "media", "arrow"] as const)[i % 3]} />
          </span>
          <h3>{s.label}</h3>
          <p>{s.description}</p>
        </section>
      ))}
    </div>
  );
}
/** A solid typographic divider for a new page chapter. */
export function SectionDivider(p: ProsProps) {
  return (
    <div
      data-pros="SectionDivider"
      className={cx("p-section-divider", p.className)}
      style={p.style}
    >
      <small>{p.value ?? "02"}</small>
      <span>{p.title ?? "A new chapter"}</span>
      <i aria-hidden="true">
        <Icon name="flower" />
      </i>
    </div>
  );
}
/** A compact editorial footer with working destination callbacks. */
export function PageFooter(p: ProsProps) {
  return (
    <footer
      data-pros="PageFooter"
      className={cx("p-page-footer", p.className)}
      style={p.style}
    >
      <div>
        <h3>{p.title ?? "Keep in touch."}</h3>
        <Action p={p} action="contact">
          Say hello
        </Action>
      </div>
      <nav aria-label="Footer">
        {itemsOf(p).map((s, i) => (
          <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
            {s.label} <Icon name="arrow" />
          </button>
        ))}
      </nav>
      <small>
        {p.description ?? "Made with intention. By independent people."}
      </small>
    </footer>
  );
}
/** A compact hero with oversized type and a moving geometric accent. */
export function HeroBlock(p: ProsProps) {
  return (
    <section
      data-pros="HeroBlock"
      className={cx("p-hero-block", p.className)}
      style={p.style}
    >
      <small>FOR YOUR NEXT GOOD IDEA.</small>
      <h3>{p.title ?? "Make it feel like something."}</h3>
      <div>
        <p>{p.description ?? "A starting point with a point of view."}</p>
        <Action p={p}>Get started</Action>
      </div>
      <Mark variant={1} />
    </section>
  );
}
