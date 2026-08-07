'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface ScoringWeights {
  accuracy: number
  consistency: number
  profitability: number
  followerBase: number
  engagementRate: number
}

interface PricingParameters {
  baseFee: number
  volumeFee: number
  performanceFee: number
  minPrice: number
  maxPrice: number
}

export function ScoringConfig() {
  const [weights, setWeights] = useState<ScoringWeights>({
    accuracy: 40,
    consistency: 25,
    profitability: 20,
    followerBase: 10,
    engagementRate: 5,
  })

  const [pricing, setPricing] = useState<PricingParameters>({
    baseFee: 10,
    volumeFee: 2.5,
    performanceFee: 15,
    minPrice: 50,
    maxPrice: 500,
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handlePricingChange = (key: keyof PricingParameters, value: number) => {
    setPricing((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0)
  const isWeightValid = totalWeights === 100

  const calculateSampleScore = () => {
    return Math.round((Math.random() * 100) / 10) * 10 + 50
  }

  const calculateSamplePrice = () => {
    const baseScore = calculateSampleScore()
    return Math.round((baseScore / 100) * (pricing.maxPrice - pricing.minPrice) + pricing.minPrice)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="weights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weights">Scoring Weights</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="weights">
          <Card>
            <CardHeader>
              <CardTitle>Signal Scoring Weights</CardTitle>
              <CardDescription>
                Adjust how different factors contribute to signal score calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <Badge variant="secondary">{value}%</Badge>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) =>
                      handleWeightChange(key as keyof ScoringWeights, Array.isArray(val) ? val[0] : val)
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              ))}

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Weight</span>
                  <Badge variant={isWeightValid ? 'secondary' : 'destructive'}>
                    {totalWeights}%
                  </Badge>
                </div>
                {!isWeightValid && (
                  <p className="text-xs text-red-600 mt-2">Total must equal 100%</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Preview</h3>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Sample signal scoring:</p>
                  <Badge className="text-lg px-4 py-2">{calculateSampleScore()} / 100</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">Cancel</Button>
                <Button disabled={!isWeightValid || !hasChanges}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Parameters</CardTitle>
              <CardDescription>
                Configure pricing calculation and fee structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Fee (%)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pricing.baseFee}
                    onChange={(e) => handlePricingChange('baseFee', parseFloat(e.target.value) || 0)}
                    step="0.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Volume Fee (%)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pricing.volumeFee}
                    onChange={(e) => handlePricingChange('volumeFee', parseFloat(e.target.value) || 0)}
                    step="0.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Performance Fee (%)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pricing.performanceFee}
                    onChange={(e) => handlePricingChange('performanceFee', parseFloat(e.target.value) || 0)}
                    step="0.5"
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-sm">Price Range</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Price ($)</label>
                  <Input
                    type="number"
                    value={pricing.minPrice}
                    onChange={(e) => handlePricingChange('minPrice', parseFloat(e.target.value) || 0)}
                    step="10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Price ($)</label>
                  <Input
                    type="number"
                    value={pricing.maxPrice}
                    onChange={(e) => handlePricingChange('maxPrice', parseFloat(e.target.value) || 0)}
                    step="10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Price Preview</h3>
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">Sample signal at score 65:</p>
                  <Badge className="text-lg px-4 py-2">${calculateSamplePrice()}</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">Cancel</Button>
                <Button disabled={!hasChanges}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
