import { Metadata } from 'next';
import { Grid3X3 } from 'lucide-react';
import { SpecialtyList } from '@/features/specialties';

export const metadata: Metadata = {
  title: 'التخصصات الطبية',
  description: 'تصفح جميع التخصصات الطبية المتاحة واعثر على الطبيب المناسب',
};

export default function SpecialtiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Grid3X3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">التخصصات الطبية</h1>
        </div>
        <p className="text-muted-foreground">
          اختر التخصص المناسب للعثور على أفضل الأطباء
        </p>
      </div>

      {/* Specialties Grid */}
      <SpecialtyList />
    </div>
  );
}
