'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, TrendingUp } from 'lucide-react'

interface Trade {
  id: string
  buyer: string
  signal: string
  amount: string
  price: string
  timestamp: string
  status: 'completed' | 'pending'
}

interface Wallet {
  id: string
  user: string
  balance: string
  holdings: string
  portfolioValue: string
  suspicious: boolean
}

const sampleTrades: Trade[] = [
  {
    id: '1',
    buyer: 'Alex Johnson',
    signal: 'AI-500 Bull Run',
    amount: '50 shares',
    price: '$125.00',
    timestamp: '2 minutes ago',
    status: 'completed',
  },
  {
    id: '2',
    buyer: 'Jordan Smith',
    signal: 'Tech Disruptors',
    amount: '100 shares',
    price: '$89.00',
    timestamp: '15 minutes ago',
    status: 'completed',
  },
  {
    id: '3',
    buyer: 'Casey Chen',
    signal: 'Blue Chip Value',
    amount: '25 shares',
    price: '$156.00',
    timestamp: '1 hour ago',
    status: 'pending',
  },
]

const sampleWallets: Wallet[] = [
  {
    id: '1',
    user: 'Alex Johnson',
    balance: '$5,240.50',
    holdings: '12 signals',
    portfolioValue: '$45,320.00',
    suspicious: false,
  },
  {
    id: '2',
    user: 'Jordan Smith',
    balance: '$2,105.00',
    holdings: '8 signals',
    portfolioValue: '$28,950.00',
    suspicious: false,
  },
  {
    id: '3',
    user: 'Casey Chen',
    balance: '$12,450.75',
    holdings: '24 signals',
    portfolioValue: '$125,600.00',
    suspicious: true,
  },
]

function getStatusVariant(
  status: Trade['status'],
): 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' {
  return status === 'completed' ? 'secondary' : 'secondary'
}

export function TradingWallets() {
  return (
    <Tabs defaultValue="trades" className="space-y-6">
      <TabsList>
        <TabsTrigger value="trades">Recent Trades</TabsTrigger>
        <TabsTrigger value="wallets">Wallet Balances</TabsTrigger>
        <TabsTrigger value="transactions">Transaction Ledger</TabsTrigger>
      </TabsList>

      <TabsContent value="trades">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price per Share</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.buyer}</TableCell>
                      <TableCell className="text-sm">{trade.signal}</TableCell>
                      <TableCell className="text-sm">{trade.amount}</TableCell>
                      <TableCell className="font-medium">{trade.price}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{trade.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(trade.status)} className="text-xs capitalize">
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wallets">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Holdings</TableHead>
                    <TableHead>Portfolio Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleWallets.map((wallet) => (
                    <TableRow key={wallet.id} className={wallet.suspicious ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-medium">{wallet.user}</TableCell>
                      <TableCell className="font-medium">{wallet.balance}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{wallet.holdings}</TableCell>
                      <TableCell className="font-medium">{wallet.portfolioValue}</TableCell>
                      <TableCell>
                        {wallet.suspicious ? (
                          <Badge variant="destructive" className="text-xs flex items-center gap-1 w-fit">
                            <AlertTriangle className="size-3" />
                            Suspicious
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{trade.signal}</p>
                      <p className="text-sm text-muted-foreground">{trade.buyer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{trade.amount}</p>
                    <p className="text-sm text-muted-foreground">{trade.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
