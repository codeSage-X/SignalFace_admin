import { CreatorApprovalsTable } from '@/components/creator-approvals-table'

export default function CreatorApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b bg-background px-8 py-4">
        <h2 className="text-2xl font-bold capitalize">Creator Approvals</h2>
      </div>
      <div className="px-8">
        <CreatorApprovalsTable />
      </div>
    </div>
  )
}
