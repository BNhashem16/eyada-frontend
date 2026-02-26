import { Metadata } from "next";
import { AdminNewAppointmentContent } from "./page-content";

export const metadata: Metadata = {
  title: "Book Appointment | Admin",
  robots: { index: false, follow: false },
};

export default function AdminNewAppointmentPage() {
  return <AdminNewAppointmentContent />;
}
