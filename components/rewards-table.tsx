'use client'

import { useEffect, useState } from 'react'
import { Gift, Loader2, Pencil, Plus, Power, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { adminApi, type AdminReward, type RewardInput, type RewardType } from '@/lib/api'

const TYPE_LABELS: Record<RewardType, string> = {
  SIGNUP_BONUS: 'Signup bonus',
  REFERRAL_BONUS: 'Referral bonus',
  ONE_TIME: 'One-time claim',
  RECURRING: 'Recurring claim',
}

const TYPE_HINTS: Record<RewardType, string> = {
  SIGNUP_BONUS: 'Paid automatically when an account verifies.',
  REFERRAL_BONUS: 'Paid to the referrer when someone they invited verifies.',
  ONE_TIME: 'Users claim this once, ever.',
  RECURRING: 'Users claim this again once the cooldown passes.',
}

const fmt = (value: string) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')

export function RewardsTable() {
  const [rewards, setRewards] = useState<AdminReward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminReward | 'new' | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    adminApi
      .getRewards()
      .then((res) => setRewards(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load rewards.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleActive = async (reward: AdminReward) => {
    setBusyId(reward.id)
    try {
      const updated = await adminApi.updateReward(reward.id, { active: !reward.active })
      setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not update that reward.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (reward: AdminReward) => {
    const warning =
      reward.totalClaims > 0
        ? `“${reward.name}” has been claimed ${reward.totalClaims} time(s), so it will be switched off rather than deleted — the payout history has to keep pointing at it. Continue?`
        : `Delete “${reward.name}”? It has never been claimed, so it will be removed entirely.`

    if (!window.confirm(warning)) return

    setBusyId(reward.id)
    try {
      await adminApi.deleteReward(reward.id)
      load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete that reward.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Rewards</h2>
          <p className="text-sm text-muted-foreground">
            Amounts here take effect immediately — including the referral bonus.
          </p>
        </div>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="mr-1 size-4" />
          New reward
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Reward</th>
              <th className="px-6 py-3 text-left font-semibold">Type</th>
              <th className="px-6 py-3 text-right font-semibold">Amount</th>
              <th className="px-6 py-3 text-left font-semibold">Duration</th>
              <th className="px-6 py-3 text-right font-semibold">Claims</th>
              <th className="px-6 py-3 text-right font-semibold">Paid out</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : rewards.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  No rewards yet. Create one to start paying users.
                </td>
              </tr>
            ) : (
              rewards.map((reward) => (
                <tr key={reward.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                        <Gift className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">{reward.name}</p>
                        {reward.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {reward.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{TYPE_LABELS[reward.type]}</td>
                  <td className="px-6 py-4 text-right font-semibold">{fmt(reward.amount)}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {reward.type === 'RECURRING' && reward.cooldownHours
                      ? `every ${reward.cooldownHours}h`
                      : reward.startsAt || reward.endsAt
                        ? `${toDateInput(reward.startsAt) || '—'} → ${toDateInput(reward.endsAt) || '—'}`
                        : 'Always'}
                  </td>
                  <td className="px-6 py-4 text-right">{reward.totalClaims}</td>
                  <td className="px-6 py-4 text-right">{fmt(reward.totalPaid)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        reward.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {reward.active ? 'Active' : 'Off'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title={reward.active ? 'Switch off' : 'Switch on'}
                        disabled={busyId === reward.id}
                        onClick={() => toggleActive(reward)}
                      >
                        {busyId === reward.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Power className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Edit"
                        onClick={() => setEditing(reward)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                        title="Delete"
                        disabled={busyId === reward.id}
                        onClick={() => remove(reward)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <RewardDialog
          reward={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function RewardDialog({
  reward,
  onClose,
  onSaved,
}: {
  reward: AdminReward | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<RewardInput>({
    name: reward?.name ?? '',
    description: reward?.description ?? '',
    type: reward?.type ?? 'ONE_TIME',
    amount: reward ? Number(reward.amount) : 100,
    active: reward?.active ?? true,
    startsAt: toDateInput(reward?.startsAt ?? null) || null,
    endsAt: toDateInput(reward?.endsAt ?? null) || null,
    cooldownHours: reward?.cooldownHours ?? 24,
    maxClaims: reward?.maxClaims ?? null,
    maxPerUser: reward?.maxPerUser ?? null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof RewardInput>(key: K, value: RewardInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload: RewardInput = {
        ...form,
        // Dates go up as full ISO timestamps; a bare yyyy-mm-dd isn't ISO8601.
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        // Only meaningful for recurring rewards.
        cooldownHours: form.type === 'RECURRING' ? form.cooldownHours : null,
      }

      if (reward) await adminApi.updateReward(reward.id, payload)
      else await adminApi.createReward(payload)

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that reward.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{reward ? 'Edit reward' : 'New reward'}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Name">
            <Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} />
          </Field>

          <Field label="Description">
            <Input
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Shown to users under the reward name"
            />
          </Field>

          <Field label="Type" hint={TYPE_HINTS[form.type as RewardType]}>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value as RewardType)}
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
            >
              {(Object.keys(TYPE_LABELS) as RewardType[]).map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Amount (SF)">
            <Input
              type="number"
              min={0}
              value={form.amount ?? 0}
              onChange={(e) => set('amount', Number(e.target.value))}
            />
          </Field>

          {form.type === 'RECURRING' && (
            <Field label="Cooldown (hours)" hint="How long before the same user can claim again.">
              <Input
                type="number"
                min={1}
                value={form.cooldownHours ?? 24}
                onChange={(e) => set('cooldownHours', Number(e.target.value))}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts" hint="Optional">
              <Input
                type="date"
                value={form.startsAt ?? ''}
                onChange={(e) => set('startsAt', e.target.value || null)}
              />
            </Field>
            <Field label="Ends" hint="Optional">
              <Input
                type="date"
                value={form.endsAt ?? ''}
                onChange={(e) => set('endsAt', e.target.value || null)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Total claim limit" hint="Blank = unlimited">
              <Input
                type="number"
                min={1}
                value={form.maxClaims ?? ''}
                onChange={(e) => set('maxClaims', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field label="Per-user limit" hint="Blank = unlimited">
              <Input
                type="number"
                min={1}
                value={form.maxPerUser ?? ''}
                onChange={(e) => set('maxPerUser', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) => set('active', e.target.checked)}
            />
            Active
          </label>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-1 size-3.5 animate-spin" />}
            {reward ? 'Save changes' : 'Create reward'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  )
}
