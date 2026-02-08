"use client";

import { GuestRoute } from "@/lib/auth";
import { Header } from "@/components/common";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <div className="min-h-screen bg-background">
        <Header variant="auth" />

        {/* Main Content */}
        <main className="flex min-h-screen items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-2xl bg-card p-8 shadow-xl border border-border">
              {children}
            </div>
          </div>
        </main>

        {/* Background Decoration */}
        <div className="fixed -bottom-40 -start-40 -z-10 h-96 w-96 rounded-full bg-primary-100 dark:bg-primary-900/30 opacity-50 blur-3xl" />
        <div className="fixed -top-40 -end-40 -z-10 h-96 w-96 rounded-full bg-secondary-100 dark:bg-secondary-900/30 opacity-50 blur-3xl" />
      </div>
    </GuestRoute>
  );
}
