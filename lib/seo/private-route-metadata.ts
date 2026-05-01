import type { Metadata } from "next";

// Defense-in-depth alongside the X-Robots-Tag header set in middleware.ts and
// the disallow rules in robots.txt. Authenticated dashboards must never be
// surfaced in any search index.
export const privateRouteMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
