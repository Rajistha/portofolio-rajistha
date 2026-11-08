import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fav-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7b54" />
            <stop offset="100%" stopColor="#e2481f" />
          </linearGradient>
          <linearGradient id="fav-slash" x1="0%" y1="0%" x2="100%" y2="100%">
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
          strokeWidth="4"
        />

        {/* Vertical Stem */}
        <rect
          x="24"
          y="22"
          width="15"
          height="56"
          rx="5"
          fill="url(#fav-primary)"
        />

        {/* Top Loop / Bowl of R */}
        <path
          d="M 36 22 L 56 22 C 67 22 74 28 74 38 C 74 48 67 54 56 54 L 36 54 Z"
          fill="url(#fav-primary)"
        />
        {/* Inner cutout of the loop */}
        <path
          d="M 39 33 L 53 33 C 58.5 33 62 35 62 38 C 62 41 58.5 43 53 43 L 39 43 Z"
          fill="#111113"
        />

        {/* Dynamic Forward Slash Leg of R */}
        <path
          d="M 48 48 L 68 75 C 69.5 77 72 78 75 78 L 78 78 C 79 78 79.5 76.8 78.5 75.5 L 59 48 Z"
          fill="url(#fav-slash)"
        />

        {/* Code flare spark dot */}
        <circle cx="75" cy="24" r="4.5" fill="#ff7b54" />
      </svg>
    ),
    { ...size }
  );
}
