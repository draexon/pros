import { Icon } from "./icons";
import { useId, useState } from "react";
import {
  type ProsProps,
  cx,
  itemsOf,
  itemValue,
  useModel,
  useContentTransition,
  useSelectionIndicator,
  Arrow,
} from "./core";
/** Floating tab pills with keyboard arrow navigation. */
export function PillTabs(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, itemValue(list[0] ?? { label: "" }));
  const id = useId();
  const selection = useSelectionIndicator(value);
  const panel = useContentTransition<HTMLElement>(value);
  return (
    <div
      data-pros="PillTabs"
      className={cx("p-pill-tabs", p.className)}
      style={p.style}
    >
      <div
        ref={selection}
        className="p-selection-track"
        role="tablist"
        aria-label={p.label ?? "Sections"}
      >
        {list.map((s, i) => (
          <button
            type="button"
            key={i}
            id={id + "-tab-" + i}
            role="tab"
            disabled={p.disabled}
            aria-selected={value === itemValue(s)}
            aria-controls={id + "-panel"}
            tabIndex={value === itemValue(s) ? 0 : -1}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const n =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? list.length - 1
                      : (i + (e.key === "ArrowRight" ? 1 : -1) + list.length) %
                        list.length;
                set(itemValue(list[n]));
                document.getElementById(id + "-tab-" + n)?.focus();
              }
            }}
            onClick={() => set(itemValue(s))}
          >
            {s.label}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id={id + "-panel"}
        aria-labelledby={
          id +
          "-tab-" +
          Math.max(
            0,
            list.findIndex((x) => itemValue(x) === value),
          )
        }
        tabIndex={0}
        ref={panel}
      >
        {p.children ??
          list.find((s) => itemValue(s) === value)?.description ??
          value}
      </section>
    </div>
  );
}
/** A compact dock with magnifying icons and persistent selection. */
export function IconDock(p: ProsProps) {
  const [value, set] = useModel(p, "0");
  const list = p.items ?? [
    { label: "Home" },
    { label: "Explore" },
    { label: "Saved" },
    { label: "Settings" },
  ];
  return (
    <nav
      data-pros="IconDock"
      className={cx("p-icon-dock", p.className)}
      style={p.style}
      aria-label={p.label ?? "Workspace"}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          aria-label={s.label}
          aria-current={value === String(i) ? "page" : undefined}
          onClick={() => {
            set(String(i));
            p.onAction?.(s.label);
          }}
        >
          <span aria-hidden="true">
            <Icon
              name={(["home", "media", "bookmark", "settings"] as const)[i % 4]}
            />
          </span>
          <small>{s.label}</small>
        </button>
      ))}
    </nav>
  );
}
/** An editorial breadcrumb trail with animated separators. */
export function BreadcrumbTrail(p: ProsProps) {
  const list = itemsOf(p);
  return (
    <nav
      data-pros="BreadcrumbTrail"
      aria-label={p.label ?? "Breadcrumb"}
      className={cx("p-breadcrumb", p.className)}
      style={p.style}
    >
      <ol>
        {list.map((s, i) => (
          <li key={i}>
            {i === list.length - 1 ? (
              <span aria-current="page">{s.label}</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => p.onAction?.(itemValue(s))}
                >
                  {s.label}
                </button>
                <span aria-hidden="true">/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
/** A numeric pagination strip with working previous and next actions. */
export function PageStepper(p: ProsProps) {
  const [value, set] = useModel(p, "1");
  const max = Math.max(1, p.max ?? 5);
  const page = Math.max(1, Math.min(max, Number(value) || 1));
  return (
    <nav
      data-pros="PageStepper"
      aria-label={p.label ?? "Pagination"}
      className={cx("p-page-stepper", p.className)}
      style={p.style}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={p.disabled || page === 1}
        onClick={() => set(String(page - 1))}
      >
        <Icon name="left" />
      </button>
      {Array.from({ length: max }, (_, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          aria-label={"Page " + (i + 1)}
          aria-current={page === i + 1 ? "page" : undefined}
          onClick={() => set(String(i + 1))}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={p.disabled || page === max}
        onClick={() => set(String(page + 1))}
      >
        <Icon name="right" />
      </button>
    </nav>
  );
}
/** A vertical numbered chapter rail that tracks selection. */
export function ChapterRail(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, "0");
  return (
    <nav
      data-pros="ChapterRail"
      aria-label={p.label ?? "Chapters"}
      className={cx("p-chapter-rail", p.className)}
      style={p.style}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          aria-current={value === String(i) ? "step" : undefined}
          onClick={() => set(String(i))}
        >
          <span>0{i + 1}</span>
          <b>{s.label}</b>
          <Arrow />
        </button>
      ))}
    </nav>
  );
}
/** A condensed header with a functional expanding mobile menu. */
export function CompactHeader(p: ProsProps) {
  const [open, set] = useState(false);
  return (
    <header
      data-pros="CompactHeader"
      className={cx("p-compact-header", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <b>{p.title ?? "studio."}</b>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => set(!open)}
        >
          {open ? (
            <>
              Close <Icon name="minus" />
            </>
          ) : (
            "Menu +"
          )}
        </button>
      </div>
      {open && (
        <nav className="p-enter">
          {itemsOf(p).map((s, i) => (
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
        </nav>
      )}
    </header>
  );
}
/** A horizontal process navigation with completed step markers. */
export function ProgressSteps(p: ProsProps) {
  const list = p.items ?? [
    { label: "Details" },
    { label: "Review" },
    { label: "Launch" },
  ];
  const [value, set] = useModel(p, "1");
  return (
    <nav
      data-pros="ProgressSteps"
      className={cx("p-progress-steps", p.className)}
      style={p.style}
      aria-label={p.label ?? "Progress"}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          className={i <= Number(value) ? "is-active" : ""}
          aria-current={i === Number(value) ? "step" : undefined}
          onClick={() => set(String(i))}
        >
          <b>
            {i < Number(value) ? (
              <>
                <Icon name="check" />
              </>
            ) : (
              String(i + 1).padStart(2, "0")
            )}
          </b>
          <span>{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
/** A collapsible directory with animated nested links. */
export function TreeNavigation(p: ProsProps) {
  const [expanded, set] = useState<string[]>(["Studio"]);
  return (
    <nav
      data-pros="TreeNavigation"
      className={cx("p-tree-nav", p.className)}
      style={p.style}
      aria-label={p.label ?? "Directory"}
    >
      {itemsOf(p).map((s, i) => (
        <div key={i}>
          <button
            type="button"
            aria-expanded={expanded.includes(s.label)}
            onClick={() =>
              set(
                expanded.includes(s.label)
                  ? expanded.filter((x) => x !== s.label)
                  : [...expanded, s.label],
              )
            }
          >
            <span>
              {expanded.includes(s.label) ? (
                <>
                  <Icon name="minus" />
                </>
              ) : (
                <Icon name="plus" />
              )}
            </span>{" "}
            {s.label}
          </button>
          {expanded.includes(s.label) && (
            <div className="p-enter">
              {["Overview", "Resources"].map((child) => (
                <button
                  type="button"
                  key={child}
                  onClick={() => p.onAction?.(s.label + "/" + child)}
                >
                  {child} <Icon name="arrow" />
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
/** A bottom navigation bar with a sliding label expansion. */
export function BottomBar(p: ProsProps) {
  const [value, set] = useModel(p, "0");
  const list = p.items ?? [
    { label: "Discover" },
    { label: "Collect" },
    { label: "Create" },
  ];
  return (
    <nav
      data-pros="BottomBar"
      className={cx("p-bottom-bar", p.className)}
      style={p.style}
      aria-label={p.label ?? "Main navigation"}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          aria-label={s.label}
          aria-current={value === String(i) ? "page" : undefined}
          onClick={() => set(String(i))}
        >
          <b aria-hidden="true">
            <Icon name={(["media", "grid", "plus"] as const)[i % 3]} />
          </b>
          <span>{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
/** A large stacked index that reveals a contextual description. */
export function IndexMenu(p: ProsProps) {
  const [value, set] = useModel(p, "0");
  return (
    <nav
      data-pros="IndexMenu"
      className={cx("p-index-menu", p.className)}
      style={p.style}
      aria-label={p.label ?? "Index"}
    >
      {itemsOf(p).map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          className={value === String(i) ? "is-active" : ""}
          onClick={() => {
            set(String(i));
            p.onAction?.(itemValue(s));
          }}
        >
          <small>0{i + 1}</small>
          <span>
            <b>{s.label}</b>
            {value === String(i) && (
              <small className="p-enter">{s.description}</small>
            )}
          </span>
          <Arrow diagonal />
        </button>
      ))}
    </nav>
  );
}
/** A filter navigation with independently selectable chips. */
export function FilterChips(p: ProsProps) {
  const [value, set] = useModel(p, "");
  const selected = value.split(",").filter(Boolean);
  return (
    <div
      data-pros="FilterChips"
      className={cx("p-filter-chips", p.className)}
      style={p.style}
      role="group"
      aria-label={p.label ?? "Filters"}
    >
      {itemsOf(p).map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          aria-pressed={selected.includes(itemValue(s))}
          onClick={() =>
            set(
              selected.includes(itemValue(s))
                ? selected.filter((x) => x !== itemValue(s)).join(",")
                : [...selected, itemValue(s)].join(","),
            )
          }
        >
          {s.label}
          <span>
            {selected.includes(itemValue(s)) ? (
              <>
                <Icon name="check" />
              </>
            ) : (
              <Icon name="plus" />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
/** A section switcher with a large current index and next control. */
export function SectionNavigator(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, "0");
  const i = Math.max(0, Math.min(list.length - 1, Number(value) || 0));
  const panel = useContentTransition(i);
  return (
    <div
      data-pros="SectionNavigator"
      className={cx("p-section-nav", p.className)}
      style={p.style}
    >
      <span className="p-number">0{i + 1}</span>
      <div ref={panel}>
        <small>YOU ARE EXPLORING</small>
        <h3>{list[i]?.label ?? "No sections"}</h3>
      </div>
      <button
        type="button"
        className="p-round"
        aria-label="Next section"
        disabled={p.disabled || !list.length}
        onClick={() => set(String((i + 1) % list.length))}
      >
        <Icon name="right" />
      </button>
    </div>
  );
}
/** A workspace selector with a current workspace badge. */
export function WorkspaceSwitcher(p: ProsProps) {
  const [value, set] = useModel(p, itemsOf(p)[0]?.label ?? "");
  return (
    <label
      data-pros="WorkspaceSwitcher"
      className={cx("p-workspace-switcher", p.className)}
      style={p.style}
    >
      <span className="p-workspace-icon" aria-hidden="true">
        {value.slice(0, 1)}
      </span>
      <span>
        <small>{p.label ?? "WORKSPACE"}</small>
        <select
          disabled={p.disabled}
          value={value}
          onChange={(e) => set(e.target.value)}
        >
          {itemsOf(p).map((s, i) => (
            <option key={i}>{s.label}</option>
          ))}
        </select>
      </span>
    </label>
  );
}
/** A jump list for alphabetically indexed collections. */
export function AlphabetIndex(p: ProsProps) {
  const [value, set] = useModel(p, "A");
  return (
    <nav
      data-pros="AlphabetIndex"
      className={cx("p-alphabet-index", p.className)}
      style={p.style}
      aria-label={p.label ?? "Alphabetical index"}
    >
      {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
        <button
          type="button"
          key={letter}
          disabled={p.disabled}
          aria-current={value === letter ? "true" : undefined}
          onClick={() => set(letter)}
        >
          {letter}
        </button>
      ))}
    </nav>
  );
}
/** A back-and-forward story pager with distinct destination labels. */
export function StoryPager(p: ProsProps) {
  const list = p.items ?? [
    { label: "The beginning" },
    { label: "What comes next" },
  ];
  return (
    <nav
      data-pros="StoryPager"
      className={cx("p-story-pager", p.className)}
      style={p.style}
      aria-label={p.label ?? "Adjacent stories"}
    >
      {list.slice(0, 2).map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={p.disabled}
          onClick={() => p.onAction?.(itemValue(s))}
        >
          <small>
            {i === 0 ? (
              <>
                <Icon name="left" /> PREVIOUS
              </>
            ) : (
              <>
                UP NEXT <Icon name="right" />
              </>
            )}
          </small>
          <b>{s.label}</b>
        </button>
      ))}
    </nav>
  );
}
