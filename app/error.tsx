'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-error-600 dark:text-error-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-muted-foreground mb-6">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 ms-2" />
            حاول مرة أخرى
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 ms-2" />
              الصفحة الرئيسية
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-muted rounded-lg text-start">
            <p className="text-xs font-mono text-error-600 dark:text-error-400 break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
