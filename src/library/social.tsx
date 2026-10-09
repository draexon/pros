import { Icon } from "./icons";
import { useId, useState } from "react";
import {
  type ProsProps,
  cx,
  itemsOf,
  useModel,
  useToggle,
  Arrow,
} from "./core";
/** A compact person row with a stateful follow action. */
export function FollowRow(p: ProsProps) {
  const [follow, toggle] = useToggle(p);
  return (
    <div
      data-pros="FollowRow"
      className={cx("p-follow-row", p.className)}
      style={p.style}
    >
      <span className="p-avatar">{(p.title ?? "Alex Morgan").slice(0, 1)}</span>
      <div>
        <b>{p.title ?? "Alex Morgan"}</b>
        <small>{p.description ?? "Independent designer"}</small>
      </div>
      <button
        type="button"
        className={cx("p-btn", follow && "p-soft")}
        aria-pressed={follow}
        onClick={() => toggle()}
      >
        {follow ? "Following" : "Follow +"}
      </button>
    </div>
  );
}
/** A comment thread with inline reply composition. */
export function CommentThread(p: ProsProps) {
  const [comments, set] = useState(
    p.items ?? [
      {
        label: "Alex",
        description: "There is something really good happening here.",
      },
      { label: "Sam", description: "The details make it feel so considered." },
    ],
  );
  const [draft, setDraft] = useState("");
  const id = useId();
  return (
    <div
      data-pros="CommentThread"
      className={cx("p-comment-thread", p.className)}
      style={p.style}
    >
      {comments.map((c, i) => (
        <article key={i}>
          <span className="p-avatar">{c.label[0]}</span>
          <div>
            <b>{c.label}</b>
            <p>{c.description}</p>
          </div>
        </article>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            set([...comments, { label: "You", description: draft.trim() }]);
            p.onAction?.(draft.trim());
            setDraft("");
          }
        }}
      >
        <label className="p-sr" htmlFor={id}>
          Add a thought
        </label>
        <input
          id={id}
          placeholder="Add a thought…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          required
        />
        <button
          type="submit"
          className="p-round"
          aria-label="Post comment"
          disabled={p.disabled || !draft.trim()}
        >
          <Icon name="up" />
        </button>
      </form>
    </div>
  );
}
/** A selectable reaction strip with per-reaction counts. */
export function ReactionBar(p: ProsProps) {
  const [selected, set] = useModel(p, "");
  const list = p.items ?? [
    { label: "Love", value: "24" },
    { label: "Inspired", value: "12" },
    { label: "Support", value: "8" },
  ];
  return (
    <div
      data-pros="ReactionBar"
      className={cx("p-reaction-bar", p.className)}
      style={p.style}
      role="group"
      aria-label={p.label ?? "Reactions"}
    >
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          aria-label={["Love", "Inspired", "Support"][i] ?? s.label}
          aria-pressed={selected === s.label}
          onClick={() => set(selected === s.label ? "" : s.label)}
        >
          <span>
            {p.items ? (
              s.label
            ) : (
              <Icon name={(["heart", "flower", "arrow"] as const)[i % 3]} />
            )}
          </span>
          <b>{(Number(s.value) || 0) + (selected === s.label ? 1 : 0)}</b>
        </button>
      ))}
    </div>
  );
}
/** A local message composer that appends sent messages. */
export function ChatPanel(p: ProsProps) {
  const [messages, set] = useState(
    p.items ?? [
      { label: "Studio", description: "What are you working on today?" },
    ],
  );
  const [draft, setDraft] = useState("");
  return (
    <div
      data-pros="ChatPanel"
      className={cx("p-chat-panel", p.className)}
      style={p.style}
    >
      <header>
        <span className="p-avatar">S</span>
        <b>{p.title ?? "The studio"}</b>
        <small>CONVERSATION</small>
      </header>
      <div className="p-chat-messages" aria-live="polite">
        {messages.map((m, i) => (
          <p key={i} className={m.label === "You" ? "is-mine" : ""}>
            <small>{m.label}</small>
            {m.description}
          </p>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            set([...messages, { label: "You", description: draft.trim() }]);
            p.onAction?.(draft.trim());
            setDraft("");
          }
        }}
      >
        <input
          aria-label="Message"
          required
          placeholder="A new thought…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          className="p-round"
          aria-label="Send message"
          disabled={p.disabled || !draft.trim()}
        >
          <Icon name="up" />
        </button>
      </form>
    </div>
  );
}
/** A testimonial carousel with a large quotation and real navigation. */
export function TestimonialSlider(p: ProsProps) {
  const list = p.items ?? [
    {
      label: "Alex, designer",
      description: "Finally, something with a little personality.",
    },
    {
      label: "Sam, founder",
      description: "The details make all the difference.",
    },
    {
      label: "Jules, maker",
      description: "A good starting point for something of our own.",
    },
  ];
  const [value, set] = useModel(p, "0");
  const i = Number(value) || 0;
  return (
    <figure
      data-pros="TestimonialSlider"
      className={cx("p-testimonial-slider", p.className)}
      style={p.style}
    >
      <span>“</span>
      <blockquote key={i} className="p-enter">
        {list[i]?.description}
      </blockquote>
      <figcaption>{list[i]?.label}</figcaption>
      <div className="p-row">
        {list.map((x, index) => (
          <button
            type="button"
            key={index}
            aria-label={"Show testimonial from " + x.label}
            aria-pressed={index === i}
            onClick={() => set(String(index))}
          />
        ))}
      </div>
    </figure>
  );
}
/** A share link control with platform callbacks and clipboard feedback. */
export function ShareBar(p: ProsProps) {
  const [copied, set] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div
      data-pros="ShareBar"
      className={cx("p-share-bar", p.className)}
      style={p.style}
    >
      <small>{p.title ?? "GOOD THINGS TRAVEL."}</small>
      <div>
        {["Email", "Message"].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => p.onAction?.(s.toLowerCase())}
          >
            {s} <Icon name="arrow" />
          </button>
        ))}
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                p.href ?? "https://example.com",
              );
              set(true);
              setError(false);
            } catch {
              setError(true);
            }
          }}
        >
          {error ? (
            "Copy unavailable"
          ) : copied ? (
            <>
              Copied <Icon name="check" />
            </>
          ) : (
            <>
              Copy link <Icon name="copy" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
/** A team roster with selectable roles for each member. */
export function TeamRoster(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Alex Morgan", description: "Designer" },
    { label: "Sam Rivera", description: "Editor" },
    { label: "Jules Park", description: "Viewer" },
  ];
  const [roles, set] = useState<Record<string, string>>({});
  return (
    <div
      data-pros="TeamRoster"
      className={cx("p-team-roster", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "Good company."}</h3>
      {rows.map((s, i) => (
        <div key={i}>
          <span className="p-avatar">{s.label[0]}</span>
          <b>{s.label}</b>
          <select
            aria-label={"Role for " + s.label}
            value={roles[s.label] ?? s.description ?? "Viewer"}
            onChange={(e) => {
              set({ ...roles, [s.label]: e.target.value });
              p.onAction?.(s.label + ":" + e.target.value);
            }}
          >
            {["Designer", "Editor", "Viewer"].map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
/** An invitation form with role selection and email validation. */
export function InviteForm(p: ProsProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");
  return (
    <form
      data-pros="InviteForm"
      className={cx("p-invite-form", p.className)}
      style={p.style}
      onSubmit={(e) => {
        e.preventDefault();
        p.onAction?.(JSON.stringify({ email, role }));
      }}
    >
      <h3>{p.title ?? "Make a little room."}</h3>
      <p>{p.description ?? "Good ideas get better with good people."}</p>
      <label>
        Email address
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@somewhere.com"
        />
      </label>
      <label>
        Role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Editor</option>
          <option>Viewer</option>
        </select>
      </label>
      <button type="submit" className="p-btn" disabled={p.disabled}>
        {p.label ?? "Send invitation"} <Arrow />
      </button>
    </form>
  );
}
/** A presence cluster with a selectable status for the current user. */
export function PresenceIndicator(p: ProsProps) {
  const [value, set] = useModel(p, "Available");
  return (
    <div
      data-pros="PresenceIndicator"
      className={cx("p-presence-indicator", p.className)}
      style={p.style}
    >
      <div className="p-presence-person">
        <span className="p-avatar">
          Y<i className={value === "Available" ? "is-online" : ""} />
        </span>
        <div>
          <b>{p.title ?? "You, right now."}</b>
          <select
            aria-label="Your availability"
            value={value}
            onChange={(e) => set(e.target.value)}
          >
            {["Available", "Focused", "Away"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <small>
        {p.description ?? "Your status is visible to your workspace."}
      </small>
    </div>
  );
}
/** A poll with one vote per local session and proportional results. */
export function PollCard(p: ProsProps) {
  const list = p.items ?? [
    { label: "Quiet mornings", value: "42" },
    { label: "Late nights", value: "28" },
    { label: "Whenever it comes", value: "18" },
  ];
  const [vote, set] = useModel(p, "");
  const total =
    list.reduce((n, x) => n + (Number(x.value) || 0), 0) + (vote ? 1 : 0);
  return (
    <div
      data-pros="PollCard"
      className={cx("p-poll-card", p.className)}
      style={p.style}
    >
      <small>A QUICK QUESTION</small>
      <h3>{p.title ?? "When do your best ideas happen?"}</h3>
      {list.map((s, i) => (
        <button
          type="button"
          key={i}
          disabled={!!vote}
          aria-pressed={vote === s.label}
          onClick={() => {
            set(s.label);
            p.onAction?.(s.label);
          }}
        >
          {vote && (
            <i
              style={{
                width:
                  (((Number(s.value) || 0) + (vote === s.label ? 1 : 0)) /
                    Math.max(1, total)) *
                    100 +
                  "%",
              }}
            />
          )}
          <span>{s.label}</span>
          <b>
            {vote ? (
              Math.round(
                (((Number(s.value) || 0) + (vote === s.label ? 1 : 0)) /
                  Math.max(1, total)) *
                  100,
              ) + "%"
            ) : (
              <>
                <Icon name="arrow" />
              </>
            )}
          </b>
        </button>
      ))}
      <small aria-live="polite">
        {vote
          ? total + " votes · Thanks for your perspective"
          : "Choose one to see the results"}
      </small>
    </div>
  );
}
/** A bookmark collection with independently saved objects. */
export function CollectionPreview(p: ProsProps) {
  const [saved, set] = useState<string[]>([]);
  return (
    <div
      data-pros="CollectionPreview"
      className={cx("p-collection-preview", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <h3>{p.title ?? "Worth keeping."}</h3>
        <span>{saved.length} saved</span>
      </div>
      {itemsOf(p).map((s, i) => (
        <button
          type="button"
          key={i}
          aria-pressed={saved.includes(s.label)}
          onClick={() => {
            set(
              saved.includes(s.label)
                ? saved.filter((x) => x !== s.label)
                : [...saved, s.label],
            );
            p.onAction?.(s.label);
          }}
        >
          <span className="p-collection-thumb">
            <Icon name={(["media", "flower", "circle"] as const)[i % 3]} />
          </span>
          <b>{s.label}</b>
          <span>
            {saved.includes(s.label) ? (
              <>
                <Icon name="bookmark-filled" />
              </>
            ) : (
              <>
                <Icon name="bookmark" />
              </>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
/** An author byline with expandable profile details. */
export function AuthorByline(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <div
      data-pros="AuthorByline"
      className={cx("p-author-byline", p.className)}
      style={p.style}
    >
      <button type="button" aria-expanded={open} onClick={() => toggle()}>
        <span className="p-avatar">{(p.title ?? "Alex")[0]}</span>
        <span>
          <small>WORDS BY</small>
          <b>{p.title ?? "Alex Morgan"}</b>
        </span>
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
          {p.description ??
            "Writing about the small details that make everyday things worth noticing."}
        </p>
      )}
    </div>
  );
}
/** A mention composer that inserts a selected teammate. */
export function MentionInput(p: ProsProps) {
  const [value, set] = useModel(p, "");
  const [show, setShow] = useState(false);
  return (
    <div
      data-pros="MentionInput"
      className={cx("p-mention-input", p.className)}
      style={p.style}
    >
      <label>
        {p.title ?? "Bring someone into the conversation"}
        <textarea
          value={value}
          onChange={(e) => {
            set(e.target.value);
            setShow(e.target.value.endsWith("@"));
          }}
          placeholder="Type @ to mention someone…"
        />
      </label>
      {show && (
        <div className="p-menu p-enter">
          {(
            p.items ?? [{ label: "Alex" }, { label: "Sam" }, { label: "Jules" }]
          ).map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                set(value + s.label + " ");
                setShow(false);
              }}
            >
              {" "}
              <span className="p-avatar">{s.label[0]}</span>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
/** A contact card with an expandable availability note. */
export function ContactCard(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <div
      data-pros="ContactCard"
      className={cx("p-contact-card", p.className)}
      style={p.style}
    >
      <small>GOOD CONVERSATIONS START HERE.</small>
      <h3>{p.title ?? "Have something in mind?"}</h3>
      <ActionRow />
      <button
        type="button"
        className="p-text-btn"
        aria-expanded={open}
        onClick={() => toggle()}
      >
        A note on availability{" "}
        {open ? (
          <>
            <Icon name="minus" />
          </>
        ) : (
          <Icon name="plus" />
        )}
      </button>
      {open && (
        <p className="p-enter">
          {p.description ??
            "Open to thoughtful projects, interesting people, and unexpected collaborations."}
        </p>
      )}
    </div>
  );
  function ActionRow() {
    return (
      <button
        type="button"
        className="p-btn"
        onClick={() => p.onAction?.("contact")}
      >
        {p.label ?? "Let’s talk"} <Icon name="arrow" />
      </button>
    );
  }
}
/** A compact activity feed with a clear-all read state. */
export function ActivityFeed(p: ProsProps) {
  const [read, set] = useState(false);
  return (
    <div
      data-pros="ActivityFeed"
      className={cx("p-activity-feed", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <h3>{p.title ?? "In good motion."}</h3>
        <button
          type="button"
          className="p-text-btn"
          onClick={() => {
            set(true);
            p.onAction?.("read-all");
          }}
        >
          {read ? (
            <>
              Caught up <Icon name="check" />
            </>
          ) : (
            "Mark read"
          )}
        </button>
      </div>
      {(
        p.items ?? [
          { label: "Alex added a new study", description: "2 minutes ago" },
          { label: "Sam left a thought", description: "18 minutes ago" },
          { label: "Your collection was saved", description: "1 hour ago" },
        ]
      ).map((s, i) => (
        <div key={i} className={read ? "is-read" : ""}>
          <i />
          <span>
            <b>{s.label}</b>
            <small>{s.description}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
