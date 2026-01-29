import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { GuestRoute } from '@/lib/auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="absolute top-0 w-full p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-700">عيادة</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex min-h-screen items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              {children}
            </div>
          </div>
        </main>

        {/* Background Decoration */}
        <div className="fixed -bottom-40 -start-40 -z-10 h-96 w-96 rounded-full bg-primary-100 opacity-50 blur-3xl" />
        <div className="fixed -top-40 -end-40 -z-10 h-96 w-96 rounded-full bg-secondary-100 opacity-50 blur-3xl" />
      </div>
    </GuestRoute>
  );
}
