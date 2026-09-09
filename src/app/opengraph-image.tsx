import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "Rajistha — Front-End Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const profile = await getProfile();
  const name = profile?.name ?? "Puja Rajistha";
  const role = profile?.role ?? "Front-End Developer";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 28,
            color: "#8a8a90",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#ff5a3c" }} />
          {role}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#ededec",
            marginTop: 24,
            letterSpacing: "-0.02em",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#8a8a90",
            marginTop: 24,
          }}
        >
          rajistha.my.id
        </div>
      </div>
    ),
    { ...size }
  );
}
