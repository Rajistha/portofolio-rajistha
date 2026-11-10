"use client";

export function Logo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105 select-none"
      >
        <defs>
          <linearGradient id="r-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7b54" />
            <stop offset="100%" stopColor="#e2481f" />
          </linearGradient>
          <linearGradient id="r-grad-slash" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#ff8a65" />
            <stop offset="100%" stopColor="#ff411f" />
          </linearGradient>
        </defs>

        {/* Outer Tech Squircle Background */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="24"
          fill="#111113"
          stroke="#26262a"
          strokeWidth="3"
        />

        {/* Subtle grid accent inside */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="20"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1.5"
        />

        {/* Futuristic R Geometry */}
        <g>
          {/* Vertical Stem */}
          <rect
            x="24"
            y="22"
            width="15"
            height="56"
            rx="5"
            fill="url(#r-grad-primary)"
          />

          {/* Top Loop / Bowl of R */}
          <path
            d="M 36 22 L 56 22 C 67 22 74 28 74 38 C 74 48 67 54 56 54 L 36 54 Z"
            fill="url(#r-grad-primary)"
          />
          {/* Inner cutout of the loop */}
          <path
            d="M 39 33 L 53 33 C 58.5 33 62 35 62 38 C 62 41 58.5 43 53 43 L 39 43 Z"
            fill="#111113"
          />

          {/* Dynamic Forward Slash Leg of R */}
          <path
            d="M 48 48 L 68 75 C 69.5 77 72 78 75 78 L 78 78 C 79 78 79.5 76.8 78.5 75.5 L 59 48 Z"
            fill="url(#r-grad-slash)"
          />

          {/* Code flare spark dot */}
          <circle cx="75" cy="24" r="3.5" fill="#ff7b54" />
        </g>
      </svg>
    </div>
  );
}
