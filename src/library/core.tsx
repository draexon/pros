import { Icon } from "./icons";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
export type ProsItem = {
  label: string;
  value?: string;
  description?: string;
  image?: string;
  href?: string;
};
export type ProsProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  items?: ProsItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onAction?: (action: string) => void;
  disabled?: boolean;
  image?: string;
  href?: string;
  label?: string;
  name?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
};
export const cx = (...v: (string | false | undefined)[]) =>
  v.filter(Boolean).join(" ");
export const defaults: ProsItem[] = [
  { label: "Studio", description: "A space for better ideas", value: "studio" },
  {
    label: "Objects",
    description: "Useful things, thoughtfully made",
    value: "objects",
  },
  { label: "Journal", description: "Notes from the process", value: "journal" },
];
export const itemsOf = (p: ProsProps) => p.items ?? defaults;
export const itemValue = (item: ProsItem) => item.value ?? item.label;
export function useModel(p: ProsProps, fallback: string) {
  const [inner, setInner] = useState(p.defaultValue ?? fallback);
  return [
    p.value ?? inner,
    (v: string) => {
      setInner(v);
      p.onValueChange?.(v);
    },
  ] as const;
}
export function useToggle(p: ProsProps, fallback = false) {
  const [value, set] = useModel(p, String(fallback));
  return [
    value === "true",
    (v?: boolean) => set(String(v ?? value !== "true")),
  ] as const;
}

