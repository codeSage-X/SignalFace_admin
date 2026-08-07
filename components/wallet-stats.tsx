'use client'

import { Wallet, TrendingUp, Users, DollarSign } from 'lucide-react'

export function WalletStats() {
  const stats = [
    {
      label: 'Total Platform Volume',
      value: '$45,231,298',
      icon: DollarSign,
      color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active Wallets',
      value: '8,542',
      icon: Wallet,
      color: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Daily Transactions',
      value: '12,456',
      icon: TrendingUp,
      color: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Average Wallet Balance',
      value: '$5,287',
      icon: Users,
      color: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className={`rounded-lg bg-gradient-to-br ${stat.color} p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
              </div>
              <Icon className={`size-8 ${stat.textColor} opacity-75`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
