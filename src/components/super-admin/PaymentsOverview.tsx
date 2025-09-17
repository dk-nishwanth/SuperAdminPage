import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, Input, Select } from '@/components/ui/primitives'
import { DataTable } from './Shared/DataTable'
import { ExportMenu, exportCSV, exportPDF } from './Shared/ExportMenu'
import { getRecentTransactions, getRevenueOverview, Transaction } from '@/services/superAdminApi'
import { formatDate, formatINR } from '@/utils/format'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props { globalSearch: string; dateRange: { from: string; to: string } }

export default function PaymentsOverview({ globalSearch, dateRange }: Props) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState(globalSearch)
  const [status, setStatus] = React.useState<'all'|'success'|'failed'>('all')
  const [minAmount, setMinAmount] = React.useState<string>('')
  const [maxAmount, setMaxAmount] = React.useState<string>('')

  React.useEffect(()=> setSearch(globalSearch), [globalSearch])

  const { data: overview } = useQuery({
    queryKey: ['revenue-overview', dateRange],
    queryFn: () => getRevenueOverview({ dateRange }),
  })

  const { data: tx } = useQuery({
    queryKey: ['transactions', { page, pageSize, search, status, minAmount, maxAmount, dateRange }],
    queryFn: () => getRecentTransactions({ page, pageSize, search, status, minAmount: minAmount? Number(minAmount): undefined, maxAmount: maxAmount? Number(maxAmount): undefined, dateRange }),
    keepPreviousData: true,
  })

  const rows = tx?.items ?? []

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: 'name', header: 'Student Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => String(getValue()).toUpperCase() },
    { accessorKey: 'amountInINR', header: 'Amount', cell: ({ getValue }) => formatINR(getValue() as number) },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue() as string) },
  ]

  const exportCols = [
    { header: 'Student Name', accessor: (r: Transaction)=> r.name },
    { header: 'Email', accessor: (r: Transaction)=> r.email },
    { header: 'Status', accessor: (r: Transaction)=> r.status },
    { header: 'Amount', accessor: (r: Transaction)=> r.amountInINR },
    { header: 'Date', accessor: (r: Transaction)=> formatDate(r.date) },
  ]

  const revenueSpark = [
    { date: 'Monthly', value: overview?.monthlyRevenueINR ?? 0 },
    { date: 'Lifetime', value: overview?.lifetimeRevenueINR ?? 0 },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="text-sm text-gray-600">Monthly Revenue</CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatINR(overview?.monthlyRevenueINR ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-gray-600">Lifetime Revenue</CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatINR(overview?.lifetimeRevenueINR ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-gray-600">Active Subscriptions</CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{overview?.activeSubscriptions ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-gray-600">Failed Payments</CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{overview?.failedPayments ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-medium">Revenue Trend</div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSpark}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Area dataKey="value" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search name/email" value={search} onChange={e=> setSearch(e.target.value)} className="w-60" />
        <Select value={status} onChange={e=> setStatus(e.target.value as any)}>
          <option value="all">All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </Select>
        <Input placeholder="Min amount" value={minAmount} onChange={e=> setMinAmount(e.target.value)} className="w-32" />
        <Input placeholder="Max amount" value={maxAmount} onChange={e=> setMaxAmount(e.target.value)} className="w-32" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        total={tx?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={setSearch}
        right={<ExportMenu onExportCSV={()=> exportCSV(rows, exportCols, 'transactions.csv')} onExportPDF={()=> exportPDF(rows, exportCols, 'Transactions', 'transactions.pdf')} />}
      />
    </div>
  )
}
