import { ModerationTable } from '@/components/moderation-table'

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div className="border-b bg-background px-8 py-4">
        <h2 className="text-2xl font-bold capitalize">Content Moderation</h2>
      </div>
      <div className="px-8">
        <ModerationTable />
      </div>
    </div>
  )
}
