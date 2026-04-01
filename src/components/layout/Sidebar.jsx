import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  FileText,
  Truck,
  Users,
  BarChart3,
  Star,
  LogOut,
  X
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/ventas', label: 'Ventas y Notas', icon: FileText },
  { path: '/vendedores', label: 'Vendedores y Rutas', icon: Truck },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white border-r border-border
          w-[260px] flex flex-col transition-sidebar
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <Star className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-text-primary tracking-tight leading-tight">
                FerreApp
              </h1>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                Administración
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-alt text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${isActive
                      ? 'text-primary bg-primary-50 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border-light">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-alt">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                Admin Profile
              </p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                SUPERUSUARIO
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-white text-text-muted hover:text-accent-red transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
