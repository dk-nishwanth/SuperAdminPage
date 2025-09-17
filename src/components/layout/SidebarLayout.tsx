import React from 'react'
import { Link } from 'react-router-dom'

interface NavItem { id: string; label: string; icon?: React.ReactNode }

export const SidebarLayout: React.FC<{
  nav: NavItem[]
  activeId: string
  onSelect: (id: string) => void
  children: React.ReactNode
}> = ({ nav, activeId, onSelect, children }) => {
  return (
    <div className="min-h-[calc(100vh-56px)] grid grid-cols-12">
      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#0b1220] via-slate-900 to-slate-800 text-white">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-lg font-bold">D</div>
            <div>
              <div className="text-sm text-white/70">Super Console</div>
              <div className="font-semibold">DSA Learn</div>
            </div>
          </div>
        </div>
        <nav className="px-2">
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              className={`w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 mb-1 transition-colors ${activeId===n.id ? 'bg-violet-600 text-white shadow' : 'text-white/85 hover:bg-white/10'}`}
            >
              <span className="text-base">{n.icon}</span>
              <span className="text-sm font-medium">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto p-3 text-xs text-white/60 hidden md:block">
          © {new Date().getFullYear()} DSA Learn
        </div>
      </aside>

      {/* Content */}
      <main className="col-span-12 md:col-span-9 lg:col-span-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
