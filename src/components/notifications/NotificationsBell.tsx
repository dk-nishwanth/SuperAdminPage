import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead, markAllNotificationsRead, NotificationItem } from '@/services/authApi'
import { Button, Badge } from '@/components/ui/primitives'
import { formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'

export const NotificationsBell: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['notifications', { cursor }],
    queryFn: () => getNotifications({ cursor, limit: 10 }),
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  })
  const items = data?.items ?? []
  const nextCursor = data?.nextCursor
  const unreadCount = items.filter(n=>!n.read).length

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="relative">
      <button aria-label="Notifications" className="relative rounded-md p-2 hover:bg-gray-100" onClick={()=> setOpen(v=>!v)}>
        <span>🔔</span>
        {unreadCount>0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-lg z-40">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center gap-2">
              <button className="text-xs text-gray-600 hover:text-gray-900" onClick={()=> markAll.mutate()}>
                Mark all read
              </button>
              <Link to="/notifications" className="text-xs text-green-700 hover:text-green-900" onClick={()=> setOpen(false)}>
                Open
              </Link>
            </div>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length===0 && <div className="p-4 text-sm text-gray-600">No notifications</div>}
            {items.map(n=> (
              <div key={n.id} className="px-3 py-2 border-b last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{n.title}</div>
                      <Badge color={n.severity==='error' ? 'red' : n.severity==='success' ? 'green' : 'gray'}>{n.type}</Badge>
                    </div>
                    {n.body && <div className="text-xs text-gray-600">{n.body}</div>}
                    <div className="text-[11px] text-gray-500 mt-1">{formatDate(n.createdAt)}</div>
                  </div>
                  {!n.read && <Button variant="secondary" onClick={()=> markRead.mutate(n.id)}>Mark read</Button>}
                </div>
              </div>
            ))}
            {nextCursor && (
              <div className="p-2 text-center">
                <Button variant="secondary" onClick={()=> setCursor(nextCursor)}>Load more</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
