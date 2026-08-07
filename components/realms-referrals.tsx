'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MoreHorizontal } from 'lucide-react'

interface Realm {
  id: string
  name: string
  members: number
  reputation: number
  createdDate: string
  status: 'active' | 'inactive'
}

interface Referral {
  id: string
  referrer: string
  referee: string
  status: 'active' | 'completed' | 'expired'
  joinDate: string
  bonus: string
}

const sampleRealms: Realm[] = [
  {
    id: '1',
    name: 'Tech Traders',
    members: 2450,
    reputation: 4.8,
    createdDate: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Crypto Hunters',
    members: 1820,
    reputation: 4.5,
    createdDate: '2024-02-10',
    status: 'active',
  },
  {
    id: '3',
    name: 'Value Investors',
    members: 950,
    reputation: 4.9,
    createdDate: '2024-03-05',
    status: 'active',
  },
]

const sampleReferrals: Referral[] = [
  {
    id: '1',
    referrer: 'Alex Johnson',
    referee: 'New User 1',
    status: 'completed',
    joinDate: '2024-07-01',
    bonus: '$25.00',
  },
  {
    id: '2',
    referrer: 'Jordan Smith',
    referee: 'New User 2',
    status: 'active',
    joinDate: '2024-07-05',
    bonus: 'Pending',
  },
  {
    id: '3',
    referrer: 'Casey Chen',
    referee: 'New User 3',
    status: 'completed',
    joinDate: '2024-06-28',
    bonus: '$50.00',
  },
]

function getStatusVariant(status: string) {
  switch (status) {
    case 'active':
      return 'secondary'
    case 'completed':
      return 'secondary'
    case 'inactive':
      return 'secondary'
    case 'expired':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function RealmsReferrals() {
  return (
    <Tabs defaultValue="realms" className="space-y-6">
      <TabsList>
        <TabsTrigger value="realms">Realms Management</TabsTrigger>
        <TabsTrigger value="memberships">Memberships</TabsTrigger>
        <TabsTrigger value="referrals">Referral Program</TabsTrigger>
      </TabsList>

      <TabsContent value="realms">
        <Card>
          <CardHeader>
            <CardTitle>Realms Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Realm Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRealms.map((realm) => (
                    <TableRow key={realm.id}>
                      <TableCell className="font-medium">{realm.name}</TableCell>
                      <TableCell className="text-sm">{realm.members.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {realm.reputation} ⭐
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{realm.createdDate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(realm.status)} className="text-xs capitalize">
                          {realm.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="memberships">
        <Card>
          <CardHeader>
            <CardTitle>Realm Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleRealms.map((realm) => (
                <div key={realm.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{realm.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {realm.members.toLocaleString()} total members
                      </p>
                    </div>
                    <Badge variant="secondary">{realm.reputation} ⭐</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reputation Threshold:</span>
                      <span className="font-medium">3.5+</span>
                    </div>
                    <div className="w-full bg-primary/20 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(realm.reputation / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="referrals">
        <Card>
          <CardHeader>
            <CardTitle>Referral Program Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.referrer}</TableCell>
                      <TableCell className="text-sm">{referral.referee}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(referral.status)} className="text-xs capitalize">
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{referral.joinDate}</TableCell>
                      <TableCell className="font-medium">{referral.bonus}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
