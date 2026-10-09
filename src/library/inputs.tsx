import { Icon } from "./icons";
import { useId, useRef, useState } from "react";
import {
  type ProsProps,
  cx,
  FieldLabel,
  useModel,
  useToggle,
  itemsOf,
  itemValue,
} from "./core";
/** A floating-label text input on a filled, borderless surface. */
export function FloatingInput(p: ProsProps) {
  const [value, set] = useModel(p, "");
  const id = useId();
  return (
    <div
      data-pros="FloatingInput"
      className={cx("p-floating-input", p.className)}
      style={p.style}
    >
      <input
        id={id}
        name={p.name}
        required={p.required}
        disabled={p.disabled}
        placeholder=" "
        value={value}
        onChange={(e) => set(e.target.value)}
      />
      <label htmlFor={id}>{p.label ?? p.title ?? "Your name"}</label>
    </div>
  );
}
/** A command-like search field with clear and submit controls. */
export function SearchInput(p: ProsProps) {
  const [value, set] = useModel(p, "");
  return (
    <form
      data-pros="SearchInput"
      className={cx("p-search-input", p.className)}
      style={p.style}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        p.onAction?.(value);
      }}
    >
      <span aria-hidden="true">
        <Icon name="search" />
      </span>
      <input
        aria-label={p.label ?? "Search"}
        name={p.name}
        disabled={p.disabled}
        placeholder={p.title ?? "Find something good…"}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => set("")}>
          <Icon name="close" />
        </button>
      ) : (
        <kbd>↵</kbd>
      )}
    </form>
  );
}
/** A password input with a working visibility control and strength indicator. */
export function PasswordInput(p: ProsProps) {
  const [value, set] = useModel(p, "");
  const [show, toggle] = useState(false);
  const strength = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ].filter(Boolean).length;
  return (
    <FieldLabel
      data-pros="PasswordInput"
      p={{ ...p, label: p.label ?? "Password" }}
    >
      {(id) => (
        <>
          <div className="p-input-group">
            <input
              id={id}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required={p.required}
              disabled={p.disabled}
              name={p.name}
              value={value}
              onChange={(e) => set(e.target.value)}
            />
            <button
              type="button"
              disabled={p.disabled}
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => toggle(!show)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <div
            className="p-strength"
            aria-label={"Password strength " + strength + " of 4"}
          >
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={strength >= n ? "is-active" : ""} />
            ))}
          </div>
        </>
      )}
    </FieldLabel>
  );
}
/** A four-digit verification input that supports paste and arrow navigation. */
export function OtpInput(p: ProsProps) {
  const [value, set] = useModel(p, "");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <fieldset
      data-pros="OtpInput"
      className={cx("p-otp", p.className)}
      style={p.style}
      disabled={p.disabled}
    >
      <legend>{p.label ?? p.title ?? "Enter your code"}</legend>
      <div>
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-label={"Digit " + (i + 1)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            value={value[i]?.trim() ?? ""}
            maxLength={1}
            onPaste={(e) => {
              e.preventDefault();
              const v = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 4);
              set(v);
              refs.current[Math.min(v.length, 3)]?.focus();
            }}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              const next = value.padEnd(4, " ").split("");
              next[i] = v || " ";
              set(next.join("").trimEnd());
              if (v) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !value[i]?.trim())
                refs.current[i - 1]?.focus();
              if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
              if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
