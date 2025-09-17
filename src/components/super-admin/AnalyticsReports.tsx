import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Select } from '@/components/ui/primitives'
import { ExportMenu, exportCSV, exportPDF } from './Shared/ExportMenu'
import { getAnalytics, GrowthPoint, RevenuePoint, TopicPopularity } from '@/services/superAdminApi'
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

interface Props { dateRange: { from: string; to: string } }

export default function AnalyticsReports({ dateRange }: Props) {
  const [topicFilter, setTopicFilter] = React.useState<string>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => getAnalytics({ dateRange })
  })

  const growth = data?.growth ?? []
  const topicPopularity = (data?.topicPopularity ?? []).filter(t=> topicFilter==='all' ? true : t.topic===topicFilter)
  const revenueTrend = data?.revenueTrend ?? []

  function exportAllCSV() {
    // Export three datasets as separate files
    exportCSV<GrowthPoint>(growth, [ { header: 'Date', accessor: r=> r.date }, { header: 'Students Total', accessor: r=> r.studentsTotal } ], 'growth.csv')
    exportCSV<TopicPopularity>(data?.topicPopularity ?? [], [ { header: 'Topic', accessor: r=> r.topic }, { header: 'Count', accessor: r=> r.count } ], 'topic_popularity.csv')
    exportCSV<RevenuePoint>(revenueTrend, [ { header: 'Date', accessor: r=> r.date }, { header: 'Revenue INR', accessor: r=> r.revenueINR } ], 'revenue_trend.csv')
  }

  function exportAllPDF() {
    exportPDF<GrowthPoint>(growth, [ { header: 'Date', accessor: r=> r.date }, { header: 'Students Total', accessor: r=> r.studentsTotal } ], 'Student Growth', 'growth.pdf')
    exportPDF<TopicPopularity>(data?.topicPopularity ?? [], [ { header: 'Topic', accessor: r=> r.topic }, { header: 'Count', accessor: r=> r.count } ], 'Topic Popularity', 'topic_popularity.pdf')
    exportPDF<RevenuePoint>(revenueTrend, [ { header: 'Date', accessor: r=> r.date }, { header: 'Revenue INR', accessor: r=> r.revenueINR } ], 'Revenue Trend', 'revenue_trend.pdf')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Topic filter:</span>
          <Select value={topicFilter} onChange={e=> setTopicFilter(e.target.value)}>
            <option value="all">All</option>
            {['Arrays','Strings','Trees','Graphs','DP','Searching','Sorting'].map(t=> <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <ExportMenu onExportCSV={exportAllCSV} onExportPDF={exportAllPDF} />
      </div>

      <Card>
        <CardHeader className="font-medium">Student growth over time</CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v)=> format(new Date(v), 'dd MMM')} />
                <YAxis />
                <Tooltip labelFormatter={(v)=> format(new Date(v), 'dd MMM yyyy')} />
                <Line type="monotone" dataKey="studentsTotal" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-medium">Most popular topics</CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicPopularity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-medium">Revenue trend</CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v)=> format(new Date(v), 'dd MMM')} />
                <YAxis />
                <Tooltip labelFormatter={(v)=> format(new Date(v), 'dd MMM yyyy')} />
                <Line type="monotone" dataKey="revenueINR" stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
