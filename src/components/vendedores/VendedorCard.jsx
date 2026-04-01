import { ChevronRight, Pencil } from 'lucide-react'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

export default function VendedorCard({ vendedor, isSelected, onClick, onEdit }) {
  const SETTINGS_KEY = 'ferreweb_settings'
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || JSON.stringify({ meta_vendedor: 120000 }))
  const metaVendedor = settings.meta_vendedor || 120000

  const ventasTotal = vendedor.ventas_total || 0
  const isGood = ventasTotal >= metaVendedor
  const ventasColor = isGood ? 'text-emerald-600' : 'text-red-500'
  const ventasBg = isGood ? 'bg-emerald-50' : 'bg-red-50'

  return (
    <div
      onClick={() => onClick(vendedor)}
      className={`
        p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
        ${isSelected
          ? 'border-[#ff8a00] shadow-lg shadow-orange-100 bg-white'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Initial */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 text-[#ff8a00] font-black text-lg">
            {vendedor.nombre ? vendedor.nombre.charAt(0).toUpperCase() : 'V'}
          </div>
        </div>

        {/* Name & Zone */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{vendedor.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5">Zona: {vendedor.zona_nombre}</p>
        </div>

        {/* Edit button */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(vendedor) }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          title="Editar vendedor"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* Ventas total con Barra de Progreso */}
      <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between z-10 relative">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ventas de la semana</span>
          <span className={`text-sm font-extrabold ${ventasColor}`}>{formatCurrency(ventasTotal)}</span>
        </div>
        
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1 z-10">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isGood ? 'bg-emerald-500' : 'bg-red-400'}`}
            style={{ width: `${Math.min(100, Math.max(0, (ventasTotal / (metaVendedor * 2)) * 100))}%` }}
          />
          {/* Marca de Meta (50%) */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gray-900/20" />
        </div>
        
        <div className="flex justify-between items-center z-10 relative">
          <span className="text-[9px] font-bold text-gray-400 uppercase">Progreso</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase">Meta: {formatCurrency(metaVendedor)}</span>
        </div>
      </div>
    </div>
  )
}
