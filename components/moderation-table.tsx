'use client'

import { useCallback, useEffect, useState } from 'react'
import { EyeOff, Eye, Trash2, Loader2, Flag, MessageSquareWarning } from 'lucide-react'
import { adminApi, type AdminModerationRow, type PostModeration } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const TABS = [
  { label: 'Reported', value: 'open' },
  { label: 'Hidden', value: 'censored' },
  { label: 'Removed', value: 'removed' },
  { label: 'Appealed', value: 'appealed' },
]

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase()
}

export function ModerationTable() {
  const [tab, setTab] = useState('open')
  const [rows, setRows] = useState<AdminModerationRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getModeration({ status: tab, page })
      setRows(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the moderation queue.')
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => {
    load()
  }, [load])

  const act = async (id: string, moderation: PostModeration) => {
    // The author is shown this text, so hiding without a reason is refused by the
    // API — ask for it here rather than letting that come back as an error.
    let note: string | undefined
    if (moderation !== 'VISIBLE') {
      const reason = window.prompt(
        moderation === 'CENSORED'
          ? 'Why is this being hidden? The author will see this.'
          : 'Why is this being removed? The author will see this.',
        'Breaches our community guidelines',
      )
      if (!reason?.trim()) return
      note = reason.trim()
    }

    setPending(id)
    try {
      await adminApi.setPostModeration(id, { moderation, note })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update that post.')
    } finally {
      setPending(null)
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={tab === t.value ? 'default' : 'outline'}
            onClick={() => {
              setTab(t.value)
              setPage(1)
            }}
          >
            {t.label}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {loading ? '—' : `${total} item${total === 1 ? '' : 's'}`}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border py-16 text-center">
          <Flag className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-semibold">Nothing here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'open'
              ? 'No posts have open reports.'
              : 'No posts in this state.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((post) => (
            <div key={post.id} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-9">
                  {post.author.avatarUrl && <AvatarImage src={post.author.avatarUrl} alt="" />}
                  <AvatarFallback>{initials(post.author.displayName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">@{post.author.username}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                    {post.moderation !== 'VISIBLE' && (
                      <Badge variant="destructive">{post.moderation}</Badge>
                    )}
                    {post.reportCount > 0 && (
                      <Badge variant="secondary">
                        <Flag className="size-3" />
                        {post.reportCount}
                      </Badge>
                    )}
                  </div>

                  {post.body && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.body}</p>
                  )}

                  {post.mediaUrls.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.mediaUrls.length} attachment{post.mediaUrls.length === 1 ? '' : 's'}
                    </p>
                  )}

                  {post.reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.reasons.map((reason, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.moderationNote && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Reason given:</span> {post.moderationNote}
                    </p>
                  )}

                  {post.appealNote && (
                    <div className="mt-2 rounded-md bg-amber-500/10 px-3 py-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <MessageSquareWarning className="size-3.5" />
                        Author appealed
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{post.appealNote}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-col gap-2">
                  {pending === post.id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      {post.moderation === 'VISIBLE' ? (
                        <Button size="sm" variant="outline" onClick={() => act(post.id, 'CENSORED')}>
                          <EyeOff className="size-3.5" />
                          Hide
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => act(post.id, 'VISIBLE')}>
                          <Eye className="size-3.5" />
                          Restore
                        </Button>
                      )}
                      {post.moderation !== 'REMOVED' && (
                        <Button size="sm" variant="destructive" onClick={() => act(post.id, 'REMOVED')}>
                          <Trash2 className="size-3.5" />
                          Remove
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
