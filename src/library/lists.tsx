import { useState } from "react";
import { type ProsProps, cx, itemsOf, useModel, Arrow } from "./core";
/** A prioritized checklist with computed completion and reset. */
export function Checklist(p: ProsProps) {
  const list = itemsOf(p);
  const [done, set] = useState<string[]>([]);
  return (
    <div
      data-pros="Checklist"
      className={cx("p-checklist", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <h3>{p.title ?? "One thing at a time."}</h3>
        <button
          type="button"
          className="p-text-btn"
          onClick={() => {
            set([]);
            p.onValueChange?.("");
          }}
        >
          Reset ↻
        </button>
      </div>
      {list.map((s, i) => (
        <label key={i}>
          <input
            type="checkbox"
            disabled={p.disabled}
            checked={done.includes(s.label)}
            onChange={() => {
              const next = done.includes(s.label)
                ? done.filter((x) => x !== s.label)
                : [...done, s.label];
              set(next);
              p.onValueChange?.(next.join(","));
            }}
          />
          <span>
            <b>{s.label}</b>
            <small>{s.description}</small>
          </span>
          <small>0{i + 1}</small>
        </label>
      ))}
      <small>
        {done.length} of {list.length} complete
      </small>
    </div>
  );
}
/** A reorderable list with accessible up and down controls. */
export function ReorderList(p: ProsProps) {
  const [list, set] = useState(itemsOf(p));
  const move = (i: number, d: number) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(next);
    p.onValueChange?.(next.map((x) => x.label).join(","));
  };
  return (
    <div
      data-pros="ReorderList"
      className={cx("p-reorder-list", p.className)}
      style={p.style}
    >
      <small>{p.title ?? "PUT THINGS IN YOUR ORDER"}</small>
      {list.map((s, i) => (
        <div key={s.label} className="p-enter">
          <span aria-hidden="true">⠿</span>
          <b>{s.label}</b>
          <span>
            <button
              type="button"
              aria-label={"Move " + s.label + " up"}
              disabled={p.disabled || i === 0}
              onClick={() => move(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={"Move " + s.label + " down"}
              disabled={p.disabled || i === list.length - 1}
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
/** A searchable directory with an honest empty state. */
export function SearchableList(p: ProsProps) {
  const [query, set] = useState("");
  const rows = itemsOf(p).filter((x) =>
    (x.label + " " + x.description).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div
      data-pros="SearchableList"
      className={cx("p-searchable-list", p.className)}
      style={p.style}
    >
      <input
        aria-label={p.label ?? "Filter items"}
        placeholder="Find a good thing…"
        value={query}
        onChange={(e) => set(e.target.value)}
      />
      {rows.map((s, i) => (
        <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
          <span>
            <b>{s.label}</b>
            <small>{s.description}</small>
          </span>
          <Arrow />
        </button>
      ))}
      {!rows.length && <p>No matches. Try another word.</p>}
    </div>
  );
}
/** A multi-select list with select-all and a live selection count. */
export function SelectableList(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, "");
  const chosen = value.split(",").filter(Boolean);
  return (
    <div
      data-pros="SelectableList"
      className={cx("p-selectable-list", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <b>{chosen.length} selected</b>
        <button
          type="button"
          className="p-text-btn"
          onClick={() =>
            set(
              chosen.length === list.length
                ? ""
                : list.map((s) => s.label).join(","),
            )
          }
        >
          {chosen.length === list.length ? "Clear all" : "Select all"}
        </button>
      </div>
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          aria-pressed={chosen.includes(s.label)}
          onClick={() =>
            set(
              chosen.includes(s.label)
                ? chosen.filter((x) => x !== s.label).join(",")
                : [...chosen, s.label].join(","),
            )
          }
        >
          <span>{chosen.includes(s.label) ? "✓" : "+"}</span>
          <b>{s.label}</b>
          <small>0{i + 1}</small>
        </button>
      ))}
    </div>
  );
}
/** A compact disclosure list with nested detail content. */
export function ExpandableRows(p: ProsProps) {
  return (
    <div
      data-pros="ExpandableRows"
      className={cx("p-expandable-rows", p.className)}
      style={p.style}
    >
      {itemsOf(p).map((s, i) => (
        <details key={i}>
          <summary>
            <span>0{i + 1}</span>
            <b>{s.label}</b>
            <i>↗</i>
          </summary>
          <p>{s.description ?? "A little more detail about this item."}</p>
        </details>
      ))}
    </div>
  );
}
/** A chronological change log with a category filter. */
export function ChangelogList(p: ProsProps) {
  const [value, set] = useModel(p, "All");
  const rows = p.items ?? [
    { label: "A fresh perspective", description: "New", value: "0.3" },
    { label: "A smoother experience", description: "Improved", value: "0.2" },
    { label: "The first chapter", description: "New", value: "0.1" },
  ];
  return (
    <div
      data-pros="ChangelogList"
      className={cx("p-changelog-list", p.className)}
      style={p.style}
    >
      <div className="p-filter-chips">
        {["All", "New", "Improved"].map((s) => (
          <button
            type="button"
            key={s}
            aria-pressed={value === s}
            onClick={() => set(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {rows
        .filter((x) => value === "All" || x.description === value)
        .map((x, i) => (
          <article key={i}>
            <small>v{x.value}</small>
            <div>
              <span className="p-pill">{x.description}</span>
              <h3>{x.label}</h3>
            </div>
          </article>
        ))}
    </div>
  );
}
/** A file directory with selectable preview metadata. */
export function FileList(p: ProsProps) {
  const [value, set] = useModel(p, "");
  return (
    <div
      data-pros="FileList"
      className={cx("p-file-list", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          { label: "Identity.pdf", description: "2.4 MB · Document" },
          { label: "Studies.zip", description: "12 MB · Archive" },
          { label: "Notes.md", description: "4 KB · Markdown" },
        ]
      ).map((s, i) => (
        <div key={i}>
          <button
            type="button"
            aria-expanded={value === s.label}
            onClick={() => set(value === s.label ? "" : s.label)}
          >
            <span className="p-file-badge">
              {s.label.split(".").pop()?.toUpperCase()}
            </span>
            <b>{s.label}</b>
            <Arrow />
          </button>
          {value === s.label && (
            <div className="p-file-meta p-enter">
              <small>{s.description}</small>
              <button
                type="button"
                className="p-text-btn"
                onClick={() => p.onAction?.("download:" + s.label)}
              >
                Download ↓
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
/** A cancellable queue driven by supplied per-item progress. */
export function DownloadQueue(p: ProsProps) {
  const [cancelled, set] = useState<string[]>([]);
  return (
    <div
      data-pros="DownloadQueue"
      className={cx("p-download-queue", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "On the way."}</h3>
      {(
        p.items ?? [
          { label: "Project assets", value: "72" },
          { label: "Reference archive", value: "38" },
        ]
      ).map((s, i) => (
        <div key={i}>
          <div className="p-between">
            <b>{s.label}</b>
            <button
              type="button"
              className="p-text-btn"
              disabled={cancelled.includes(s.label)}
              aria-label={"Cancel " + s.label}
              onClick={() => {
                set([...cancelled, s.label]);
                p.onAction?.("cancel:" + s.label);
              }}
            >
              {cancelled.includes(s.label) ? "Cancelled" : "×"}
            </button>
          </div>
          <progress
            aria-label={s.label + " progress"}
            value={cancelled.includes(s.label) ? 0 : Number(s.value) || 0}
            max={100}
          />
          <small>
            {cancelled.includes(s.label)
              ? "Paused by you"
              : s.value + "% · Transfer progress"}
          </small>
        </div>
      ))}
    </div>
  );
}
/** A three-column kanban board with explicit move-forward controls. */
export function KanbanBoard(p: ProsProps) {
  const [cards, set] = useState(
    (
      p.items ?? [
        { label: "Gather references" },
        { label: "Explore directions" },
        { label: "Make it move" },
      ]
    ).map((x, i) => ({ ...x, column: i % 3 })),
  );
  return (
    <div
      data-pros="KanbanBoard"
      className={cx("p-kanban-board", p.className)}
      style={p.style}
    >
      {["To explore", "In motion", "Done"].map((column, i) => (
        <section key={column}>
          <small>
            {column} <b>{cards.filter((x) => x.column === i).length}</b>
          </small>
          {cards
            .filter((x) => x.column === i)
            .map((card) => (
              <button
                type="button"
                key={card.label}
                aria-label={
                  card.label +
                  ": move to " +
                  ["To explore", "In motion", "Done"][(i + 1) % 3]
                }
                onClick={() => {
                  set(
                    cards.map((x) =>
                      x === card ? { ...x, column: (i + 1) % 3 } : x,
                    ),
                  );
                  p.onAction?.(card.label + ":" + ((i + 1) % 3));
                }}
              >
                <b>{card.label}</b>
                <span>{i === 2 ? "↻" : "→"}</span>
              </button>
            ))}
        </section>
      ))}
    </div>
  );
}
/** A compact command list with contextual descriptions. */
export function CommandList(p: ProsProps) {
  return (
    <div
      data-pros="CommandList"
      className={cx("p-command-list", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          {
            label: "New collection",
            description: "A home for a new idea",
            value: "N",
          },
          {
            label: "Quick search",
            description: "Find something you saved",
            value: "S",
          },
          {
            label: "Workspace settings",
            description: "Make yourself at home",
            value: ",",
          },
        ]
      ).map((s, i) => (
        <button type="button" key={i} onClick={() => p.onAction?.(s.label)}>
          <span>0{i + 1}</span>
          <div>
            <b>{s.label}</b>
            <small>{s.description}</small>
          </div>
          <kbd>{s.value}</kbd>
        </button>
      ))}
    </div>
  );
}
/** A weekly agenda with selectable days and editable appointment state. */
export function ScheduleList(p: ProsProps) {
  const [value, set] = useModel(p, "Wed");
  const [done, setDone] = useState<string[]>([]);
  const rows = p.items ?? [
    { label: "A little focus time", description: "09:00 — 10:30" },
    { label: "Studio catch-up", description: "11:00 — 11:30" },
  ];
  return (
    <div
      data-pros="ScheduleList"
      className={cx("p-schedule-list", p.className)}
      style={p.style}
    >
      <div className="p-week-days">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((s, i) => (
          <button
            type="button"
            key={s}
            aria-pressed={value === s}
            onClick={() => set(s)}
          >
            <small>{s}</small>
            <b>{19 + i}</b>
          </button>
        ))}
      </div>
      <small>AGENDA FOR {value.toUpperCase()}</small>
      {rows.map((s, i) => (
        <button
          type="button"
          className="p-schedule-item"
          key={value + s.label}
          aria-pressed={done.includes(value + s.label)}
          onClick={() =>
            setDone(
              done.includes(value + s.label)
                ? done.filter((x) => x !== value + s.label)
                : [...done, value + s.label],
            )
          }
        >
          <span>{done.includes(value + s.label) ? "✓" : "○"}</span>
          <div>
            <b>{s.label}</b>
            <small>{s.description}</small>
          </div>
        </button>
      ))}
    </div>
  );
}
/** A directory of contacts with expandable details and a contact action. */
export function ContactList(p: ProsProps) {
  const [selected, set] = useModel(p, "");
  return (
    <div
      data-pros="ContactList"
      className={cx("p-contact-list", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          { label: "Alex Morgan", description: "alex@example.com" },
          { label: "Sam Rivera", description: "sam@example.com" },
          { label: "Jules Park", description: "jules@example.com" },
        ]
      ).map((s, i) => (
        <article key={i}>
          <button
            type="button"
            aria-expanded={selected === s.label}
            onClick={() => set(selected === s.label ? "" : s.label)}
          >
            <span className="p-avatar">{s.label[0]}</span>
            <b>{s.label}</b>
            <span>{selected === s.label ? "−" : "+"}</span>
          </button>
          {selected === s.label && (
            <div className="p-enter">
              <small>{s.description}</small>
              <button
                type="button"
                className="p-action"
                onClick={() => p.onAction?.("contact:" + s.description)}
              >
                Get in touch ↗
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
/** A definition list with click-to-copy values. */
export function DefinitionList(p: ProsProps) {
  const [message, set] = useState("");
  return (
    <div
      data-pros="DefinitionList"
      className={cx("p-definition-list", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "The finer details."}</h3>
      <dl>
        {(
          p.items ?? [
            { label: "Project", value: "A new perspective" },
            { label: "Type", value: "Independent study" },
            { label: "Status", value: "In progress" },
          ]
        ).map((s, i) => (
          <div key={i}>
            <dt>{s.label}</dt>
            <dd>
              <button
                type="button"
                title="Copy value"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(s.value ?? "");
                    set(s.label + " copied");
                  } catch {
                    set("Copy unavailable");
                  }
                }}
              >
                {s.value}
                <span>⧉</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <small role="status">{message || "Click a value to copy it."}</small>
    </div>
  );
}
/** A dismissible notification list with a restore action. */
export function NotificationList(p: ProsProps) {
  const rows = itemsOf(p);
  const [hidden, set] = useState<string[]>([]);
  return (
    <div
      data-pros="NotificationList"
      className={cx("p-notification-list", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <h3>{p.title ?? "A few new things."}</h3>
        <button type="button" className="p-text-btn" onClick={() => set([])}>
          Restore ↻
        </button>
      </div>
      {rows
        .filter((x) => !hidden.includes(x.label))
        .map((s, i) => (
          <div key={s.label}>
            <span>↳</span>
            <section>
              <b>{s.label}</b>
              <p>{s.description}</p>
            </section>
            <button
              type="button"
              aria-label={"Dismiss " + s.label}
              onClick={() => {
                set([...hidden, s.label]);
                p.onAction?.("dismiss:" + s.label);
              }}
            >
              ×
            </button>
          </div>
        ))}
      {hidden.length === rows.length && (
        <p className="p-enter">All caught up. Enjoy the quiet.</p>
      )}
    </div>
  );
}
/** A saved-reading list with unread and completed filters. */
export function ReadingList(p: ProsProps) {
  const [read, setRead] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const rows = p.items ?? [
    { label: "The value of empty space", description: "6 min read" },
    { label: "Making ordinary things better", description: "4 min read" },
    { label: "An independent point of view", description: "8 min read" },
  ];
  return (
    <div
      data-pros="ReadingList"
      className={cx("p-reading-list", p.className)}
      style={p.style}
    >
      <div className="p-filter-chips">
        {["All", "Unread", "Finished"].map((x) => (
          <button
            type="button"
            key={x}
            aria-pressed={filter === x}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {rows
        .filter(
          (x) =>
            filter === "All" ||
            (filter === "Finished") === read.includes(x.label),
        )
        .map((s, i) => (
          <article key={s.label}>
            <small>0{i + 1}</small>
            <div>
              <h3>{s.label}</h3>
              <small>{s.description}</small>
            </div>
            <button
              type="button"
              className="p-round"
              aria-label={
                "Mark " +
                s.label +
                (read.includes(s.label) ? " unread" : " finished")
              }
              aria-pressed={read.includes(s.label)}
              onClick={() => {
                setRead(
                  read.includes(s.label)
                    ? read.filter((x) => x !== s.label)
                    : [...read, s.label],
                );
                p.onAction?.(s.label);
              }}
            >
              {read.includes(s.label) ? "✓" : "+"}
            </button>
          </article>
        ))}
    </div>
  );
}
