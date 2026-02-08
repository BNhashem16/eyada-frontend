'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, X, ChevronDown, Stethoscope, MapPin, Building2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Specialty, State, City } from '@/types';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { useTranslation } from '@/lib/i18n';

// Import and re-export from hook for consistency
import type { ClinicFilters } from '../hooks/use-clinics';
export type { ClinicFilters };

interface ClinicFiltersProps {
  filters: ClinicFilters;
  onFiltersChange: (filters: ClinicFilters) => void;
}

export function ClinicFiltersComponent({ filters, onFiltersChange }: ClinicFiltersProps) {
  const { t } = useTranslation();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Local state for inputs that should not trigger on every keystroke
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [priceMinInput, setPriceMinInput] = useState(filters.priceMin?.toString() || '');
  const [priceMaxInput, setPriceMaxInput] = useState(filters.priceMax?.toString() || '');

  // Sync local state with filters when they change externally
  useEffect(() => {
    setSearchInput(filters.search || '');
    setPriceMinInput(filters.priceMin?.toString() || '');
    setPriceMaxInput(filters.priceMax?.toString() || '');
  }, [filters.search, filters.priceMin, filters.priceMax]);

  const handleSearch = () => {
    handleFilterChange('search', searchInput || undefined);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePriceBlur = () => {
    const newFilters = { ...filters };
    newFilters.priceMin = priceMinInput ? Number(priceMinInput) : undefined;
    newFilters.priceMax = priceMaxInput ? Number(priceMaxInput) : undefined;
    onFiltersChange(newFilters);
  };

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
    setSearchInput('');
    setPriceMinInput('');
    setPriceMaxInput('');
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const filtersContent = (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder={t('clinics.searchClinicPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearch}
          inputMode="search"
          icon={<Search className="h-5 w-5" />}
          iconPosition="start"
          className="bg-background flex-1"
        />
        <Button onClick={handleSearch} variant="default" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Specialty */}
      <SearchableSelect
        options={[
          { value: '', label: t('doctors.allSpecialties'), icon: <Stethoscope className="h-4 w-4" /> },
          ...specialties.map((specialty) => ({
            value: specialty.id,
            label: specialty.name?.ar || specialty.name?.en || (specialty as any).nameAr || (specialty as any).nameEn || '',
            icon: <Stethoscope className="h-4 w-4" />,
          })),
        ]}
        value={filters.specialtyId || ''}
        onValueChange={(value) => handleFilterChange('specialtyId', value || undefined)}
        placeholder={t('doctors.filterBySpecialty')}
        searchPlaceholder={t('common.search')}
        emptyMessage={t('common.noResults')}
        className="bg-background"
      />

      {/* State */}
      <SearchableSelect
        options={[
          { value: '', label: t('doctors.allStates'), icon: <MapPin className="h-4 w-4" /> },
          ...states.map((state) => ({
            value: state.id,
            label: state.name?.ar || state.name?.en || (state as any).nameAr || (state as any).nameEn || '',
            icon: <MapPin className="h-4 w-4" />,
          })),
        ]}
        value={filters.stateId || ''}
        onValueChange={(value) => handleFilterChange('stateId', value || undefined)}
        placeholder={t('doctors.filterByState')}
        searchPlaceholder={t('common.search')}
        emptyMessage={t('common.noResults')}
        className="bg-background"
      />

      {/* City */}
      <SearchableSelect
        options={[
          { value: '', label: t('doctors.allCities'), icon: <Building2 className="h-4 w-4" /> },
          ...cities.map((city) => ({
            value: city.id,
            label: city.name?.ar || city.name?.en || (city as any).nameAr || (city as any).nameEn || '',
            icon: <Building2 className="h-4 w-4" />,
          })),
        ]}
        value={filters.cityId || ''}
        onValueChange={(value) => handleFilterChange('cityId', value || undefined)}
        placeholder={t('doctors.filterByCity')}
        searchPlaceholder={t('common.search')}
        emptyMessage={t('common.noResults')}
        disabled={!filters.stateId}
        className="bg-background"
      />

      {/* Rating */}
      <SearchableSelect
        options={[
          { value: '', label: t('doctors.allRatings'), icon: <Star className="h-4 w-4" /> },
          { value: '4', label: `4+ ${t('common.stars')}`, icon: <Star className="h-4 w-4 fill-warning-400 text-warning-400" /> },
          { value: '3', label: `3+ ${t('common.stars')}`, icon: <Star className="h-4 w-4 fill-warning-400 text-warning-400" /> },
          { value: '2', label: `2+ ${t('common.stars')}`, icon: <Star className="h-4 w-4 fill-warning-400 text-warning-400" /> },
        ]}
        value={filters.minRating?.toString() || ''}
        onValueChange={(value) => handleFilterChange('minRating', value ? Number(value) : undefined)}
        placeholder={t('doctors.filterByRating')}
        showSearch={false}
        className="bg-background"
      />

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">{t('common.priceRange')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={t('common.from')}
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
            onBlur={handlePriceBlur}
            className="bg-background"
          />
          <Input
            type="number"
            inputMode="decimal"
            placeholder={t('common.to')}
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            onBlur={handlePriceBlur}
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
          {t('common.clearFilters')} ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-muted p-5">
          <h3 className="mb-4 font-bold text-foreground">{t('common.filterResults')}</h3>
          {filtersContent}
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
            <span>{t('common.filters')}</span>
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
              <h3 className="font-bold text-foreground">{t('common.filterResults')}</h3>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {filtersContent}
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                {t('common.viewResults')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
