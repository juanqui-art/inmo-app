/**
 * DASHBOARD - Página protegida
 * Solo usuarios autenticados pueden verla
 */

import { getUser, logoutAction } from '@/app/actions/auth'
import { Button } from '@repo/ui'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  try {
    // Obtener usuario actual
    const user = await getUser()

    console.log('Dashboard - User:', user) // Debug

    // Si no hay usuario (por seguridad extra), redirigir
    if (!user) {
      console.log('Dashboard - No user, redirecting to login')
      redirect('/login')
    }

    return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Bienvenido</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">ID de usuario</p>
              <p className="text-sm font-mono">{user.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Metadata</p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>

            <form action={logoutAction}>
              <Button type="submit" variant="destructive">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-2">Error</h1>
            <p className="text-red-600">
              Hubo un error al cargar el dashboard. Revisa los logs del servidor.
            </p>
            <pre className="mt-4 text-xs bg-white p-2 rounded">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </pre>
          </div>
        </div>
      </div>
    )
  }
}
