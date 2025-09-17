import { useEffect, useState } from 'react'

export interface ToastProps {
  id?: string
  title: string
  description?: string
  durationMs?: number
}

let listeners: React.Dispatch<React.SetStateAction<ToastProps[]>>[] = []

export function toast(t: ToastProps) {
  const id = `${Date.now()}-${Math.random()}`
  const item = { ...t, id }
  listeners.forEach(set => set(prev => [...prev, item]))
  setTimeout(() => {
    listeners.forEach(set => set(prev => prev.filter(x => x.id !== id)))
  }, t.durationMs ?? 3000)
}

export function useToastQueue() {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter(l => l !== setToasts)
    }
  }, [])
  return { toasts }
}
