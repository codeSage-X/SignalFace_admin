'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, X, Ban, Loader2, RotateCcw } from 'lucide-react'
import { adminApi, type AdminRealmRow, type RealmStatus } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const FILTERS: { label: string; value: RealmStatus | 'ALL' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'All', value: 'ALL' },
]

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase()
}

function statusVariant(status: RealmStatus) {
  if (status === 'APPROVED') return 'default'
  if (status === 'PENDING') return 'secondary'
  return 'destructive'
}

export function CreatorApprovalsTable() {
  const [filter, setFilter] = useState<RealmStatus | 'ALL'>('PENDING')
  const [rows, setRows] = useState<AdminRealmRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getRealms({
        status: filter === 'ALL' ? undefined : filter,
        page,
      })
      setRows(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load creator pages.')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    load()
  }, [load])

  const act = async (id: string, status: RealmStatus) => {
    setPending(id)
    try {
      await adminApi.setRealmStatus(id, { status })
      // Refetched rather than patched locally: approving also changes the owner's
      // role and creatorStatus, so the row is more than its own status.
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update that page.')
    } finally {
      setPending(null)
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'default' : 'outline'}
            onClick={() => {
              setFilter(f.value)
              setPage(1)
            }}
          >
            {f.label}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {loading ? '—' : `${total} page${total === 1 ? '' : 's'}`}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Creator page</th>
              <th className="px-6 py-3 text-left font-semibold">Owner</th>
              <th className="px-6 py-3 text-left font-semibold">Category</th>
              <th className="px-6 py-3 text-center font-semibold">Posts</th>
              <th className="px-6 py-3 text-center font-semibold">Followers</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                  No creator pages with this status.
                </td>
              </tr>
            ) : (
              rows.map((realm) => (
                <tr key={realm.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {realm.iconUrl && <AvatarImage src={realm.iconUrl} alt="" />}
                        <AvatarFallback>{initials(realm.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{realm.name}</p>
                        <p className="text-xs text-muted-foreground truncate">/{realm.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">@{realm.owner.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{realm.category}</td>
                  <td className="px-6 py-4 text-center">{realm.postsCount}</td>
                  <td className="px-6 py-4 text-center">{realm.followersCount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant(realm.status)}>{realm.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {pending === realm.id ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : realm.status === 'APPROVED' ? (
                        <Button size="sm" variant="outline" onClick={() => act(realm.id, 'SUSPENDED')}>
                          <Ban className="size-3.5" />
                          Suspend
                        </Button>
                      ) : realm.status === 'PENDING' ? (
                        <>
                          <Button size="sm" onClick={() => act(realm.id, 'APPROVED')}>
                            <Check className="size-3.5" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => act(realm.id, 'REJECTED')}>
                            <X className="size-3.5" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => act(realm.id, 'APPROVED')}>
                          <RotateCcw className="size-3.5" />
                          Reinstate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((n) => n + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
