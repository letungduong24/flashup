'use client';

import AuthGuard from '@/components/auth-guard';
import { DashboardLayout } from './dashboard-layout';

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/signin">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}

