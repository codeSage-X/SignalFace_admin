'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/kpi-cards'
import { ActivityFeed } from '@/components/activity-feed'
import { GrowthChart, TradeVolumeChart } from '@/components/dashboard-charts'
import { adminApi, type OverviewData } from '@/lib/api'
import { Users, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react'

export default function OverviewPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)

  useEffect(() => {
    adminApi.getOverview().then(setOverview).catch(() => {})
  }, [])

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
