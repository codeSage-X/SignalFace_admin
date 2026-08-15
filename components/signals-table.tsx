'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { adminApi, type AdminSignalRow } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateSignalSheet } from '@/components/create-signal-sheet'

type SignalType = 'bullish' | 'bearish'

const getType = (growthPct: string): SignalType => (Number(growthPct) >= 0 ? 'bullish' : 'bearish')

const getTypeIcon = (type: SignalType) =>
  type === 'bullish' ? (
    <TrendingUp className="size-4 text-green-600" />
  ) : (
    <TrendingDown className="size-4 text-red-600" />
  )

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'SUSPENDED':
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

const getPerformanceColor = (growthPct: number) => {
  if (growthPct > 10) return 'text-green-600 font-semibold'
  if (growthPct < -5) return 'text-red-600 font-semibold'
  return 'text-muted-foreground'
}

export function SignalsTable() {
  const [signals, setSignals] = useState<AdminSignalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | SignalType>('all')

  useEffect(() => {
    adminApi
      .getSignals()
      .then(setSignals)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredSignals = signals.filter(
    (signal) => filterType === 'all' || getType(signal.growthPct) === filterType,
  )

  const activeCount = signals.filter((s) => s.status === 'APPROVED').length
  const totalSubscribers = signals.reduce((sum, s) => sum + s.subscribers, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950 dark:to-blue-900">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Signals</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCount}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-950 dark:to-purple-900">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Signals</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{signals.length}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 dark:from-emerald-950 dark:to-emerald-900">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Total Subscribers</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalSubscribers.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All Signals
          </Button>
          <Button
            variant={filterType === 'bullish' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('bullish')}
            className={filterType === 'bullish' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Bullish
          </Button>
          <Button
            variant={filterType === 'bearish' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('bearish')}
            className={filterType === 'bearish' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Bearish
          </Button>
        </div>
        <CreateSignalSheet onCreated={(signal) => setSignals((prev) => [signal, ...prev])} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Signal Name</th>
              <th className="px-6 py-3 text-left font-semibold">Creator</th>
              <th className="px-6 py-3 text-center font-semibold">Type</th>
              <th className="px-6 py-3 text-right font-semibold">Price</th>
              <th className="px-6 py-3 text-right font-semibold">Performance</th>
              <th className="px-6 py-3 text-center font-semibold">Subscribers</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Placeholder rows rather than a single line of text, so the table
              // keeps its height and columns while loading instead of collapsing
              // and then jolting when the data lands.
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="mx-auto h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="mx-auto h-4 w-10" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                </tr>
              ))
            ) : filteredSignals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No signals found.
                </td>
              </tr>
            ) : (
              filteredSignals.map((signal) => {
                const type = getType(signal.growthPct)
                const growth = Number(signal.growthPct)
                return (
                  <tr key={signal.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{signal.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{signal.creatorName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {getTypeIcon(type)}
                        <span className="text-xs font-semibold uppercase">{type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${Number(signal.price).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 text-right ${getPerformanceColor(growth)}`}>
                      {growth > 0 ? '+' : ''}
                      {growth.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center">{signal.subscribers.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(signal.status)}`}
                      >
                        {signal.status.charAt(0) + signal.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredSignals.length} of {signals.length} signals
      </div>
    </div>
  )
}
