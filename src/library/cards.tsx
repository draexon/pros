import { Icon } from "./icons";
import { useState } from "react";
import {
  type ProsProps,
  cx,
  Mark,
  Action,
  Arrow,
  useToggle,
  itemsOf,
  useModel,
} from "./core";
/** An editorial cover with a shifting geometric composition. */
export function EditorialCard(p: ProsProps) {
  return (
    <article
      data-pros="EditorialCard"
      className={cx("p-card p-editorial", p.className)}
      style={p.style}
    >
      <div className="p-between p-eyebrow">
        <span>FIELD NOTES</span>
        <span>№ 001</span>
      </div>
      <Mark variant={0} />
      <div className="p-between">
        <div>
          <small>FORM / FUNCTION</small>
          <h3>{p.title ?? "Less, but alive."}</h3>
        </div>
        <Action p={p}>Read story</Action>
      </div>
    </article>
  );
}
/** A tactile deck that fans out to reveal the next idea. */
export function StackedCard(p: ProsProps) {
  const [index, set] = useState(0);
  const items = itemsOf(p);
  return (
    <div
      data-pros="StackedCard"
      className={cx("p-stack-card", p.className)}
      style={p.style}
    >
      <i />
      <i />
      <article className="p-card">
        <small className="p-eyebrow">
          IN THE COLLECTION · {index + 1}/{items.length}
        </small>
        <Mark variant={index + 1} />
        <h3>{items[index]?.label ?? p.title ?? "Collected thoughts"}</h3>
        <button
          type="button"
          className="p-action"
          disabled={p.disabled || !items.length}
          onClick={() => {
            set((index + 1) % items.length);
            p.onAction?.("next");
          }}
        >
          Next object <Arrow />
        </button>
      </article>
    </div>
  );
}
/** A collectible ticket with a punch-out spine and expanding details. */
export function TicketCard(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <article
      data-pros="TicketCard"
      className={cx("p-card p-ticket", p.className)}
      style={p.style}
    >
      <div>
        <small className="p-eyebrow">YOU ARE INVITED</small>
        <h3>{p.title ?? "After hours."}</h3>
        <p>
          {p.description ?? "An evening for ideas that refuse to sit still."}
        </p>
        <button
          type="button"
          className="p-action"
          aria-expanded={open}
          onClick={() => toggle()}
        >
          Event details{" "}
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
        {open && (
          <p className="p-enter">
            Friday · 19:00
            <br />
            Studio 04 · Bring your curiosity.
          </p>
        )}
      </div>
      <aside>
        <b>04</b>
        <span>ADMIT ONE</span>
      </aside>
    </article>
  );
}
/** A two-sided note that rotates between summary and detail. */
export function FlipCard(p: ProsProps) {
  const [back, toggle] = useToggle(p);
  return (
    <button
      data-pros="FlipCard"
      type="button"
      disabled={p.disabled}
      className={cx("p-flip-card", p.className)}
      style={p.style}
      aria-pressed={back}
      onClick={() => toggle()}
    >
      <span className={cx("p-flip-inner", back && "is-flipped")}>
        <span className="p-card p-flip-front">
          <small>THERE IS MORE TO THIS</small>
          <Mark variant={2} />
          <strong>{p.title ?? "A different side."}</strong>
          <span>
            Click to turn <Icon name="arrow" />
          </span>
        </span>
        <span className="p-card p-flip-back">
          <small>THE OTHER SIDE</small>
          <strong>
            {p.description ??
              "Good things reveal themselves with a little curiosity."}
          </strong>
          <span>
            Turn back <Icon name="arrow" />
          </span>
        </span>
      </span>
    </button>
  );
}
/** A book-like card with a hinged cover and hidden reading note. */
export function FoldCard(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <button
      data-pros="FoldCard"
      type="button"
      className={cx("p-fold-card", p.className, open && "is-open")}
      style={p.style}
      aria-expanded={open}
      disabled={p.disabled}
      onClick={() => toggle()}
    >
      <span className="p-fold-inside">
        {p.description ?? "The best ideas are waiting just inside."}
        <small>CLICK TO CLOSE</small>
      </span>
      <span className="p-fold-cover">
        <small>PROS / STUDIES</small>
        <strong>{p.title ?? "Open to possibility."}</strong>
        <span>
          <Icon name="arrow" />
        </span>
      </span>
    </button>
  );
}
/** A profile card with an expanding follow state. */
export function ProfileCard(p: ProsProps) {
  const [following, toggle] = useToggle(p);
  return (
    <article
      data-pros="ProfileCard"
      className={cx("p-card p-profile-card", p.className)}
      style={p.style}
    >
      <div className="p-avatar-art">
        <Mark variant={3} />
      </div>
      <small className="p-eyebrow">INDEPENDENT CREATIVE</small>
      <h3>{p.title ?? "Alex Morgan"}</h3>
      <p>{p.description ?? "Making useful things feel a little unexpected."}</p>
      <button
        type="button"
        className={cx("p-btn", following && "p-soft")}
        aria-pressed={following}
        disabled={p.disabled}
        onClick={() => toggle()}
      >
        {following ? (
          <>
            Following <Icon name="check" />
          </>
        ) : (
          "Follow + "
        )}
      </button>
    </article>
  );
}
/** A full-bleed image card with a sliding caption. */
export function ImageCard(p: ProsProps) {
  return (
    <article
      data-pros="ImageCard"
      className={cx("p-card p-image-card", p.className)}
      style={p.style}
    >
      {p.image ? (
        <img src={p.image} alt={p.title ?? "Featured object"} />
      ) : (
        <div className="p-sculpture">
          <i />
          <i />
          <i />
        </div>
      )}
      <div className="p-image-caption">
        <small>OBJECT STUDY / 002</small>
        <h3>{p.title ?? "Soft structure."}</h3>
        <Action p={p}>View study</Action>
      </div>
    </article>
  );
}
/** A typographic quote with an oversized animated quotation mark. */
export function QuoteCard(p: ProsProps) {
  return (
    <figure
      data-pros="QuoteCard"
      className={cx("p-card p-quote-card", p.className)}
      style={p.style}
    >
      <span aria-hidden="true" className="p-quote-mark">
        “
      </span>
      <blockquote>
        {p.title ?? "The details are not the details. They make the design."}
      </blockquote>
      <figcaption>{p.description ?? "A note worth keeping."}</figcaption>
    </figure>
  );
}
/** A metric card with an expandable breakdown and living bar chart. */
export function MetricCard(p: ProsProps) {
  const [show, toggle] = useToggle(p);
  return (
    <article
      data-pros="MetricCard"
      className={cx("p-card p-metric-card", p.className)}
      style={p.style}
    >
      <small>{p.title ?? "Weekly momentum"}</small>
      <div className="p-between">
        <strong className="p-number">
          84.6<span>%</span>
        </strong>
        <span className="p-pill">
          <Icon name="arrow" /> 12.8%
        </span>
      </div>
      <div className="p-bars" aria-label="Seven-day activity">
        {[35, 52, 42, 70, 56, 84, 95].map((n, i) => (
          <i
            key={i}
            style={{ height: n + "%", animationDelay: i * 70 + "ms" }}
          />
        ))}
      </div>
      <button
        type="button"
        className="p-action"
        aria-expanded={show}
        onClick={() => toggle()}
      >
        See breakdown{" "}
        <span>
          {show ? (
            <>
              <Icon name="minus" />
            </>
          ) : (
            <Icon name="plus" />
          )}
        </span>
      </button>
      {show && (
        <p className="p-enter">
          {p.description ?? "Design 46% · Engineering 38.6% · Research 15.4%"}
        </p>
      )}
    </article>
  );
}
/** A date-first event card with a persistent RSVP control. */
export function EventCard(p: ProsProps) {
  const [saved, toggle] = useToggle(p);
  return (
    <article
      data-pros="EventCard"
      className={cx("p-card p-event-card", p.className)}
      style={p.style}
    >
      <div className="p-date-block">
        <b>24</b>
        <small>OCTOBER</small>
      </div>
      <div>
        <span className="p-pill">IN PERSON</span>
        <h3>{p.title ?? "Design in motion"}</h3>
        <p>{p.description ?? "A gathering for people who make."}</p>
        <button
          type="button"
          className="p-action"
          disabled={p.disabled}
          aria-pressed={saved}
          onClick={() => toggle()}
        >
          {saved ? (
            <>
              You’re on the list <Icon name="check" />
            </>
          ) : (
            <>
              Save my place <Icon name="arrow" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
/** An audio release card with a play state and moving waveform. */
export function AudioCard(p: ProsProps) {
  const [playing, toggle] = useToggle(p);
  return (
    <article
      data-pros="AudioCard"
      className={cx(
        "p-card p-audio-card",
        p.className,
        playing && "is-playing",
      )}
      style={p.style}
    >
      <Mark variant={4} />
      <div className="p-between">
        <div>
          <small>LISTENING ROOM</small>
          <h3>{p.title ?? "Between spaces"}</h3>
        </div>
        <button
          type="button"
          disabled={p.disabled}
          className="p-round"
          aria-label={playing ? "Pause" : "Play"}
          aria-pressed={playing}
          onClick={() => {
            toggle();
            p.onAction?.(playing ? "pause" : "play");
          }}
        >
          {playing ? (
            <>
              <Icon name="pause" />
            </>
          ) : (
            <>
              <Icon name="play" />
            </>
          )}
        </button>
      </div>
      <div className="p-wave" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <i
            key={i}
            style={{
              height: 12 + ((i * 17) % 40) + "px",
              animationDelay: i * 43 + "ms",
            }}
          />
        ))}
      </div>
      <small>
        {p.description ?? "Playback control · connect onAction to your audio"}
      </small>
    </article>
  );
}
/** A file card that reveals metadata before its download action. */
export function FileCard(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <article
      data-pros="FileCard"
      className={cx("p-card p-file-card", p.className)}
      style={p.style}
    >
      <div className="p-file-icon">
        Aa<span>PDF</span>
      </div>
      <h3>{p.title ?? "Field guide.pdf"}</h3>
      <p>{p.description ?? "12 pages · 2.4 MB"}</p>
      <div className="p-between">
        <button
          type="button"
          className="p-text-btn"
          aria-expanded={open}
          onClick={() => toggle()}
        >
          Details{" "}
          {open ? (
            <>
              <Icon name="minus" />
            </>
          ) : (
            <Icon name="plus" />
          )}
        </button>
        <Action p={p} action="download">
          Download
        </Action>
      </div>
      {open && (
        <small className="p-enter">
          Portable document · Print ready · Revision 01
        </small>
      )}
    </article>
  );
}
/** A project brief with a three-step animated status selector. */
export function ProjectCard(p: ProsProps) {
  const [value, set] = useModel(p, "Design");
  return (
    <article
      data-pros="ProjectCard"
      className={cx("p-card p-project-card", p.className)}
      style={p.style}
    >
      <span className="p-pill">PROJECT 021</span>
      <h3>{p.title ?? "A new perspective."}</h3>
      <p>{p.description ?? "Brand identity for a world in motion."}</p>
      <div className="p-project-steps">
        {["Explore", "Design", "Deliver"].map((s, i) => (
          <button
            type="button"
            key={s}
            className={value === s ? "is-active" : ""}
            disabled={p.disabled}
            aria-pressed={value === s}
            onClick={() => set(s)}
          >
            <b>0{i + 1}</b>
            {s}
          </button>
        ))}
      </div>
    </article>
  );
}
/** A bookmarkable article with a sliding abstract thumbnail. */
export function ArticleCard(p: ProsProps) {
  const [saved, toggle] = useToggle(p);
  return (
    <article
      data-pros="ArticleCard"
      className={cx("p-card p-article-card", p.className)}
      style={p.style}
    >
      <div className="p-article-art">
        <Mark variant={5} />
      </div>
      <div className="p-between">
        <small>JOURNAL · 5 MIN READ</small>
        <button
          type="button"
          className="p-icon-button"
          aria-label={saved ? "Remove bookmark" : "Bookmark article"}
          aria-pressed={saved}
          onClick={() => toggle()}
        >
          {saved ? (
            <>
              <Icon name="bookmark-filled" />
            </>
          ) : (
            <>
              <Icon name="bookmark" />
            </>
          )}
        </button>
      </div>
      <h3>{p.title ?? "A little less expected."}</h3>
      <p>
        {p.description ??
          "Finding character in the spaces between the obvious."}
      </p>
      <Action p={p}>Read the journal</Action>
    </article>
  );
}
/** A progress card with an interactive checklist and computed completion. */
export function TaskCard(p: ProsProps) {
  const list = itemsOf(p);
  const [done, set] = useState<string[]>([]);
  return (
    <article
      data-pros="TaskCard"
      className={cx("p-card p-task-card", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <h3>{p.title ?? "Small steps."}</h3>
        <span>
          {done.length}/{list.length}
        </span>
      </div>
      <progress max={list.length || 1} value={done.length} />
      {list.map((s, i) => (
        <label key={i} className="p-check-row">
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
          <span>{s.label}</span>
        </label>
      ))}
    </article>
  );
}
