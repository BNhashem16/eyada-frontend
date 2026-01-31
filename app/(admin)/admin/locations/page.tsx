import { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { LocationsManagement } from '@/features/admin';

export const metadata: Metadata = {
  title: 'إدارة المواقع - الإدارة',
  description: 'إدارة المحافظات والمدن',
};

export default function AdminLocationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المواقع</h1>
            <p className="text-gray-500">إدارة المحافظات والمدن في النظام</p>
          </div>
        </div>
      </div>

      {/* Locations Management */}
      <LocationsManagement />
    </div>
  );
}
