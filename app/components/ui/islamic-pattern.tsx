export function IslamicPattern({ className = '', opacity = 0.05 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="islamic" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="currentColor" />
          <path
            d="M10 2 L18 10 L10 18 L2 10 Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="0.3" fill="none" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#islamic)" />
    </svg>
  );
}