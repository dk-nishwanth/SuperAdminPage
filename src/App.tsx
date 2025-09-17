import { Outlet, Link, useLocation } from 'react-router-dom'
import { Toaster } from './components/ui/Toaster'
import { NotificationsBell } from '@/components/notifications/NotificationsBell'
import { Button } from '@/components/ui/primitives'
import { useAuth } from '@/context/AuthContext'

export default function App() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isLogin = location.pathname.startsWith('/login')
  return (
    <div className="min-h-screen bg-gray-50">
      {!isLogin && (
        <header className="sticky top-0 z-40 border-b bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#0b1220] via-slate-900 to-slate-800 text-white">
          <div className="container h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/super-admin" className="font-semibold text-white">Super Admin</Link>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsBell />
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-white/90">{user.name} • {user.role}</div>
                  <Button variant="secondary" onClick={logout}>Logout</Button>
                </div>
              ) : (
                <Link to="/login" className="text-sm text-green-300 hover:text-white">Login</Link>
              )}
            </div>
          </div>
        </header>
      )}
      <Outlet />
      <Toaster />
    </div>
  )
}
