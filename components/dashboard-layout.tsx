'use client'

import React, { useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  TrendingUp,
  Wallet,
  MessageSquare,
  Settings,
  BarChart3,
  Globe,
  Share2,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/lib/store'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAdminAuth((s) => s.logout)
  const [section, setSection] = useState(pathname.split('/')[2] || 'overview')

  const handleSignOut = () => {
    logout()
    router.push('/login')
  }

  const menuItems = [
    {
      title: 'Overview',
      icon: LayoutDashboard,
      href: '/admin/overview',
      id: 'overview',
    },
    {
      title: 'Users',
      icon: Users,
      href: '/admin/users',
      id: 'users',
    },
    {
      title: 'Creator Approvals',
      icon: CheckCircle2,
      href: '/admin/creator-approvals',
      id: 'creator-approvals',
    },
    {
      title: 'Signals',
      icon: TrendingUp,
      href: '/admin/signals',
      id: 'signals',
    },
    {
      title: 'Trading & Wallets',
      icon: Wallet,
      href: '/admin/trading',
      id: 'trading',
    },
    {
      title: 'Content Moderation',
      icon: MessageSquare,
      href: '/admin/moderation',
      id: 'moderation',
    },
    {
      title: 'Scoring Configuration',
      icon: BarChart3,
      href: '/admin/scoring',
      id: 'scoring',
    },
    {
      title: 'Realms & Referrals',
      icon: Globe,
      href: '/admin/realms',
      id: 'realms',
    },
    {
      title: 'Settings & Audit',
      icon: Settings,
      href: '/admin/settings',
      id: 'settings',
    },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              SF
            </div>
            <div>
              <h1 className="text-base font-bold">Signal Face</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={section === item.id}
                      render={
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-background px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold capitalize">{section.replace(/-/g, ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
