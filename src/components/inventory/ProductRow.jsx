import { Pencil, PackagePlus, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react'

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0)
}

function getRotationBadge(level) {
  const config = {
    alta: { label: 'ALTA', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
    media: { label: 'MEDIA', className: 'bg-gray-50 text-gray-600 border border-gray-200' },
    baja: { label: 'BAJA', className: 'bg-orange-50 text-orange-600 border border-orange-200' },
    critica: { label: 'CRÍTICA', className: 'bg-red-50 text-red-600 border border-red-200' },
  }
  return config[level] || config.media
}

function getStockDot(stock) {
  if (stock === 0) return 'bg-red-500'
  if (stock <= 10) return 'bg-orange-400'
  return 'bg-emerald-500'
}

function getUnitLabel(product) {
  if (product.unidades_medida) {
    return product.unidades_medida.abreviatura || product.unidades_medida.nombre || ''
  }
  return ''
}

export default function ProductRow({ product, index, onEdit, onToggleActive, isMobile }) {
  const rotation = getRotationBadge(product.nivel_rotacion)
  const dotClass = getStockDot(product.stock)
  const unitLabel = getUnitLabel(product)
  const isActive = product.activo !== false

  if (isMobile) {
    return (
      <div
        className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors animate-fade-in ${!isActive ? 'opacity-50' : ''}`}
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {product.foto_url ? (
            <img src={product.foto_url} alt={product.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Sin img</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 text-sm truncate">{product.nombre}</p>
            {!isActive && (
              <span className="bg-gray-700 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase">Inactivo</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-0.5">
            <span className="text-[#ff8a00] font-bold">CLAVE: {product.clave || 'N/A'}</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">{formatCurrency(product.precio_mayoreo)}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">{product.stock}</span>
              {unitLabel && <span className="text-xs text-gray-400">{unitLabel}</span>}
              <div className={`w-2 h-2 rounded-full ${dotClass}`} />
            </div>
            <span className={`${rotation.className} text-[10px] font-bold px-2.5 py-0.5 rounded-md`}>
              {rotation.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {product.stock === 0 && (
            <button onClick={() => onEdit(product)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase transition-colors">
              Reabastecer
            </button>
          )}
          <button onClick={() => onEdit(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(product.id)}
            className={`p-2 rounded-lg transition-colors ${isActive ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600' : 'hover:bg-emerald-50 text-emerald-500'}`}
            title={isActive ? 'Desactivar producto' : 'Activar producto'}
          >
            {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <tr
      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors animate-fade-in ${!isActive ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Foto */}
      <td className="px-6 py-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
          {product.foto_url ? (
            <img src={product.foto_url} alt={product.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Sin img</div>
          )}
        </div>
      </td>

      {/* Descripción (nombre + SKU + empaque) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-bold text-gray-900">{product.nombre}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-[#ff8a00] font-semibold">CLAVE: {product.clave || 'N/A'}</p>
              {product.empaque && <p className="text-[10px] text-gray-400">• {product.empaque}</p>}
            </div>
          </div>
          {!isActive && (
            <span className="bg-gray-700 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase">Inactivo</span>
          )}
        </div>
      </td>

      {/* Precio */}
      <td className="px-6 py-4">
         <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{formatCurrency(product.precio_mayoreo)}</span>
      </td>

      {/* Stock (number + unit label) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-gray-900">{product.stock}</span>
          {unitLabel && <span className="text-sm text-gray-400">{unitLabel}</span>}
          <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        </div>
      </td>

      {/* Rotación */}
      <td className="px-6 py-4">
        <span className={`${rotation.className} px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide`}>
          {rotation.label}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          {product.stock === 0 && (
            <button
              onClick={() => onEdit(product)}
              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide transition-colors flex items-center gap-1.5 mr-1"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              Reabastecer
            </button>
          )}
          <button onClick={() => onEdit(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Editar producto">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(product.id)}
            className={`p-2 rounded-lg transition-colors ${isActive ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600'}`}
            title={isActive ? 'Desactivar producto' : 'Activar producto'}
          >
            {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>
      </td>
    </tr>
  )
}
