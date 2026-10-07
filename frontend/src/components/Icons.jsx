// Small inline stroke icons, sized by the parent's font-size via `size`.
const Svg = ({ size = 20, strokeWidth = 1.7, fill = "none", children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const HeartIcon = ({ filled, ...props }) => (
  <Svg fill={filled ? "currentColor" : "none"} {...props}>
    <path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z" />
  </Svg>
);

export const BagIcon = (props) => (
  <Svg {...props}>
    <path d="M5 8h14l-1.2 12H6.2z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Svg>
);

export const UserIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
  </Svg>
);

export const LogoutIcon = (props) => (
  <Svg {...props}>
    <path d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" />
    <path d="M15 8l4 4-4 4M19 12H10" />
  </Svg>
);

export const SearchIcon = (props) => (
  <Svg strokeWidth={2} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const ArrowUpRight = (props) => (
  <Svg strokeWidth={2} {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Svg>
);

export const ArrowDownRight = (props) => (
  <Svg strokeWidth={1.8} {...props}>
    <path d="M7 7l10 10M17 9v8H9" />
  </Svg>
);

export const ChevronLeft = (props) => (
  <Svg strokeWidth={2} {...props}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const ChevronRight = (props) => (
  <Svg strokeWidth={2} {...props}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const PlusIcon = (props) => (
  <Svg strokeWidth={2} {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MinusIcon = (props) => (
  <Svg strokeWidth={2} {...props}>
    <path d="M5 12h14" />
  </Svg>
);

export const TrashIcon = (props) => (
  <Svg {...props}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
  </Svg>
);

export const LockIcon = (props) => (
  <Svg strokeWidth={2} {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const CheckIcon = (props) => (
  <Svg strokeWidth={2} {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
