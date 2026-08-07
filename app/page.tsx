'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/store';

export default function Page() {
  const router = useRouter();
  const hasHydrated = useAdminAuth((s) => s.hasHydrated);
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(isAuthenticated ? '/admin/overview' : '/login');
  }, [hasHydrated, isAuthenticated, router]);

  return null;
}
