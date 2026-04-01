import { useState, useEffect } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { exportToExcel } from '../../lib/exportExcel'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

export default function VentasTabla({ startDate, endDate }) {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('ventas')
          .select(`
            *,
            clientes(nombre_negocio),
            vendedores(nombre, apellido_paterno),
            detalles_venta(cantidad, productos(nombre))
          `)
          .gte('fecha_venta', startDate)
          .lte('fecha_venta', endDate)
          .order('fecha_venta', { ascending: false })
          .limit(20)

        if (error) throw error

        const mapped = (data || []).map((v) => {
          const productos = (v.detalles_venta || []).map(d => d.productos?.nombre).filter(Boolean)
          const totalItems = (v.detalles_venta || []).reduce((s, d) => s + (d.cantidad || 0), 0)
          const descuento = v.porcentaje_descuento ? (v.subtotal || 0) * (v.porcentaje_descuento / 100) : 0

          return {
            folio: `#NV-${v.id.slice(0, 4).toUpperCase()}`,
            id: v.id,
            cliente: v.clientes?.nombre_negocio || 'Cliente',
            productos: productos.length > 0 ? productos.join(', ') : 'Sin detalle',
            cantidades: totalItems || '—',
            subtotal: formatCurrency(v.subtotal || v.total_final),
            descuento: descuento > 0 ? `-${formatCurrency(descuento)}` : '$0.00',
            total: formatCurrency(v.total_final),
            total_raw: v.total_final || 0,
            vendedor: v.vendedores ? `${v.vendedores.nombre} ${v.vendedores.apellido_paterno || ''}`.trim() : '—',
            fecha_raw: v.fecha_venta,
          }
        })

        setVentas(mapped)
      } catch (err) {
        console.error('VentasTabla error:', err)
        setVentas([])
      } finally {
        setLoading(false)
      }
    }
    if (startDate && endDate) fetch()
  }, [startDate, endDate])

  const handleExport = () => {
    const exportData = ventas.map(v => ({
      Folio: v.folio,
      Cliente: v.cliente,
      Vendedor: v.vendedor,
      Productos: v.productos,
      Cantidades: v.cantidades,
      Subtotal: v.subtotal,
      Descuento: v.descuento,
      Total: v.total,
    }))
    exportToExcel(exportData, 'Ventas', `ventas_reporte.xlsx`)
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold text-gray-900">Historial Reciente de Ventas</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#ff8a00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No hay ventas en este período</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-left">Folio</th>
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-left">Cliente</th>
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-left">Productos</th>
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-center">Cantidades</th>
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-right">Subtotal</th>
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-right">Dcto</th>
                <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-5 pr-3">
                    <span className="text-sm font-bold text-[#ff8a00]">{v.folio}</span>
                  </td>
                  <td className="py-5 px-3">
                    <p className="text-sm font-bold text-gray-900">{v.cliente}</p>
                  </td>
                  <td className="py-5 px-3">
                    <p className="text-sm text-gray-500 max-w-[180px] truncate">{v.productos}</p>
                  </td>
                  <td className="py-5 px-3 text-center">
                    <span className="text-sm font-bold text-gray-900">{v.cantidades}</span>
                  </td>
                  <td className="py-5 px-3 text-right">
                    <span className="text-sm text-gray-700">{v.subtotal}</span>
                  </td>
                  <td className="py-5 px-3 text-right">
                    <span className="text-sm font-medium text-red-500">{v.descuento}</span>
                  </td>
                  <td className="py-5 pl-3 text-right">
                    <span className="text-sm font-extrabold text-gray-900">{v.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
