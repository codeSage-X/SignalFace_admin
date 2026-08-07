'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Eye, Trash2 } from 'lucide-react'

interface ReportedContent {
  id: string
  contentType: 'post' | 'comment' | 'like'
  author: string
  content: string
  reportedBy: string
  reason: string
  reportDate: string
  status: 'pending' | 'reviewed' | 'removed'
}

const sampleReports: ReportedContent[] = [
  {
    id: '1',
    contentType: 'post',
    author: 'User123',
    content: 'Suspicious trading advice post',
    reportedBy: 'Admin',
    reason: 'Inappropriate content',
    reportDate: '2024-07-08',
    status: 'pending',
  },
  {
    id: '2',
    contentType: 'comment',
    author: 'User456',
    content: 'Abusive comment on signal',
    reportedBy: 'User789',
    reason: 'Harassment',
    reportDate: '2024-07-07',
    status: 'reviewed',
  },
  {
    id: '3',
    contentType: 'post',
    author: 'User321',
    content: 'Spam promotional post',
    reportedBy: 'System',
    reason: 'Spam',
    reportDate: '2024-07-06',
    status: 'removed',
  },
  {
    id: '4',
    contentType: 'comment',
    author: 'User654',
    content: 'Misleading market information',
    reportedBy: 'Moderator',
    reason: 'Misinformation',
    reportDate: '2024-07-05',
    status: 'reviewed',
  },
]

function getStatusVariant(status: ReportedContent['status']) {
  switch (status) {
    case 'pending':
      return 'secondary'
    case 'reviewed':
      return 'secondary'
    case 'removed':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getContentTypeVariant(
  type: ReportedContent['contentType'],
): 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' {
  switch (type) {
    case 'post':
      return 'secondary'
    case 'comment':
      return 'secondary'
    case 'like':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export function ContentModeration() {
  const [reports, setReports] = useState<ReportedContent[]>(sampleReports)

  const handleApprove = (id: string) => {
    setReports(
      reports.map((report) =>
        report.id === id ? { ...report, status: 'reviewed' as const } : report
      )
    )
  }

  const handleRemove = (id: string) => {
    setReports(
      reports.map((report) =>
        report.id === id ? { ...report, status: 'removed' as const } : report
      )
    )
  }

  const pendingReports = reports.filter((report) => report.status === 'pending')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Report Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant={getContentTypeVariant(report.contentType)} className="text-xs capitalize">
                        {report.contentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{report.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {report.content}
                    </TableCell>
                    <TableCell className="text-sm">{report.reportedBy}</TableCell>
                    <TableCell className="text-sm">{report.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{report.reportDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(report.status)} className="text-xs capitalize">
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(report.id)}
                            >
                              <CheckCircle2 className="size-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(report.id)}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reported content found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>{pendingReports.length}</strong> pending moderation reviews
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