/** A switch with a traveling thumb and clear on/off labeling. */
export function ToggleInput(p: ProsProps) {
  const [on, toggle] = useToggle(p);
  return (
    <label
      data-pros="ToggleInput"
      className={cx("p-toggle-input", p.className)}
      style={p.style}
    >
      <span>
        <b>{p.label ?? p.title ?? "Keep me in the loop"}</b>
        <small>{p.description ?? "Only the good updates."}</small>
      </span>
      <input
        name={p.name}
        type="checkbox"
        role="switch"
        checked={on}
        disabled={p.disabled}
        onChange={() => toggle()}
      />
      <i aria-hidden="true" />
    </label>
  );
}
/** An oversized checkbox tile that fills on selection. */
export function CheckboxTile(p: ProsProps) {
  const [on, toggle] = useToggle(p);
  return (
    <label
      data-pros="CheckboxTile"
      className={cx("p-checkbox-tile", p.className, on && "is-active")}
      style={p.style}
    >
      <input
        name={p.name}
        type="checkbox"
        checked={on}
        disabled={p.disabled}
        onChange={() => toggle()}
      />
      <span className="p-tile-check" aria-hidden="true">
        {on ? (
          <>
            <Icon name="check" />
          </>
        ) : (
          <Icon name="plus" />
        )}
      </span>
      <b>{p.label ?? p.title ?? "A little more experimental"}</b>
      <small>{p.description ?? "Leave room for the unexpected."}</small>
    </label>
  );
}
/** A card-style radio group with a moving selection indicator. */
export function RadioCards(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, itemValue(list[0] ?? { label: "" }));
  const group = useId();
  return (
    <fieldset
      data-pros="RadioCards"
      className={cx("p-radio-cards", p.className)}
      style={p.style}
      disabled={p.disabled}
    >
      <legend>{p.label ?? p.title ?? "Choose your direction"}</legend>
      {list.map((item, i) => (
        <label key={i} className={value === itemValue(item) ? "is-active" : ""}>
          <input
            type="radio"
            name={p.name ?? group}
            value={itemValue(item)}
            checked={value === itemValue(item)}
            onChange={() => set(itemValue(item))}
          />
          <b>{item.label}</b>
          <small>{item.description}</small>
        </label>
      ))}
    </fieldset>
  );
}
/** A continuous range input with a live numeric readout. */
export function RangeInput(p: ProsProps) {
  const [value, set] = useModel(p, "64");
  return (
    <FieldLabel
      data-pros="RangeInput"
      p={{ ...p, label: p.label ?? "Intensity" }}
      className="p-range-input"
    >
      {(id) => (
        <>
          <div className="p-between">
            <strong className="p-number">
              {value}
              <span>%</span>
            </strong>
            <small>FIND YOUR BALANCE</small>
          </div>
          <input
            id={id}
            name={p.name}
            type="range"
            min={p.min ?? 0}
            max={p.max ?? 100}
            step={p.step ?? 1}
            value={value}
            disabled={p.disabled}
            onChange={(e) => set(e.target.value)}
          />
        </>
      )}
    </FieldLabel>
  );
}
/** A constrained number stepper with spring-like button feedback. */
export function NumberStepper(p: ProsProps) {
  const [value, set] = useModel(p, "1");
  const min = p.min ?? 0,
    max = p.max ?? 99;
  const change = (n: number) => set(String(Math.max(min, Math.min(max, n))));
  return (
    <FieldLabel
      data-pros="NumberStepper"
      p={{ ...p, label: p.label ?? "Quantity" }}
    >
      {(id) => (
        <div className="p-number-stepper">
          <button
            type="button"
            disabled={p.disabled || Number(value) <= min}
            aria-label="Decrease quantity"
            onClick={() => change(Number(value) - (p.step ?? 1))}
          >
            <Icon name="minus" />
          </button>
          <input
            id={id}
            type="number"
            name={p.name}
            min={min}
            max={max}
            step={p.step ?? 1}
            disabled={p.disabled}
            value={value}
            onChange={(e) => {
              if (e.target.value !== "") change(Number(e.target.value));
            }}
          />
          <button
            type="button"
            disabled={p.disabled || Number(value) >= max}
            aria-label="Increase quantity"
            onClick={() => change(Number(value) + (p.step ?? 1))}
          >
            <Icon name="plus" />
          </button>
        </div>
      )}
    </FieldLabel>
  );
}
/** A native select framed as an editorial answer field. */
export function SelectInput(p: ProsProps) {
  const list = itemsOf(p);
  const [value, set] = useModel(p, itemValue(list[0] ?? { label: "" }));
  return (
    <FieldLabel
      data-pros="SelectInput"
      p={{ ...p, label: p.label ?? "What brings you here?" }}
      className="p-select-input"
    >
      {(id) => (
        <select
          id={id}
          name={p.name}
          required={p.required}
          disabled={p.disabled}
          value={value}
          onChange={(e) => set(e.target.value)}
        >
          {list.map((item, i) => (
            <option key={i} value={itemValue(item)}>
              {item.label}
            </option>
          ))}
        </select>
      )}
    </FieldLabel>
  );
}
/** A growing note field with a remaining-character counter. */
export function NoteInput(p: ProsProps) {
  const [value, set] = useModel(p, "");
  const max = p.max ?? 280;
  return (
    <FieldLabel
      data-pros="NoteInput"
      p={{ ...p, label: p.label ?? "A thought worth sharing" }}
      className="p-note-input"
    >
      {(id) => (
        <>
          <textarea
            id={id}
            name={p.name}
            required={p.required}
            disabled={p.disabled}
            value={value}
            maxLength={max}
            rows={4}
            placeholder={p.title ?? "Start anywhere…"}
            onChange={(e) => set(e.target.value)}
          />
          <small className="p-right" aria-live="polite">
            {max - value.length} characters left
          </small>
        </>
      )}
    </FieldLabel>
  );
}
/** A tag editor with enter-to-add and keyboard-friendly removal. */
export function TagInput(p: ProsProps) {
  const [value, set] = useModel(p, "design,motion");
  const [draft, setDraft] = useState("");
  const tags = value.split(",").filter(Boolean);
  const add = () => {
    const next = draft.trim().replace(/,/g, "");
    if (next && !tags.includes(next)) {
      set([...tags, next].join(","));
    }
    setDraft("");
  };
  return (
    <FieldLabel
      data-pros="TagInput"
      p={{ ...p, label: p.label ?? "Your interests" }}
      className="p-tag-input"
    >
      {(id) => (
        <div>
          {tags.map((tag) => (
            <span className="p-pill" key={tag}>
              {tag}
              <button
                type="button"
                disabled={p.disabled}
                aria-label={"Remove " + tag}
                onClick={() => set(tags.filter((t) => t !== tag).join(","))}
              >
                <Icon name="close" />
              </button>
            </span>
          ))}
          <input
            id={id}
            disabled={p.disabled}
            value={draft}
            placeholder="Add a tag…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
              if (e.key === "Backspace" && !draft)
                set(tags.slice(0, -1).join(","));
            }}
            onBlur={add}
          />
        </div>
      )}
    </FieldLabel>
  );
}
/** A file dropzone with native browsing and real file selection. */
export function FileDropzone(p: ProsProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const choose = (list: FileList | null) => {
    if (!list || p.disabled) return;
    const names = Array.from(list).map((f) => f.name);
    setFiles(names);
    p.onValueChange?.(names.join(","));
  };
  return (
    <label
      data-pros="FileDropzone"
      className={cx("p-dropzone", p.className, drag && "is-active")}
      style={p.style}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        choose(e.dataTransfer.files);
      }}
    >
      <input
        type="file"
        multiple
        disabled={p.disabled}
        name={p.name}
        onChange={(e) => choose(e.target.files)}
      />
      <span aria-hidden="true">↥</span>
      <b>
        {files.length
          ? files.length + " file" + (files.length > 1 ? "s" : "") + " selected"
          : (p.title ?? "Drop something good.")}
      </b>
      <small>
        {files.length
          ? files.join(", ")
          : (p.description ?? "Drag files here or click to browse")}
      </small>
    </label>
  );
}
/** A native date picker with a large day readout. */
export function DateInput(p: ProsProps) {
  const [value, set] = useModel(p, "2026-10-24");
  return (
    <FieldLabel
      data-pros="DateInput"
      p={{ ...p, label: p.label ?? "Save the date" }}
      className="p-date-input"
    >
      {(id) => (
        <div>
          <span className="p-number" aria-hidden="true">
            {value.slice(-2) || "—"}
          </span>
          <input
            id={id}
            type="date"
            name={p.name}
            required={p.required}
            disabled={p.disabled}
            value={value}
            onChange={(e) => set(e.target.value)}
          />
        </div>
      )}
    </FieldLabel>
  );
}
/** A star rating with explicit values and a live caption. */
export function RatingInput(p: ProsProps) {
  const [value, set] = useModel(p, "3");
  return (
    <fieldset
      data-pros="RatingInput"
      className={cx("p-rating-input", p.className)}
      style={p.style}
      disabled={p.disabled}
    >
      <legend>{p.label ?? p.title ?? "How does it feel?"}</legend>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            aria-label={n + " star" + (n > 1 ? "s" : "")}
            aria-pressed={Number(value) === n}
            className={Number(value) >= n ? "is-active" : ""}
            onClick={() => set(String(n))}
          >
            <Icon name="star" />
          </button>
        ))}
      </div>
      <small aria-live="polite">
        {value} out of 5 ·{" "}
        {
          [
            "",
            "Room to grow",
            "Getting there",
            "Feels good",
            "Really good",
            "Just right",
          ][Number(value)]
        }
      </small>
    </fieldset>
  );
}
