import React, { createContext, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from '@/components/ui/useToast'
import { loginWithEmail as apiLoginWithEmail, verifyToken } from '@/services/authApi'

export type Role = 'student' | 'teacher' | 'admin' | 'super_admin'

export interface UserAuth {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthContextType {
  user: UserAuth | null
  loading: boolean
  loginAs: (role: Role) => void
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = new URLSearchParams(window.location.search)
  const roleParam = (params.get('role') as Role) || undefined
  const [user, setUser] = useState<UserAuth | null>(() => {
    const fromStorage = localStorage.getItem('auth_user')
    if (fromStorage) try { return JSON.parse(fromStorage) } catch {}
    if (roleParam) return { id: 'u0', name: `${roleParam} user`, email: `${roleParam}@example.com`, role: roleParam }
    return null
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const value = useMemo(() => ({
    user,
    loading,
    loginAs: (role: Role) => {
      setUser({ id: 'uX', name: `${role} user`, email: `${role}@example.com`, role })
      localStorage.setItem('auth_user', JSON.stringify({ id: 'uX', name: `${role} user`, email: `${role}@example.com`, role }))
      navigate(location.state?.from ?? '/super-admin', { replace: true })
    },
    loginWithEmail: async (email: string, password: string) => {
      try {
        setLoading(true)
        const { user } = await apiLoginWithEmail(email, password)
        if (user.role !== 'super_admin') {
          throw new Error('Only super_admin may access this console')
        }
        setUser(user as UserAuth)
        localStorage.setItem('auth_user', JSON.stringify(user))
        navigate(location.state?.from ?? '/super-admin', { replace: true })
        toast({ title: 'Logged in' })
      } catch (e) {
        toast({ title: 'Login failed', description: (e as Error).message })
        throw e
      } finally {
        setLoading(false)
      }
    },
    loginWithToken: async (token: string) => {
      try {
        setLoading(true)
        const { user } = await verifyToken(token)
        if (user.role !== 'super_admin') {
          throw new Error('Only super_admin may access this console')
        }
        setUser(user as UserAuth)
        localStorage.setItem('auth_user', JSON.stringify(user))
        navigate(location.state?.from ?? '/super-admin', { replace: true })
        toast({ title: 'SSO success', description: 'Signed in via main website' })
      } catch (e) {
        toast({ title: 'SSO failed', description: (e as Error).message })
        throw e
      } finally {
        setLoading(false)
      }
    },
    logout: () => {
      setUser(null)
      localStorage.removeItem('auth_user')
      navigate('/login')
    }
  }), [user, loading, navigate, location])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const RequireSuperAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loginWithToken, loading } = useAuth()
  const location = useLocation()

  const unauthorized = !user || user.role !== 'super_admin'

  // If an SSO token is present in URL, try to log in silently
  React.useEffect(() => {
    if (!unauthorized) return
    const params = new URLSearchParams(location.search)
    const token = params.get('sso') || params.get('token') || params.get('ssoToken')
    if (token) {
      loginWithToken(token).catch(() => {
        toast({ title: 'Insufficient permissions', description: 'Only Super Admins can access this page.' })
      })
    }
  }, [unauthorized, location.search, loginWithToken])

  if (unauthorized) {
    const params = new URLSearchParams(location.search)
    const token = params.get('sso') || params.get('token') || params.get('ssoToken')
    if (token || loading) {
      return <div className="container py-20 text-center text-sm text-gray-600">Checking permissions...</div>
    }
    toast({ title: 'Insufficient permissions', description: 'Only Super Admins can access this page.' })
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <>{children}</>
}
