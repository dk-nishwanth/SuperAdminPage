import React from 'react'
import { DateRangePicker, DateRange } from '@/components/super-admin/Shared/DateRangePicker'
import { Input, Tabs } from '@/components/ui/primitives'
import UserManagement from '@/components/super-admin/UserManagement'
import StudentProgress from '@/components/super-admin/StudentProgress'
import PaymentsOverview from '@/components/super-admin/PaymentsOverview'
import TeacherManagement from '@/components/super-admin/TeacherManagement'
import AnalyticsReports from '@/components/super-admin/AnalyticsReports'
// Sidebar removed per request; using simple container layout

function useQueryState(key: string, initial: string) {
  const [value, setValue] = React.useState(() => new URLSearchParams(location.search).get(key) || initial)
  React.useEffect(() => {
    const sp = new URLSearchParams(location.search)
    sp.set(key, value)
    const url = `${location.pathname}?${sp.toString()}`
    window.history.replaceState({}, '', url)
  }, [key, value])
  return [value, setValue] as const
}

export default function SuperAdmin() {
  const [tab, setTab] = useQueryState('tab', 'users')
  const [search, setSearch] = useQueryState('q', '')
  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    const to = new Date().toISOString()
    const from = new Date(Date.now()-30*24*3600*1000).toISOString()
    return { from, to }
  })

  const tabs = [
    { id: 'users', label: 'User Management' },
    { id: 'students', label: 'Student Progress' },
    { id: 'payments', label: 'Payments & Subscriptions' },
    { id: 'teachers', label: 'Admin / Teacher Management' },
    { id: 'analytics', label: 'Analytics & Reports' },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Manage users, payments, analytics, and more</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Global search..." value={search} onChange={e=>setSearch(e.target.value)} className="w-64" />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="section">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className="section">
        {tab==='users' && <UserManagement globalSearch={search} />}
        {tab==='students' && <StudentProgress globalSearch={search} />}
        {tab==='payments' && <PaymentsOverview globalSearch={search} dateRange={dateRange} />}
        {tab==='teachers' && <TeacherManagement globalSearch={search} />}
        {tab==='analytics' && <AnalyticsReports dateRange={dateRange} />}
      </div>
    </div>
  )
}
