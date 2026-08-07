'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis } from 'recharts'

const growthChartConfig = {
  users: { label: 'Total Users', color: 'var(--primary)' },
  creators: { label: 'Creators', color: 'var(--secondary)' },
} satisfies ChartConfig

const tradeVolumeChartConfig = {
  volume: { label: 'Trade Volume', color: 'var(--primary)' },
} satisfies ChartConfig

export interface GrowthPoint {
  month: string
  users: number
  creators: number
}

export interface VolumePoint {
  date: string
  volume: number
}

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Growth</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length >= 2 ? (
          <ChartContainer config={growthChartConfig} className="h-[300px] w-full">
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="var(--foreground)" opacity={0.6} />
              <YAxis stroke="var(--foreground)" opacity={0.6} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--primary)"
                dot={{ fill: 'var(--primary)', r: 4 }}
                name="Total Users"
              />
              <Line
                type="monotone"
                dataKey="creators"
                stroke="var(--secondary)"
                dot={{ fill: 'var(--secondary)', r: 4 }}
                name="Creators"
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-center px-6">
            <p className="text-sm text-muted-foreground">Not enough history yet to plot growth.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TradeVolumeChart({ data }: { data: VolumePoint[] }) {
  const hasVolume = data.some((d) => d.volume > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trade Volume</CardTitle>
      </CardHeader>
      <CardContent>
        {hasVolume ? (
          <ChartContainer config={tradeVolumeChartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <XAxis dataKey="date" stroke="var(--foreground)" opacity={0.6} />
              <YAxis stroke="var(--foreground)" opacity={0.6} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="volume" fill="var(--primary)" name="Trade Volume" />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-center px-6">
            <p className="text-sm text-muted-foreground">No trades in the last 7 days yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
