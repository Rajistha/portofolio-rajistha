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
          backgroundColor: "#0a0a0b",
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          color: "#ff5a3c",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
