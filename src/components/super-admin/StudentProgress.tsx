import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, Dialog, Input, Select } from '@/components/ui/primitives'
import { DataTable } from './Shared/DataTable'
import { ExportMenu, exportCSV, exportPDF } from './Shared/ExportMenu'
import { getStudentProgressSummary, getStudentProfile, getUsers, User } from '@/services/superAdminApi'
import { formatDate } from '@/utils/format'

interface Props { globalSearch: string }

export default function StudentProgress({ globalSearch }: Props) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState(globalSearch)
  const [topicFilter, setTopicFilter] = React.useState<string>('all')
  const [activity, setActivity] = React.useState<'all'|'active_today'>('all')
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)

  React.useEffect(()=> setSearch(globalSearch), [globalSearch])

  const { data: studentsRes } = useQuery({
    queryKey: ['students', { page, pageSize, search }],
    queryFn: () => getUsers({ page, pageSize, search, role: 'student', status: 'all', sort: [{ id: 'name' }] }),
    keepPreviousData: true,
  })

  const { data: summary } = useQuery({
    queryKey: ['students-summary'],
    queryFn: () => getStudentProgressSummary({ dateRange: { from: new Date(Date.now()-30*24*3600*1000).toISOString(), to: new Date().toISOString() } }),
  })

  const { data: profile } = useQuery({
    enabled: !!selectedUserId,
    queryKey: ['student-profile', selectedUserId],
    queryFn: () => getStudentProfile(selectedUserId!)
  })

  const rows = (studentsRes?.items ?? []).map(u => ({ ...u, progress: studentsRes?.studentsProgress.find(s=>s.userId===u.id)?.progress ?? 0 }))
    .filter(r => activity==='all' ? true : new Date(r.lastLoginAt) >= new Date(new Date().toDateString()))

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Student', cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-gray-500">{row.original.email}</span>
      </div>
    ) },
    { accessorKey: 'progress', header: 'Progress %' },
    { accessorKey: 'lastLoginAt', header: 'Last Login', cell: ({ getValue }) => formatDate(getValue() as string) },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <Button variant="secondary" onClick={()=> setSelectedUserId(row.original.id)}>View</Button> },
  ]

  const exportCols = [
    { header: 'Name', accessor: (r: any)=> r.name },
    { header: 'Email', accessor: (r: any)=> r.email },
    { header: 'Progress %', accessor: (r: any)=> r.progress },
    { header: 'Last Login', accessor: (r: any)=> formatDate(r.lastLoginAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Total Students Enrolled" value={summary?.totalStudents ?? rows.length} />
        <Stat label="Average Completion %" value={summary?.averageCompletion ?? 0} />
        <Stat label="Active Students Today" value={summary?.activeToday ?? 0} />
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search students" value={search} onChange={e=> setSearch(e.target.value)} className="w-60" />
        <Select value={activity} onChange={e=> setActivity(e.target.value as any)}>
          <option value="all">All</option>
          <option value="active_today">Active today</option>
        </Select>
        <Select value={topicFilter} onChange={e=> setTopicFilter(e.target.value)}>
          <option value="all">All topics</option>
          {['Arrays','Strings','Trees','Graphs','DP','Searching','Sorting'].map(t=> <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        total={studentsRes?.total ?? rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={setSearch}
        right={<ExportMenu onExportCSV={()=> exportCSV(rows, exportCols, 'students.csv')} onExportPDF={()=> exportPDF(rows, exportCols, 'Students', 'students.pdf')} />}
      />

      <Dialog open={!!selectedUserId} onClose={()=> setSelectedUserId(null)} title="Student Profile">
        {profile && (
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold">{profile.user.name} <Badge color="gray">{profile.user.role}</Badge></div>
              <div className="text-sm text-gray-600">{profile.user.email}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Progress by Topic</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(profile.progress.topics).map(([k,v])=> (
                  <div key={k} className="space-y-1">
                    <div className="text-sm">{k}</div>
                    <div className="w-full h-2 bg-gray-200 rounded">
                      <div className="h-2 bg-blue-500 rounded" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Completed Tests</div>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Score %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile.progress.completedTests.map(t=> (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-sm">{formatDate(t.date)}</td>
                        <td className="px-3 py-2 text-sm">{t.title}</td>
                        <td className="px-3 py-2 text-sm">{t.scorePct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Certification</div>
              <Badge color={profile.progress.certification.status==='Certified' ? 'green' : 'gray'}>
                {profile.progress.certification.status}
              </Badge>
              {profile.progress.certification.issuedOn && (
                <div className="text-xs text-gray-600 mt-1">Issued on {formatDate(profile.progress.certification.issuedOn)}</div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary">Message Student</Button>
              <Button variant="secondary">Reset Password</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

const Stat: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="p-4 border rounded-md bg-white">
    <div className="text-xs text-gray-600">{label}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
)
