'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { InviteAdminForm } from '@/components/invite-admin-form'

interface AuditLog {
  id: string
  admin: string
  action: string
  target: string
  timestamp: string
  status: 'success' | 'error'
}

interface HealthIndicator {
  name: string
  status: 'healthy' | 'warning' | 'error'
  details: string
}

const sampleAuditLogs: AuditLog[] = [
  {
    id: '1',
    admin: 'Admin User',
    action: 'User suspended',
    target: 'User ID: 12345',
    timestamp: '2024-07-08 14:30',
    status: 'success',
  },
  {
    id: '2',
    admin: 'Moderator A',
    action: 'Content removed',
    target: 'Post ID: 54321',
    timestamp: '2024-07-08 13:45',
    status: 'success',
  },
  {
    id: '3',
    admin: 'Admin User',
    action: 'Signal pricing updated',
    target: 'Signal ID: 99876',
    timestamp: '2024-07-08 12:15',
    status: 'success',
  },
  {
    id: '4',
    admin: 'System',
    action: 'Backup created',
    target: 'Database backup',
    timestamp: '2024-07-08 06:00',
    status: 'success',
  },
]

const healthIndicators: HealthIndicator[] = [
  {
    name: 'Database Performance',
    status: 'healthy',
    details: 'Response time: 45ms',
  },
  {
    name: 'API Uptime',
    status: 'healthy',
    details: '99.99% uptime (last 30 days)',
  },
  {
    name: 'Cache System',
    status: 'healthy',
    details: 'Hit rate: 94.2%',
  },
  {
    name: 'Storage Capacity',
    status: 'warning',
    details: '78% capacity used',
  },
]

function getStatusVariant(status: string) {
  switch (status) {
    case 'success':
      return 'secondary'
    case 'error':
      return 'destructive'
    case 'healthy':
      return 'secondary'
    case 'warning':
      return 'secondary'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function SettingsAudit() {
  return (
    <Tabs defaultValue="settings" className="space-y-6">
      <TabsList>
        <TabsTrigger value="settings">Admin Settings</TabsTrigger>
        <TabsTrigger value="invite">Invite Admin</TabsTrigger>
        <TabsTrigger value="audit">Activity Audit Log</TabsTrigger>
        <TabsTrigger value="health">System Health</TabsTrigger>
      </TabsList>

      <TabsContent value="invite">
        <InviteAdminForm />
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>Manage platform settings and configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Moderation Settings</h3>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Automatic Content Scanning</p>
                  <p className="text-xs text-muted-foreground">Enable AI-powered content moderation</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Alert on moderation events</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Spam Detection</p>
                  <p className="text-xs text-muted-foreground">Block suspicious patterns</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-sm">Maintenance</h3>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Read-Only Mode</p>
                  <p className="text-xs text-muted-foreground">Prevent all writes during maintenance</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">Cancel</Button>
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card>
          <CardHeader>
            <CardTitle>Activity Audit Log</CardTitle>
            <CardDescription>Track all administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.admin}</TableCell>
                      <TableCell className="text-sm">{log.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.target}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="size-4 text-green-600" />
                          ) : (
                            <AlertCircle className="size-4 text-red-600" />
                          )}
                          <Badge variant={getStatusVariant(log.status)} className="text-xs capitalize">
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="health">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Monitor system performance and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthIndicators.map((indicator, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{indicator.name}</p>
                      <Badge variant={getStatusVariant(indicator.status)} className="text-xs capitalize">
                        {indicator.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{indicator.details}</p>
                  </div>
                  {indicator.status === 'healthy' && (
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-1" />
                  )}
                  {indicator.status === 'warning' && (
                    <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Last System Check</p>
              <p className="text-sm text-muted-foreground">2024-07-08 at 14:35 UTC</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
