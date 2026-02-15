export interface AdminDashboardStatistics {
  overview: {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    totalSecretaries: number;
    totalClinics: number;
    activeClinics: number;
    totalAppointments: number;
  };

  doctors: {
    byStatus: {
      pending: number;
      approved: number;
      rejected: number;
      suspended: number;
    };
    newThisMonth: number;
    averageRating: number;
    topSpecialties: Array<{
      specialtyId: string;
      specialtyName: { ar: string; en: string };
      count: number;
    }>;
  };

  patients: {
    byStatus: {
      pending: number;
      approved: number;
      rejected: number;
      suspended: number;
    };
    newThisMonth: number;
    byGender: {
      male: number;
      female: number;
      unknown: number;
    };
  };

  appointments: {
    byStatus: Array<{ status: string; count: number }>;
    byPaymentStatus: Array<{ status: string; count: number }>;
    todayTotal: number;
    thisMonthTotal: number;
  };

  revenue: {
    totalRevenue: number;
    thisMonthRevenue: number;
    paidRevenue: number;
    unpaidRevenue: number;
  };

  recentActivity: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    appointmentsToday: number;
    appointmentsThisWeek: number;
  };

  growth: {
    monthlyRegistrations: Array<{
      month: string;
      doctors: number;
      patients: number;
    }>;
    monthlyAppointments: Array<{
      month: string;
      total: number;
      completed: number;
      revenue: number;
    }>;
  };
}
