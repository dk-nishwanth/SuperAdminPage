import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { AuthProvider, RequireSuperAdmin } from './context/AuthContext'
import SuperAdmin from './pages/SuperAdmin'
import Login from './pages/auth/Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/super-admin" replace /> },
      { path: 'super-admin', element: (<RequireSuperAdmin><SuperAdmin /></RequireSuperAdmin>) },
      { path: 'login', element: <Login /> },
    ],
  },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
