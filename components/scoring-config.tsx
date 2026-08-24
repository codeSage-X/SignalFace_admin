'use client'

import { useEffect, useState } from 'react'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { adminApi, type ScoringConfig as Config } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type Draft = Omit<Config, 'updatedAt'>

const WEIGHTS: { key: keyof Draft; label: string; hint: string; max: number; step: number }[] = [
  { key: 'wFollowers', label: 'Followers', hint: 'Points per follower', max: 1, step: 0.001 },
  { key: 'wLikes', label: 'Likes', hint: 'Points per like', max: 1, step: 0.001 },
  { key: 'wComments', label: 'Comments', hint: 'Points per comment', max: 1, step: 0.001 },
  { key: 'wShares', label: 'Shares', hint: 'Points per share', max: 1, step: 0.001 },
  { key: 'wGrowth', label: 'Growth', hint: 'Multiplier on growth rate', max: 10, step: 0.05 },
]

const PRICING: { key: keyof Draft; label: string; hint: string; max: number; step: number }[] = [
  { key: 'priceBase', label: 'Base price', hint: 'Floor price for any signal', max: 100, step: 0.1 },
  { key: 'priceK', label: 'Price coefficient', hint: 'How steeply score moves price', max: 10, step: 0.01 },
  {
    key: 'smoothing',
    label: 'Smoothing (alpha)',
    hint: '1 = jump straight to the new price, 0 = never move',
    max: 1,
    step: 0.05,
  },
]

export function ScoringConfig() {
  const [saved, setSaved] = useState<Config | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .getScoring()
      .then((config) => {
        setSaved(config)
        const { updatedAt, ...rest } = config
        setDraft(rest)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the config.'))
      .finally(() => setLoading(false))
  }, [])

  const dirty =
    saved !== null &&
    draft !== null &&
    (Object.keys(draft) as (keyof Draft)[]).some((k) => draft[k] !== saved[k])

  const save = async () => {
    if (!draft) return
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      const next = await adminApi.updateScoring(draft)
      setSaved(next)
      const { updatedAt, ...rest } = next
      setDraft(rest)
      setOk('Saved. New scores use these values from the next scoring run.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the config.')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    if (!saved) return
    const { updatedAt, ...rest } = saved
    setDraft(rest)
    setOk(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6">
            <Skeleton className="h-4 w-40" />
            <div className="mt-6 space-y-5">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!draft) {
    return <p className="text-sm text-destructive">{error ?? 'Could not load the config.'}</p>
  }

  const field = (f: (typeof WEIGHTS)[number]) => (
    <div key={f.key}>
      <div className="flex items-center justify-between">
        <label htmlFor={f.key} className="text-sm font-medium">
          {f.label}
        </label>
        <input
          id={f.key}
          type="number"
          min={0}
          max={f.max}
          step={f.step}
          value={draft[f.key]}
          onChange={(e) =>
            setDraft({ ...draft, [f.key]: Number(e.target.value) })
          }
          className="w-24 rounded-md border bg-background px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <input
        type="range"
        min={0}
        max={f.max}
        step={f.step}
        value={draft[f.key]}
        onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
        className="mt-2 w-full"
      />
      <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}
      {ok && (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          {ok}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">{WEIGHTS.map(field)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">{PRICING.map(field)}</CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
        <Button variant="outline" onClick={reset} disabled={!dirty || saving}>
          <RotateCcw className="size-4" />
          Discard
        </Button>
        {saved && (
          <span className="ml-auto text-xs text-muted-foreground">
            Last updated {new Date(saved.updatedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
