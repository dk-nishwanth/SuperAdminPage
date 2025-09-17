import React from 'react'
import { formatISO, subDays } from 'date-fns'
import { Button, Select } from '@/components/ui/primitives'

export interface DateRange { from: string; to: string }

const presetOptions = [
  { id: 'today', label: 'Today', range: () => { const d = new Date(); const iso = formatISO(d); return { from: iso, to: iso } } },
  { id: '7d', label: 'Last 7d', range: () => { const to = new Date(); const from = subDays(to, 7); return { from: formatISO(from), to: formatISO(to) } } },
  { id: '30d', label: 'Last 30d', range: () => { const to = new Date(); const from = subDays(to, 30); return { from: formatISO(from), to: formatISO(to) } } },
]

export const DateRangePicker: React.FC<{ value: DateRange; onChange: (v: DateRange) => void }>= ({ value, onChange }) => {
  const [mode, setMode] = React.useState<'preset' | 'custom'>('preset')
  const [preset, setPreset] = React.useState<string>('30d')

  React.useEffect(()=>{
    if (mode==='preset') {
      const found = presetOptions.find(p=>p.id===preset) ?? presetOptions[2]
      onChange(found.range())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, preset])

  return (
    <div className="flex items-center gap-2">
      <Select value={mode} onChange={e=> setMode(e.target.value as any)}>
        <option value="preset">Preset</option>
        <option value="custom">Custom</option>
      </Select>
      {mode==='preset' ? (
        <Select value={preset} onChange={e=> setPreset(e.target.value)}>
          {presetOptions.map(p=> <option key={p.id} value={p.id}>{p.label}</option>)}
        </Select>
      ) : (
        <div className="flex items-center gap-2">
          <input type="date" className="border rounded px-2 py-1 text-sm" value={value.from.slice(0,10)} onChange={e=> onChange({ ...value, from: new Date(e.target.value).toISOString() })} />
          <span className="text-sm">to</span>
          <input type="date" className="border rounded px-2 py-1 text-sm" value={value.to.slice(0,10)} onChange={e=> onChange({ ...value, to: new Date(e.target.value).toISOString() })} />
        </div>
      )}
      <Button variant="secondary" onClick={()=> onChange({ ...value })}>Apply</Button>
    </div>
  )
}
