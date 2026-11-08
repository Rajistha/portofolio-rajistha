import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111113",
          borderRadius: 8,
          border: "1px solid #26262a",
          fontSize: 20,
          fontWeight: 800,
          color: "#ff5a3c",
          fontFamily: "sans-serif",
          letterSpacing: "-0.05em",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
