import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button, Dialog, Input } from '@/components/ui/primitives'
import { DataTable } from './Shared/DataTable'
import { ExportMenu, exportCSV, exportPDF } from './Shared/ExportMenu'
import { getTeacherActivityLogs, getTeachers, Teacher } from '@/services/superAdminApi'
import { formatDate } from '@/utils/format'

interface Props { globalSearch: string }

export default function TeacherManagement({ globalSearch }: Props) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState(globalSearch)
  const [selected, setSelected] = React.useState<Teacher | null>(null)

  React.useEffect(()=> setSearch(globalSearch), [globalSearch])

  const { data } = useQuery({
    queryKey: ['teachers', { page, pageSize, search }],
    queryFn: () => getTeachers({ page, pageSize, search }),
    keepPreviousData: true,
  })

  const { data: logs } = useQuery({
    enabled: !!selected,
    queryKey: ['teacher-logs', selected?.id],
    queryFn: () => getTeacherActivityLogs(selected!.id)
  })

  const rows = data?.items ?? []

  const columns: ColumnDef<Teacher>[] = [
    { accessorKey: 'name', header: 'Teacher Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'assignedStudentsCount', header: 'Assigned Students' },
    { accessorKey: 'lastActivityAt', header: 'Last Activity', cell: ({ getValue }) => formatDate(getValue() as string) },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={()=> setSelected(row.original)}>View Logs</Button>
        <Button variant="ghost">Assign Students</Button>
      </div>
    ) }
  ]

  const exportCols = [
    { header: 'Name', accessor: (r: Teacher)=> r.name },
    { header: 'Email', accessor: (r: Teacher)=> r.email },
    { header: 'Assigned Students', accessor: (r: Teacher)=> r.assignedStudentsCount },
    { header: 'Last Activity', accessor: (r: Teacher)=> formatDate(r.lastActivityAt) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Search teachers" value={search} onChange={e=> setSearch(e.target.value)} className="w-60" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={setSearch}
        right={<ExportMenu onExportCSV={()=> exportCSV(rows, exportCols, 'teachers.csv')} onExportPDF={()=> exportPDF(rows, exportCols, 'Teachers', 'teachers.pdf')} />}
      />

      <Dialog open={!!selected} onClose={()=> setSelected(null)} title="Activity Logs">
        {logs ? (
          <div className="space-y-2 max-h-80 overflow-auto">
            {logs.items.map((l:any)=> (
              <div key={l.id} className="text-sm">
                <span className="font-medium">{selected?.name}</span> {l.text} at {formatDate(l.at)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">Loading...</div>
        )}
      </Dialog>
    </div>
  )
}
