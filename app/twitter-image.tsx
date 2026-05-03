import { ImageResponse } from "next/og";
import { getTranslation } from "@/lib/i18n";

export const runtime = "edge";

export const alt = `${getTranslation("seo.ogAlt", "ar")} | ${getTranslation("seo.ogAlt", "en")}`;
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background circles */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.03)",
          display: "flex",
        }}
      />

      {/* Medical cross */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.15)",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            color: "white",
            fontWeight: "bold",
            display: "flex",
          }}
        >
          +
        </div>
      </div>

      {/* Brand */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "8px",
          display: "flex",
        }}
      >
        {getTranslation("seo.brandNameShort", "ar")}
      </div>

      <div
        style={{
          fontSize: "28px",
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "24px",
          display: "flex",
        }}
      >
        {getTranslation("seo.brandNameLatin", "en")}
      </div>

      <div
        style={{
          fontSize: "24px",
          color: "rgba(255, 255, 255, 0.8)",
          textAlign: "center",
          maxWidth: "700px",
          display: "flex",
        }}
      >
        {getTranslation("seo.heroTagline", "ar")}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "4px",
          background: "linear-gradient(90deg, #60a5fa, #ffffff, #60a5fa)",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          fontSize: "18px",
          color: "rgba(255, 255, 255, 0.6)",
          display: "flex",
        }}
      >
        clinics-eg.com
      </div>
    </div>,
    {
      ...size,
    },
  );
}
