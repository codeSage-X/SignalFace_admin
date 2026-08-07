'use client'

import { useState } from 'react'
import { Check, X, Flag, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Report {
  id: string
  reportedBy: string
  content: string
  contentType: 'signal' | 'comment' | 'profile' | 'post'
  reason: string
  reportedDate: string
  status: 'pending' | 'approved' | 'rejected'
  severity: 'low' | 'medium' | 'high'
}

const mockReports: Report[] = [
  {
    id: '1',
    reportedBy: 'Morgan Lee',
    content: 'Signal: "Guaranteed 100% Returns"',
    contentType: 'signal',
    reason: 'Misleading claims',
    reportedDate: '2024-07-12',
    status: 'pending',
    severity: 'high',
  },
  {
    id: '2',
    reportedBy: 'Taylor Wilson',
    content: 'Comment on AI-500 Bull Run',
    contentType: 'comment',
    reason: 'Offensive language',
    reportedDate: '2024-07-12',
    status: 'pending',
    severity: 'medium',
  },
  {
    id: '3',
    reportedBy: 'Riley Martinez',
    content: 'User profile: @spamuser123',
    contentType: 'profile',
    reason: 'Suspicious activity',
    reportedDate: '2024-07-11',
    status: 'approved',
    severity: 'high',
  },
  {
    id: '4',
    reportedBy: 'Avery Thompson',
    content: 'Post: Market Analysis Update',
    contentType: 'post',
    reason: 'Copyrighted content',
    reportedDate: '2024-07-11',
    status: 'pending',
    severity: 'medium',
  },
  {
    id: '5',
    reportedBy: 'Casey Chen',
    content: 'Signal: "Tech Sector Correction"',
    contentType: 'signal',
    reason: 'False information',
    reportedDate: '2024-07-10',
    status: 'rejected',
    severity: 'low',
  },
  {
    id: '6',
    reportedBy: 'Jordan Smith',
    content: 'Comment on NASDAQ discussion',
    contentType: 'comment',
    reason: 'Spam',
    reportedDate: '2024-07-10',
    status: 'approved',
    severity: 'low',
  },
]

const getSeverityColor = (severity: Report['severity']) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: Report['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
    case 'approved':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    case 'rejected':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getContentIcon = (type: Report['contentType']) => {
  switch (type) {
    case 'signal':
      return '📊'
    case 'comment':
      return '💬'
    case 'profile':
      return '👤'
    case 'post':
      return '📝'
    default:
      return '📄'
  }
}

export function ModerationTable() {
  const [reports, setReports] = useState<Report[]>(mockReports)

  const handleApprove = (id: string) => {
    setReports(reports.map(report =>
      report.id === id ? { ...report, status: 'approved' as const } : report
    ))
  }

  const handleReject = (id: string) => {
    setReports(reports.map(report =>
      report.id === id ? { ...report, status: 'rejected' as const } : report
    ))
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length
  const highSeverityCount = reports.filter(r => r.severity === 'high').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:from-orange-950 dark:to-orange-900">
          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending Reports</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingCount}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4 dark:from-red-950 dark:to-red-900">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">High Severity</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highSeverityCount}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-950 dark:to-green-900">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">Total Reports</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{reports.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Reported By</th>
              <th className="px-6 py-3 text-left font-semibold">Content</th>
              <th className="px-6 py-3 text-left font-semibold">Reason</th>
              <th className="px-6 py-3 text-center font-semibold">Severity</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{report.reportedBy}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getContentIcon(report.contentType)}</span>
                    <span className="truncate text-muted-foreground max-w-xs">{report.content}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-sm">{report.reason}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(report.severity)}`}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-sm">{report.reportedDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {report.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleApprove(report.id)}
                          title="Approve - Remove content"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                          onClick={() => handleReject(report.id)}
                          title="Reject - Keep content"
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MessageCircle className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {reports.length} reports
      </div>
    </div>
  )
}
