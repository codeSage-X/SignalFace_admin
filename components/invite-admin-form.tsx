'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { inviteAdminSchema, type InviteAdminInput } from '@/lib/schemas'
import { adminApi, ApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function InviteAdminForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<InviteAdminInput>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: '', displayName: '' },
  })

  const onSubmit = async (data: InviteAdminInput) => {
    setError(null)
    setSuccess(null)
    try {
      const res = await adminApi.invite(data)
      setSuccess(res.message)
      form.reset()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send invite.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Admin</CardTitle>
        <CardDescription>
          Send a new admin an email invite so they can set their password and sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display Name</label>
            <Input {...form.register('displayName')} />
            {form.formState.errors.displayName && (
              <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Mail className="size-4 mr-2" />
            )}
            Send Invite
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
