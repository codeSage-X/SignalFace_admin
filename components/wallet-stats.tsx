'use client'

import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, Users, Activity } from 'lucide-react'
import { adminApi, type WalletStats as Stats } from '@/lib/api'
import { KPICard } from '@/components/kpi-cards'
import { Skeleton } from '@/components/ui/skeleton'

function compact(value: string | number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function WalletStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getWalletStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Points in circulation"
        value={compact(stats?.circulatingPoints ?? 0)}
        icon={<Wallet className="size-4" />}
      />
      <KPICard
        title="Total volume"
        value={compact(stats?.totalVolume ?? 0)}
        icon={<TrendingUp className="size-4" />}
      />
      <KPICard
        title="Volume (24h)"
        value={compact(stats?.volume24h ?? 0)}
        icon={<Activity className="size-4" />}
      />
      <KPICard
        title="Holders"
        value={(stats?.holders ?? 0).toLocaleString()}
        icon={<Users className="size-4" />}
      />
    </div>
  )
}
