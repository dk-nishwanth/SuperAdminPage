import React from 'react'
import { useToastQueue } from './useToast'

export const Toaster: React.FC = () => {
  const { toasts } = useToastQueue()
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className="bg-gray-900 text-white px-4 py-3 rounded shadow">
          <div className="font-medium">{t.title}</div>
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
