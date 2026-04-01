import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Inventory from './pages/Inventory'
import Clients from './pages/Clients'
import Sales from './pages/Sales'
import Vendedores from './pages/Vendedores'
import Dashboard from './pages/Dashboard'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ventas" element={<Sales />} />
            <Route path="/vendedores" element={<Vendedores />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/inventario" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
