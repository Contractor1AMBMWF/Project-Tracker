export default function Logo({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M23 6 L34 32 M23 6 L12 32 M14 18 L23 32 M14 18 L5 32"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
