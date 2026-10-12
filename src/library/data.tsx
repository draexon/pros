import { Icon } from "./icons";
import { useState } from "react";
import { type ProsProps, cx, itemsOf, useModel } from "./core";
/** One stroked arrow shared by sort headers and trend tiles; down turns it over. */
function DirectionArrow({ down }: { down?: boolean }) {
  return (
    <svg
      className={cx("p-direction", down && "is-down")}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}
/** A column chart with selectable bars and exact value readouts. */
export function BarChart(p: ProsProps) {
  const data = p.items ?? [
    { label: "Mon", value: "42" },
    { label: "Tue", value: "68" },
    { label: "Wed", value: "56" },
    { label: "Thu", value: "89" },
    { label: "Fri", value: "74" },
  ];
  const [value, set] = useModel(p, "3");
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  return (
    <div
      data-pros="BarChart"
      className={cx("p-bar-chart", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <b>{p.title ?? "Weekly rhythm"}</b>
        <span aria-live="polite">
          {data[Number(value)]?.value ?? "0"} visits
        </span>
      </div>
      <div>
        {data.map((d, i) => (
          <button
            type="button"
            key={i}
            className={value === String(i) ? "is-active" : ""}
            aria-label={d.label + ": " + d.value}
            aria-pressed={value === String(i)}
            onClick={() => set(String(i))}
          >
            <i style={{ height: ((Number(d.value) || 0) / max) * 100 + "%" }} />
            <small>{d.label}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
/** A line chart drawn on entry with a clear textual data summary. */
export function LineChart(p: ProsProps) {
  const data = p.items ?? [
    { label: "Jan", value: "18" },
    { label: "Feb", value: "42" },
    { label: "Mar", value: "32" },
    { label: "Apr", value: "65" },
    { label: "May", value: "55" },
    { label: "Jun", value: "90" },
  ];
  const max = Math.max(1, ...data.map((x) => Number(x.value) || 0));
  const points = data.map((x, i) => [
    10 + (i / Math.max(1, data.length - 1)) * 280,
    110 - ((Number(x.value) || 0) / max) * 90,
  ]);
  return (
    <figure
      data-pros="LineChart"
      className={cx("p-line-chart", p.className)}
      style={p.style}
    >
      <figcaption>{p.title ?? "The bigger picture"}</figcaption>
      <svg
        viewBox="0 0 300 130"
        role="img"
        aria-label={data.map((x) => x.label + ": " + x.value).join(", ")}
      >
        <path
          className="p-chart-area"
          d={
            points.length
              ? "M" +
                points.map((x) => x.join(",")).join(" L") +
                " L290,120 L10,120 Z"
              : ""
          }
        />
        <polyline points={points.map((x) => x.join(",")).join(" ")} />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" />
        ))}
      </svg>
      <div className="p-between">
        {data.map((x, i) => (
          <small key={i}>{x.label}</small>
        ))}
      </div>
    </figure>
  );
}
/** A donut chart with a selectable category legend. */
export function DonutChart(p: ProsProps) {
  const data = p.items ?? [
    { label: "Design", value: "48" },
    { label: "Build", value: "32" },
    { label: "Research", value: "20" },
  ];
  const total = data.reduce((n, x) => n + (Number(x.value) || 0), 0) || 1;
  const [value, set] = useModel(p, "0");
  let sum = 0;
  const gradient = data
    .map((x, i) => {
      const start = sum;
      sum += ((Number(x.value) || 0) / total) * 100;
      return (
        ["#161616", "#777", "#bbb", "#ddd"][i % 4] +
        " " +
        start +
        "% " +
        sum +
        "%"
      );
    })
    .join(",");
  return (
    <div
      data-pros="DonutChart"
      className={cx("p-donut-chart", p.className)}
      style={p.style}
    >
      <div
        className="p-donut"
        style={{ background: "conic-gradient(" + gradient + ")" }}
      >
        <span>
          <b>{data[Number(value)]?.value ?? "0"}</b>
          <small>{data[Number(value)]?.label}</small>
        </span>
      </div>
      <div>
        {data.map((d, i) => (
          <button
            type="button"
            key={i}
            aria-pressed={value === String(i)}
            onClick={() => set(String(i))}
          >
            <i
              style={{ background: ["#161616", "#777", "#bbb", "#ddd"][i % 4] }}
            />
            {d.label}
            <b>{d.value}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
/** A contribution calendar with inspectable day values. */
export function Heatmap(p: ProsProps) {
  const [selected, set] = useState<number | null>(null);
  return (
    <div
      data-pros="Heatmap"
      className={cx("p-heatmap", p.className)}
      style={p.style}
    >
      <b>{p.title ?? "A little, every day."}</b>
      <div>
        {Array.from({ length: 70 }, (_, i) => (
          <button
            type="button"
            key={i}
            style={{ opacity: 0.16 + ((i * 7) % 10) / 12 }}
            aria-label={
              "Day " + (i + 1) + ": " + ((i * 7) % 10) + " contributions"
            }
            onClick={() => {
              set(i);
              p.onValueChange?.(String(i + 1));
            }}
          />
        ))}
      </div>
      <small aria-live="polite">
        {selected === null
          ? "70 days of showing up"
          : "Day " +
            (selected + 1) +
            " · " +
            ((selected * 7) % 10) +
            " contributions"}
      </small>
    </div>
  );
}
/** A compact sortable table with a header row, aligned numbers and clear sort direction. */
export function SortableTable(p: ProsProps) {
  const [sort, set] = useState<{ key: "label" | "value"; asc: boolean }>({
    key: "value",
    asc: true,
  });
  const rows = [
    ...(p.items ?? [
      { label: "Studio work", value: "42" },
      { label: "Side projects", value: "18" },
      { label: "Experiments", value: "64" },
    ]),
  ].sort((a, b) => {
    const order =
      sort.key === "value"
        ? Number(a.value) - Number(b.value)
        : a.label.localeCompare(b.label);
    return sort.asc ? order : -order;
  });
  const header = (key: "label" | "value", name: string) => {
    const active = sort.key === key;
    return (
      <th
        scope="col"
        className={active ? "is-sorted" : undefined}
        aria-sort={
          active ? (sort.asc ? "ascending" : "descending") : undefined
        }
      >
        <button
          type="button"
          onClick={() => set({ key, asc: active ? !sort.asc : true })}
        >
          {name}
          <DirectionArrow down={active && !sort.asc} />
        </button>
      </th>
    );
  };
  return (
    <div
      data-pros="SortableTable"
      className={cx("p-table-wrap", p.className)}
      style={p.style}
    >
      <table className="p-table">
        <caption>{p.title ?? "A working overview"}</caption>
        <thead>
          <tr>
            {header("label", "Project")}
            {header("value", "Activity")}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>
                <span className="p-table-dot" />
                {row.label}
              </td>
              <td>
                {row.value}
                <small> pts</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
/** A compact ranked list with proportional filled bars. */
export function Leaderboard(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Alex Morgan", value: "92" },
    { label: "Sam Rivera", value: "84" },
    { label: "Jules Park", value: "76" },
  ];
  const max = Math.max(1, ...rows.map((x) => Number(x.value) || 0));
  return (
    <div
      data-pros="Leaderboard"
      className={cx("p-leaderboard", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "Making moves."}</h3>
      {rows.map((x, i) => (
        <div key={i}>
          <span>0{i + 1}</span>
          <div>
            <div className="p-between">
              <b>{x.label}</b>
              <small>{x.value}</small>
            </div>
            <i style={{ width: ((Number(x.value) || 0) / max) * 100 + "%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
/** A horizontal distribution strip that exposes each allocation. */
export function AllocationBar(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Focus", value: "50" },
    { label: "Explore", value: "30" },
    { label: "Rest", value: "20" },
  ];
  return (
    <div
      data-pros="AllocationBar"
      className={cx("p-allocation", p.className)}
      style={p.style}
    >
      <b>{p.title ?? "Make room for everything."}</b>
      <div className="p-allocation-track">
        {rows.map((x, i) => (
          <button
            type="button"
            key={i}
            style={{
              flex: Number(x.value) || 1,
              background: ["#181818", "#777", "#bbb"][i % 3],
            }}
            aria-label={x.label + ": " + x.value + " percent"}
            onClick={() => p.onAction?.(x.label)}
          >
            {x.value}%
          </button>
        ))}
      </div>
      <div className="p-between">
        {rows.map((x, i) => (
          <small key={i}>{x.label}</small>
        ))}
      </div>
    </div>
  );
}
/** A side-by-side comparison with highlighted differences. */
export function ComparisonTable(p: ProsProps) {
  const [value, set] = useModel(p, "Studio");
  return (
    <div
      data-pros="ComparisonTable"
      className={cx("p-comparison", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <h3>{p.title ?? "Find your fit."}</h3>
        <span className="p-pill">{value}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Included</th>
            <th scope="col">Solo</th>
            <th scope="col">Studio</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Projects", "5", "Unlimited"],
            ["Collaborators", "1", "10"],
            ["Storage", "2 GB", "100 GB"],
          ].map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-row">
        {["Solo", "Studio"].map((s) => (
          <button
            type="button"
            className={cx("p-btn", value !== s && "p-soft")}
            key={s}
            aria-pressed={value === s}
            onClick={() => set(s)}
          >
            Choose {s}
          </button>
        ))}
      </div>
    </div>
  );
}
/** A statistic triptych with animated numeric emphasis. */
export function StatsRow(p: ProsProps) {
  return (
    <div
      data-pros="StatsRow"
      className={cx("p-stats-row", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          { label: "Ideas", value: "128" },
          { label: "In motion", value: "24" },
          { label: "Released", value: "09" },
        ]
      ).map((x, i) => (
        <div key={i} style={{ animationDelay: i * 100 + "ms" }}>
          <strong>{x.value}</strong>
          <small>{x.label}</small>
        </div>
      ))}
    </div>
  );
}
/** A radial goal meter paired with a target-setting input. */
export function GoalGauge(p: ProsProps) {
  const [value, set] = useModel(p, "64");
  return (
    <div
      data-pros="GoalGauge"
      className={cx("p-goal-gauge", p.className)}
      style={p.style}
    >
      <div
        style={{
          background:
            "conic-gradient(#171717 " +
            Math.max(0, Math.min(100, Number(value) || 0)) +
            "%, #e5e5e1 0)",
        }}
      >
        <span>
          <b>{value}%</b>
          <small>{p.title ?? "DAILY GOAL"}</small>
        </span>
      </div>
      <label>
        Adjust your progress
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
/** A waterfall chart showing positive and negative contributions. */
export function WaterfallChart(p: ProsProps) {
  const data = p.items ?? [
    { label: "Start", value: "40" },
    { label: "New", value: "25" },
    { label: "Lost", value: "-12" },
    { label: "Return", value: "18" },
  ];
  let sum = 0;
  const steps = data.map((x, i) => {
    const change = Number(x.value) || 0;
    const from = sum;
    sum += change;
    return {
      label: x.label,
      from,
      to: sum,
      kind: i === 0 ? "start" : change < 0 ? "down" : "up",
      text:
        i === 0 ? String(change) : (change < 0 ? "−" : "+") + Math.abs(change),
    };
  });
  // Every bar shares one zero baseline, so the closing total reads against the steps.
  const bars = [
    ...steps,
    { label: "Total", from: 0, to: sum, kind: "total", text: String(sum) },
  ];
  const high = Math.max(0, ...bars.map((x) => Math.max(x.from, x.to)));
  const low = Math.min(0, ...bars.map((x) => Math.min(x.from, x.to)));
  const span = Math.max(1, high - low);
  const at = (n: number) => ((n - low) / span) * 100;
  return (
    <figure
      data-pros="WaterfallChart"
      className={cx("p-waterfall", p.className)}
      style={p.style}
    >
      <figcaption>{p.title ?? "How we got here."}</figcaption>
      <ol className="p-waterfall-plot">
        {bars.map((x, i) => (
          <li key={i} className={"is-" + x.kind}>
            <div className="p-waterfall-track">
              <i
                className="p-waterfall-base"
                style={{ bottom: at(0) + "%" }}
                aria-hidden="true"
              />
              {i < bars.length - 1 && (
                <i
                  className="p-waterfall-link"
                  style={{ bottom: at(x.to) + "%" }}
                  aria-hidden="true"
                />
              )}
              <span
                style={{
                  bottom: at(Math.min(x.from, x.to)) + "%",
                  height: (Math.abs(x.to - x.from) / span) * 100 + "%",
                }}
              />
              <small style={{ bottom: at(Math.max(x.from, x.to)) + "%" }}>
                {x.text}
              </small>
            </div>
            <b>{x.label}</b>
          </li>
        ))}
      </ol>
      <small>Net total: {sum}</small>
    </figure>
  );
}
/** A funnel visualization with selectable conversion stages. */
export function FunnelChart(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Discovered", value: "100" },
    { label: "Explored", value: "72" },
    { label: "Collected", value: "38" },
  ];
  return (
    <div
      data-pros="FunnelChart"
      className={cx("p-funnel", p.className)}
      style={p.style}
    >
      <b>{p.title ?? "From curious to committed."}</b>
      {rows.map((x, i) => (
        <button
          type="button"
          key={i}
          style={{ width: Math.max(30, Number(x.value) || 30) + "%" }}
          onClick={() => p.onAction?.(x.label)}
        >
          <span>{x.label}</span>
          <b>{x.value}%</b>
        </button>
      ))}
    </div>
  );
}
/** A data inspector that reveals the object behind a summary. */
export function JsonInspector(p: ProsProps) {
  const [open, set] = useState(true);
  return (
    <div
      data-pros="JsonInspector"
      className={cx("p-json-inspector", p.className)}
      style={p.style}
    >
      <button type="button" aria-expanded={open} onClick={() => set(!open)}>
        <span>
          {open ? (
            <>
              <Icon name="minus" />
            </>
          ) : (
            <Icon name="plus" />
          )}
        </span>{" "}
        {p.title ?? "project"}{" "}
        <small>{"{ " + itemsOf(p).length + " fields }"}</small>
      </button>
      {open && (
        <dl className="p-enter">
          {itemsOf(p).map((x, i) => (
            <div key={i}>
              <dt>{x.label.toLowerCase()}</dt>
              <dd>{JSON.stringify(x.value ?? x.description ?? "active")}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
/** A bounded timeline chart with a selected period readout. */
export function TimelineChart(p: ProsProps) {
  const [value, set] = useModel(p, "1");
  const list = p.items ?? [
    { label: "Research", value: "24" },
    { label: "Design", value: "60" },
    { label: "Build", value: "42" },
  ];
  // Each lane starts partway through the one before it, so the chart reads as a plan.
  let start = 0;
  const lanes = list.map((s) => {
    const length = Math.max(1, Number(s.value) || 40);
    const lane = { label: s.label, from: start, to: start + length };
    start += length * 0.6;
    return lane;
  });
  const span = Math.max(1, ...lanes.map((x) => x.to));
  const current = lanes[Number(value)];
  return (
    <div
      data-pros="TimelineChart"
      className={cx("p-timeline-chart", p.className)}
      style={p.style}
    >
      <b>{p.title ?? "One thing at a time."}</b>
      <div className="p-timeline-axis" aria-hidden="true">
        <div>
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} style={{ left: n * 25 + "%" }}>
              {"Wk " + Math.round((span * n) / 4)}
            </span>
          ))}
        </div>
      </div>
      {lanes.map((s, i) => (
        <button
          type="button"
          key={i}
          aria-pressed={value === String(i)}
          aria-label={
            s.label + ", week " + Math.round(s.from) + " to " + Math.round(s.to)
          }
          onClick={() => set(String(i))}
        >
          <span>{s.label}</span>
          <span className="p-timeline-track">
            <i
              style={{
                left: (s.from / span) * 100 + "%",
                width: ((s.to - s.from) / span) * 100 + "%",
              }}
            />
          </span>
        </button>
      ))}
      <small aria-live="polite">
        Selected: {current?.label ?? "None"}
        {current &&
          " · Wk " + Math.round(current.from) + " to " + Math.round(current.to)}
      </small>
    </div>
  );
}
/** A compact ticker displaying trends without pretending to be live data. */
export function TrendTicker(p: ProsProps) {
  return (
    <div
      data-pros="TrendTicker"
      className={cx("p-trend-ticker", p.className)}
      style={p.style}
    >
      {(
        p.items ?? [
          { label: "Visits", value: "+12.8%" },
          { label: "Saves", value: "+8.4%" },
          { label: "Returns", value: "−2.1%" },
        ]
      ).map((s, i) => {
        const down = !!s.value && /^[−-]/.test(s.value);
        return (
          <div key={i} className={down ? "is-down" : "is-up"}>
            <small>{s.label}</small>
            <b>{s.value}</b>
            <span aria-hidden="true">
              <DirectionArrow down={down} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
