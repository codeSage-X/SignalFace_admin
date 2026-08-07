'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { createSignalSchema, type CreateSignalInput } from '@/lib/schemas'
import { adminApi, ApiError, type AdminSignalRow } from '@/lib/api'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CreateSignalSheet({ onCreated }: { onCreated: (signal: AdminSignalRow) => void }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateSignalInput>({
    resolver: zodResolver(createSignalSchema),
    defaultValues: { title: '', worth: 1 },
  })

  const onSubmit = async (data: CreateSignalInput) => {
    setError(null)
    try {
      const signal = await adminApi.createSignal(data)
      onCreated(signal)
      form.reset()
      setOpen(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create signal.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button size="sm" />}>
        <Plus className="size-4 mr-2" />
        Create Signal
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Signal</SheetTitle>
          <SheetDescription>Give it a title and a starting worth (price).</SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 px-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. AI-500 Bull Run" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Worth ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...form.register('worth', { valueAsNumber: true })}
            />
            {form.formState.errors.worth && (
              <p className="text-xs text-destructive">{form.formState.errors.worth.message}</p>
            )}
          </div>
          <SheetFooter className="px-0">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Create Signal
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
