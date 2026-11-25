import { ImageResponse } from "next/og";
import { markDataUri } from "@/lib/og";

/* Home-screen icon (iOS), generated from the same placeholder mark as the favicon. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0B0B" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri()} width={124} height={108} alt="" />
      </div>
    ),
    size,
  );
}
