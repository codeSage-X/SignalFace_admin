'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAdminAuth } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAdminAuth((s) => s.hasHydrated);
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
  const role = useAdminAuth((s) => s.user?.role);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, role, router]);

  if (!hasHydrated || !isAuthenticated || role !== 'ADMIN') {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
