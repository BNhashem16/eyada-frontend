import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { TrackDetailsContent } from "@/components/track/track-details-content";

export const metadata: Metadata = {
  title: getTranslation("meta.trackDetails.title"),
  description: getTranslation("meta.trackDetails.description"),
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackQueuePage() {
  return <TrackDetailsContent />;
}
