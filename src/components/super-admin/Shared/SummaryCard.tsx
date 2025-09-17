import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/primitives'

export const SummaryCard: React.FC<{ title: string; value: React.ReactNode; subtitle?: string; right?: React.ReactNode }>
= ({ title, value, subtitle, right }) => (
  <Card>
    <CardHeader className="flex items-center justify-between">
      <div className="text-sm text-gray-600">{title}</div>
      {right}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </CardContent>
  </Card>
)
