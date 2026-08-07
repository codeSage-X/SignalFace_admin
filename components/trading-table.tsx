'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Trade {
  id: string
  user: string
  type: 'buy' | 'sell'
  asset: string
  amount: string
  price: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

const mockTrades: Trade[] = [
  {
    id: '1',
    user: 'Alex Johnson',
    type: 'buy',
    asset: 'AI-500',
    amount: '$2,500',
    price: '$125.50',
    date: '2024-07-12 14:32',
    status: 'completed',
  },
  {
    id: '2',
    user: 'Jordan Smith',
    type: 'sell',
    asset: 'TECH',
    amount: '$1,850',
    price: '$92.25',
    date: '2024-07-12 14:28',
    status: 'completed',
  },
  {
    id: '3',
    user: 'Casey Chen',
    type: 'buy',
    asset: 'ETH',
    amount: '$5,200',
    price: '$2,341.00',
    date: '2024-07-12 14:15',
    status: 'completed',
  },
  {
    id: '4',
    user: 'Riley Martinez',
    type: 'sell',
    asset: 'BTC',
    amount: '$8,900',
    price: '$64,500.00',
    date: '2024-07-12 13:52',
    status: 'pending',
  },
  {
    id: '5',
    user: 'Morgan Lee',
    type: 'buy',
    asset: 'SPX',
    amount: '$3,400',
    price: '$5,124.75',
    date: '2024-07-12 13:30',
    status: 'failed',
  },
  {
    id: '6',
    user: 'Taylor Wilson',
    type: 'sell',
    asset: 'NASDAQ',
    amount: '$2,100',
    price: '$18,245.50',
    date: '2024-07-12 13:15',
    status: 'completed',
  },
]

const getStatusColor = (status: Trade['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function TradingTable() {
  const [trades] = useState<Trade[]>(mockTrades)

  const totalVolume = trades
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[$,]/g, '')), 0)

  const completedTrades = trades.filter(t => t.status === 'completed').length
  const pendingTrades = trades.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-950 dark:to-green-900">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">Total Volume (24h)</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950 dark:to-blue-900">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Completed Trades</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedTrades}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 dark:from-yellow-950 dark:to-yellow-900">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Pending Trades</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingTrades}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">User</th>
              <th className="px-6 py-3 text-center font-semibold">Type</th>
              <th className="px-6 py-3 text-left font-semibold">Asset</th>
              <th className="px-6 py-3 text-right font-semibold">Amount</th>
              <th className="px-6 py-3 text-right font-semibold">Price</th>
              <th className="px-6 py-3 text-left font-semibold">Time</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{trade.user}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {trade.type === 'buy' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight className="size-4" />
                        <span className="text-xs font-semibold">BUY</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <ArrowDownLeft className="size-4" />
                        <span className="text-xs font-semibold">SELL</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {trade.asset}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold">{trade.amount}</td>
                <td className="px-6 py-4 text-right text-muted-foreground">{trade.price}</td>
                <td className="px-6 py-4 text-muted-foreground text-xs">{trade.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(trade.status)}`}>
                    {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {trades.length} recent trades</div>
      </div>
    </div>
  )
}
