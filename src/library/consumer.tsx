import {
  useId,
  useRef,
  useState,
  useLayoutEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  cx,
  useModel,
  useContentTransition,
  useSelectionIndicator,
  useMotionAllowed,
  type ProsProps,
} from "./core";
import { Icon } from "./icons";

/** Content for discovery, trending, and collection blocks. IDs must be unique. */
export type ConsumerStory = {
  id: string;
  title: string;
  category: string;
  creator: string;
  detail: string;
  image?: string;
  popularity?: number;
};
export type ConsumerContentProps = ProsProps & { stories?: ConsumerStory[] };
const stories: ConsumerStory[] = [
  {
    id: "slow",
    title: "Find your slower Sunday.",
    category: "Places",
    creator: "The Sunday Club",
    detail: "A guide to getting a little lost",
    popularity: 1280,
  },
  {
    id: "objects",
    title: "Objects with a story.",
    category: "Design",
    creator: "Form & Field",
    detail: "Everyday things, extraordinary details",
    popularity: 960,
  },
  {
    id: "table",
    title: "A seat at the table.",
    category: "Food",
    creator: "Common Ground",
    detail: "Good food. Even better company.",
    popularity: 1540,
  },
  {
    id: "coast",
    title: "Take the scenic route.",
    category: "Places",
    creator: "Outside Hours",
    detail: "Small escapes for curious people",
    popularity: 820,
  },
];

function Block({
  p,
  name,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  p: ProsProps;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const surface = useRef<HTMLElement>(null);
  const content = useRef<HTMLFieldSetElement>(null);
  const motion = useMotionAllowed();
  useLayoutEffect(() => {
    const element = surface.current,
      inner = content.current;
    if (!motion || !element || !inner) return;
    let previousHeight = element.offsetHeight;
    let previousWidth = element.offsetWidth;
    let animation: Animation | undefined;
    const observer = new ResizeObserver(() => {
      const styles = getComputedStyle(element);
      const nextHeight =
        inner.offsetHeight +
        parseFloat(styles.paddingTop) +
        parseFloat(styles.paddingBottom) +
        parseFloat(styles.borderTopWidth) +
        parseFloat(styles.borderBottomWidth);
      const nextWidth = element.offsetWidth;
      if (
        Math.abs(nextHeight - previousHeight) > 1 &&
        nextWidth === previousWidth &&
        !document.documentElement.dataset.themeChanging
      ) {
        const from =
          animation?.playState === "running"
            ? element.getBoundingClientRect().height
            : previousHeight;
        animation?.cancel();
        animation = element.animate(
          [
            { height: from + "px", overflow: "clip" },
            { height: nextHeight + "px", overflow: "clip" },
          ],
          { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" },
        );
      }
      previousHeight = nextHeight;
      previousWidth = nextWidth;
    });
    observer.observe(inner);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [motion]);
  return (
    <section
      ref={surface}
      data-pros={name}
      className={cx("p-app-block", className, p.className)}
      style={p.style}
      aria-labelledby={id}
    >
      <fieldset ref={content} disabled={p.disabled}>
        <header className="p-app-heading">
          <span className="p-app-eyebrow">
            <i />
            {eyebrow}
          </span>
          <h3 id={id}>{p.title ?? title}</h3>
          <p>{p.description ?? description}</p>
        </header>
        {children}
        {p.children}
      </fieldset>
    </section>
  );
}
function Art({
  variant = 0,
  image,
  className = "",
}: {
  variant?: number;
  image?: string;
  className?: string;
}) {
  return (
    <div
      className={cx("p-app-art", "p-app-art-" + (variant % 4), className)}
      aria-hidden="true"
    >
      {image ? (
        <img src={image} alt="" loading="lazy" />
      ) : (
        <>
          <i />
          <i />
          <i />
          <span className="p-app-art-grain" />
        </>
      )}
    </div>
  );
}
function Choices({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useSelectionIndicator(value);
  return (
    <div
      ref={ref}
      className="p-app-choices p-selection-track"
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="p-app-empty" role="status">
      {children}
    </p>
  );
}
function Status({ children }: { children: ReactNode }) {
  return (
    <div className="p-app-status" role="status" aria-live="polite">
      {children}
    </div>
  );
}
const money = (minorUnits: number, currency = "USD") => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });
  return formatter.format(
    minorUnits / 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2),
  );
};
const amount = (n: number) =>
  Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;

