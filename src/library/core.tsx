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
      running.get(control)?.cancel();
      const animation = control.animate(
        [{ scale: "0.96" }, { scale: "1.015", offset: 0.65 }, { scale: "1" }],
        { duration: 280, easing: "cubic-bezier(.22,1,.36,1)" },
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
}: {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLButtonElement | null>;
  items: ProsItem[];
  onAction?: (value: string) => void;
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
      panel.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
    }
  }, [open, present, position.visibility]);
  if (!present) return null;
  return createPortal(
    <div
      ref={panel}
      id={id}
      className="pros p-menu p-action-menu"
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
        }
      }}
    >
      <InteractionMotion />
      {items.length ? (
        items.map((item, index) => (
          <button
            type="button"
            key={index}
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
            <Arrow />
          </button>
        ))
      ) : (
        <p className="p-menu-empty">No options available</p>
      )}
    </div>,
    document.body,
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
