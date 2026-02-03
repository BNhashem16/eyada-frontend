'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  CalendarIcon,
  User,
  Loader2,
  Plus,
  AlertCircle,
  ArrowRight,
  Building2,
  Stethoscope,
  Phone,
  Cake,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { useSecretaryClinics, useCreateAppointment } from '@/features/secretary';
import { useClinicServices } from '@/features/clinics/hooks/use-clinics';

export default function NewAppointmentPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [patientName, setPatientName] = useState<string>('');
  const [patientDateOfBirth, setPatientDateOfBirth] = useState<Date | undefined>();
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');

  // Success dialog state
  const [successData, setSuccessData] = useState<{
    bookingNumber: string;
    queueNumber: number;
  } | null>(null);

  // Data fetching
  const { data: clinics, isLoading: clinicsLoading } = useSecretaryClinics();
  const { data: services, isLoading: servicesLoading } = useClinicServices(selectedClinic);

  const createAppointment = useCreateAppointment();

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setSelectedService('');
    setSelectedDate(undefined);
  }, [selectedClinic]);

  const selectedClinicData = clinics?.find((c) => c.id === selectedClinic);
  const selectedServiceData = services?.find((s) => s.id === selectedService);

  const canSubmit =
    selectedClinic &&
    selectedService &&
    selectedDate &&
    patientName.trim().length >= 2 &&
    patientDateOfBirth;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const result = await createAppointment.mutateAsync({
        clinicId: selectedClinic,
        serviceTypeId: selectedService,
        appointmentDate: format(selectedDate!, 'yyyy-MM-dd'),
        patientName: patientName.trim(),
        patientDateOfBirth: format(patientDateOfBirth!, 'yyyy-MM-dd'),
        patientPhone: patientPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
      });

      // Show success dialog with booking info
      setSuccessData({
        bookingNumber: result.data?.bookingNumber || result.bookingNumber,
        queueNumber: result.data?.queueNumber || result.queueNumber,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('errors.somethingWentWrong');
      toast({
        title: t('toast.error'),
        description: errorMessage,
        variant: 'error',
      });
    }
  };

  const trackingUrl = successData
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/track/${successData.bookingNumber}`
    : '';

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: t('toast.success'),
      description: t('secretary.linkCopied'),
      variant: 'success',
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('secretary.bookAppointment')}</h1>
            <p className="text-muted-foreground">{t('secretary.bookAppointmentDesc')}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowRight className="h-4 w-4 ms-2" />
          {t('common.back')}
        </Button>
      </div>

      {/* No Clinics Warning */}
      {!clinicsLoading && (!clinics || clinics.length === 0) && (
        <Alert className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">{t('secretary.noClinicsAssigned')}</p>
            <p className="text-sm text-muted-foreground">{t('secretary.contactAdmin')}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t('secretary.patientInfo')}
              </CardTitle>
              <CardDescription>
                {t('secretary.walkInPatientHint')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Name */}
              <div className="space-y-2">
                <Label htmlFor="patientName">{t('auth.fullName')} *</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="ps-9"
                  />
                </div>
              </div>

              {/* Patient Date of Birth */}
              <div className="space-y-2">
                <Label>{t('patient.dateOfBirth')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start',
                        !patientDateOfBirth && 'text-muted-foreground'
                      )}
                    >
                      <Cake className="me-2 h-4 w-4" />
                      {patientDateOfBirth
                        ? format(patientDateOfBirth, 'dd MMMM yyyy', { locale: ar })
                        : t('patient.dateOfBirth')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={patientDateOfBirth}
                      onSelect={setPatientDateOfBirth}
                      disabled={(date) => date > new Date()}
                      defaultMonth={new Date(1990, 0)}
                      captionLayout="dropdown"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {patientDateOfBirth && (
                  <p className="text-sm text-muted-foreground">
                    {t('family.age')}: {calculateAge(patientDateOfBirth)} {t('family.yearsOld')}
                  </p>
                )}
              </div>

              {/* Patient Phone (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="patientPhone">{t('auth.phoneNumber')} ({t('common.optional')})</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patientPhone"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="01012345678"
                    className="ps-9"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic & Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t('secretary.clinicAndService')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('secretary.selectClinic')} *</Label>
                  <SearchableSelect
                    options={clinics?.map((clinic) => ({
                      value: clinic.id,
                      label: getLocalizedText(clinic.name, locale),
                      icon: <Building2 className="h-4 w-4" />,
                    })) || []}
                    value={selectedClinic}
                    onValueChange={setSelectedClinic}
                    placeholder={t('secretary.selectClinic')}
                    searchPlaceholder={t('common.search')}
                    emptyMessage={t('common.noResults')}
                    loading={clinicsLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('secretary.selectService')} *</Label>
                  <SearchableSelect
                    options={services?.filter((s) => s.isActive).map((service) => ({
                      value: service.id,
                      label: `${getLocalizedText(service.name, locale)} - ${service.price} ${t('common.egp')}`,
                      description: service.duration ? `${service.duration} ${t('services.minute')}` : undefined,
                      icon: <Stethoscope className="h-4 w-4" />,
                    })) || []}
                    value={selectedService}
                    onValueChange={setSelectedService}
                    placeholder={t('secretary.selectService')}
                    searchPlaceholder={t('common.search')}
                    emptyMessage={servicesLoading ? t('common.loading') : t('clinics.noServicesAvailable')}
                    disabled={!selectedClinic}
                    loading={servicesLoading}
                  />
                </div>
              </div>

              {selectedServiceData && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium">{getLocalizedText(selectedServiceData.name, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary-600">
                        {selectedServiceData.price} {t('common.egp')}
                      </Badge>
                      <Badge variant="outline">
                        {selectedServiceData.duration} {t('services.minute')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t('secretary.selectDate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>{t('appointments.date')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start',
                        !selectedDate && 'text-muted-foreground'
                      )}
                      disabled={!selectedClinic}
                    >
                      <CalendarIcon className="me-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, 'dd MMMM yyyy', { locale: ar })
                        : t('secretary.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('secretary.additionalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">{t('appointments.symptoms')}</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSymptoms(e.target.value)}
                  placeholder={t('secretary.symptomsPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('appointments.notes')}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder={t('secretary.notesPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">{t('secretary.bookingSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Name */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('auth.fullName')}</span>
                <span className="font-medium text-sm">
                  {patientName.trim() || '-'}
                </span>
              </div>

              {/* Patient Age */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('family.age')}</span>
                <span className="font-medium text-sm">
                  {patientDateOfBirth ? `${calculateAge(patientDateOfBirth)} ${t('family.yearsOld')}` : '-'}
                </span>
              </div>

              {/* Clinic */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('appointments.clinic')}</span>
                <span className="font-medium text-sm">
                  {selectedClinicData ? getLocalizedText(selectedClinicData.name, locale) : '-'}
                </span>
              </div>

              {/* Service */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('appointments.service')}</span>
                <span className="font-medium text-sm">
                  {selectedServiceData ? getLocalizedText(selectedServiceData.name, locale) : '-'}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('appointments.date')}</span>
                <span className="font-medium text-sm">
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '-'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{t('appointments.price')}</span>
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                  {selectedServiceData ? `${selectedServiceData.price} ${t('common.egp')}` : '-'}
                </span>
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!canSubmit || createAppointment.isPending}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 me-2" />
                    {t('secretary.confirmBooking')}
                  </>
                )}
              </Button>

              {!canSubmit && (
                <p className="text-xs text-center text-muted-foreground">
                  {t('booking.selectAllRequired')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t('secretary.bookingSuccess')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('booking.bookingSuccessDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Booking Number */}
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t('appointments.bookingNumber')}
              </p>
              <p className="font-mono text-xl font-bold text-primary">
                {successData?.bookingNumber}
              </p>
            </div>

            {/* Queue Number */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t('appointments.queueNumber')}
              </p>
              <p className="text-3xl font-bold text-primary">
                {successData?.queueNumber}
              </p>
            </div>

            {/* Tracking Link */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {t('secretary.trackingLinkHint')}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={trackingUrl}
                  readOnly
                  className="font-mono text-sm"
                  dir="ltr"
                />
                <Button variant="outline" size="icon" onClick={copyTrackingLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 me-2" />
                {t('secretary.openTrackingPage')}
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccessData(null);
                router.push('/secretary/appointments');
              }}
            >
              {t('secretary.goToAppointments')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
