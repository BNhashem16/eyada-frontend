import { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { ClinicList } from '@/features/clinics';

export const metadata: Metadata = {
  title: 'ابحث عن عيادة',
  description: 'ابحث عن أفضل العيادات في مصر واحجز موعدك الآن',
};

export default function ClinicsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ابحث عن عيادة</h1>
        </div>
        <p className="text-muted-foreground">
          اعثر على أقرب عيادة إليك واحجز موعدك بسهولة
        </p>
      </div>

      {/* Clinic List with Filters */}
      <ClinicList />
    </div>
  );
}
