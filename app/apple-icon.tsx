import { ImageResponse } from "next/og";
import { getTranslation } from "@/lib/i18n";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function Icon() {
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
        borderRadius: "36px",
      }}
    >
      <div
        style={{
          fontSize: "80px",
          color: "white",
          fontWeight: "bold",
          marginBottom: "-10px",
          display: "flex",
        }}
      >
        +
      </div>
      <div
        style={{
          fontSize: "28px",
          color: "rgba(255, 255, 255, 0.9)",
          fontWeight: "bold",
          display: "flex",
        }}
      >
        {getTranslation("seo.brandNameShort", "ar")}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
