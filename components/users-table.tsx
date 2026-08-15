'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Ban,
  Check,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { adminApi, type AccountStatus, type AdminUserRow } from '@/lib/api'

const PAGE_SIZE = 20
// Long enough that typing a word is one request, short enough to feel live.
const SEARCH_DEBOUNCE_MS = 500

const getStatusColor = (status: AdminUserRow['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'unverified':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    case 'restricted':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
    case 'blocked':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTierBadgeColor = (tier: string) => {
  if (tier === 'Admin') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
  if (tier === 'Creator') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
  if (tier === 'Pro Trader') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  if (tier === 'Trader') return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
}

const formatBalance = (balance: string) =>
  `$${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function UsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // What is typed, and what has actually been searched for. They differ for the
  // length of the debounce.
  const [searchTerm, setSearchTerm] = useState('')
  const [query, setQuery] = useState('')

  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Debounce typing into the query that actually hits the API. Searching is
  // server-side now, so this is one request per pause rather than per keystroke
  // — and it searches every user, not just the page already downloaded.
  useEffect(() => {
    if (searchTerm.trim() === query) return

    const id = setTimeout(() => {
      setQuery(searchTerm.trim())
      // A new search invalidates whatever page you were on.
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(id)
  }, [searchTerm, query])

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    adminApi
      .getUsers({ q: query, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setUsers(res.items)
        setTotal(res.total)
        setPageCount(res.pageCount)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load users.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, page])

  useEffect(() => load(), [load])

  // Close the row menu on an outside click or Escape.
  useEffect(() => {
    if (!menuFor) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuFor(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuFor(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuFor])

  const applyStatus = async (user: AdminUserRow, status: AccountStatus) => {
    const verb = status === 'BLOCKED' ? 'block' : status === 'RESTRICTED' ? 'restrict' : 'reinstate'
    const reason =
      status === 'ACTIVE'
        ? undefined
        : (window.prompt(`Why are you about to ${verb} @${user.username}?`) ?? undefined)

    // A dismissed prompt means "changed my mind", not "no reason".
    if (status !== 'ACTIVE' && reason === undefined) return

    setMenuFor(null)
    setBusyId(user.id)
    try {
      const updated = await adminApi.setUserStatus(user.id, { status, reason })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : `Could not ${verb} that account.`)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (user: AdminUserRow) => {
    if (
      !window.confirm(
        `Permanently delete @${user.username}? Their posts, trades and holdings go with them. This cannot be undone.`,
      )
    ) {
      return
    }

    setMenuFor(null)
    setBusyId(user.id)
    try {
      await adminApi.deleteUser(user.id)
      // Refetch rather than splicing: the row count changed, so the page needs
      // to be refilled from the server.
      load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete that account.')
    } finally {
      setBusyId(null)
    }
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name, username or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Join Date</th>
              <th className="px-6 py-3 text-left font-semibold">Tier</th>
              <th className="px-6 py-3 text-right font-semibold">Trades</th>
              <th className="px-6 py-3 text-right font-semibold">Balance</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="ml-auto h-4 w-8" /></td>
                  <td className="px-6 py-4"><Skeleton className="ml-auto h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="mx-auto size-8 rounded" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  {query ? `No users match “${query}”.` : 'No users found.'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}
                      title={user.statusReason ?? undefined}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTierBadgeColor(user.tier)}`}
                    >
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">{user.trades}</td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatBalance(user.balance)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block" ref={menuFor === user.id ? menuRef : undefined}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={busyId === user.id}
                        onClick={() => setMenuFor((cur) => (cur === user.id ? null : user.id))}
                        aria-haspopup="menu"
                        aria-expanded={menuFor === user.id}
                      >
                        {busyId === user.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="size-4" />
                        )}
                      </Button>

                      {menuFor === user.id && (
                        <div
                          role="menu"
                          className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border bg-popover text-left shadow-lg"
                        >
                          <MenuItem icon={<Pencil className="size-3.5" />} onClick={() => { setMenuFor(null); setEditing(user) }}>
                            Edit details
                          </MenuItem>

                          {user.accountStatus !== 'RESTRICTED' && (
                            <MenuItem
                              icon={<ShieldAlert className="size-3.5" />}
                              onClick={() => applyStatus(user, 'RESTRICTED')}
                            >
                              Restrict (under review)
                            </MenuItem>
                          )}

                          {user.accountStatus !== 'BLOCKED' && (
                            <MenuItem
                              icon={<Ban className="size-3.5" />}
                              onClick={() => applyStatus(user, 'BLOCKED')}
                            >
                              Block (ban account)
                            </MenuItem>
                          )}

                          {user.accountStatus !== 'ACTIVE' && (
                            <MenuItem
                              icon={<Check className="size-3.5" />}
                              onClick={() => applyStatus(user, 'ACTIVE')}
                            >
                              Reinstate
                            </MenuItem>
                          )}

                          <MenuItem
                            icon={<Trash2 className="size-3.5" />}
                            destructive
                            onClick={() => remove(user)}
                          >
                            Delete permanently
                          </MenuItem>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {total === 0 ? 'No users' : `Showing ${from}–${to} of ${total} users`}
          {query && ' (filtered)'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {editing && (
        <EditUserDialog
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  destructive,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition hover:bg-muted ${
        destructive ? 'text-red-600 dark:text-red-400' : ''
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function EditUserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRow
  onClose: () => void
  onSaved: (user: AdminUserRow) => void
}) {
  const [displayName, setDisplayName] = useState(user.name)
  // Lowercased as it is typed, matching how registration normalises handles.
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await adminApi.updateUser(user.id, { displayName, username, email })
      onSaved(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save those changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Edit account</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Display name</span>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Username</span>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-1 size-3.5 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
