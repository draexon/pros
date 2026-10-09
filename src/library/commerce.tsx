import { Icon } from "./icons";
import { useId, useState } from "react";
import {
  type ProsProps,
  cx,
  Mark,
  Action,
  Arrow,
  useModel,
  useToggle,
} from "./core";
/** A product tile with a selectable finish and add-to-cart action. */
export function ProductCard(p: ProsProps) {
  const [finish, set] = useModel(p, "Chalk");
  return (
    <article
      data-pros="ProductCard"
      className={cx("p-product-card", p.className)}
      style={p.style}
    >
      <div className="p-product-art">
        <Mark variant={4} />
        <small>EDITION / 001</small>
      </div>
      <div className="p-between">
        <h3>{p.title ?? "The everyday object"}</h3>
        <b>{p.description ?? "$48"}</b>
      </div>
      <div className="p-between">
        <div className="p-swatches">
          {["Chalk", "Ink", "Stone"].map((s, i) => (
            <button
              type="button"
              key={s}
              style={{ background: ["#e8e6df", "#161616", "#aaa9a4"][i] }}
              aria-label={s}
              aria-pressed={finish === s}
              onClick={() => set(s)}
            />
          ))}
        </div>
        <button
          type="button"
          className="p-action"
          onClick={() => p.onAction?.("add:" + finish)}
        >
          Add to bag +
        </button>
      </div>
    </article>
  );
}
/** A pricing plan with a monthly/annual billing switch. */
export function PricingCard(p: ProsProps) {
  const [annual, toggle] = useToggle(p, true);
  return (
    <article
      data-pros="PricingCard"
      className={cx("p-pricing-card", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <span className="p-pill">FOR THE INDEPENDENT</span>
        <span>
          <Icon name="arrow" />
        </span>
      </div>
      <h3>{p.title ?? "A little more room."}</h3>
      <div className="p-price">
        <b>${annual ? (p.min ?? 18) : (p.max ?? 24)}</b>
        <small>/ month</small>
      </div>
      <button
        type="button"
        className="p-text-btn"
        aria-pressed={annual}
        onClick={() => toggle()}
      >
        {annual
          ? "Billed annually · switch to monthly"
          : "Billed monthly · switch to annually"}
      </button>
      <ul>
        {(
          p.items ?? [
            { label: "Unlimited projects" },
            { label: "Your own space" },
            { label: "Room to collaborate" },
          ]
        ).map((x, i) => (
          <li key={i}>
            <Icon name="check" /> {x.label}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="p-btn"
        onClick={() =>
          p.onAction?.(annual ? "subscribe:annual" : "subscribe:monthly")
        }
      >
        {p.label ?? "Find your space"} <Arrow />
      </button>
    </article>
  );
}
/** A cart line item with bounded quantity and recalculated subtotal. */
export function CartItem(p: ProsProps) {
  const [value, set] = useModel(p, "1");
  const quantity = Math.max(1, Number(value) || 1),
    price = p.min ?? 48;
  return (
    <div
      data-pros="CartItem"
      className={cx("p-cart-item", p.className)}
      style={p.style}
    >
      <div>
        <Mark variant={4} />
      </div>
      <section>
        <h3>{p.title ?? "Everyday object"}</h3>
        <small>{p.description ?? "Chalk / Edition 01"}</small>
        <div className="p-between">
          <span className="p-mini-stepper">
            <button
              type="button"
              aria-label="Remove one"
              disabled={quantity <= 1}
              onClick={() => set(String(quantity - 1))}
            >
              <Icon name="minus" />
            </button>
            <b aria-live="polite">{quantity}</b>
            <button
              type="button"
              aria-label="Add one"
              disabled={quantity >= 99}
              onClick={() => set(String(quantity + 1))}
            >
              <Icon name="plus" />
            </button>
          </span>
          <b>${(quantity * price).toFixed(2)}</b>
        </div>
      </section>
    </div>
  );
}
/** An order summary with a computed total and checkout callback. */
export function OrderSummary(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Objects", value: "96" },
    { label: "Shipping", value: "8" },
    { label: "Studio discount", value: "-12" },
  ];
  const total = rows.reduce((n, x) => n + (Number(x.value) || 0), 0);
  return (
    <section
      data-pros="OrderSummary"
      className={cx("p-order-summary", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "Good choices."}</h3>
      <dl>
        {rows.map((x, i) => (
          <div key={i}>
            <dt>{x.label}</dt>
            <dd>${Number(x.value).toFixed(2)}</dd>
          </div>
        ))}
        <div className="p-order-total">
          <dt>Total</dt>
          <dd>${total.toFixed(2)}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="p-btn"
        disabled={p.disabled}
        onClick={() => p.onAction?.("checkout")}
      >
        Continue to checkout <Arrow />
      </button>
      <small>{p.description ?? "The next step is a secure checkout."}</small>
    </section>
  );
}
/** A coupon field that validates against caller-supplied codes. */
export function CouponInput(p: ProsProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      data-pros="CouponInput"
      className={cx("p-coupon-input", p.className)}
      style={p.style}
      onSubmit={(e) => {
        e.preventDefault();
        const match = (p.items ?? [{ label: "PROS10", value: "10%" }]).find(
          (x) => x.label.toLowerCase() === code.trim().toLowerCase(),
        );
        setMessage(
          match
            ? "Applied: " + match.value + " off"
            : "That code was not found. Try again.",
        );
        if (match) p.onAction?.(match.label);
      }}
    >
      <label>
        {p.label ?? "A little something extra"}
        <span>
          <input
            placeholder="Enter a code"
            disabled={p.disabled}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" className="p-btn" disabled={p.disabled}>
            Apply <Icon name="arrow" />
          </button>
        </span>
      </label>
      <small role="status">
        {message || p.description || "Demo code: PROS10"}
      </small>
    </form>
  );
}
/** A receipt-style transaction record with a print callback. */
export function ReceiptCard(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Studio notebook", value: "24" },
    { label: "Edition print", value: "36" },
  ];
  return (
    <article
      data-pros="ReceiptCard"
      className={cx("p-receipt-card", p.className)}
      style={p.style}
    >
      <b className="p-receipt-brand">pros.</b>
      <small>{p.title ?? "A RECORD OF GOOD TASTE"}</small>
      <dl>
        {rows.map((x, i) => (
          <div key={i}>
            <dt>{x.label}</dt>
            <dd>${x.value}</dd>
          </div>
        ))}
        <div>
          <dt>TOTAL</dt>
          <dd>
            ${rows.reduce((n, x) => n + (Number(x.value) || 0), 0).toFixed(2)}
          </dd>
        </div>
      </dl>
      <div className="p-barcode" aria-hidden="true" />
      <button
        type="button"
        className="p-text-btn"
        onClick={() => p.onAction?.("print")}
      >
        Keep this receipt <Icon name="down" />
      </button>
    </article>
  );
}
/** A three-stage delivery status with an expandable shipment note. */
export function ShippingTracker(p: ProsProps) {
  const [details, set] = useState(false);
  const current = Math.max(0, Math.min(2, Number(p.value ?? 1)));
  return (
    <div
      data-pros="ShippingTracker"
      className={cx("p-shipping-tracker", p.className)}
      style={p.style}
    >
      <small>ON ITS WAY TO YOU</small>
      <h3>{p.title ?? "Good things travel."}</h3>
      <div>
        {["Packed", "On the move", "At your door"].map((s, i) => (
          <span key={s} className={i <= current ? "is-active" : ""}>
            <b>
              {i < current ? (
                <>
                  <Icon name="check" />
                </>
              ) : (
                i + 1
              )}
            </b>
            <small>{s}</small>
          </span>
        ))}
      </div>
      <button
        type="button"
        className="p-action"
        aria-expanded={details}
        onClick={() => set(!details)}
      >
        Shipment details{" "}
        {details ? (
          <>
            <Icon name="minus" />
          </>
        ) : (
          <Icon name="plus" />
        )}
      </button>
      {details && (
        <p className="p-enter">
          {p.description ??
            "Tracking updates are supplied by your shipping provider."}
        </p>
      )}
    </div>
  );
}
/** A product size selector that exposes a simple fit guide. */
export function SizeSelector(p: ProsProps) {
  const [value, set] = useModel(p, "M");
  const [guide, show] = useState(false);
  return (
    <div
      data-pros="SizeSelector"
      className={cx("p-size-selector", p.className)}
      style={p.style}
    >
      <div className="p-between">
        <b>{p.title ?? "Find your fit."}</b>
        <button
          type="button"
          className="p-text-btn"
          aria-expanded={guide}
          onClick={() => show(!guide)}
        >
          Size guide <Icon name="arrow" />
        </button>
      </div>
      <div role="group" aria-label={p.label ?? "Size"}>
        {(
          p.items ?? ["XS", "S", "M", "L", "XL"].map((label) => ({ label }))
        ).map((x, i) => (
          <button
            type="button"
            key={i}
            disabled={p.disabled}
            aria-pressed={value === x.label}
            onClick={() => set(x.label)}
          >
            {x.label}
          </button>
        ))}
      </div>
      {guide && (
        <p className="p-enter">
          {p.description ??
            "XS 80–84 · S 85–89 · M 90–94 · L 95–99 · XL 100–104 cm chest"}
        </p>
      )}
    </div>
  );
}
/** A textured finish selector with a large material preview. */
export function MaterialSelector(p: ProsProps) {
  const [value, set] = useModel(p, "0");
  const list = p.items ?? [
    { label: "Raw paper" },
    { label: "Soft stone" },
    { label: "Brushed ink" },
  ];
  return (
    <div
      data-pros="MaterialSelector"
      className={cx("p-material-selector", p.className)}
      style={p.style}
    >
      <div className={"p-material-surface p-material-" + value}>
        <span>{list[Number(value)]?.label}</span>
      </div>
      <div>
        {list.map((x, i) => (
          <button
            type="button"
            key={i}
            aria-pressed={value === String(i)}
            onClick={() => set(String(i))}
          >
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );
}
/** A gift card that reveals a personal message. */
export function GiftCard(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <button
      data-pros="GiftCard"
      type="button"
      className={cx("p-gift-card", p.className, open && "is-open")}
      style={p.style}
      aria-expanded={open}
      onClick={() => toggle()}
    >
      <small>
        {open ? "A NOTE FOR YOU" : "SOMETHING GOOD, FOR SOMEONE GOOD."}
      </small>
      <b>
        {open
          ? (p.description ?? "For your next good idea. With love.")
          : (p.title ?? "$100")}
      </b>
      <span>
        {open ? (
          <>
            Close your note <Icon name="minus" />
          </>
        ) : (
          "Open your note +"
        )}
      </span>
      <i aria-hidden="true" />
    </button>
  );
}
/** A membership pass with an expanding benefits panel. */
export function MembershipCard(p: ProsProps) {
  const [open, toggle] = useToggle(p);
  return (
    <article
      data-pros="MembershipCard"
      className={cx("p-membership-card", p.className)}
      style={p.style}
    >
      <small>THE INNER CIRCLE</small>
      <div className="p-between">
        <h3>{p.title ?? "Studio member."}</h3>
        <span>
          <Icon name="flower" />
        </span>
      </div>
      <div className="p-between">
        <small>MEMBER № {p.value ?? "00128"}</small>
        <button
          type="button"
          className="p-text-btn"
          aria-expanded={open}
          onClick={() => toggle()}
        >
          Benefits{" "}
          {open ? (
            <>
              <Icon name="minus" />
            </>
          ) : (
            <Icon name="plus" />
          )}
        </button>
      </div>
      {open && (
        <p className="p-enter">
          {p.description ??
            "Early access · Private editions · A little more possibility"}
        </p>
      )}
    </article>
  );
}
/** A spending limit meter with a manage-budget action. */
export function BudgetCard(p: ProsProps) {
  const spent = Number(p.value ?? 640),
    limit = p.max ?? 1000;
  return (
    <div
      data-pros="BudgetCard"
      className={cx("p-budget-card", p.className)}
      style={p.style}
    >
      <small>{p.title ?? "ROOM TO EXPLORE"}</small>
      <div className="p-between">
        <b className="p-number">${Math.max(0, limit - spent)}</b>
        <span>left</span>
      </div>
      <progress aria-label="Budget used" max={limit} value={spent} />
      <p>
        ${spent} of ${limit} used
      </p>
      <Action p={p} action="manage">
        Manage budget
      </Action>
    </div>
  );
}
/** A configurable bundle picker with a computed combined price. */
export function BundleBuilder(p: ProsProps) {
  const rows = p.items ?? [
    { label: "Notebook", value: "24" },
    { label: "Print", value: "36" },
    { label: "Tote", value: "18" },
  ];
  const [selected, set] = useState<string[]>([rows[0]?.label ?? ""]);
  const total = rows
    .filter((x) => selected.includes(x.label))
    .reduce((n, x) => n + (Number(x.value) || 0), 0);
  return (
    <div
      data-pros="BundleBuilder"
      className={cx("p-bundle-builder", p.className)}
      style={p.style}
    >
      <h3>{p.title ?? "Better as a set."}</h3>
      {rows.map((x, i) => (
        <label key={i}>
          <input
            type="checkbox"
            checked={selected.includes(x.label)}
            onChange={() =>
              set(
                selected.includes(x.label)
                  ? selected.filter((s) => s !== x.label)
                  : [...selected, x.label],
              )
            }
          />
          <b>{x.label}</b>
          <span>${x.value}</span>
        </label>
      ))}
      <button
        type="button"
        className="p-btn"
        disabled={!selected.length || p.disabled}
        onClick={() => p.onAction?.("bundle:" + selected.join(","))}
      >
        Add bundle · ${total}
      </button>
    </div>
  );
}
/** A review summary with a distribution and real rating selection. */
export function ReviewSummary(p: ProsProps) {
  const [value, set] = useModel(p, "5");
  return (
    <div
      data-pros="ReviewSummary"
      className={cx("p-review-summary", p.className)}
      style={p.style}
    >
      <div>
        <b className="p-number">{p.title ?? "4.9"}</b>
        <small>{p.description ?? "From 128 good people"}</small>
      </div>
      <div>
        {[5, 4, 3, 2, 1].map((n, i) => (
          <button
            type="button"
            key={n}
            aria-pressed={value === String(n)}
            onClick={() => set(String(n))}
          >
            <span>
              {n} <Icon name="star" />
            </span>
            <i>
              <b style={{ width: [86, 10, 3, 1, 0][i] + "%" }} />
            </i>
          </button>
        ))}
      </div>
      <small aria-live="polite">Showing {value}-star reviews</small>
    </div>
  );
}
/** A restock signup form with email validation and host submission. */
export function RestockNotice(p: ProsProps) {
  const id = useId();
  const [email, set] = useState("");
  return (
    <form
      data-pros="RestockNotice"
      className={cx("p-restock-notice", p.className)}
      style={p.style}
      onSubmit={(e) => {
        e.preventDefault();
        p.onAction?.(email);
      }}
    >
      <span>
        <Icon name="refresh" />
      </span>
      <h3>{p.title ?? "Worth the wait."}</h3>
      <p>
        {p.description ?? "Leave your email to request a restock notification."}
      </p>
      <label className="p-sr" htmlFor={id}>
        Email address
      </label>
      <input
        id={id}
        type="email"
        required
        placeholder="you@somewhere.com"
        value={email}
        onChange={(e) => set(e.target.value)}
      />
      <button type="submit" className="p-btn" disabled={p.disabled}>
        Keep me posted <Arrow />
      </button>
    </form>
  );
}
