import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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
      {diagonal ? "↗" : "→"}
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
}: {
  children: ReactNode;
  motion?: boolean;
  className?: string;
}) {
  return (
    <MotionContext.Provider value={motion}>
      <div
        className={cx("pros", className)}
        data-motion={motion ? "on" : "off"}
      >
        {children}
      </div>
    </MotionContext.Provider>
  );
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
  const motion = useContext(MotionContext);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    return () => {
      if (d.open) d.close();
    };
  }, [open]);
  return (
    <dialog
      data-motion={motion ? "on" : "off"}
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
          ×
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
}: {
  p: ProsProps;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cx("p-field", className, p.className)} style={p.style}>
      <label htmlFor={id}>
        {p.label ?? p.title ?? "Your details"}
        {p.required && <span aria-hidden="true"> *</span>}
      </label>
      {children(id)}
      {p.description && <small>{p.description}</small>}
    </div>
  );
}
