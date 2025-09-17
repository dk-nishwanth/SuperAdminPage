import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Button, Input, Select } from '@/components/ui/primitives'

export interface DataTableProps<T> {
  columns: ColumnDef<T, any>[]
  data: T[]
  total: number
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  sorting?: SortingState
  onSortingChange?: (s: SortingState) => void
  search?: string
  onSearchChange?: (s: string) => void
  right?: React.ReactNode
}

export function DataTable<T extends object>({ columns, data, total, page, pageSize, onPageChange, onPageSizeChange, sorting, onSortingChange, search, onSearchChange, right }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          {onSearchChange && <Input placeholder="Search..." value={search ?? ''} onChange={e=> onSearchChange(e.target.value)} className="w-56" />}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Select value={String(pageSize)} onChange={e=> onPageSizeChange(Number(e.target.value))}>
            {[10,20,50].map(s=> <option key={s} value={s}>{s}/page</option>)}
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-3 py-2 text-left text-xs font-semibold text-gray-700 select-none">
                    {h.isPlaceholder ? null : (
                      <div className={h.column.getCanSort() ? 'cursor-pointer select-none' : ''} onClick={h.column.getToggleSortingHandler()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: ' ▲', desc: ' ▼' }[h.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                {r.getVisibleCells().map(c => (
                  <td key={c.id} className="px-3 py-2 text-sm text-gray-800">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length===0 && (
              <tr><td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={columns.length}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • Total {total}</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={()=> onPageChange(1)} disabled={page===1}>« First</Button>
          <Button variant="secondary" onClick={()=> onPageChange(Math.max(1, page-1))} disabled={page===1}>‹ Prev</Button>
          <Button variant="secondary" onClick={()=> onPageChange(Math.min(totalPages, page+1))} disabled={page===totalPages}>Next ›</Button>
          <Button variant="secondary" onClick={()=> onPageChange(totalPages)} disabled={page===totalPages}>Last »</Button>
        </div>
      </div>
    </div>
  )
}