/** Crossfade stable panels without remounting their controls or delaying state. */
export function useContentTransition<T extends HTMLElement = HTMLDivElement>(
  value: unknown,
  target?: RefObject<T | null>,
) {
  const local = useRef<T>(null);
  const ref = target ?? local;
  const enabled = useMotionAllowed();
  const previous = useRef<{
    value: unknown;
    image: HTMLElement;
    height: number;
  } | null>(null);
  const stop = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset.contentTransition = "true";
    const old = previous.current;
    const next = {
      value,
      image: element.cloneNode(true) as HTMLElement,
      height: element.offsetHeight,
    };
    previous.current = next;
    if (!enabled) {
      stop.current();
      return;
    }
    if (!old || Object.is(old.value, value)) return;
    stop.current();
    next.height = element.offsetHeight;
    const parent = element.parentElement;
    if (!parent || document.documentElement.dataset.themeChanging) return;
    const position = parent.style.position;
    if (getComputedStyle(parent).position === "static")
      parent.style.position = "relative";
    const ghost = old.image;
    ghost.classList.add("p-content-outgoing");
    ghost.setAttribute("aria-hidden", "true");
    ghost.inert = true;
    for (const node of [ghost, ...ghost.querySelectorAll<HTMLElement>("*")]) {
      for (const attribute of [
        "id",
        "name",
        "for",
        "data-pros",
        "aria-live",
        "aria-labelledby",
        "aria-describedby",
        "aria-controls",
      ])
        node.removeAttribute(attribute);
    }
    Object.assign(ghost.style, {
      position: "absolute",
      left: element.offsetLeft + "px",
      top: element.offsetTop + "px",
      width: element.offsetWidth + "px",
      height: old.height + "px",
      margin: "0",
      pointerEvents: "none",
      zIndex: "2",
    });
    parent.appendChild(ghost);
    const frames: Keyframe[] = [
      { opacity: 0, translate: "0 5px" },
      { opacity: 1, translate: "0 0" },
    ];
    if (
      !element.closest(".p-app-block") &&
      Math.abs(old.height - next.height) > 1
    ) {
      frames[0].height = old.height + "px";
      frames[1].height = next.height + "px";
    }
    const incoming = element.animate(frames, {
      duration: 320,
      easing: "cubic-bezier(.22,1,.36,1)",
    });
    const outgoing = ghost.animate(
      [
        { opacity: 1, translate: "0 0" },
        { opacity: 0, translate: "0 -4px" },
      ],
      { duration: 260, easing: "ease-out", fill: "forwards" },
    );
    const cleanup = () => {
      incoming.cancel();
      outgoing.cancel();
      ghost.remove();
      parent.style.position = position;
    };
    stop.current = cleanup;
    incoming.finished.then(
      () => {
        if (stop.current === cleanup) {
          cleanup();
          stop.current = () => {};
        }
      },
      () => {},
    );
  });
  useLayoutEffect(() => () => stop.current(), [enabled]);
  return ref;
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="p-arrow">
      <Icon name={diagonal ? "arrow" : "right"} />
    </span>
  );
}
export function Mark({ variant = 0 }: { variant?: number }) {
  return (
    <div aria-hidden="true" className={"p-mark p-mark-" + (variant % 6)}>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
export function Action({
  p,
  children,
  action = "open",
  className = "",
}: {
  p: ProsProps;
  children?: ReactNode;
  action?: string;
  className?: string;
}) {
  return p.href ? (
    <a className={cx("p-action", className)} href={p.href}>
      {children ?? p.label ?? "Explore"}
      <Arrow />
    </a>
  ) : (
    <button
      type="button"
      disabled={p.disabled}
      className={cx("p-action", className)}
      onClick={() => p.onAction?.(action)}
    >
      {children ?? p.label ?? "Explore"}
      <Arrow />
    </button>
  );
}
const MotionContext = createContext(true);
export function ProsProvider({
  children,
  motion = true,
  className,
  theme,
}: {
  children: ReactNode;
  motion?: boolean;
  className?: string;
  theme?: "light" | "dark";
}) {
  return (
    <MotionContext.Provider value={motion}>
      <div
        className={cx("pros", className)}
        data-motion={motion ? "on" : "off"}
        data-theme={theme}
      >
        <InteractionMotion />
        {children}
      </div>
    </MotionContext.Provider>
  );
}

/** Delegated feedback covers mouse, touch and keyboard activation in every collection. */
function InteractionMotion() {
  const marker = useRef<HTMLSpanElement>(null);
  const enabled = useMotionAllowed();
  useEffect(() => {
    const root = marker.current?.parentElement;
    if (!root || !enabled) return;
    const running = new Map<Element, Animation>();
    const click = (event: MouseEvent) => {
      const control =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              "button, a[href], summary, label:has(input)",
            )
          : null;
      if (
        !control ||
        !root.contains(control) ||
        control.closest(
          ".p-selection-track, .p-image-accordion, .theme-control",
        ) ||
        control.matches(':disabled, [aria-disabled="true"]') ||
        control.closest('[data-motion="off"]')
      )
        return;
      if (root.classList.contains("site") && !control.closest("[data-pros]"))
        return;
      running.get(control)?.cancel();
      const animation = control.animate(
        [
          { scale: control.offsetWidth > 220 ? "0.99" : "0.975" },
          { scale: "1" },
        ],
        { duration: 240, easing: "cubic-bezier(.16,1,.3,1)" },
      );
      running.set(control, animation);
      animation.finished.then(
        () => {
          if (running.get(control) === animation) running.delete(control);
        },
        () => {},
      );
    };
    root.addEventListener("click", click);
    return () => {
      root.removeEventListener("click", click);
      running.forEach((animation) => animation.cancel());
    };
  }, [enabled]);
  return <span ref={marker} hidden aria-hidden="true" />;
}

/** A viewport-positioned menu with reversible motion and native button navigation. */
export function ActionMenu({
  open,
  onClose,
  anchor,
  items,
  onAction,
  selectedValue,
  label,
  className,
}: {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLButtonElement | null>;
  items: ProsItem[];
  onAction?: (value: string) => void;
  selectedValue?: string;
  label?: string;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const motion = useMotionAllowed();
  const [present, setPresent] = useState(open);
  const [position, setPosition] = useState<CSSProperties>({
    visibility: "hidden",
  });
  const [theme, setTheme] = useState("light");
  const id = useId();
  useEffect(() => {
    anchor.current?.setAttribute("aria-controls", id);
    if (open) setPresent(true);
    else {
      const timer = setTimeout(() => setPresent(false), motion ? 180 : 0);
      return () => clearTimeout(timer);
    }
  }, [open, motion, anchor, id]);
  useEffect(() => {
    if (!open || !present) return;
    const trigger = anchor.current;
    const menu = panel.current;
    if (!trigger || !menu) return;
    const place = () => {
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(Math.max(220, rect.width), window.innerWidth - 24);
      const below = window.innerHeight - rect.bottom - 20;
      const above = rect.top - 20;
      const up = below < Math.min(menu.scrollHeight, 260) && above > below;
      setPosition({
        width,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        top: up ? undefined : rect.bottom + 8,
        bottom: up ? window.innerHeight - rect.top + 8 : undefined,
        maxHeight: Math.max(60, up ? above : below),
        transformOrigin: up ? "bottom center" : "top center",
      });
      setTheme(
        trigger.closest("[data-theme]")?.getAttribute("data-theme") ??
          document.documentElement.dataset.theme ??
          "light",
      );
    };
    place();
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menu.contains(event.target) &&
        !trigger.contains(event.target)
      )
        close.current();
    };
    const blur = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !menu.contains(event.target) &&
        !trigger.contains(event.target)
      )
        close.current();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", blur);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", blur);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, present, anchor]);
  useEffect(() => {
    if (open && present && position.visibility !== "hidden") {
      (
        panel.current?.querySelector<HTMLButtonElement>(
          '[aria-checked="true"]',
        ) ?? panel.current?.querySelector<HTMLButtonElement>("button")
      )?.focus({ preventScroll: true });
    }
  }, [open, present, position.visibility]);
  if (!present) return null;
  return createPortal(
    <div
      ref={panel}
      id={id}
      className={cx("pros p-menu p-action-menu", className)}
      role={selectedValue !== undefined ? "menu" : undefined}
      aria-label={label}
      data-theme={theme}
      data-motion={motion ? "on" : "off"}
      data-open={open}
      style={position}
      inert={!open}
      onKeyDown={(event) => {
        const buttons = Array.from(
          panel.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
        );
        const index = buttons.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (event.key === "Escape") {
          event.preventDefault();
          close.current();
          anchor.current?.focus();
        } else if (
          ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
        ) {
          event.preventDefault();
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? buttons.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          buttons[next]?.focus();
        } else if (event.key.length === 1 && /\S/.test(event.key)) {
          const key = event.key.toLowerCase();
          const match = [
            ...buttons.slice(index + 1),
            ...buttons.slice(0, index + 1),
          ].find((button) =>
            button.textContent?.trim().toLowerCase().startsWith(key),
          );
          match?.focus();
        }
      }}
    >
      <InteractionMotion />
      {label && (
        <div className="p-menu-heading" aria-hidden="true">
          {label}
        </div>
      )}
      {items.length ? (
        items.map((item, index) => (
          <button
            type="button"
            key={index}
            role={selectedValue !== undefined ? "menuitemradio" : undefined}
            aria-checked={
              selectedValue !== undefined
                ? selectedValue === itemValue(item)
                : undefined
            }
            style={{ "--option-delay": index * 35 + "ms" } as CSSProperties}
            onClick={() => {
              close.current();
              anchor.current?.focus();
              onAction?.(itemValue(item));
            }}
          >
            <span>
              {item.label}
              {item.description && <small>{item.description}</small>}
            </span>
            {selectedValue !== undefined ? (
              <span className="p-option-check" aria-hidden="true">
                {selectedValue === itemValue(item) && <Icon name="check" />}
              </span>
            ) : (
              <Arrow />
            )}
          </button>
        ))
      ) : (
        <p className="p-menu-empty">No options available</p>
      )}
    </div>,
    document.body,
  );
}
/** A select-style trigger that opens the shared menu instead of the platform list. */
export function Dropdown({
  id,
  value,
  options,
  onChange,
  label,
  heading,
  name,
  disabled,
  compact,
  className,
}: {
  id?: string;
  value: string;
  options: ProsItem[];
  onChange: (value: string) => void;
  label?: string;
  heading?: string;
  name?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const current = options.find((item) => itemValue(item) === value);
  return (
    <span
      className={cx("p-dropdown", compact && "is-compact", className)}
      data-open={open}
    >
      <button
        ref={anchor}
        id={id}
        type="button"
        className="p-dropdown-trigger"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{current?.label ?? value}</span>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      <ActionMenu
        open={open}
        onClose={() => setOpen(false)}
        anchor={anchor}
        items={options}
        selectedValue={value}
        label={heading}
        className="p-dropdown-menu"
        onAction={onChange}
      />
    </span>
  );
}
/** Measure the selected control so its highlight travels instead of blinking. */
export function useSelectionIndicator(value: string) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const track = ref.current;
    if (!track) return;
    const update = () => {
      const selected = track.querySelector<HTMLElement>(
        '[aria-selected="true"], [aria-pressed="true"]',
      );
      if (!selected) {
        delete track.dataset.selectionReady;
        return;
      }
      track.style.setProperty("--selection-x", selected.offsetLeft + "px");
      track.style.setProperty("--selection-y", selected.offsetTop + "px");
      track.style.setProperty("--selection-width", selected.offsetWidth + "px");
      track.style.setProperty(
        "--selection-height",
        selected.offsetHeight + "px",
      );
      track.dataset.selectionReady = "true";
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    for (const child of track.children) observer.observe(child);
    return () => observer.disconnect();
  }, [value]);
  return ref;
}

