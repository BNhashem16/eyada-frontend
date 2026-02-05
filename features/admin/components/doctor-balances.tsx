'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Frown,
  Loader2,
  Eye,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Calendar,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDoctorBalances,
  useBalanceSummary,
  useRecordPayment,
  DoctorBalance,
  DateFilterPeriod,
} from '../hooks';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { useTranslation } from '@/lib/i18n';

interface PaymentFormData {
  doctorProfileId: string;
  doctorName: string;
  balance: number;
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

const initialPaymentData: PaymentFormData = {
  doctorProfileId: '',
  doctorName: '',
  balance: 0,
  amount: '',
  paymentMethod: '',
  referenceNumber: '',
  notes: '',
};

const periodOptions: { value: DateFilterPeriod; label: string }[] = [
  { value: 'TODAY', label: 'admin.collections.today' },
  { value: 'THIS_WEEK', label: 'admin.collections.thisWeek' },
  { value: 'THIS_MONTH', label: 'admin.collections.thisMonth' },
  { value: 'THIS_YEAR', label: 'admin.collections.thisYear' },
  { value: 'CUSTOM', label: 'admin.collections.custom' },
];

export function DoctorBalances() {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [period, setPeriod] = useState<DateFilterPeriod | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasBalance, setHasBalance] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    search,
    period,
    dateFrom: period === 'CUSTOM' ? dateFrom : undefined,
    dateTo: period === 'CUSTOM' ? dateTo : undefined,
    hasBalance,
  };

  const { data: balancesResponse, isLoading, isError } = useDoctorBalances(filters);
  const balances = balancesResponse?.data || [];
  const { data: summary } = useBalanceSummary(filters);

  const recordPayment = useRecordPayment();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData>(initialPaymentData);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleOpenPayment = (doctor: DoctorBalance) => {
    setPaymentData({
      doctorProfileId: doctor.doctorProfileId,
      doctorName: doctor.doctorName,
      balance: doctor.balance,
      amount: doctor.balance.toString(),
      paymentMethod: '',
      referenceNumber: '',
      notes: '',
    });
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) return;

    recordPayment.mutate(
      {
        doctorProfileId: paymentData.doctorProfileId,
        amount,
        paymentMethod: paymentData.paymentMethod || undefined,
        referenceNumber: paymentData.referenceNumber || undefined,
        notes: paymentData.notes || undefined,
      },
      {
        onSuccess: () => {
          setIsPaymentDialogOpen(false);
          setPaymentData(initialPaymentData);
        },
      }
    );
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${t('common.currency')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">{t('errors.loadError')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.collections.totalDoctors')}</p>
                <p className="text-2xl font-bold">{summary?.totalDoctors || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.collections.totalCommission')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.totalCommission || 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.collections.totalPaid')}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.totalPaid || 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.collections.totalBalance')}</p>
                <p className="text-2xl font-bold text-warning-600">{formatCurrency(summary?.totalBalance || 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder={t('admin.collections.searchDoctor')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Select
                value={period || 'all'}
                onValueChange={(value) => setPeriod(value === 'all' ? undefined : value as DateFilterPeriod)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.collections.period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.collections.allTime')}</SelectItem>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={hasBalance === undefined ? 'all' : hasBalance ? 'true' : 'false'}
                onValueChange={(value) =>
                  setHasBalance(value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.collections.balanceFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.collections.all')}</SelectItem>
                  <SelectItem value="true">{t('admin.collections.withBalance')}</SelectItem>
                  <SelectItem value="false">{t('admin.collections.noBalance')}</SelectItem>
                </SelectContent>
              </Select>

              {period === 'CUSTOM' && (
                <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {period === 'CUSTOM' && showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <div className="flex-1">
                <Label>{t('admin.collections.dateFrom')}</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="flex-1">
                <Label>{t('admin.collections.dateTo')}</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balances Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('admin.collections.doctorBalances')} ({balances.length})
          </h3>

          {balances.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t('admin.collections.noBalances')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.collections.doctor')}</TableHead>
                  <TableHead>{t('admin.collections.specialty')}</TableHead>
                  <TableHead>{t('admin.collections.appointments')}</TableHead>
                  <TableHead>{t('admin.collections.totalCommission')}</TableHead>
                  <TableHead>{t('admin.collections.totalPaid')}</TableHead>
                  <TableHead>{t('admin.collections.balance')}</TableHead>
                  <TableHead>{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((doctor) => (
                  <TableRow key={doctor.doctorProfileId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doctor.doctorName}</p>
                        <p className="text-xs text-muted-foreground">{doctor.doctorPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getLocalizedText(doctor.specialtyName, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.appointmentsCount}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(doctor.totalCommission)}
                    </TableCell>
                    <TableCell className="text-purple-600">
                      {formatCurrency(doctor.totalPaid)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={doctor.balance > 0 ? 'warning' : 'success'}
                        className="font-bold"
                      >
                        {formatCurrency(doctor.balance)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/collections/${doctor.doctorProfileId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {doctor.balance > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                            onClick={() => handleOpenPayment(doctor)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.collections.recordPayment')}</DialogTitle>
            <DialogDescription>
              {t('admin.collections.recordPaymentDesc', { doctor: paymentData.doctorName })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('admin.collections.currentBalance')}</span>
                <span className="font-bold text-lg text-warning-600">
                  {formatCurrency(paymentData.balance)}
                </span>
              </div>
            </div>

            <div>
              <Label>{t('admin.collections.amount')} *</Label>
              <Input
                type="number"
                min="0"
                max={paymentData.balance}
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder={t('admin.collections.amountPlaceholder')}
                dir="ltr"
              />
            </div>

            <div>
              <Label>{t('admin.collections.paymentMethod')}</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) =>
                  setPaymentData((p) => ({ ...p, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.collections.selectMethod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">{t('admin.collections.cash')}</SelectItem>
                  <SelectItem value="BANK_TRANSFER">{t('admin.collections.bankTransfer')}</SelectItem>
                  <SelectItem value="WALLET">{t('admin.collections.wallet')}</SelectItem>
                  <SelectItem value="OTHER">{t('admin.collections.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('admin.collections.referenceNumber')}</Label>
              <Input
                value={paymentData.referenceNumber}
                onChange={(e) =>
                  setPaymentData((p) => ({ ...p, referenceNumber: e.target.value }))
                }
                placeholder={t('admin.collections.referencePlaceholder')}
                dir="ltr"
              />
            </div>

            <div>
              <Label>{t('admin.collections.notes')}</Label>
              <Textarea
                value={paymentData.notes}
                onChange={(e) =>
                  setPaymentData((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder={t('admin.collections.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={
                !paymentData.amount ||
                parseFloat(paymentData.amount) <= 0 ||
                parseFloat(paymentData.amount) > paymentData.balance ||
                recordPayment.isPending
              }
            >
              {recordPayment.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t('admin.collections.confirmPayment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
