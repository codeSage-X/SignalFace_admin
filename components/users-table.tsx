'use client'

import { useEffect, useState } from 'react'
import { MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi, type AdminUserRow } from '@/lib/api'

const getStatusColor = (status: AdminUserRow['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'unverified':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    case 'suspended':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTierBadgeColor = (tier: string) => {
  if (tier === 'Admin') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
  if (tier === 'Creator') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
  if (tier === 'Pro Trader') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  if (tier === 'Trader') return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
}

const formatBalance = (balance: string) =>
  `$${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function UsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'balance'>('name')

  useEffect(() => {
    adminApi
      .getUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'joinDate') return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    if (sortBy === 'balance') return Number(b.balance) - Number(a.balance)
    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
          <Button
            variant={sortBy === 'joinDate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('joinDate')}
          >
            Join Date
          </Button>
          <Button
            variant={sortBy === 'balance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('balance')}
          >
            Balance
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Join Date</th>
              <th className="px-6 py-3 text-left font-semibold">Tier</th>
              <th className="px-6 py-3 text-right font-semibold">Trades</th>
              <th className="px-6 py-3 text-right font-semibold">Balance</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  Loading users…
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTierBadgeColor(user.tier)}`}
                    >
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">{user.trades}</td>
                  <td className="px-6 py-4 text-right font-semibold">{formatBalance(user.balance)}</td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {sortedUsers.length} of {users.length} users
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
