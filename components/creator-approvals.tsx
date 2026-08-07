'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'

interface CreatorApplication {
  id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  appliedDate: string
  followers: number
  notes: string
}

const sampleApplications: CreatorApplication[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    status: 'pending',
    appliedDate: '2024-07-08',
    followers: 45000,
    notes: 'Strong track record in tech analysis',
  },
  {
    id: '2',
    name: 'Jordan Smith',
    email: 'jordan@example.com',
    status: 'pending',
    appliedDate: '2024-07-07',
    followers: 32000,
    notes: 'Consistently accurate predictions',
  },
  {
    id: '3',
    name: 'Casey Chen',
    email: 'casey@example.com',
    status: 'approved',
    appliedDate: '2024-07-01',
    followers: 78000,
    notes: 'Approved after review',
  },
  {
    id: '4',
    name: 'Morgan Lee',
    email: 'morgan@example.com',
    status: 'rejected',
    appliedDate: '2024-06-28',
    followers: 5000,
    notes: 'Insufficient follower base',
  },
]

function getStatusVariant(status: CreatorApplication['status']) {
  switch (status) {
    case 'approved':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function CreatorApprovals() {
  const [applications, setApplications] = useState<CreatorApplication[]>(sampleApplications)

  const handleApprove = (id: string) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: 'approved' as const } : app
      )
    )
  }

  const handleReject = (id: string) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: 'rejected' as const } : app
      )
    )
  }

  const pendingApplications = applications.filter((app) => app.status === 'pending')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{app.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{app.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.email}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)} className="text-xs capitalize">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{app.appliedDate}</TableCell>
                    <TableCell className="text-sm font-medium">{app.followers.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {app.notes}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                            >
                              <CheckCircle2 className="size-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(app.id)}
                            >
                              <XCircle className="size-4 text-red-600" />
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>{pendingApplications.length}</strong> pending applications awaiting review
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
