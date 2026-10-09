import type { CSSProperties, ReactNode } from "react";

// Original 24-unit drawings. Broad silhouettes stay legible at small sizes.
const shapes = {
  right: (
    <path d="M3 18c0-5.8 3.2-9 9-9h2.2l-2.4-2.4a1.8 1.8 0 0 1 2.6-2.6l6.2 6.2a2.5 2.5 0 0 1 0 3.6L14.4 20a1.8 1.8 0 0 1-2.6-2.6l2.8-2.8H12c-3.8 0-5.2 1.4-5.2 3.4A1.9 1.9 0 0 1 3 18Z" />
  ),
  search: (
    <>
      <path
        fillRule="evenodd"
        d="M10.3 2a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Zm0 3.7a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Z"
      />
      <path d="m15 16 3 5c1.8 2.8 5 .4 3-1.8l-4-4Z" />
    </>
  ),
  grid: (
    <>
      <rect x="2" y="2" width="9" height="12" rx="3" />
      <rect x="14" y="2" width="8" height="7" rx="2.7" />
      <rect x="2" y="17" width="9" height="5" rx="2.5" />
      <rect x="14" y="12" width="8" height="10" rx="3" />
    </>
  ),
  list: (
    <>
      <rect x="2" y="3" width="5" height="5" rx="2" />
      <rect x="10" y="3" width="12" height="5" rx="2.5" />
      <rect x="2" y="11" width="5" height="4" rx="2" />
      <rect x="10" y="11" width="9" height="4" rx="2" />
      <rect x="2" y="18" width="5" height="4" rx="2" />
      <rect x="10" y="18" width="12" height="4" rx="2" />
    </>
  ),
  code: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 6-4 6 4 6m12-12 4 6-4 6M14 4l-4 16" />
    </g>
  ),
  heart: (
    <path
      fillRule="evenodd"
      d="M12 5C6-2-4 7 4 15l6.2 6a2.6 2.6 0 0 0 3.6 0l6.2-6C28 7 18-2 12 5Zm0 4.8C8.5 3.2 3 6.3 6.4 11.7L12 17.4l5.6-5.7C21 6.3 15.5 3.2 12 9.8Z"
    />
  ),
  close: <path d="m5 2 7 7 7-7 3 3-7 7 7 7-3 3-7-7-7 7-3-3 7-7-7-7Z" />,
  plus: (
    <path d="M10 3a2 2 0 0 1 4 0v7h7a2 2 0 0 1 0 4h-7v7a2 2 0 0 1-4 0v-7H3a2 2 0 0 1 0-4h7Z" />
  ),
  minus: <rect x="2" y="10" width="20" height="4" rx="2" />,
  check: (
    <path d="M2.6 11.6a2.2 2.2 0 0 1 3.1 0l3.8 3.8L18.4 4a2.2 2.2 0 0 1 3.5 2.7L11.5 20a2.5 2.5 0 0 1-3.8.2l-5.1-5.5a2.2 2.2 0 0 1 0-3.1Z" />
  ),
  refresh: (
    <>
      <path d="M19 3v7h-7l2.7-2.7A5.7 5.7 0 1 0 17 15h4a9.5 9.5 0 1 1-3.5-10Z" />
      <rect x="18" y="2" width="4" height="9" rx="1.5" />
    </>
  ),
  flower: (
    <path d="M12 2c4-5 7 2 3.5 6C21 3 26 10 19 12c7 2 2 9-3.5 4C19 20 16 27 12 22c-4 5-7-2-3.5-6C3 21-2 14 5 12-2 10 3 3 8.5 8 5 4 8-3 12 2Z" />
  ),
  cards: (
    <>
      <path d="M7 3 18 1c2-.3 3 1 3.3 3l1.5 11c.3 2-1 3-3 3.3L18 7Z" />
      <rect x="2" y="6" width="15" height="17" rx="4" />
    </>
  ),
  inputs: (
    <>
      <path
        fillRule="evenodd"
        d="M5 3h14a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 4v10h14V7Z"
      />
      <rect x="7" y="9" width="3" height="6" rx="1.5" />
    </>
  ),
  navigation: (
    <path d="M3 3c0-1 1-2 2-1l17 8c2 1 1 3-1 3l-7 1-1 7c0 2-2 3-3 1Z" />
  ),
  typography: (
    <>
      <path d="M1 3h15v4h-5v15H6V7H1Z" />
      <path d="M15 10h8v3h-2v9h-4v-9h-2Z" />
    </>
  ),
  feedback: (
    <>
      <path
        fillRule="evenodd"
        d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"
      />
      <rect x="10" y="7" width="4" height="6" rx="2" />
      <circle cx="12" cy="16" r="1.6" />
    </>
  ),
  overlays: (
    <>
      <path d="M5 2h12a4 4 0 0 1 4 4v1H7v12H5a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z" />
      <rect x="10" y="10" width="13" height="13" rx="4" />
    </>
  ),
  data: (
    <>
      <rect x="2" y="12" width="5" height="10" rx="2.5" />
      <rect x="9.5" y="6" width="5" height="16" rx="2.5" />
      <rect x="17" y="2" width="5" height="20" rx="2.5" />
    </>
  ),
  media: (
    <path
      fillRule="evenodd"
      d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm1 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-1 10h12l-4-7-4 5-2-2Z"
    />
  ),
  commerce: (
    <>
      <path
        fillRule="evenodd"
        d="M7 7V6a5 5 0 0 1 10 0v1h2l3 11c.7 3-1 5-4 5H6c-3 0-4.7-2-4-5L5 7Zm3 0h4V6a2 2 0 0 0-4 0Z"
      />
    </>
  ),
  social: (
    <>
      <circle cx="8" cy="7" r="5" />
      <path d="M1 22v-3a7 7 0 0 1 14 0v3Z" />
      <path d="M15 2a5 5 0 0 1 0 10 8 8 0 0 0 0-10Zm2 12a7 7 0 0 1 6 7v1h-5v-3Z" />
    </>
  ),
  motion: (
    <>
      <path d="M4 2h6L6 22H0Zm10 0h10l-4 20H10Z" />
    </>
  ),
  menu: (
    <>
      <rect x="2" y="5" width="20" height="5" rx="2.5" />
      <rect x="8" y="15" width="14" height="5" rx="2.5" />
    </>
  ),
  github: (
    <>
      <circle cx="6" cy="5" r="4" />
      <circle cx="18" cy="5" r="4" />
      <circle cx="6" cy="19" r="4" />
      <path d="M4 5h4v8c6 0 8-3 8-8h4c0 8-4 12-12 12v2H4Z" />
    </>
  ),
  bookmark: (
    <path
      fillRule="evenodd"
      d="M6 1h12a3 3 0 0 1 3 3v18l-9-5-9 5V4a3 3 0 0 1 3-3Zm1 4v10l5-3 5 3V5Z"
    />
  ),
  "bookmark-filled": (
    <path d="M6 1h12a3 3 0 0 1 3 3v18l-9-5-9 5V4a3 3 0 0 1 3-3Z" />
  ),
  "heart-filled": (
    <path d="M12 5C6-2-4 7 4 15l6.2 6a2.6 2.6 0 0 0 3.6 0l6.2-6C28 7 18-2 12 5Z" />
  ),
  play: <path d="M5 4c0-2 2-3 4-2l12 8c2 1 2 3 0 4L9 22c-2 1-4 0-4-2Z" />,
  pause: (
    <>
      <rect x="4" y="2" width="6" height="20" rx="2" />
      <rect x="14" y="2" width="6" height="20" rx="2" />
    </>
  ),
  circle: (
    <path
      fillRule="evenodd"
      d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"
    />
  ),
  home: <path d="M1 10 10 2a3 3 0 0 1 4 0l9 8-3 3v9h-6v-7h-4v7H4v-9Z" />,
  settings: (
    <path
      fillRule="evenodd"
      d="m9 1 6 0 1 4 4 1 3 6-3 6-4 1-1 4H9l-1-4-4-1-3-6 3-6 4-1Zm3 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
    />
  ),
  info: (
    <>
      <circle cx="12" cy="4" r="3" />
      <path d="M7 9h8v10h3v4H6v-4h4v-6H7Z" />
    </>
  ),
  star: <path d="m12 1 3.5 7 7.5 1-5.5 5.5 1.5 8-7-4-7 4 1.5-8L1 9l7.5-1Z" />,
  sound: (
    <>
      <path d="M2 8h5l7-6v20l-7-6H2Z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        d="M18 6q7 6 0 12"
      />
    </>
  ),
  copy: (
    <>
      <path d="M5 1h10a4 4 0 0 1 4 4v1H6v13H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z" />
      <path
        fillRule="evenodd"
        d="M12 8h8a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Zm1 4v7h6v-7Z"
      />
    </>
  ),
} satisfies Record<string, ReactNode>;
const turns = {
  arrow: -45,
  left: 180,
  up: -90,
  down: 90,
  southeast: 45,
  southwest: 135,
};
export type ProsIconName = keyof typeof shapes | keyof typeof turns;
export function ProsIcon({
  name,
  size = "1em",
  className = "",
  style,
  label,
}: {
  name: ProsIconName;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const turn = name in turns ? turns[name as keyof typeof turns] : undefined;
  return (
    <svg
      className={"p-icon p-icon--" + name + " " + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      style={style}
    >
      {turn === undefined ? (
        shapes[name as keyof typeof shapes]
      ) : (
        <g transform={"rotate(" + turn + " 12 12)"}>{shapes.right}</g>
      )}
    </svg>
  );
}
export const Icon = ProsIcon;
