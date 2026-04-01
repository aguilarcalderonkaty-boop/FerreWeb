import { useState } from 'react'
import { ChevronDown, ChevronUp, Eye } from 'lucide-react'

function StatusBadge({ resultado }) {
  const config = {
    rechazado: { label: 'RECHAZADO', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    venta_exitosa: { label: 'VENTA EXITOSA', bg: 'bg-orange-50', text: 'text-[#ff8a00]', border: 'border-orange-200' },
    pendiente: { label: 'PENDIENTE', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  }
  const c = config[resultado] || config.pendiente
  return (
    <span className={`${c.bg} ${c.text} ${c.border} border text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md`}>
      {c.label}
    </span>
  )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0)
}

export default function VisitaCard({ visita, onClickCard, onOpenDetail }) {
  const [expanded, setExpanded] = useState(false)

  const borderColor =
    visita.resultado === 'rechazado'
      ? 'border-red-300'
      : visita.resultado === 'venta_exitosa'
      ? 'border-[#ff8a00]'
      : 'border-gray-200'

  const handleClick = () => {
    setExpanded(!expanded)
    if (onClickCard) onClickCard(visita)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded-2xl border-2 ${borderColor} shadow-lg shrink-0 overflow-hidden cursor-pointer transition-all duration-300 ${
        expanded ? 'min-w-[360px] max-w-[420px]' : 'min-w-[260px] max-w-[300px]'
      }`}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); if (onOpenDetail) onOpenDetail(visita); }}
        className="absolute top-3 right-3 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#ff8a00] transition-colors"
        title="Ver detalle"
      >
        <Eye className="w-4 h-4" />
      </button>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-gray-900 uppercase tracking-wide truncate">
              {visita.cliente_nombre}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{visita.cliente_direccion}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 pr-8">
            <StatusBadge resultado={visita.resultado} />
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Times - always visible */}
        <div className="flex gap-8">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Llegada</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{visita.hora_llegada}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Salida</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{visita.hora_salida}</p>
          </div>
          {visita.resultado === 'venta_exitosa' && visita.total_venta && !expanded && (
            <div className="ml-auto text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Venta</p>
              <p className="text-sm font-extrabold text-[#ff8a00] mt-0.5">{formatCurrency(visita.total_venta)}</p>
            </div>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
            {visita.resultado === 'rechazado' && visita.motivo_no_venta && (
              <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">
                  Motivo de Rechazo
                </p>
                <p className="text-xs text-red-400 italic leading-relaxed">
                  "{visita.motivo_no_venta}"
                </p>
              </div>
            )}

            {visita.resultado === 'venta_exitosa' && visita.total_venta && (
              <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                <p className="text-[9px] font-bold text-[#ff8a00] uppercase tracking-widest mb-1">Total de Venta</p>
                <p className="text-xl font-extrabold text-gray-900">{formatCurrency(visita.total_venta)}</p>
              </div>
            )}

            {visita.cliente_direccion && (
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dirección</p>
                <p className="text-xs text-gray-600 leading-relaxed">{visita.cliente_direccion}</p>
              </div>
            )}

            {visita.notas && (
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notas</p>
                <p className="text-xs text-gray-600 leading-relaxed">{visita.notas}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
