'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Specialty, State, City } from '@/types';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';

export interface DoctorFilters {
  search?: string;
  specialtyId?: string;
  stateId?: string;
  cityId?: string;
  minRating?: number;
  sortBy?: 'rating' | 'experience' | 'price';
}

interface DoctorFiltersProps {
  filters: DoctorFilters;
  onFiltersChange: (filters: DoctorFilters) => void;
}

export function DoctorFiltersComponent({ filters, onFiltersChange }: DoctorFiltersProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch specialties and states on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialtiesRes, statesRes] = await Promise.all([
          apiGet<Specialty[]>(PUBLIC_ENDPOINTS.SPECIALTIES),
          apiGet<State[]>(PUBLIC_ENDPOINTS.STATES),
        ]);
        setSpecialties(specialtiesRes);
        setStates(statesRes);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (filters.stateId) {
      const fetchCities = async () => {
        try {
          const citiesRes = await apiGet<City[]>(
            `${PUBLIC_ENDPOINTS.CITIES}?stateId=${filters.stateId}`
          );
          setCities(citiesRes);
        } catch (error) {
          console.error('Failed to fetch cities:', error);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [filters.stateId]);

  const handleFilterChange = (key: keyof DoctorFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };

    // Clear city when state changes
    if (key === 'stateId') {
      newFilters.cityId = undefined;
    }

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const FiltersContent = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Input
          placeholder="ابحث عن طبيب..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          icon={<Search className="h-5 w-5" />}
          iconPosition="start"
          className="bg-white"
        />
      </div>

      {/* Specialty */}
      <Select
        value={filters.specialtyId || ''}
        onValueChange={(value) => handleFilterChange('specialtyId', value || undefined)}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="التخصص" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">كل التخصصات</SelectItem>
          {specialties.map((specialty) => (
            <SelectItem key={specialty.id} value={specialty.id}>
              {specialty.nameAr || specialty.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* State */}
      <Select
        value={filters.stateId || ''}
        onValueChange={(value) => handleFilterChange('stateId', value || undefined)}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="المحافظة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">كل المحافظات</SelectItem>
          {states.map((state) => (
            <SelectItem key={state.id} value={state.id}>
              {state.nameAr || state.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City */}
      <Select
        value={filters.cityId || ''}
        onValueChange={(value) => handleFilterChange('cityId', value || undefined)}
        disabled={!filters.stateId}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="المدينة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">كل المدن</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.nameAr || city.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Rating */}
      <Select
        value={filters.minRating?.toString() || ''}
        onValueChange={(value) => handleFilterChange('minRating', value ? Number(value) : undefined)}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="التقييم" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">كل التقييمات</SelectItem>
          <SelectItem value="4">4+ نجوم</SelectItem>
          <SelectItem value="3">3+ نجوم</SelectItem>
          <SelectItem value="2">2+ نجوم</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={filters.sortBy || ''}
        onValueChange={(value) => handleFilterChange('sortBy', value || undefined)}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="ترتيب حسب" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">الأكثر صلة</SelectItem>
          <SelectItem value="rating">الأعلى تقييماً</SelectItem>
          <SelectItem value="experience">الأكثر خبرة</SelectItem>
          <SelectItem value="price">السعر (الأقل)</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 ms-2" />
          مسح الفلاتر ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="mb-4 font-bold text-gray-900">تصفية النتائج</h3>
          <FiltersContent />
        </div>
      </div>

      {/* Mobile Filters Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowMobileFilters(true)}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>الفلاتر</span>
            {activeFiltersCount > 0 && (
              <Badge variant="primary" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">تصفية النتائج</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FiltersContent />
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                عرض النتائج
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
