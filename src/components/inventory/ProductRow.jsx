import { Pencil, MoreVertical } from 'lucide-react'

function getRotationBadge(level) {
  const config = {
    alta: { label: 'ALTA', className: 'badge-alta' },
    media: { label: 'MEDIA', className: 'badge-media' },
    baja: { label: 'BAJA', className: 'badge-baja' },
    critica: { label: 'CRÍTICA', className: 'badge-critica' },
  }
  return config[level] || config.media
}

function getStockDot(stock) {
  if (stock === 0) return 'dot-danger'
  if (stock <= 10) return 'dot-warning'
  return 'dot-ok'
}

function getUnitLabel(product) {
  if (product.unidades_medida) {
    const u = product.unidades_medida
    return u.abreviatura ? `${u.nombre} (${u.abreviatura})` : u.nombre
  }
  return product.empaque || '—'
}

export default function ProductRow({ product, index, onEdit, onDelete, isMobile }) {
  const rotation = getRotationBadge(product.nivel_rotacion)
  const dotClass = getStockDot(product.stock)
  const unitLabel = getUnitLabel(product)

  if (isMobile) {
    return (
      <div
        className="p-4 flex gap-4 table-row-hover animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-alt flex-shrink-0">
          {product.foto_url ? (
            <img src={product.foto_url} alt={product.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
              Sin img
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{product.nombre}</p>
          <p className="text-xs text-primary font-medium mt-0.5">
            {product.clave && `Clave: ${product.clave}`}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${dotClass}`} />
              <span className="text-sm font-bold text-text-primary">{product.stock}</span>
              <span className="text-xs text-text-muted">{unitLabel}</span>
            </div>
            <span className={`${rotation.className} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
              {rotation.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-secondary transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {product.stock === 0 && (
            <button className="px-2 py-1 bg-accent-red text-white text-[9px] font-bold rounded-md uppercase">
              Reabastecer
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <tr
      className="table-row-hover animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Photo */}
      <td className="px-6 py-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-alt">
          {product.foto_url ? (
            <img src={product.foto_url} alt={product.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">
              Sin img
            </div>
          )}
        </div>
      </td>

      {/* Description */}
      <td className="px-6 py-4">
        <p className="font-semibold text-text-primary text-sm">{product.nombre}</p>
        {product.clave && (
          <p className="text-xs text-primary font-medium mt-0.5">Clave: {product.clave}</p>
        )}
      </td>

      {/* Unit */}
      <td className="px-6 py-4 text-sm text-text-secondary">
        {unitLabel}
      </td>

      {/* Stock */}
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className={`text-lg font-extrabold ${product.stock === 0 ? 'text-accent-red' : 'text-text-primary'}`}>
            {product.stock}
          </span>
          <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        </div>
      </td>

      {/* Rotation Level */}
      <td className="px-6 py-4 text-center">
        <span className={`${rotation.className} text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block`}>
          {rotation.label}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-1">
          {product.stock === 0 ? (
            <button className="px-3 py-1.5 bg-accent-red text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-red-600 transition-colors">
              Reabastecer
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(product)}
                className="p-2 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-secondary transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-secondary transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
