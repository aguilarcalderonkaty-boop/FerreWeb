import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Inventory from './pages/Inventory'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/inventario" element={<Inventory />} />
            
            {/* Placeholder routes for future modules */}
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" description="Panel de control general — próximamente." />} />
            <Route path="/ventas" element={<PlaceholderPage title="Ventas y Notas" description="Gestión de ventas y notas de crédito — próximamente." />} />
            <Route path="/vendedores" element={<PlaceholderPage title="Vendedores y Rutas" description="Administración de vendedores y rutas — próximamente." />} />
            <Route path="/clientes" element={<PlaceholderPage title="Clientes" description="Gestión de clientes — próximamente." />} />
            <Route path="/reportes" element={<PlaceholderPage title="Reportes" description="Reportes y análisis — próximamente." />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/inventario" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

// Placeholder component for future modules
function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-2xl font-extrabold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary text-sm max-w-md">{description}</p>
      <div className="mt-6 px-4 py-2 bg-primary-50 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
        En desarrollo
      </div>
    </div>
  )
}

export default App
