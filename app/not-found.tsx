import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-9xl font-bold text-primary-200 dark:text-primary-800">404</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          الصفحة غير موجودة
        </h1>
        <p className="text-muted-foreground mb-6">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="h-4 w-4 ms-2" />
              الصفحة الرئيسية
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/doctors">
              <Search className="h-4 w-4 ms-2" />
              ابحث عن طبيب
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
