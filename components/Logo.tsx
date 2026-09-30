// The Ambassador mark as inline SVG with a transparent background. It takes
// the text color, so it can sit white on the navy sidebar.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 106 110" role="img" aria-label="Ambassador" className={className}>
      <g transform="translate(0,110) scale(0.1,-0.1)" fill="currentColor">
        <path d="M526 1010 c-10 -31 -118 -326 -132 -363 -8 -23 -11 -44 -6 -53 8 -15 49 86 139 346 3 9 12 -5 22 -35 24 -68 113 -309 117 -314 1 -1 7 0 13 3 6 4 5 19 -4 44 -116 315 -144 385 -149 372z" />
        <path d="M362 556 c-17 -39 -140 -350 -144 -365 -2 -7 2 -15 7 -17 6 -2 42 77 80 176 39 99 73 180 76 180 3 0 35 -38 72 -85 l67 -85 -35 -46 c-44 -58 -51 -84 -30 -123 28 -55 86 -66 134 -25 44 37 42 81 -5 145 l-36 50 68 89 c55 72 70 87 76 73 4 -10 33 -85 66 -168 33 -82 62 -158 65 -167 4 -11 12 -15 21 -12 14 5 13 11 -3 42 -10 21 -46 110 -81 200 -35 89 -66 162 -69 162 -6 -1 -43 -47 -122 -150 l-35 -47 -79 98 c-43 55 -79 99 -80 99 -1 0 -7 -11 -13 -24z m238 -329 c0 -21 -43 -67 -63 -67 -26 0 -67 41 -67 67 0 13 14 44 31 69 l32 43 33 -47 c19 -26 34 -55 34 -65z" />
        <path d="M560 526 c0 -2 8 -10 18 -17 15 -13 16 -12 3 4 -13 16 -21 21 -21 13z" />
      </g>
    </svg>
  );
}