export function useMotionAllowed() {
  const enabled = useContext(MotionContext);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  return enabled && !reduced;
}
export function DialogSurface({
  open,
  onClose,
  children,
  title,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const motion = useMotionAllowed();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) {
      if (!motion) d.close();
      else {
        const timer = setTimeout(() => d.close(), 180);
        return () => clearTimeout(timer);
      }
    }
  }, [open, motion]);
  useEffect(() => () => ref.current?.close(), []);
  return (
    <dialog
      data-motion={motion ? "on" : "off"}
      data-closing={!open}
      ref={ref}
      aria-labelledby={titleId}
      className={cx("pros p-dialog", className)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header>
        <h3 id={titleId}>{title}</h3>
        <button
          type="button"
          className="p-icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function FieldLabel({
  p,
  children,
  className,
  "data-pros": component,
}: {
  p: ProsProps;
  children: (id: string) => ReactNode;
  className?: string;
  "data-pros"?: string;
}) {
  const id = useId();
  return (
    <div
      data-pros={component}
      className={cx("p-field", className, p.className)}
      style={p.style}
    >
      <label htmlFor={id}>
        {p.label ?? p.title ?? "Your details"}
        {p.required && <span aria-hidden="true"> *</span>}
      </label>
      {children(id)}
      {p.description && <small>{p.description}</small>}
    </div>
  );
}
