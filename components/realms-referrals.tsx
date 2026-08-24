'use client'

import { useEffect, useState } from 'react'
import { Gift, Link2, Users } from 'lucide-react'
import { adminApi, type ReferralStats } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { KPICard } from '@/components/kpi-cards'

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase()
}

function compact(value: string | number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function RealmsReferrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    adminApi
      .getReferrals({ page })
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load referrals.'))
      .finally(() => setLoading(false))
  }, [page])

  const rows = stats?.items ?? []
  const hasMore = rows.length === (stats?.pageSize ?? 20)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading && !stats ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-4 h-8 w-24" />
            </div>
          ))
        ) : (
          <>
            <KPICard
              title="Accounts referred"
              value={compact(stats?.totals.totalReferred ?? 0)}
              icon={<Users className="size-4" />}
            />
            <KPICard
              title="Bonuses paid"
              value={compact(stats?.totals.bonusesPaid ?? 0)}
              icon={<Gift className="size-4" />}
            />
            <KPICard
              title="Points paid out"
              value={compact(stats?.totals.pointsPaid ?? 0)}
              icon={<Link2 className="size-4" />}
            />
          </>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top referrers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !stats ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nobody has referred anyone yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Referrer</th>
                    <th className="px-4 py-3 text-left font-semibold">Invite code</th>
                    <th className="px-4 py-3 text-center font-semibold">Signed up</th>
                    <th className="px-4 py-3 text-center font-semibold">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((person) => (
                    <tr key={person.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
                            <AvatarFallback>{initials(person.displayName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{person.displayName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              @{person.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {person.referralCode.slice(0, 12)}…
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">{person.referredCount}</td>
                      <td className="px-4 py-3 text-center">
                        {/* Only verified invitees are worth a bonus, so the two
                            numbers are shown side by side rather than merged. */}
                        <Badge variant={person.verifiedCount > 0 ? 'default' : 'secondary'}>
                          {person.verifiedCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(page > 1 || hasMore) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={!hasMore} onClick={() => setPage((n) => n + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
