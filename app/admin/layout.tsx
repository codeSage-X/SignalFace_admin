'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useSessionKeepalive } from '@/hooks/use-session-keepalive';
import { useAdminAuth } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAdminAuth((s) => s.hasHydrated);
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
  const role = useAdminAuth((s) => s.user?.role);

  // Renews the access token ahead of its hourly expiry for as long as any admin
  // page is mounted, so a long session never has to fail a request first.
  useSessionKeepalive();

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
