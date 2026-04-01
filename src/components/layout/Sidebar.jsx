import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  FileText,
  Truck,
  Users,
  BarChart3,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Settings
} from 'lucide-react'
import logoUrl from '../../img/logo.jpg'
import iconUrl from '../../img/icono.png'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/ventas', label: 'Ventas y Visitas', icon: FileText },
  { path: '/vendedores', label: 'Vendedores y Rutas', icon: Truck },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/configuracion', label: 'Configuración', icon: Settings },
]

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white border-r border-gray-200
          flex flex-col transition-all duration-300 ease-in-out
          lg:static lg:z-auto
          ${collapsed ? 'w-[72px]' : 'w-[220px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`flex flex-col items-center ${collapsed ? 'px-2' : 'px-4'} pt-5 pb-3`}>
          {!collapsed && (
            <>
              <div className="w-full rounded-2xl overflow-hidden mb-2">
                <img src={logoUrl} alt="Logo Empresa" className="w-full h-auto object-cover" />
              </div>
              <div className="flex items-center gap-1.5 opacity-60">
                <div className="w-4 h-4 shrink-0">
                  <img src={iconUrl} alt="FerreApp" className="w-full h-full object-contain" />
                </div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">FerreApp</span>
              </div>
            </>
          )}

          {collapsed && (
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle collapse (desktop) - top right corner */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center absolute top-4 right-3 text-gray-400 hover:text-[#ff8a00] transition-colors p-1.5 rounded-lg hover:bg-gray-50"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-8 flex flex-col gap-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center ${collapsed ? 'justify-center px-3' : 'px-6'} gap-3 py-3 text-[14px] transition-all duration-200 relative
                  ${isActive
                    ? 'text-[#ff8a00] bg-orange-50/60 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[#ff8a00] rounded-r-md" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#ff8a00]' : 'text-gray-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className={`mt-auto border-t border-gray-100 ${collapsed ? 'p-3' : 'p-5'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${collapsed ? 'bg-orange-50 text-[#ff8a00]' : 'bg-gray-100 text-gray-400'}`}>
              <User className="w-4 h-4" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">Admin</p>
                  <p className="text-[9px] font-bold text-gray-500 mt-0.5 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              onClick={signOut}
              className="mt-3 w-full flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}


        </div>
      </aside>
    </>
  )
}
