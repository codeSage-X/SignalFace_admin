'use client'

import { useCallback, useEffect, useState } from 'react'
import { History, Loader2, Plus, Save, Settings2 } from 'lucide-react'
import { adminApi, type AuditRow, type PlatformSettingRow } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const ACTION_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Users', value: 'user' },
  { label: 'Posts', value: 'post' },
  { label: 'Realms', value: 'realm' },
  { label: 'Scoring', value: 'scoring' },
  { label: 'Settings', value: 'setting' },
]

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase()
}

export function SettingsAudit() {
  const [settings, setSettings] = useState<PlatformSettingRow[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const [audit, setAudit] = useState<AuditRow[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditPage, setAuditPage] = useState(1)
  const [auditFilter, setAuditFilter] = useState('')
  const [auditLoading, setAuditLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await adminApi.getSettings()
      setSettings(res.items)
      setDrafts(Object.fromEntries(res.items.map((s) => [s.key, s.value])))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load settings.')
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const loadAudit = useCallback(async () => {
    setAuditLoading(true)
    try {
      const res = await adminApi.getAudit({
        action: auditFilter || undefined,
        page: auditPage,
      })
      setAudit(res.items)
      setAuditTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the audit log.')
    } finally {
      setAuditLoading(false)
    }
  }, [auditFilter, auditPage])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    loadAudit()
  }, [loadAudit])

  const save = async (key: string, value: string) => {
    setSavingKey(key)
    setError(null)
    try {
      await adminApi.updateSetting({ key, value })
      await loadSettings()
      // Every write is audited, so the log beside it is now stale.
      await loadAudit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that setting.')
    } finally {
      setSavingKey(null)
    }
  }

  const addSetting = async () => {
    const key = newKey.trim()
    if (!key || !newValue.trim()) return
    await save(key, newValue.trim())
    setNewKey('')
    setNewValue('')
  }

  const auditPageCount = Math.max(1, Math.ceil(auditTotal / 20))

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="size-4" />
            Platform settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : settings.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No settings defined yet. Add one below — settings are free-form key/value
              pairs, so a new toggle needs no database change.
            </p>
          ) : (
            settings.map((setting) => {
              const dirty = drafts[setting.key] !== setting.value
              return (
                <div key={setting.key} className="flex flex-wrap items-center gap-3">
                  <code className="min-w-[180px] rounded bg-muted px-2 py-1 text-xs">
                    {setting.key}
                  </code>
                  <input
                    value={drafts[setting.key] ?? ''}
                    onChange={(e) => setDrafts({ ...drafts, [setting.key]: e.target.value })}
                    className="flex-1 min-w-[160px] rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    size="sm"
                    disabled={!dirty || savingKey === setting.key}
                    onClick={() => save(setting.key, drafts[setting.key])}
                  >
                    {savingKey === setting.key ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              )
            })
          )}

          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="new.setting.key"
              className="min-w-[180px] rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="value"
              className="flex-1 min-w-[160px] rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" variant="outline" onClick={addSetting} disabled={!newKey.trim() || !newValue.trim()}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4" />
            Audit log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {ACTION_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={auditFilter === f.value ? 'default' : 'outline'}
                onClick={() => {
                  setAuditFilter(f.value)
                  setAuditPage(1)
                }}
              >
                {f.label}
              </Button>
            ))}
            <span className="ml-auto text-sm text-muted-foreground">
              {auditLoading ? '—' : `${auditTotal} entr${auditTotal === 1 ? 'y' : 'ies'}`}
            </span>
          </div>

          {auditLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : audit.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No admin actions recorded{auditFilter ? ' for this filter' : ' yet'}.
            </p>
          ) : (
            <div className="space-y-1">
              {audit.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="size-8">
                    {entry.actor?.avatarUrl && <AvatarImage src={entry.actor.avatarUrl} alt="" />}
                    <AvatarFallback>
                      {entry.actor ? initials(entry.actor.displayName) : '—'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {entry.actor ? `@${entry.actor.username}` : 'System'}
                      </span>{' '}
                      <span className="text-muted-foreground">{entry.summary ?? entry.action}</span>
                    </p>
                    {entry.targetType && (
                      <p className="text-xs text-muted-foreground">
                        {entry.targetType}
                        {entry.targetId ? ` · ${entry.targetId.slice(0, 10)}…` : ''}
                      </p>
                    )}
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {entry.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {auditPageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Page {auditPage} of {auditPageCount}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={auditPage <= 1} onClick={() => setAuditPage((n) => n - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={auditPage >= auditPageCount} onClick={() => setAuditPage((n) => n + 1)}>
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
