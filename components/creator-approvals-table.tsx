'use client'

import { useState } from 'react'
import { Check, X, Eye, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreatorApplication {
  id: string
  name: string
  email: string
  appliedDate: string
  status: 'pending' | 'approved' | 'rejected'
  specialty: string
  followers: number
  portfolio: string
}

const mockApplications: CreatorApplication[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@creators.com',
    appliedDate: '2024-07-10',
    status: 'pending',
    specialty: 'Tech Analysis',
    followers: 5200,
    portfolio: 'View Profile',
  },
  {
    id: '2',
    name: 'Jordan Smith',
    email: 'jordan@creators.com',
    appliedDate: '2024-07-09',
    status: 'pending',
    specialty: 'Market Trends',
    followers: 8400,
    portfolio: 'View Profile',
  },
  {
    id: '3',
    name: 'Casey Chen',
    email: 'casey@creators.com',
    appliedDate: '2024-07-08',
    status: 'approved',
    specialty: 'AI Signals',
    followers: 12300,
    portfolio: 'View Profile',
  },
  {
    id: '4',
    name: 'Morgan Lee',
    email: 'morgan@creators.com',
    appliedDate: '2024-07-07',
    status: 'rejected',
    specialty: 'Crypto Trading',
    followers: 2100,
    portfolio: 'View Profile',
  },
  {
    id: '5',
    name: 'Taylor Wilson',
    email: 'taylor@creators.com',
    appliedDate: '2024-07-06',
    status: 'pending',
    specialty: 'Finance Education',
    followers: 6800,
    portfolio: 'View Profile',
  },
]

const getStatusBadge = (status: CreatorApplication['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function CreatorApprovalsTable() {
  const [applications, setApplications] = useState<CreatorApplication[]>(mockApplications)

  const handleApprove = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: 'approved' as const } : app
    ))
  }

  const handleReject = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: 'rejected' as const } : app
    ))
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Pending Applications</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</p>
        </div>
        <Calendar className="size-8 text-blue-400" />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Specialty</th>
              <th className="px-6 py-3 text-center font-semibold">Followers</th>
              <th className="px-6 py-3 text-left font-semibold">Applied</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{app.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{app.email}</td>
                <td className="px-6 py-4">{app.specialty}</td>
                <td className="px-6 py-4 text-center">{app.followers.toLocaleString()}</td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(app.status)}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(app.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(app.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {applications.length} applications
      </div>
    </div>
  )
}