/** An editorial discovery surface with categories, a featured story, and saved state. */
export function DiscoveryHub(p: ConsumerContentProps) {
  const data = p.stories ?? stories;
  const categories = ["For you", ...new Set(data.map((s) => s.category))];
  const [category, setCategory] = useModel(p, "For you");
  const scene = useContentTransition(category);
  const [saved, setSaved] = useState<string[]>([]);
  const visible = data.filter(
    (s) => category === "For you" || s.category === category,
  );
  const hero = visible[0];
  const save = (id: string) => {
    const exists = saved.includes(id);
    setSaved(exists ? saved.filter((x) => x !== id) : [...saved, id]);
    p.onAction?.(`${exists ? "unsave" : "save"}:${id}`);
  };
  return (
    <Block
      p={p}
      name="DiscoveryHub"
      eyebrow="DISCOVER"
      title="Picked for your weekend."
      description="Explore places, design, and food from independent creators."
      className="p-discovery-hub"
    >
      <Choices
        options={categories}
        value={category}
        onChange={setCategory}
        label="Discovery categories"
      />
      {hero ? (
        <div ref={scene}>
          <div className="p-discovery-feature">
            <Art variant={data.indexOf(hero)} image={hero.image} />
            <div className="p-discovery-overlay">
              <span className="p-app-tag">
                THE WEEKEND EDIT / {hero.category}
              </span>
              <h4>{hero.title}</h4>
              <p>{hero.detail}</p>
              <button
                type="button"
                className="p-app-light-button"
                onClick={() => p.onAction?.("open:" + hero.id)}
              >
                Take a look <Icon name="arrow" />
              </button>
            </div>
            <button
              type="button"
              className="p-app-save"
              aria-label={
                (saved.includes(hero.id) ? "Unsave " : "Save ") + hero.title
              }
              aria-pressed={saved.includes(hero.id)}
              onClick={() => save(hero.id)}
            >
              <Icon name={saved.includes(hero.id) ? "check" : "plus"} />
            </button>
          </div>
          <div className="p-discovery-more">
            {visible.slice(1, 3).map((s, i) => (
              <button
                type="button"
                key={s.id}
                className="p-discovery-small"
                onClick={() => p.onAction?.("open:" + s.id)}
              >
                <Art variant={data.indexOf(s)} image={s.image} />
                <span>
                  <small>
                    {s.category} / 0{i + 2}
                  </small>
                  <b>{s.title}</b>
                  <small>{s.creator}</small>
                </span>
                <Icon name="right" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Empty>No discoveries in this category yet.</Empty>
      )}
      <footer className="p-app-footnote">
        <span>YOUR DISCOVERIES</span>
        <span role="status">
          {saved.length} saved <Icon name="heart" size={13} />
        </span>
      </footer>
    </Block>
  );
}

/** Ranked content with topic filtering, accessible selection, and individual saves. */
export function TrendingBoard(p: ConsumerContentProps) {
  const data = p.stories ?? stories;
  const [topic, setTopic] = useModel(p, "Everything");
  const scene = useContentTransition(topic);
  const [saved, setSaved] = useState<string[]>([]);
  const ranked = data
    .filter((s) => topic === "Everything" || s.category === topic)
    .slice()
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  return (
    <Block
      p={p}
      name="TrendingBoard"
      eyebrow="COMMUNITY"
      title="Trending this week."
      description="What people are finding, sharing, and coming back to."
    >
      <div className="p-trending-banner">
        <span className="p-trending-spark">
          <Icon name="motion" size={32} />
        </span>
        <div>
          <b>Most saved by the community</b>
          <p>Ranked by saves. Filter by topic.</p>
        </div>
        <span className="p-app-tag">TRENDING</span>
      </div>
      <Choices
        options={["Everything", ...new Set(data.map((s) => s.category))]}
        value={topic}
        onChange={setTopic}
        label="Trending topics"
      />
      <div className="p-trending-list" ref={scene}>
        {ranked.map((s, i) => (
          <div
            className="p-trending-row"
            key={s.id}
            style={{ "--app-index": i } as CSSProperties}
          >
            <span className="p-trending-rank">
              {String(i + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              className="p-trending-story"
              onClick={() => p.onAction?.("open:" + s.id)}
            >
              <Art variant={data.indexOf(s)} image={s.image} />
              <span>
                <b>{s.title}</b>
                <small>
                  {s.creator} · {s.category}
                </small>
              </span>
            </button>
            <div className="p-trending-score">
              <b>{(s.popularity ?? 0).toLocaleString("en-US")}</b>
              <small>saves</small>
            </div>
            <button
              type="button"
              className="p-app-icon"
              aria-label={
                (saved.includes(s.id) ? "Unsave " : "Save ") + s.title
              }
              aria-pressed={saved.includes(s.id)}
              onClick={() => {
                const exists = saved.includes(s.id);
                setSaved(
                  exists ? saved.filter((x) => x !== s.id) : [...saved, s.id],
                );
                p.onAction?.(`${exists ? "unsave" : "save"}:${s.id}`);
              }}
            >
              <Icon name={saved.includes(s.id) ? "check" : "plus"} />
            </button>
          </div>
        ))}
      </div>
      {!ranked.length && <Empty>No trending stories in this topic yet.</Empty>}
      <Status>
        {saved.length
          ? `${saved.length} ${saved.length === 1 ? "find" : "finds"} saved to your collection.`
          : "Save a story to add it to your collection."}
      </Status>
    </Block>
  );
}

/** A searchable saved collection with an animated edit mode and reversible removal. */
export function CollectionStudio(p: ConsumerContentProps) {
  const data = p.stories ?? stories;
  const [query, setQuery] = useState("");
  const [removed, setRemoved] = useState<string[]>([]);
  const [undo, setUndo] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const undoButton = useRef<HTMLButtonElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (undo) undoButton.current?.focus({ preventScroll: true });
  }, [undo]);
  const list = data.filter(
    (s) =>
      !removed.includes(s.id) &&
      `${s.title} ${s.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <Block
      p={p}
      name="CollectionStudio"
      eyebrow="SAVED"
      title="Your collection."
      description="Search your saved stories or edit your collection."
    >
      <div className="p-collection-toolbar">
        <label className="p-app-search">
          <Icon name="search" />
          <input
            aria-label="Search your collection"
            placeholder="Find something you saved"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="p-app-secondary"
          ref={editButton}
          aria-pressed={editing}
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      <div className="p-collection-grid" data-editing={editing}>
        {list.map((s, i) => (
          <article
            key={s.id}
            className="p-collection-card"
            style={{ "--app-index": i } as CSSProperties}
          >
            <button
              type="button"
              className="p-collection-open"
              onClick={() => p.onAction?.("open:" + s.id)}
            >
              <Art variant={data.indexOf(s)} image={s.image} />
              <span>
                <small>{s.category}</small>
                <b>{s.title}</b>
              </span>
            </button>
            {editing && (
              <button
                type="button"
                className="p-collection-remove"
                aria-label={"Remove " + s.title}
                onClick={() => {
                  setRemoved([...removed, s.id]);
                  setUndo(s.id);
                  p.onAction?.("remove:" + s.id);
                }}
              >
                <Icon name="minus" />
              </button>
            )}
          </article>
        ))}
      </div>
      {!list.length && (
        <Empty>
          {query
            ? "No matches. Try a different search."
            : "Room for your next discovery."}
        </Empty>
      )}
      <div className="p-app-inline-status">
        <Status>
          {undo
            ? "Removed from your collection."
            : `${data.filter((s) => !removed.includes(s.id)).length} saved stories.`}
        </Status>
        {undo && (
          <button
            type="button"
            className="p-app-text-button"
            ref={undoButton}
            onClick={() => {
              setRemoved(removed.filter((id) => id !== undo));
              p.onAction?.("restore:" + undo);
              setUndo(null);
              editButton.current?.focus({ preventScroll: true });
            }}
          >
            Undo <Icon name="refresh" size={14} />
          </button>
        )}
      </div>
    </Block>
  );
}

/** Currency amounts are integer minor units (cents for USD). */
export type ConsumerProduct = {
  id: string;
  name: string;
  detail: string;
  price: number;
  image?: string;
};
export type BagLine = ConsumerProduct & { quantity: number };
export type ShoppingBagProps = ProsProps & {
  products?: ConsumerProduct[];
  currency?: string;
  freeShippingAt?: number;
  shipping?: number;
  onCheckout?: (lines: BagLine[]) => void;
};
const products: ConsumerProduct[] = [
  {
    id: "carry",
    name: "The everyday carry",
    detail: "Natural canvas / one size",
    price: 4800,
  },
  {
    id: "journal",
    name: "A place for ideas",
    detail: "Moss / dotted pages",
    price: 2400,
  },
];
/** Quantity controls, computed totals, a shipping goal, and removal with undo. */
export function ShoppingBag(p: ShoppingBagProps) {
  const data = p.products ?? products;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [undo, setUndo] = useState<{ id: string; count: number } | null>(null);
  const undoButton = useRef<HTMLButtonElement>(null);
  const checkoutButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (undo) undoButton.current?.focus({ preventScroll: true });
  }, [undo]);
  const qty = (id: string) => counts[id] ?? 1;
  const lines = data
    .filter((x) => qty(x.id) > 0)
    .map((x) => ({ ...x, price: amount(x.price), quantity: qty(x.id) }));
  const subtotal = lines.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const threshold = amount(p.freeShippingAt ?? 10000);
  const shipping =
    !lines.length || subtotal >= threshold ? 0 : amount(p.shipping ?? 600);
  const format = (n: number) => money(n, p.currency);
  return (
    <Block
      p={p}
      name="ShoppingBag"
      eyebrow="CHOSEN BY YOU"
      title="Your shopping bag."
      description="Review items, adjust quantities, and check your total."
    >
      <div className="p-bag-goal">
        <div>
          <Icon name="commerce" />
          <span>
            {subtotal >= threshold
              ? "Your bag ships on us."
              : `${format(threshold - subtotal)} away from free shipping`}
          </span>
        </div>
        <progress
          aria-label="Free shipping progress"
          value={Math.min(subtotal, threshold)}
          max={Math.max(1, threshold)}
        />
      </div>
      <div className="p-bag-lines">
        {lines.map((x) => (
          <div className="p-bag-line" key={x.id}>
            <Art
              variant={data.findIndex((product) => product.id === x.id) + 1}
              image={x.image}
            />
            <div className="p-bag-product">
              <b>{x.name}</b>
              <small>{x.detail}</small>
              <div className="p-bag-stepper">
                <button
                  type="button"
                  aria-label={"Decrease " + x.name}
                  disabled={x.quantity <= 1}
                  onClick={() => {
                    setCounts({ ...counts, [x.id]: x.quantity - 1 });
                    p.onAction?.(`quantity:${x.id}:${x.quantity - 1}`);
                  }}
                >
                  <Icon name="minus" size={12} />
                </button>
                <output aria-label={x.name + " quantity"} key={x.quantity}>
                  {x.quantity}
                </output>
                <button
                  type="button"
                  aria-label={"Increase " + x.name}
                  disabled={x.quantity >= 99}
                  onClick={() => {
                    setCounts({ ...counts, [x.id]: x.quantity + 1 });
                    p.onAction?.(`quantity:${x.id}:${x.quantity + 1}`);
                  }}
                >
                  <Icon name="plus" size={12} />
                </button>
              </div>
            </div>
            <div className="p-bag-price">
              <b>{format(x.price * x.quantity)}</b>
              <button
                type="button"
                className="p-app-text-button"
                aria-label={"Remove " + x.name}
                onClick={() => {
                  setUndo({ id: x.id, count: x.quantity });
                  setCounts({ ...counts, [x.id]: 0 });
                  p.onAction?.("remove:" + x.id);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {!lines.length && (
        <Empty>Your bag is empty. Add an item to get started.</Empty>
      )}
      {undo && (
        <div className="p-app-inline-status p-app-scene">
          <Status>Item removed.</Status>
          <button
            type="button"
            className="p-app-text-button"
            ref={undoButton}
            onClick={() => {
              setCounts({ ...counts, [undo.id]: undo.count });
              p.onAction?.("restore:" + undo.id);
              setUndo(null);
              requestAnimationFrame(() =>
                checkoutButton.current?.focus({ preventScroll: true }),
              );
            }}
          >
            Undo <Icon name="refresh" size={14} />
          </button>
        </div>
      )}
      <div className="p-app-summary">
        <div>
          <span>Subtotal</span>
          <b>{format(subtotal)}</b>
        </div>
        <div>
          <span>Shipping</span>
          <b>{shipping ? format(shipping) : "Free"}</b>
        </div>
        <div className="p-app-total">
          <span>Total</span>
          <strong key={subtotal + shipping}>
            {format(subtotal + shipping)}
          </strong>
        </div>
      </div>
      <button
        type="button"
        className="p-app-primary"
        ref={checkoutButton}
        disabled={!lines.length}
        onClick={() => {
          p.onCheckout?.(lines);
          p.onAction?.("checkout");
        }}
      >
        Continue to checkout <Icon name="right" />
      </button>
      <p className="p-app-note">
        Taxes, if applicable, are calculated at checkout.
      </p>
    </Block>
  );
}

export type CheckoutRequest = {
  method: string;
  amount: number;
  currency: string;
};
export type CheckoutPanelProps = ProsProps & {
  amount?: number;
  currency?: string;
  methods?: { id: string; label: string; detail: string }[];
  /** Resolve only after confirmation by your payment integration; reject on failure. */
  onConfirm?: (request: CheckoutRequest) => Promise<void>;
};
/** Payment method selection and review. Without onConfirm it is explicitly a demo. */
export function CheckoutPanel(p: CheckoutPanelProps) {
  const methods =
    p.methods ??
    (p.onConfirm
      ? []
      : [
          { id: "card", label: "Saved card", detail: "Visa ending in 4242" },
          {
            id: "wallet",
            label: "Digital wallet",
            detail: "Continue with your wallet provider",
          },
        ]);
  const [method, setMethod] = useModel(p, methods[0]?.id ?? "");
  const [state, setState] = useState<
    "select" | "review" | "pending" | "complete"
  >("select");
  const [error, setError] = useState("");
  const pending = useRef(false);
  const total = amount(p.amount ?? 7800);
  const selected = methods.find((m) => m.id === method);
  const heading = useRef<HTMLDivElement>(null);
  useContentTransition(state === "pending" ? "review" : state, heading);
  const go = (next: typeof state) => {
    setState(next);
    setError("");
    requestAnimationFrame(() => heading.current?.focus());
  };
  const confirm = async () => {
    if (!selected || pending.current || p.disabled) return;
    pending.current = true;
    setState("pending");
    setError("");
    try {
      if (p.onConfirm)
        await p.onConfirm({
          method,
          amount: total,
          currency: p.currency ?? "USD",
        });
    } catch {
      setState("review");
      setError("We couldn't confirm this payment. Please try again.");
      return;
    } finally {
      pending.current = false;
    }
    go("complete");
    p.onAction?.(p.onConfirm ? "confirmed" : "preview-complete");
  };
  return (
    <Block
      p={p}
      name="CheckoutPanel"
      eyebrow={p.onConfirm ? "CHECKOUT" : "INTERACTIVE CHECKOUT PREVIEW"}
      title="Complete your order."
      description="A clear total. Your preferred way to pay."
    >
      <div className="p-checkout-steps" aria-label="Checkout progress">
        <span data-active={state === "select"}>01 / Payment</span>
        <i />
        <span data-active={state === "review" || state === "pending"}>
          02 / Review
        </span>
        <i />
        <span data-active={state === "complete"}>
          03 / {p.onConfirm ? "Confirmed" : "Preview"}
        </span>
      </div>
      <div
        ref={heading}
        tabIndex={-1}
        className="p-checkout-body"
        aria-busy={state === "pending"}
      >
        {state === "select" ? (
          <div className="p-app-scene">
            <div className="p-payment-card">
              <Icon name="commerce" size={28} />
              <span>ORDER TOTAL</span>
              <strong>{money(total, p.currency)}</strong>
              <small>
                {p.onConfirm ? "Order total" : "Demo order / no charge"}
              </small>
              <div className="p-payment-orbits" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div
              className="p-payment-methods"
              role="group"
              aria-label="Payment methods"
            >
              {methods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  aria-pressed={method === m.id}
                  onClick={() => setMethod(m.id)}
                >
                  <span className="p-payment-radio">
                    <Icon name="check" size={12} />
                  </span>
                  <span>
                    <b>{m.label}</b>
                    <small>{m.detail}</small>
                  </span>
                  <Icon name="right" />
                </button>
              ))}
            </div>
            {!methods.length && <Empty>No payment methods available.</Empty>}
            <button
              type="button"
              className="p-app-primary"
              disabled={!selected}
              onClick={() => go("review")}
            >
              Review {money(total, p.currency)} <Icon name="right" />
            </button>
          </div>
        ) : state === "complete" ? (
          <div className="p-checkout-complete p-app-scene">
            <span className="p-checkout-seal">
              <Icon name="check" size={32} />
            </span>
            <h4>
              {p.onConfirm ? "Confirmation received." : "Preview complete."}
            </h4>
            <p>
              {p.onConfirm
                ? "Your payment is confirmed. You're all set."
                : "You reached the confirmation step. No payment was taken."}
            </p>
            <strong>{money(total, p.currency)}</strong>
            {!p.onConfirm && (
              <button
                type="button"
                className="p-app-secondary"
                onClick={() => go("select")}
              >
                Try it again <Icon name="refresh" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-app-scene">
            <h4 className="p-app-subtitle">Everything look good?</h4>
            <div className="p-app-summary">
              <div>
                <span>Payment method</span>
                <b>{selected?.label ?? "Unavailable"}</b>
              </div>
              <div>
                <span>Details</span>
                <b>{selected?.detail ?? "Select another method"}</b>
              </div>
              <div className="p-app-total">
                <span>Total</span>
                <strong>{money(total, p.currency)}</strong>
              </div>
            </div>
            {error && (
              <p className="p-payment-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="p-app-primary"
              disabled={state === "pending" || !selected}
              onClick={() => void confirm()}
            >
              {state === "pending" ? (
                <>
                  <span className="p-app-spinner" />
                  Confirming…
                </>
              ) : (
                <>
                  {p.onConfirm ? "Confirm payment" : "Preview payment"}
                  <Icon name="right" />
                </>
              )}
            </button>
            <button
              type="button"
              className="p-app-text-button p-checkout-back"
              disabled={state === "pending"}
              onClick={() => go("select")}
            >
              Back to payment methods
            </button>
          </div>
        )}
      </div>
      <p className="p-app-note">
        {p.onConfirm
          ? "Review your total before confirming."
          : "Demo only. No card details collected. No payment taken."}
      </p>
    </Block>
  );
}

export type MembershipPlan = {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
};
export type MembershipStudioProps = ProsProps & {
  plans?: MembershipPlan[];
  currency?: string;
  onSelectPlan?: (id: string, billing: "Monthly" | "Yearly") => void;
};
const plans: MembershipPlan[] = [
  {
    id: "everyday",
    name: "Everyday",
    monthly: 800,
    yearly: 7200,
    description: "For your daily dose of good.",
    features: [
      "Unlimited collections",
      "Personal discovery feed",
      "Save for offline reading",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthly: 1400,
    yearly: 12000,
    description: "More room for the things you love.",
    features: [
      "Everything in Everyday",
      "Early access to new releases",
      "Member-only experiences",
    ],
  },
];
function MembershipPrice({
  plan,
  billing,
  currency,
}: {
  plan: MembershipPlan;
  billing: "Monthly" | "Yearly";
  currency?: string;
}) {
  const panel = useContentTransition<HTMLSpanElement>(billing);
  return (
    <span ref={panel} className="p-membership-price">
      <strong>
        {money(
          billing === "Monthly" ? amount(plan.monthly) : amount(plan.yearly),
          currency,
        )}
      </strong>
      <small>/ {billing === "Monthly" ? "month" : "year"}</small>
    </span>
  );
}

/** Real monthly/yearly price comparison and explicit plan-selection callbacks. */
export function MembershipStudio(p: MembershipStudioProps) {
  const data = p.plans ?? plans;
  const [billing, setBilling] = useState<"Monthly" | "Yearly">("Yearly");
  const [selected, setSelected] = useModel(p, data[1]?.id ?? data[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const plan = data.find((x) => x.id === selected);
  return (
    <Block
      p={p}
      name="MembershipStudio"
      eyebrow="MEMBERSHIP"
      title="Choose your membership."
      description="Compare plans and choose monthly or annual billing."
    >
      <Choices
        options={["Monthly", "Yearly"]}
        value={billing}
        onChange={(v) => {
          setBilling(v as typeof billing);
          setNotice("");
        }}
        label="Membership billing"
      />
      <div className="p-membership-plans">
        {data.map((x) => {
          const saving = Math.max(0, amount(x.monthly) * 12 - amount(x.yearly));
          return (
            <button
              type="button"
              className="p-membership-plan"
              key={x.id}
              aria-pressed={selected === x.id}
              onClick={() => {
                setSelected(x.id);
                setNotice("");
              }}
            >
              <span className="p-membership-name">
                <b>{x.name}</b>
                <span className="p-payment-radio">
                  <Icon name="check" size={12} />
                </span>
              </span>
              <MembershipPrice
                plan={x}
                billing={billing}
                currency={p.currency}
              />
              <span className="p-membership-description">{x.description}</span>
              <span className="p-membership-saving">
                {billing === "Yearly" && saving > 0
                  ? `Save ${money(saving, p.currency)} a year`
                  : "Your membership, your pace"}
              </span>
              <span className="p-membership-features">
                {x.features.map((f) => (
                  <span key={f}>
                    <Icon name="check" size={13} />
                    {f}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      {!data.length && <Empty>No memberships available yet.</Empty>}
      <button
        type="button"
        className="p-app-primary"
        disabled={!plan}
        onClick={() => {
          if (!plan) return;
          p.onSelectPlan?.(plan.id, billing);
          p.onAction?.(`subscribe:${plan.id}:${billing.toLowerCase()}`);
          setNotice(`${plan.name} selected. You're ready for the next step.`);
        }}
      >
        Continue with {plan?.name ?? "a plan"}
        <Icon name="right" />
      </button>
      <Status>
        {notice ||
          (billing === "Yearly"
            ? "Annual plans are billed once per year."
            : "Billed monthly. Clear pricing, always.")}
      </Status>
    </Block>
  );
}

export type OrderMilestone = { label: string; detail: string; time: string };
export type OrderJourneyProps = ProsProps & {
  milestones?: OrderMilestone[];
  currentStep?: number;
  orderNumber?: string;
  arrival?: string;
};
const milestones: OrderMilestone[] = [
  {
    label: "Confirmed",
    detail: "Your order is in. We're getting your good things ready.",
    time: "Monday, 9:41 AM",
  },
  {
    label: "Packed with care",
    detail: "Checked, wrapped, and ready for its next chapter.",
    time: "Monday, 2:30 PM",
  },
  {
    label: "On its way",
    detail: "Your parcel has left our studio and is heading your way.",
    time: "Tuesday, 8:15 AM",
  },
  {
    label: "At your door",
    detail: "The best part is almost here. We'll update you when it arrives.",
    time: "Expected Thursday",
  },
];
/** Inspect milestones without changing the actual fulfillment status. */
export function OrderJourney(p: OrderJourneyProps) {
  const data = p.milestones ?? milestones;
  const current = Math.min(
    Math.max(0, Math.floor(amount(p.currentStep ?? 2))),
    Math.max(0, data.length - 1),
  );
  const [view, setView] = useState<number | null>(null);
  const active = Math.min(view ?? current, Math.max(0, data.length - 1));
  const scene = useContentTransition(active);
  return (
    <Block
      p={p}
      name="OrderJourney"
      eyebrow={"ORDER / " + (p.orderNumber ?? "PS-2048")}
      title="Track your delivery."
      description="View the latest status and delivery milestones."
    >
      <div className="p-order-hero">
        <div>
          <span className="p-app-eyebrow">
            {current === data.length - 1
              ? "LATEST UPDATE"
              : "ESTIMATED ARRIVAL"}
          </span>
          <strong>{p.arrival ?? "Thursday, 24 October"}</strong>
          <span className="p-app-tag">
            <i />
            {data[current]?.label ?? "Awaiting updates"}
          </span>
        </div>
        <div className="p-order-parcel" aria-hidden="true">
          <span />
          <i />
          <b>p.</b>
        </div>
      </div>
      <div
        className="p-order-timeline"
        role="group"
        aria-label="Order milestones"
      >
        {data.map((step, i) => (
          <button
            type="button"
            key={i}
            data-complete={i <= current}
            aria-pressed={active === i}
            aria-current={i === current ? "step" : undefined}
            onClick={() => {
              setView(i);
              p.onAction?.("milestone:" + i);
            }}
          >
            <span className="p-order-node">
              {i < current ? <Icon name="check" size={12} /> : i + 1}
            </span>
            <span>{step.label}</span>
            <small>
              {i > current
                ? "Upcoming"
                : i === current
                  ? "Current"
                  : "Complete"}
            </small>
          </button>
        ))}
      </div>
      {data[active] ? (
        <div className="p-order-detail" ref={scene}>
          <small>{data[active].time}</small>
          <h4>{data[active].label}</h4>
          <p>{data[active].detail}</p>
        </div>
      ) : (
        <Empty>Tracking updates will appear here.</Empty>
      )}
      <button
        type="button"
        className="p-app-secondary p-app-full"
        onClick={() => p.onAction?.("support:" + (p.orderNumber ?? "PS-2048"))}
      >
        Need a hand with your order?
        <Icon name="right" />
      </button>
    </Block>
  );
}

export type ConsumerReward = {
  id: string;
  title: string;
  detail: string;
  points: number;
};
export type RewardsWalletProps = ProsProps & {
  points?: number;
  rewards?: ConsumerReward[];
  onSelectReward?: (reward: ConsumerReward) => void;
};
/** A points wallet with affordable reward selection and a review step. */
export function RewardsWallet(p: RewardsWalletProps) {
  const points = amount(p.points ?? 1240);
  const data = p.rewards ?? [
    {
      id: "shipping",
      title: "Delivery, on us",
      detail: "Free shipping on your next order",
      points: 500,
    },
    {
      id: "credit",
      title: "A little thank you",
      detail: "$10 off your next order",
      points: 1000,
    },
    {
      id: "edition",
      title: "Something special",
      detail: "Unlock a members-only edition",
      points: 2000,
    },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const reward = data.find((r) => r.id === selected);
  return (
    <Block
      p={p}
      name="RewardsWallet"
      eyebrow="MEMBER REWARDS"
      title="Your rewards."
      description="Use your points toward shipping, discounts, and member rewards."
    >
      <div className="p-rewards-balance">
        <div>
          <span>YOUR POINTS</span>
          <strong key={points}>
            {points.toLocaleString("en-US")}
            <small>pts</small>
          </strong>
          <p>Available to redeem.</p>
        </div>
        <div className="p-rewards-medal" aria-hidden="true">
          <Icon name="flower" size={54} />
          <span>GOOD / CLUB</span>
        </div>
      </div>
      <div
        className="p-rewards-list"
        role="group"
        aria-label="Available rewards"
      >
        {data.map((r, i) => (
          <button
            type="button"
            key={r.id}
            className="p-reward"
            aria-pressed={selected === r.id}
            disabled={points < amount(r.points)}
            onClick={() => {
              setSelected(r.id);
              setNotice("");
            }}
          >
            <span className="p-reward-stamp">0{i + 1}</span>
            <span>
              <b>{r.title}</b>
              <small>{r.detail}</small>
            </span>
            <span className="p-reward-cost">
              <b>{amount(r.points).toLocaleString("en-US")}</b>
              <small>
                {points < amount(r.points)
                  ? `${amount(r.points) - points} to go`
                  : "points"}
              </small>
            </span>
          </button>
        ))}
      </div>
      {!data.length && <Empty>New rewards are on their way.</Empty>}
      {reward && points >= amount(reward.points) && (
        <div className="p-reward-review p-app-scene">
          <div>
            <b>{reward.title}</b>
            <p>
              {(points - amount(reward.points)).toLocaleString("en-US")} points
              remaining after redemption
            </p>
          </div>
          <button
            type="button"
            className="p-app-primary"
            onClick={() => {
              p.onSelectReward?.(reward);
              p.onAction?.("redeem:" + reward.id);
              setNotice(`Ready to redeem: ${reward.title}.`);
            }}
          >
            Choose reward
            <Icon name="right" />
          </button>
        </div>
      )}
      <Status>
        {notice || "Select a reward to see the details before you redeem."}
      </Status>
    </Block>
  );
}
