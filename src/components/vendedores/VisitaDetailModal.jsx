import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Clock, Users, Package, ShoppingCart } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

export default function VisitaDetailModal({ item, onClose, vendedorName }) {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) return
    async function loadDetails() {
      if (item.resultado === 'venta_exitosa' && item.total_venta) {
        setLoading(true)
        // Need to find the venta_id. Wait, `item` in `Vendedores` might not have `venta_id`.
        // Let's query `ventas` for this visita.
        const { data: ventaData } = await supabase
          .from('ventas')
          .select('id')
          .eq('visita_id', item.id)
          .single()

        if (ventaData) {
          const { data } = await supabase
            .from('detalles_venta')
            .select('*, productos(nombre, clave)')
            .eq('venta_id', ventaData.id)
          setDetails(data || [])
        } else {
          setDetails([])
        }
        setLoading(false)
      } else {
        setDetails([])
      }
    }
    loadDetails()
  }, [item])

  if (!item) return null

  const isVenta = item.resultado === 'venta_exitosa'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in z-10 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isVenta ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <ShoppingCart className={`w-6 h-6 ${isVenta ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalle de Visita</p>
                <h2 className="text-2xl font-black text-gray-900 leading-tight mt-0.5">{item.cliente_nombre}</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {item.hora_llegada}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Usuario / Asesor</p>
              <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ff8a00]" /> {vendedorName}
              </p>
            </div>
            <div className={`p-5 rounded-2xl border ${isVenta ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
              <p className={`text-base font-extrabold ${isVenta ? 'text-emerald-600' : 'text-red-600'}`}>
                {isVenta ? 'Venta Exitosa' : 'Sin Venta'}
              </p>
            </div>
          </div>

          {!isVenta && item.motivo_no_venta && (
             <div className="bg-white p-6 rounded-2xl border border-red-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo reportado (Sin venta)</p>
               <p className="text-base text-gray-900 font-medium italic">"{item.motivo_no_venta}"</p>
             </div>
          )}

          {/* Table Details */}
          {isVenta && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Desglose de Artículos</p>
              </div>
              {loading ? (
                <div className="p-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-[#ff8a00] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : details.length === 0 ? (
                <p className="p-6 text-sm text-gray-400 text-center">Detalles no encontrados o visita sin nota de venta registrada.</p>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {details.map(d => (
                      <div key={d.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{d.productos?.nombre || 'Producto Desconocido'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Clave: {d.productos?.clave || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-8 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Cant.</p>
                            <p className="text-sm font-bold text-gray-900">{d.cantidad}</p>
                          </div>
                          <div className="text-right w-24">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Subtotal</p>
                            <p className="text-sm font-black text-emerald-600">{formatCurrency(d.subtotal_linea)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Operación</span>
                    <span className="text-2xl font-black text-[#ff8a00]">{formatCurrency(item.total_venta)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
