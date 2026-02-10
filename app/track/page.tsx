import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { TrackPageContent } from "@/components/track/track-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.track.title"),
  description: getTranslation("meta.track.description"),
  openGraph: {
    title: getTranslation("meta.track.title"),
    description: getTranslation("meta.track.description"),
    url: "https://clinics-eg.com/track",
  },
  alternates: {
    canonical: "https://clinics-eg.com/track",
  },
};

export default function TrackPage() {
  return <TrackPageContent />;
}
