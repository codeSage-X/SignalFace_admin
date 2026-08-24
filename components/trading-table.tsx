'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Search } from 'lucide-react'
import { adminApi, type AdminTradeRow } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const DEBOUNCE_MS = 500

function money(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value
}

export function TradingTable() {
  const [rows, setRows] = useState<AdminTradeRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Searching the whole table server-side, debounced so typing isn't a request
  // per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(draft.trim())
      setPage(1)
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [draft])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getTrades({ q: query || undefined, page })
      setRows(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load trades.')
    } finally {
      setLoading(false)
    }
  }, [query, page])

  useEffect(() => {
    load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(total / 20))
  const from = total === 0 ? 0 : (page - 1) * 20 + 1
  const to = Math.min(page * 20, total)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search by trader or creator"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {loading ? '—' : total === 0 ? 'No trades' : `Showing ${from}–${to} of ${total}`}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Trader</th>
              <th className="px-6 py-3 text-left font-semibold">Signal</th>
              <th className="px-6 py-3 text-center font-semibold">Side</th>
              <th className="px-6 py-3 text-right font-semibold">Quantity</th>
              <th className="px-6 py-3 text-right font-semibold">Price</th>
              <th className="px-6 py-3 text-right font-semibold">Total</th>
              <th className="px-6 py-3 text-left font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
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
                  {query ? 'No trades match that search.' : 'No trades yet.'}
                </td>
              </tr>
            ) : (
              rows.map((trade) => (
                <tr key={trade.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">@{trade.user.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{trade.signalName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                        {trade.side === 'BUY' ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
                        {trade.side}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">{money(trade.quantity)}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{money(trade.pricePerUnit)}</td>
                  <td className="px-6 py-4 text-right font-semibold tabular-nums">
                    {money(trade.totalPoints)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleString()}
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
