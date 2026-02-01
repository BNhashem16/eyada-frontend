'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

// Import and re-export from hook for consistency
import type { ClinicFilters } from '../hooks/use-clinics';
export type { ClinicFilters };

interface ClinicFiltersProps {
  filters: ClinicFilters;
  onFiltersChange: (filters: ClinicFilters) => void;
}

export function ClinicFiltersComponent({ filters, onFiltersChange }: ClinicFiltersProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch specialties and states on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialtiesRes, statesRes] = await Promise.all([
          apiGet<{ data: Specialty[] } | Specialty[]>(PUBLIC_ENDPOINTS.SPECIALTIES),
          apiGet<{ data: State[] } | State[]>(PUBLIC_ENDPOINTS.STATES),
        ]);
        // Handle both { data: [...] } and [...] response formats
        setSpecialties(Array.isArray(specialtiesRes) ? specialtiesRes : specialtiesRes.data || []);
        setStates(Array.isArray(statesRes) ? statesRes : statesRes.data || []);
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
          const citiesRes = await apiGet<{ data: City[] } | City[]>(
            `${PUBLIC_ENDPOINTS.CITIES}?stateId=${filters.stateId}`
          );
          setCities(Array.isArray(citiesRes) ? citiesRes : citiesRes.data || []);
        } catch (error) {
          console.error('Failed to fetch cities:', error);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [filters.stateId]);

  const handleFilterChange = (key: keyof ClinicFilters, value: string | boolean | number | undefined) => {
    const newFilters = { ...filters, [key]: value };

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
          placeholder="ابحث عن عيادة..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          icon={<Search className="h-5 w-5" />}
          iconPosition="start"
          className="bg-background"
        />
      </div>

      {/* Specialty */}
      <Select
        value={filters.specialtyId || 'all'}
        onValueChange={(value) => handleFilterChange('specialtyId', value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="التخصص" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل التخصصات</SelectItem>
          {specialties.map((specialty) => (
            <SelectItem key={specialty.id} value={specialty.id}>
              {specialty.name?.ar || specialty.name?.en || (specialty as any).nameAr || (specialty as any).nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* State */}
      <Select
        value={filters.stateId || 'all'}
        onValueChange={(value) => handleFilterChange('stateId', value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="المحافظة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل المحافظات</SelectItem>
          {states.map((state) => (
            <SelectItem key={state.id} value={state.id}>
              {state.name?.ar || state.name?.en || (state as any).nameAr || (state as any).nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City */}
      <Select
        value={filters.cityId || 'all'}
        onValueChange={(value) => handleFilterChange('cityId', value === 'all' ? undefined : value)}
        disabled={!filters.stateId}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="المدينة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل المدن</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.name?.ar || city.name?.en || (city as any).nameAr || (city as any).nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Rating */}
      <Select
        value={filters.minRating?.toString() || 'all'}
        onValueChange={(value) => handleFilterChange('minRating', value === 'all' ? undefined : Number(value))}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="التقييم" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل التقييمات</SelectItem>
          <SelectItem value="4">4+ نجوم</SelectItem>
          <SelectItem value="3">3+ نجوم</SelectItem>
          <SelectItem value="2">2+ نجوم</SelectItem>
        </SelectContent>
      </Select>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">نطاق السعر (ج.م)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="من"
            value={filters.priceMin || ''}
            onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
            className="bg-background"
          />
          <Input
            type="number"
            placeholder="إلى"
            value={filters.priceMax || ''}
            onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
            className="bg-background"
          />
        </div>
      </div>

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
        <div className="sticky top-24 rounded-xl border border-border bg-muted p-5">
          <h3 className="mb-4 font-bold text-foreground">تصفية النتائج</h3>
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
              <Badge variant="default" className="text-xs">
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
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-card p-5 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-foreground">تصفية النتائج</h3>
              <Button
                variant="ghost"
                className="text-xs"
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
