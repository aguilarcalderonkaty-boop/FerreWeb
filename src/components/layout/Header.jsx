import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/inventario': 'Inventario',
  '/ventas': 'Ventas y Notas',
  '/vendedores': 'Vendedores y Rutas',
  '/clientes': 'Clientes',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || ''

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center shrink-0">
      <div className="flex items-center w-full px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 mr-3 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-sm font-semibold text-gray-400 hidden lg:block">{title}</p>
      </div>
    </header>
  )
}
