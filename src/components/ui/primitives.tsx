import React from 'react'

// Minimal className joiner to avoid external dependency
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }>
= ({ className, variant = 'primary', ...props }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors shadow-sm',
      variant === 'primary' && 'bg-green-600 text-white hover:bg-green-700',
      variant === 'secondary' && 'bg-white text-slate-900 border hover:bg-gray-50',
      variant === 'ghost' && 'hover:bg-gray-100',
      className
    )}
    {...props}
  />
)

export const Card: React.FC<{ className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cn('card', className)} {...rest}>{children}</div>
)
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('card-header', className)} {...rest} />
)
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('card-content', className)} {...rest} />
)

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500', className)} {...props} />
))
Input.displayName = 'Input'

export const Badge: React.FC<{ color?: 'green' | 'red' | 'gray'; children: React.ReactNode }> = ({ color = 'gray', children }) => {
  const map: Record<'green'|'red'|'gray', string> = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  }
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', map[color])}>{children}</span>
}

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, ...props }) => (
  <select className={cn('rounded-lg border px-2.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500', className)} {...props} />
)

export const Tabs: React.FC<{ tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="bg-white border rounded-xl p-1 inline-flex">
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cn(
          'px-3.5 py-2 text-sm rounded-lg',
          active === t.id ? 'bg-green-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
)

export const Dialog: React.FC<{ open: boolean; onClose: () => void; title?: string; children: React.ReactNode }>= ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <button aria-label="Close" className="text-gray-500 hover:text-gray-900" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
