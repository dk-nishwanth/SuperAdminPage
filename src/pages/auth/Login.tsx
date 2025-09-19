import React from 'react'
import { Card, CardContent, CardHeader, Input } from '@/components/ui/primitives'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

export default function Login() {
  const { loginWithEmail, loading } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    await loginWithEmail(email, password)
  }
  

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left: dark panel with brand and CTA */}
      <div className="hidden md:flex flex-col justify-center px-12 bg-[#1c1c1c] text-white">
        <div>
          <div className="text-3xl font-semibold tracking-tight" style={{ color: '#7ed957' }}>Super Admin</div>
          <p className="mt-5 text-2xl leading-snug max-w-xl text-white/85">complete control for administrators</p>
         
        </div>
      </div>

      {/* Right: light panel with login form */}
      <div className="bg-[#f9f9f9] flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-semibold">Super Admin Login</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmitEmail} className="space-y-4">
              <div>
                <label className="text-xs text-gray-600">Username / Email</label>
                <Input value={email} onChange={e=> setEmail(e.target.value)} placeholder="Enter your email id" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Password</label>
                <Input value={password} onChange={e=> setPassword(e.target.value)} placeholder="Enter password" type="password" />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-lg bg-gray-900 text-white px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                onMouseOver={e=> (e.currentTarget.style.backgroundColor = '#374151')}
                onMouseOut={e=> (e.currentTarget.style.backgroundColor = '#111827')}
                style={{ backgroundColor: '#111827' }}
              >
                {loading ? 'Signing in…' : 'Login as Super Admin'}
              </button>
              <div className="text-center">
                <button type="button" className="text-xs text-gray-600 hover:text-gray-800">Forgot Password?</button>
              </div>
              <div className="text-[11px] text-gray-500 text-center">Use your configured credentials to access the console.</div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
