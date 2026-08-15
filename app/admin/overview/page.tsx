'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/kpi-cards'
import { ActivityFeed } from '@/components/activity-feed'
import { GrowthChart, TradeVolumeChart } from '@/components/dashboard-charts'
import { adminApi, type OverviewData } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react'

/**
 * Stands in for the whole dashboard while it loads, laid out exactly like the
 * real thing — four KPI cards, two charts, an activity list. Previously the page
 * rendered em-dashes and empty charts, which looked like a dashboard reporting
 * that everything was zero rather than one that hadn't loaded.
 */
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="mt-4 h-8 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-6 h-[240px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-6">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getOverview()
      .then(setOverview)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <OverviewSkeleton />


  const walletVolumeDisplay = overview
    ? `$${(Number(overview.walletVolume) / 1_000_000).toFixed(1)}M`
    : '—'

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={overview?.totalUsers ?? '—'}
          icon={<Users className="size-4" />}
        />
        <KPICard
          title="Active Creators"
          value={overview?.activeCreators ?? '—'}
          icon={<TrendingUp className="size-4" />}
        />
        <KPICard
          title="Active Signals"
          value={overview?.activeSignals ?? '—'}
          icon={<CheckCircle2 className="size-4" />}
        />
        <KPICard title="Wallet Volume" value={walletVolumeDisplay} icon={<Wallet className="size-4" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={overview?.platformGrowth ?? []} />
        <TradeVolumeChart data={overview?.weeklyTradeVolume ?? []} />
      </div>

      {/* Activity Feed */}
      <div>
        <ActivityFeed items={overview?.recentActivity ?? []} />
      </div>
    </div>
  )
}
