"use client";

import { useEffect } from "react";

// Last-resort error boundary. Renders when the root layout itself fails to
// render — at that point we cannot use the project's UI components or i18n
// runtime because providers haven't mounted. Plain HTML with inline styling
// keeps this resilient under broken dependency graphs.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    let cancelled = false;
    void import("@sentry/nextjs")
      .then((Sentry) => {
        if (cancelled) return;
        Sentry.captureException(error, {
          tags: { surface: "global-error", digest: error.digest },
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#f9fafb",
          color: "#111827",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
          حدث خطأ غير متوقع — Unexpected error
        </h1>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          نعتذر عن هذا الخطأ. يرجى إعادة تحميل الصفحة. — Please reload the page.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#0ea5e9",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          العودة للصفحة الرئيسية / Go home
        </a>
      </body>
    </html>
  );
}
