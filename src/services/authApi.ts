import { formatISO, subMinutes } from 'date-fns'

export type Role = 'student' | 'teacher' | 'admin' | 'super_admin'
export interface AuthUser { id: string; name: string; email: string; role: Role }
export type NotificationType = 'system' | 'payment' | 'account' | 'report'
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success'
export interface NotificationItem {
  id: string
  title: string
  body?: string
  createdAt: string
  read: boolean
  type: NotificationType
  severity: NotificationSeverity
  link?: string
}

let tokenStore = new Map<string, AuthUser>()

// Seed a deterministic SSO token for demo
const demoUser: AuthUser = { id: 'sa_1', name: 'Super Admin', email: '', role: 'super_admin' }
const DEMO_TOKEN = 'demo-sso-token-123'
if (!tokenStore.has(DEMO_TOKEN)) tokenStore.set(DEMO_TOKEN, demoUser)

export async function verifyToken(token: string): Promise<{ user: AuthUser }>{
  // Simulate network delay and verification
  await new Promise(r=> setTimeout(r, 400))
  const user = tokenStore.get(token)
  if (!user) throw new Error('Invalid or expired token')
  return { user }
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: AuthUser }>{
  await new Promise(r=> setTimeout(r, 400))
  if (!email || !password) throw new Error('Missing credentials')
  // Simple fixed credentials for your console
  if (email === 'dknishwanth1718@gmail.com' && password === 'Nishwanth') {
    return { user: { id: 'auth_superadmin', name: 'Nishwanth', email, role: 'super_admin' } }
  }
  // Fallback mock for other emails (will be rejected by super_admin-only guard in AuthContext)
  if (!email.includes('@')) throw new Error('Invalid email')
  const role: Role = 'admin'
  return { user: { id: 'auth_'+email, name: email.split('@')[0], email, role } }
}

export async function sendMagicLink(email: string): Promise<{ sent: true }>{
  await new Promise(r=> setTimeout(r, 400))
  if (!email) throw new Error('Email required')
  return { sent: true }
}

// Notifications mock
let notifications: NotificationItem[] = Array.from({ length: 18 }).map((_,i)=> ({
  id: 'n_'+i,
  title: [
    'New subscription activated',
    'Payment failed',
    'Teacher assigned a student',
    'Account password reset',
    'User re-activated',
    'Monthly revenue report ready',
  ][i%6],
  body: 'Mock notification #'+i,
  createdAt: formatISO(subMinutes(new Date(), i*9)),
  read: i>5,
  type: (['payment','payment','account','account','system','report'] as NotificationType[])[i%6],
  severity: (['success','error','info','warning','success','info'] as NotificationSeverity[])[i%6],
  link: i%6===5 ? '/super-admin?tab=analytics' : undefined,
}))

export async function getNotifications(params?: {
  cursor?: string
  limit?: number
  unread?: boolean
  q?: string
  type?: NotificationType | 'all'
}): Promise<{ items: NotificationItem[]; nextCursor?: string }>{
  await new Promise(r=> setTimeout(r, 200))
  const { cursor, limit = 10, unread = false, q = '', type = 'all' } = params || {}

  let items = notifications.slice().sort((a,b)=> b.createdAt.localeCompare(a.createdAt))
  if (unread) items = items.filter(n=> !n.read)
  if (q) {
    const low = q.toLowerCase()
    items = items.filter(n=> n.title.toLowerCase().includes(low) || (n.body||'').toLowerCase().includes(low))
  }
  if (type !== 'all') items = items.filter(n=> n.type === type)

  let startIndex = 0
  if (cursor) {
    const idx = items.findIndex(n=> n.id === cursor)
    startIndex = idx >= 0 ? idx + 1 : 0
  }
  const page = items.slice(startIndex, startIndex + limit)
  const nextCursor = page.length === limit ? page[page.length - 1].id : undefined
  return { items: page, nextCursor }
}

export async function markNotificationRead(id: string): Promise<{ ok: true }>{
  await new Promise(r=> setTimeout(r, 200))
  notifications = notifications.map(n=> n.id===id ? { ...n, read: true } : n)
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<{ ok: true }>{
  await new Promise(r=> setTimeout(r, 200))
  notifications = notifications.map(n=> ({ ...n, read: true }))
  return { ok: true }
}

// Optional: simulate background generation of a new notification
let seedCounter = 1000
export function pushMockNotification(partial: Partial<NotificationItem>) {
  const n: NotificationItem = {
    id: 'n_'+seedCounter++,
    title: partial.title || 'System update',
    body: partial.body || 'Background task completed',
    createdAt: formatISO(new Date()),
    read: false,
    type: partial.type || 'system',
    severity: partial.severity || 'info',
    link: partial.link,
  }
  notifications = [n, ...notifications]
}
