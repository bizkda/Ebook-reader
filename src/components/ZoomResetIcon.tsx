interface ZoomResetIconProps {
  size?: number;
  className?: string;
}

export function ZoomResetIcon({ size = 20, className }: ZoomResetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* center square */}
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
      {/* four outward arrows */}
      <path d="M8 8 3 3M3 7V3h4" />
      <path d="M16 8l5-5M17 3h4v4" />
      <path d="M8 16l-5 5M3 17v4h4" />
      <path d="M16 16l5 5M21 17v4h-4" />
    </svg>
  );
}