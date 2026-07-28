import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "Freight Link Network — Engineered Road, Rail & Intermodal Logistics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The logo is white-on-transparent, so it must sit on the brand navy.
// Social platforms flatten transparency onto white, which erases the wordmark.
export default function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), "public", "FLNSITELOGO.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06082C",
        }}
      >
        <img src={logoSrc} width={820} height={362} alt="" />
      </div>
    ),
    size
  );
}
