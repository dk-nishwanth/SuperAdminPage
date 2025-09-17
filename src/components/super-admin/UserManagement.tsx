import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge, Button, Dialog, Input, Select } from '@/components/ui/primitives'
import { DataTable } from './Shared/DataTable'
import { ExportMenu, exportCSV, exportPDF } from './Shared/ExportMenu'
import { getUsers, toggleUserActive, User } from '@/services/superAdminApi'
import { formatDate } from '@/utils/format'
import { toast } from '@/components/ui/useToast'

interface Props { globalSearch: string }

export default function UserManagement({ globalSearch }: Props) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [search, setSearch] = React.useState(globalSearch)
  const [role, setRole] = React.useState<'all'|'student'|'teacher'|'admin'|'super_admin'>('all')
  const [status, setStatus] = React.useState<'all'|'active'|'suspended'>('all')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [viewUser, setViewUser] = React.useState<User | null>(null)
  const qc = useQueryClient()

  React.useEffect(()=> setSearch(globalSearch), [globalSearch])

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, pageSize, search, role, status, sorting }],
    queryFn: () => getUsers({ page, pageSize, search, role, status, sort: sorting.map(s=> ({ id: s.id as string, desc: s.desc })) }),
    keepPreviousData: true,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleUserActive(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const items = data?.items ?? []

  const columns: ColumnDef<User & { progress?: number | null }>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
          {row.original.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
        </div>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      </div>
    ), sortingFn: 'alphanumeric' },
    { accessorKey: 'role', header: 'Role' },
    { id: 'progress', header: 'Progress %', cell: ({ row }) => row.original.role==='student' ? (data?.studentsProgress.find(s=>s.userId===row.original.id)?.progress ?? 0) : '—' },
    { accessorKey: 'lastLoginAt', header: 'Last Login', cell: ({ getValue }) => formatDate(getValue() as string) },
    { id: 'status', header: 'Status', cell: ({ row }) => row.original.isActive ? <Badge color="green">Active</Badge> : <Badge color="red">Suspended</Badge> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={()=> setViewUser(row.original)}>View</Button>
        {row.original.isActive ? (
          <Button variant="ghost" onClick={()=> handleToggle(row.original, false)}>Suspend</Button>
        ) : (
          <Button variant="ghost" onClick={()=> handleToggle(row.original, true)}>Activate</Button>
        )}
      </div>
    ) },
  ]

  function handleToggle(user: User, makeActive: boolean) {
    // optimistic
    const prev = qc.getQueryData<any>(['users', { page, pageSize, search, role, status, sorting }])
    qc.setQueryData<any>(['users', { page, pageSize, search, role, status, sorting }], (old: any)=> ({
      ...old,
      items: (old?.items ?? []).map((u:User)=> u.id===user.id ? { ...u, isActive: makeActive } : u)
    }))
    toggleMutation.mutate({ id: user.id, isActive: makeActive }, {
      onSuccess: ()=> toast({ title: makeActive ? 'User activated' : 'User suspended' }),
      onError: (err)=> {
        qc.setQueryData(['users', { page, pageSize, search, role, status, sorting }], prev)
        toast({ title: 'Action failed', description: (err as Error).message })
      }
    })
  }

  const exportRows = items.map(u=> ({ ...u, progress: u.role==='student' ? data?.studentsProgress.find(s=>s.userId===u.id)?.progress ?? 0 : '' }))
  const exportCols = [
    { header: 'Name', accessor: (r: any)=> r.name },
    { header: 'Email', accessor: (r: any)=> r.email },
    { header: 'Role', accessor: (r: any)=> r.role },
    { header: 'Progress %', accessor: (r: any)=> r.progress },
    { header: 'Last Login', accessor: (r: any)=> formatDate(r.lastLoginAt) },
    { header: 'Status', accessor: (r: any)=> r.isActive ? 'Active' : 'Suspended' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Users" value={data?.total ?? 0} />
        <Stat label="Total Students" value={(data?.items ?? []).filter(i=>i.role==='student').length} />
        <Stat label="Teachers/Admins" value={(data?.items ?? []).filter(i=>i.role!=='student').length} />
        <Stat label="Active Today" value={(data?.items ?? []).filter(i=> new Date(i.lastLoginAt) >= new Date(new Date().toDateString())).length} />
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search name/email" value={search} onChange={e=> setSearch(e.target.value)} className="w-60" />
        <Select value={role} onChange={e=> setRole(e.target.value as any)}>
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        <Select value={status} onChange={e=> setStatus(e.target.value as any)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <DataTable
        columns={columns as any}
        data={items as any}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sorting={sorting}
        onSortingChange={setSorting}
        search={search}
        onSearchChange={setSearch}
        right={<ExportMenu onExportCSV={()=> exportCSV(exportRows, exportCols, 'users.csv')} onExportPDF={()=> exportPDF(exportRows, exportCols, 'Users', 'users.pdf')} />}
      />

      <Dialog open={!!viewUser} onClose={()=> setViewUser(null)} title="User Profile">
        {viewUser && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                {viewUser.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <div className="font-medium">{viewUser.name}</div>
                <div className="text-sm text-gray-600">{viewUser.email}</div>
                <div className="text-xs">Role: {viewUser.role}</div>
              </div>
            </div>
            <div className="text-sm">Last login: {formatDate(viewUser.lastLoginAt)}</div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={()=> setViewUser(null)}>Close</Button>
              {viewUser.isActive ? (
                <Button variant="ghost" onClick={()=> handleToggle(viewUser, false)}>Suspend</Button>
              ) : (
                <Button variant="ghost" onClick={()=> handleToggle(viewUser, true)}>Activate</Button>
              )}
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
