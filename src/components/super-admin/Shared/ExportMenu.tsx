import React from 'react'
import { Button } from '@/components/ui/primitives'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportColumn<T> { header: string; accessor: (row: T) => any }

export function exportCSV<T>(rows: T[], columns: ExportColumn<T>[], filename = 'export.csv') {
  const headers = columns.map(c=>c.header)
  const body = rows.map(r=> columns.map(c=> c.accessor(r)))
  const csv = [headers.join(','), ...body.map(r=> r.map(v=> `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename)
}

export function exportPDF<T>(rows: T[], columns: ExportColumn<T>[], title = 'Report', filename = 'report.pdf') {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.text(title, 14, 16)
  const head = [columns.map(c=>c.header)]
  const body = rows.map(r=> columns.map(c=> c.accessor(r)))
  autoTable(doc, { head, body, startY: 22 })
  doc.save(filename)
}

export const ExportMenu: React.FC<{ onExportCSV: () => void; onExportPDF: () => void }>= ({ onExportCSV, onExportPDF }) => (
  <div className="flex gap-2">
    <Button variant="secondary" onClick={onExportCSV}>Export CSV</Button>
    <Button variant="secondary" onClick={onExportPDF}>Export PDF</Button>
  </div>
)
