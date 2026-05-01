import { NextResponse } from "next/server";

// Cheap, deterministic health probe. Used by uptime monitors (BetterUptime,
// UptimeRobot, Vercel monitors). Does NOT call the backend — the frontend's
// only "readiness" signal is "did the deploy succeed and is the runtime
// serving requests". Backend health belongs to a separate /api/health on the
// backend repo.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      buildTime: process.env.VERCEL_GIT_COMMIT_DATE ?? null,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
