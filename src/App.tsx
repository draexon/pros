import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import * as Library from "./library";
import { Mark, Arrow } from "./library/core";
import catalog from "./catalog.json";
import type { ProsProps } from "./library";

type Entry = (typeof catalog)[number];
const components = Library as unknown as Record<
  string,
  ComponentType<ProsProps>
>;
const categoryNames: Record<string, string> = {
  cards: "Cards",
  buttons: "Buttons",
  inputs: "Inputs",
  navigation: "Navigation",
  typography: "Typography",
  feedback: "Feedback",
  overlays: "Overlays",
  data: "Data display",
  media: "Media",
  layout: "Layouts",
  commerce: "Commerce",
  social: "Social",
  lists: "Lists",
  motion: "Motion",
};
const categoryIcons: Record<string, string> = {
  cards: "▣",
  buttons: "↗",
  inputs: "⌨",
  navigation: "⌘",
  typography: "Aa",
  feedback: "◌",
  overlays: "▱",
  data: "▥",
  media: "◈",
  layout: "▦",
  commerce: "⌑",
  social: "◉",
  lists: "☷",
  motion: "✳",
};
const featured = [
  "EditorialCard",
  "StackedCard",
  "ArrowButton",
  "ImageCard",
  "TiltSurface",
  "PillTabs",
  "MorphingShape",
  "MetricCard",
  "TicketCard",
  "OrbitButton",
  "ToggleInput",
  "WordReveal",
  "ProductCard",
  "ImageAccordion",
  "SpringStack",
  "BentoGrid",
  "Polaroid",
  "QuoteCard",
];
const sourceLoaders = import.meta.glob<string>("./library/*.{tsx,css}", {
  query: "?raw",
  import: "default",
});
const humanize = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2");
function readSaved(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem("pros.saved") ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function currentRoute() {
  return window.location.hash.slice(1) || "/";
}
function routeTo(path: string) {
  window.location.hash = path;
}
function Icon({
  name,
  size = 18,
}: {
  name:
    | "search"
    | "grid"
    | "list"
    | "code"
    | "heart"
    | "arrow"
    | "github"
    | "close";
  size?: number;
}) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    list: (
      <>
        <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1" />
      </>
    ),
    code: (
      <>
        <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    github: (
      <>
        <path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.5-.5-2 3-.3 6-1.4 6-6a5 5 0 0 0-1.3-3.5c.1-1 .1-2.1-.5-3.5 0 0-1.1-.3-3.7 1.4a12 12 0 0 0-7 0C4.4 2.7 3.3 3 3.3 3c-.6 1.4-.6 2.5-.5 3.5A5 5 0 0 0 1.5 10c0 4.6 3 5.7 6 6-.6.5-.5 1-.5 2v4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Hero({ notify }: { notify: (text: string) => void }) {
  const [flipped, setFlipped] = useState(false);
  const [liked, setLiked] = useState(false);
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="tiny-flower">✳</span> SMALL DETAILS. BIG PERSONALITY.
        </div>
        <h1>
          A little motion.
          <br />A lot of <em>feeling.</em>
          <svg viewBox="0 0 360 20" aria-hidden="true">
            <path d="M4 13Q170-3 351 7M35 18Q220 3 331 12" />
          </svg>
        </h1>
        <p>
          Thoughtfully crafted components for interfaces that feel alive. Curvy,
          tactile, and a little unexpected.
        </p>
        <div className="hero-actions">
          <button
            className="big-action"
            onClick={() =>
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore components{" "}
            <span>
              <Icon name="arrow" size={19} />
            </span>
          </button>
          <button className="quiet-action" onClick={() => routeTo("/docs")}>
            Get started <Icon name="code" size={17} />
          </button>
        </div>
        <div className="hero-proof">
          <span className="hero-proof-avatars">
            <i>a</i>
            <i>✳</i>
            <i>d</i>
          </span>
          <span>
            For people who care
            <br />
            <b>how the little things feel.</b>
          </span>
        </div>
      </div>
      <div className="hero-playground">
        <div className="hero-orbit-line" />
        <div className="hero-background-card">
          <span>AN EXERCISE IN</span>
          <b>
            GOOD
            <br />
            FORM.
          </b>
          <Mark variant={0} />
          <small>INDEPENDENT BY DESIGN.</small>
        </div>
        <button
          className={"hero-feature-card " + (flipped ? "is-flipped" : "")}
          aria-label="Change the featured shape"
          onClick={() => setFlipped(!flipped)}
        >
          <span className="hero-card-top">
            <span>OBJECTS IN MOTION</span>
            <span>01 — 06</span>
          </span>
          <div className="hero-sculpture">
            <Mark variant={flipped ? 3 : 2} />
          </div>
          <span className="hero-card-bottom">
            <strong>{flipped ? "Another angle." : "Made to move."}</strong>
            <span className="hero-card-arrow">↗</span>
          </span>
        </button>
        <div className="hero-count">
          <b>
            210<span>+</span>
          </b>
          <small>
            WAYS TO MAKE
            <br />
            SOMETHING FEEL.
          </small>
          <i>✳</i>
        </div>
        <button
          className={"hero-love " + (liked ? "is-liked" : "")}
          aria-pressed={liked}
          aria-label="Like this design"
          onClick={() => setLiked(!liked)}
        >
          <Icon name="heart" size={21} />
          <span>{liked ? "129" : "128"}</span>
          <i>+1</i>
        </button>
        <button
          className="hero-mini-button"
          onClick={() => notify("You made a move. Now make something yours.")}
        >
          <span>Make a move</span>
          <b>↗</b>
        </button>
        <div className="hero-handnote">
          Go on. Touch something.
          <svg viewBox="0 0 95 60" aria-hidden="true">
            <path d="M4 50Q68 72 78 8M62 15 79 6 88 25" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function PreviewTile({
  entry,
  saved,
  toggleSave,
  notify,
  index,
}: {
  entry: Entry;
  saved: boolean;
  toggleSave: () => void;
  notify: (text: string) => void;
  index: number;
}) {
  const C = components[entry.name];
  const [replay, setReplay] = useState(0);
  return (
    <article
      className="component-tile"
      style={
        { "--tile-delay": Math.min(index % 18, 8) * 45 + "ms" } as CSSProperties
      }
    >
      <div className={"tile-stage stage-" + entry.category}>
        <div className="tile-tools">
          <span className="live-label">
            <i /> INTERACTIVE
          </span>
          <button
            aria-label={"Replay " + humanize(entry.name)}
            title="Replay entrance"
            onClick={() => setReplay(replay + 1)}
          >
            ↻
          </button>
        </div>
        <div className="tile-component" key={replay}>
          <C
            onAction={(action) => notify(humanize(entry.name) + " → " + action)}
          />
        </div>
        <button
          className="tile-source"
          aria-label={"View " + humanize(entry.name) + " details"}
          onClick={() => routeTo("/component/" + entry.slug)}
        >
          <Icon name="code" size={12} /> View code <span>↗</span>
        </button>
      </div>
      <div className="tile-footer">
        <button
          className="tile-title"
          onClick={() => routeTo("/component/" + entry.slug)}
        >
          <b>{humanize(entry.name)}</b>
          <span>
            {categoryNames[entry.category]} <i>·</i> React + CSS
          </span>
        </button>
        <button
          className={"tile-save " + (saved ? "is-saved" : "")}
          aria-label={(saved ? "Unsave " : "Save ") + humanize(entry.name)}
          aria-pressed={saved}
          onClick={toggleSave}
        >
          <Icon name="heart" size={17} />
        </button>
      </div>
    </article>
  );
}

function Collection({
  motionOnly,
  saved,
  toggleSave,
  notify,
}: {
  motionOnly: boolean;
  saved: string[];
  toggleSave: (name: string) => void;
  notify: (text: string) => void;
}) {
  const [category, setCategory] = useState(motionOnly ? "motion" : "all");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("curated");
  const [view, setView] = useState("grid");
  const [limit, setLimit] = useState(18);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setCategory(motionOnly ? "motion" : "all");
    setLimit(18);
  }, [motionOnly]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !document.querySelector("dialog[open]")
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => setLimit(18), [query, category, savedOnly, sort]);
  const filtered = useMemo(() => {
    let result = catalog.filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (!savedOnly || saved.includes(e.name)) &&
        (humanize(e.name) + " " + e.category + " " + e.description)
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    if (sort === "az")
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "za")
      result = result.sort((a, b) => b.name.localeCompare(a.name));
    else
      result = result.sort((a, b) => {
        const ai = featured.indexOf(a.name),
          bi = featured.indexOf(b.name);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    return result;
  }, [category, query, savedOnly, saved, sort]);
  return (
    <section className="collection" id="collection">
      <div className="section-intro">
        <div>
          <span className="section-kicker">
            <i /> THE COMPONENT COLLECTION
          </span>
          <h2>
            {motionOnly ? (
              <>
                A little more <em>movement.</em>
              </>
            ) : (
              <>
                Your next great <em>detail.</em>
              </>
            )}
          </h2>
          <p>
            {motionOnly
              ? "Pull, tilt, drag, and explore. Fifteen studies in how an interface can feel."
              : "A considered collection. An open invitation to play."}
          </p>
        </div>
        <div className="collection-search">
          <Icon name="search" size={19} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find your next detail…"
            aria-label="Search components"
          />
          {query ? (
            <button aria-label="Clear search" onClick={() => setQuery("")}>
              <Icon name="close" size={15} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </div>
      </div>
      <div className="collection-layout">
        <aside className="category-sidebar">
          <div className="sidebar-label">EXPLORE THE LIBRARY</div>
          <button
            className={
              "category-button " + (category === "all" ? "is-active" : "")
            }
            onClick={() => {
              setCategory("all");
              setSavedOnly(false);
            }}
          >
            <span className="category-symbol">✳</span>
            <span>All components</span>
            <small>210</small>
          </button>
          {Object.entries(categoryNames).map(([id, name]) => (
            <button
              key={id}
              className={
                "category-button " + (category === id ? "is-active" : "")
              }
              onClick={() => {
                setCategory(id);
                setSavedOnly(false);
              }}
            >
              <span className="category-symbol">{categoryIcons[id]}</span>
              <span>{name}</span>
              <small>15</small>
            </button>
          ))}
          <div className="sidebar-note">
            <span>↗</span>
            <p>
              Made to be
              <br />
              <em>made your own.</em>
            </p>
            <button onClick={() => routeTo("/docs")}>
              Meet the system <Arrow />
            </button>
          </div>
          <div className="sidebar-bottom">
            DESIGNED & BUILT BY <b>DRAEXON</b>
          </div>
        </aside>
        <div className="collection-results">
          <div className="collection-toolbar">
            <div className="result-label">
              <b>
                {savedOnly
                  ? "Your saved details"
                  : category === "all"
                    ? "All components"
                    : categoryNames[category]}
              </b>
              <span>{filtered.length}</span>
            </div>
            <div className="toolbar-controls">
              <button
                className={"saved-toggle " + (savedOnly ? "is-active" : "")}
                aria-pressed={savedOnly}
                onClick={() => setSavedOnly(!savedOnly)}
              >
                <Icon name="heart" size={15} />
                <span>
                  Saved {saved.length > 0 && "(" + saved.length + ")"}
                </span>
              </button>
              <select
                aria-label="Sort components"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="curated">Curated order</option>
                <option value="az">Name: A–Z</option>
                <option value="za">Name: Z–A</option>
              </select>
              <div className="view-toggle">
                <button
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <Icon name="grid" size={15} />
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <Icon name="list" size={15} />
                </button>
              </div>
            </div>
          </div>
          {filtered.length ? (
            <div
              className={"component-grid " + (view === "list" ? "is-list" : "")}
              key={category + savedOnly + sort}
            >
              {filtered.slice(0, limit).map((entry, index) => (
                <PreviewTile
                  key={entry.name}
                  entry={entry}
                  index={index}
                  saved={saved.includes(entry.name)}
                  toggleSave={() => toggleSave(entry.name)}
                  notify={notify}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <Mark variant={1} />
              <h3>
                {savedOnly
                  ? "Your collection starts here."
                  : "Nothing here. Yet."}
              </h3>
              <p>
                {savedOnly
                  ? "Tap the heart on a component to keep it close."
                  : "Try another word or explore a different category."}
              </p>
              <button
                className="big-action"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setSavedOnly(false);
                }}
              >
                Explore everything <Arrow />
              </button>
            </div>
          )}
          {limit < filtered.length && (
            <div className="load-more">
              <span>
                {Math.min(limit, filtered.length)} of {filtered.length} little
                details
              </span>
              <button onClick={() => setLimit(limit + 18)}>
                A little more inspiration <span>+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CodeBlock({
  code,
  notify,
  label = "Copy code",
}: {
  code: string;
  notify: (s: string) => void;
  label?: string;
}) {
  return (
    <div className="code-block">
      <div>
        <span>TSX / PROS</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              notify("Copied. Make it yours.");
            } catch {
              notify("Clipboard unavailable. Select and copy the code below.");
            }
          }}
        >
          {label} <span>⧉</span>
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
function usageFor(entry: Entry) {
  return (
    "import { ProsProvider, " +
    entry.name +
    " } from '@draexon/pros';\nimport '@draexon/pros/style.css';\n\nexport default function Example() {\n  return (\n    <ProsProvider>\n      <" +
    entry.name +
    "\n        onAction={(action) => console.log(action)}\n      />\n    </ProsProvider>\n  );\n}"
  );
}
function Detail({
  entry,
  saved,
  toggleSave,
  notify,
}: {
  entry: Entry;
  saved: boolean;
  toggleSave: () => void;
  notify: (s: string) => void;
}) {
  const C = components[entry.name];
  const [tab, setTab] = useState("preview");
  const [replay, setReplay] = useState(0);
  const [canvas, setCanvas] = useState("paper");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [sourceKind, setSourceKind] = useState("component");
  const [event, setEvent] = useState(
    "Interact with the preview to see its events here.",
  );
  useEffect(() => {
    setSource("");
    const key =
      sourceKind === "styles"
        ? "./library/styles.css"
        : sourceKind === "core"
          ? "./library/core.tsx"
          : "./library/" + entry.category + ".tsx";
    let active = true;
    sourceLoaders[key]?.()
      .then((text) => {
        if (active) setSource(text);
      })
      .catch(() => {
        if (active)
          setSource(
            "Source could not be loaded. Open src/library/" +
              entry.category +
              ".tsx in your project.",
          );
      });
    return () => {
      active = false;
    };
  }, [entry, sourceKind]);
  return (
    <main className="detail-page">
      <button className="back-link" onClick={() => routeTo("/components")}>
        ← Back to the collection
      </button>
      <div className="detail-heading">
        <div>
          <span className="section-kicker">
            {categoryNames[entry.category]} /{" "}
            {String(catalog.indexOf(entry) + 1).padStart(3, "0")}
          </span>
          <h1>
            {humanize(entry.name)}
            <span>.</span>
          </h1>
          <p>{entry.description}</p>
        </div>
        <button
          className={"detail-save " + (saved ? "is-saved" : "")}
          aria-pressed={saved}
          onClick={toggleSave}
        >
          <Icon name="heart" />
          {saved ? "Saved to your collection" : "Save this detail"}
        </button>
      </div>
      <div className="detail-layout">
        <section className="detail-main">
          <div className="detail-toolbar">
            <div
              className="detail-tabs"
              role="group"
              aria-label="Component documentation"
            >
              {["preview", "usage", "source"].map((t) => (
                <button
                  key={t}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t === "preview"
                    ? "Playground"
                    : t === "usage"
                      ? "Usage"
                      : "Source"}
                </button>
              ))}
            </div>
            <button
              className="replay-button"
              onClick={() => setReplay(replay + 1)}
            >
              ↻ Replay
            </button>
          </div>
          {tab === "preview" ? (
            <div className={"detail-canvas canvas-" + canvas}>
              <div className="detail-component" key={entry.name + replay}>
                <C
                  title={title || undefined}
                  onAction={(v) => {
                    setEvent('onAction("' + v + '")');
                    notify("Action: " + v);
                  }}
                  onValueChange={(v) => setEvent('onValueChange("' + v + '")')}
                />
              </div>
              <span className="canvas-caption">
                GO ON. MAKE A LITTLE MOVEMENT.
              </span>
            </div>
          ) : tab === "usage" ? (
            <CodeBlock code={usageFor(entry)} notify={notify} />
          ) : (
            <div className="source-panel">
              <div className="source-choices">
                {[
                  ["component", entry.category + ".tsx"],
                  ["core", "core.tsx"],
                  ["styles", "styles.css"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    aria-pressed={sourceKind === key}
                    onClick={() => setSourceKind(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p>
                Full source module. Keep core.tsx and styles.css alongside your
                copied components, or use the package import.
              </p>
              <CodeBlock
                code={source || "Loading source…"}
                notify={notify}
                label="Copy source"
              />
            </div>
          )}
          <div className="event-log">
            <span>EVENT LOG</span>
            <code aria-live="polite">{event}</code>
          </div>
        </section>
        <aside className="detail-settings">
          <span className="sidebar-label">MAKE IT YOURS</span>
          <label>
            Preview title
            <input
              placeholder="Use the original title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="canvas-picker">
            <span>Preview surface</span>
            <div>
              {["paper", "stone", "sage"].map((s) => (
                <button
                  key={s}
                  className={"swatch-" + s}
                  aria-label={s + " surface"}
                  aria-pressed={canvas === s}
                  onClick={() => setCanvas(s)}
                />
              ))}
            </div>
          </div>
          <div className="detail-info">
            <b>Considered by default.</b>
            <p>
              Responsive layouts. Semantic controls. Reduced-motion support.
              Every detail has a reason to move.
            </p>
          </div>
          <div className="detail-props">
            <span>COMMON PROPS</span>
            {[
              ["title", "string"],
              ["description", "string"],
              ["items", "ProsItem[]"],
              ["value", "string"],
              ["onValueChange", "(value) => void"],
              ["onAction", "(action) => void"],
              ["className", "string"],
              ["style", "CSSProperties"],
            ].map(([name, type]) => (
              <div key={name}>
                <code>{name}</code>
                <small>{type}</small>
              </div>
            ))}
          </div>
          <button className="settings-link" onClick={() => routeTo("/docs")}>
            Read the API notes <Arrow />
          </button>
        </aside>
      </div>
      <div className="related-heading">
        <h2>Keep the good ideas moving.</h2>
        <button className="quiet-action" onClick={() => routeTo("/components")}>
          Back to all 210 <Arrow />
        </button>
      </div>
    </main>
  );
}

function Docs({ notify }: { notify: (s: string) => void }) {
  return (
    <main className="docs-page">
      <div className="docs-intro">
        <span className="section-kicker">A LITTLE GUIDANCE</span>
        <h1>
          A starting point.
          <br />
          <em>Your point of view.</em>
        </h1>
        <p>
          Pros is an original React component library by draexon. 210 considered
          details. Fourteen collections. One very movable system.
        </p>
      </div>
      <div className="docs-layout">
        <aside>
          <a
            href="#/docs"
            onClick={() =>
              document
                .getElementById("installation")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            01 · Get started
          </a>
          <button
            onClick={() =>
              document
                .getElementById("api")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            02 · Make it yours
          </button>
          <button
            onClick={() =>
              document
                .getElementById("motion-guide")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            03 · Give it motion
          </button>
          <button
            onClick={() =>
              document
                .getElementById("principles")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            04 · A point of view
          </button>
        </aside>
        <div>
          <section id="installation">
            <span className="section-kicker">01 / GET STARTED</span>
            <h2>Something good starts small.</h2>
            <p>
              Build the private package from this repository, then install its
              tarball in your React project. React 18.3 or 19 and React DOM are
              peer dependencies.
            </p>
            <CodeBlock
              code={
                "# In this repository\nnpm install\nnpm run build:lib\nnpm pack\n\n# In your application\nnpm install /path/to/draexon-pros-0.1.0.tgz"
              }
              notify={notify}
            />
            <p>
              Import the stylesheet once, wrap your app in ProsProvider, and
              choose a component.
            </p>
            <CodeBlock
              code={usageFor(catalog.find((x) => x.name === "EditorialCard")!)}
              notify={notify}
            />
          </section>
          <section id="api">
            <span className="section-kicker">02 / MAKE IT YOURS</span>
            <h2>Room for your own details.</h2>
            <p>
              Every component accepts optional content and styling props.
              Stateful controls support local defaults; where documented, value
              and onValueChange let your app own the state. Values are
              serialized as strings: toggles use "true"/"false", numeric
              controls use a number string, and multi-selection uses
              comma-separated labels.
            </p>
            <CodeBlock
              code={
                '<ProsProvider>\n  <RangeInput\n    label="Intensity"\n    value={intensity}\n    onValueChange={setIntensity}\n  />\n  <ProductCard\n    title="Your everyday object"\n    description="$48"\n    onAction={(action) => handleCartAction(action)}\n  />\n</ProsProvider>'
              }
              notify={notify}
            />
            <div className="docs-note">
              <b>Connect your own application.</b>
              <p>
                Checkout, contact, invite, download, and other service actions
                call onAction. Pros supplies the interface; your app supplies
                storage, authentication, payments, and delivery. Local demo
                changes reset when a component remounts.
              </p>
            </div>
            <p>
              ProsItem accepts label, value, description, image, and href.
              Content props depend on the component; inspect its source tab for
              the exact behavior. Use image for image assets and href for
              VideoFrame or AudioPlayer media sources. Data components display
              your supplied values; demo values are illustrative.
            </p>
          </section>
          <section id="motion-guide">
            <span className="section-kicker">03 / GIVE IT MOTION</span>
            <h2>Movement with a reason.</h2>
            <p>
              Motion is built from CSS transforms, keyframes, pointer
              interactions, and native browser controls. No animation package or
              external UI library is required. The system uses a soft spring for
              controls and a smooth deceleration for layout transitions.
            </p>
            <CodeBlock
              code={
                ":root {\n  --pros-radius: 32px;\n  --pros-ink: #171817;\n  --pros-paper: #ffffff;\n  --pros-ease: cubic-bezier(.22, 1, .36, 1);\n  --pros-spring: cubic-bezier(.34, 1.56, .64, 1);\n  --pros-duration: 450ms;\n}\n\n// Stop animations while retaining usable state changes.\n<ProsProvider motion={false}>\n  <YourApplication />\n</ProsProvider>"
              }
              notify={notify}
            />
            <p>
              System reduced-motion preferences are respected. The gallery
              motion switch pauses animation across previews. Fonts use Manrope
              and DM Sans from Google Fonts, with local sans-serif fallbacks;
              self-host them in your app if required.
            </p>
          </section>
          <section id="principles">
            <span className="section-kicker">04 / A POINT OF VIEW</span>
            <h2>Independent by design.</h2>
            <div className="principle-grid">
              <article>
                <span>01</span>
                <h3>Form before decoration.</h3>
                <p>
                  Strong silhouettes, rounded surfaces, and space to breathe.
                  Movement follows the shape.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Personality in the details.</h3>
                <p>
                  A turning cover. A rolling label. A control that gives a
                  little under your hand.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>A quiet palette.</h3>
                <p>
                  Black and white first. A little sage, stone, or warm paper
                  when it serves the moment.
                </p>
              </article>
            </div>
            <p>
              The visual research draws from editorial compositions and printed
              matter collected on{" "}
              <a
                href="https://www.are.na/rachel-steele/layout-editorial-kl3d-_flrj4"
                target="_blank"
                rel="noreferrer"
              >
                Are.na ↗
              </a>
              , typographic references on{" "}
              <a
                href="https://it.pinterest.com/pin/business-cards-design-inspiration-black-and-white-graphic-design-typography--814799757554549066/"
                target="_blank"
                rel="noreferrer"
              >
                Pinterest ↗
              </a>
              , and physical objects. The implementations and geometric artwork
              are original; no existing component library was used as a design
              reference.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [saved, setSaved] = useState(readSaved);
  const [motion, setMotion] = useState(() => {
    try {
      return localStorage.getItem("pros.motion") !== "off";
    } catch {
      return true;
    }
  });
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (text: string) => {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3600);
  };
  useEffect(() => {
    const handle = () => {
      setRoute(currentRoute());
      setMobileMenu(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    try {
      localStorage.setItem("pros.saved", JSON.stringify(saved));
    } catch {}
  }, [saved]);
  useEffect(() => {
    try {
      localStorage.setItem("pros.motion", motion ? "on" : "off");
    } catch {}
  }, [motion]);
  const toggleSave = (name: string) =>
    setSaved((current) =>
      current.includes(name)
        ? current.filter((x) => x !== name)
        : [...current, name],
    );
  const entry = route.startsWith("/component/")
    ? catalog.find((x) => x.slug === route.split("/")[2])
    : undefined;
  const isHome = route === "/" || route === "";
  const isDocs = route === "/docs";
  const isMotion = route === "/motion";
  useEffect(() => {
    document.title = entry
      ? humanize(entry.name) + " — Pros"
      : isDocs
        ? "A little guidance — Pros"
        : "Pros — Interfaces with feeling.";
  }, [entry, isDocs]);
  return (
    <Library.ProsProvider motion={motion} className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="Pros home">
          pros<span className="brand-dot">✳</span>
        </a>
        <nav
          className={mobileMenu ? "is-open" : ""}
          aria-label="Main navigation"
        >
          <a
            href="#/components"
            className={route === "/components" || entry ? "is-current" : ""}
          >
            Components <span>210</span>
          </a>
          <a href="#/motion" className={isMotion ? "is-current" : ""}>
            Motion lab <i>✳</i>
          </a>
          <a href="#/docs" className={isDocs ? "is-current" : ""}>
            Documentation
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="motion-control"
            aria-pressed={motion}
            onClick={() => setMotion(!motion)}
            title={motion ? "Pause motion" : "Enable motion"}
          >
            <span className={motion ? "motion-bars is-moving" : "motion-bars"}>
              <i />
              <i />
              <i />
            </span>
            <span>Motion {motion ? "on" : "off"}</span>
          </button>
          <a
            className="github-link"
            href="https://github.com/draexon/pros"
            target="_blank"
            rel="noreferrer"
            aria-label="Pros private repository on GitHub"
          >
            <Icon name="github" size={19} />
          </a>
          <button className="header-start" onClick={() => routeTo("/docs")}>
            Get started <span>↗</span>
          </button>
          <button
            className="mobile-menu-button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? "×" : "☰"}
          </button>
        </div>
      </header>
      <div id="main" tabIndex={-1}>
        {entry ? (
          <Detail
            key={entry.name}
            entry={entry}
            saved={saved.includes(entry.name)}
            toggleSave={() => toggleSave(entry.name)}
            notify={notify}
          />
        ) : isDocs ? (
          <Docs notify={notify} />
        ) : route.startsWith("/component/") ? (
          <main className="not-found">
            <h1>This detail wandered off.</h1>
            <button
              className="big-action"
              onClick={() => routeTo("/components")}
            >
              Back to the collection ↗
            </button>
          </main>
        ) : (
          <main>
            {isHome && (
              <>
                <Hero notify={notify} />
                <div className="manifesto-strip">
                  <span>
                    <i>✳</i> BUILT WITH CHARACTER
                  </span>
                  <span>210 original components</span>
                  <span>14 considered collections</span>
                  <span>React + TypeScript</span>
                  <span>
                    Motion in the details <i>↗</i>
                  </span>
                </div>
              </>
            )}
            <Collection
              motionOnly={isMotion}
              saved={saved}
              toggleSave={toggleSave}
              notify={notify}
            />
            <section className="closing-note">
              <div>
                <span className="section-kicker">A LITTLE LESS ORDINARY.</span>
                <h2>
                  Make something
                  <br />
                  <em>worth feeling.</em>
                </h2>
                <button className="big-action" onClick={() => routeTo("/docs")}>
                  Start with Pros{" "}
                  <span>
                    <Icon name="arrow" size={18} />
                  </span>
                </button>
              </div>
              <div className="closing-art">
                <Mark variant={1} />
                <span>
                  INDEPENDENT
                  <br />
                  BY DESIGN.
                </span>
              </div>
            </section>
          </main>
        )}
      </div>
      <footer className="site-footer">
        <a href="#/" className="brand">
          pros<span className="brand-dot">✳</span>
        </a>
        <p>Small details. A different feeling.</p>
        <span>
          Made with intention by <b>draexon</b>
        </span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top ↑
        </button>
      </footer>
      {toast && (
        <div className="site-toast" role="status">
          <span>✳</span>
          <p>{toast}</p>
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            ×
          </button>
        </div>
      )}
    </Library.ProsProvider>
  );
}
