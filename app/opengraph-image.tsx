import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "عيادة - احجز موعدك مع أفضل الأطباء في مصر | Eyada - Book Doctor Appointments";
export const size = {
  width: 1200,
  height: 630,
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
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.03)",
          display: "flex",
        }}
      />

      {/* Medical cross icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100px",
          height: "100px",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.15)",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            fontSize: "60px",
            color: "white",
            fontWeight: "bold",
            display: "flex",
          }}
        >
          +
        </div>
      </div>

      {/* Arabic title */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "10px",
          display: "flex",
        }}
      >
        عيادة
      </div>

      {/* English subtitle */}
      <div
        style={{
          fontSize: "32px",
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "30px",
          display: "flex",
        }}
      >
        Eyada
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: "28px",
          color: "rgba(255, 255, 255, 0.8)",
          textAlign: "center",
          maxWidth: "800px",
          lineHeight: 1.5,
          display: "flex",
        }}
      >
        احجز موعدك مع أفضل الأطباء في مصر
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "6px",
          background: "linear-gradient(90deg, #60a5fa, #ffffff, #60a5fa)",
          display: "flex",
        }}
      />

      {/* Domain */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          fontSize: "20px",
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
