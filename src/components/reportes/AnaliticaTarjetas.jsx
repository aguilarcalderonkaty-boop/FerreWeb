import { useState, useEffect } from 'react'
import { TrendingUp, ClipboardList, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

export default function AnaliticaTarjetas({ startDate, endDate }) {
  const [masVendidos, setMasVendidos] = useState([])
  const [bajaRotacion, setBajaRotacion] = useState([])
  const [nulaRotacion, setNulaRotacion] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        // ── Top products by quantity sold in the period ──
        const { data: detalles } = await supabase
          .from('detalles_venta')
          .select('cantidad, producto_id, productos(nombre, clave), ventas!inner(fecha_venta)')
          .gte('ventas.fecha_venta', startDate)
          .lte('ventas.fecha_venta', endDate)

        const productTotals = {}
        const productMeta = {}
        ;(detalles || []).forEach((d) => {
          const pid = d.producto_id
          productTotals[pid] = (productTotals[pid] || 0) + (d.cantidad || 0)
          if (d.productos) productMeta[pid] = { nombre: d.productos.nombre, clave: d.productos.clave }
        })

        const sortedTop = Object.entries(productTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([pid, cantidad]) => ({
            nombre: productMeta[pid]?.nombre || 'Producto',
            sku: productMeta[pid]?.clave || '—',
            cantidad: `${cantidad} pz`,
          }))

        setMasVendidos(sortedTop)

        // ── Low rotation: products with high stock but few sales ──
        const { data: allProducts } = await supabase
          .from('productos')
          .select('id, nombre, stock')
          .gt('stock', 10)
          .order('stock', { ascending: false })
          .limit(50)

        // Products sold recently (last 90 days)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        const { data: recentSales } = await supabase
          .from('detalles_venta')
          .select('producto_id, cantidad, ventas!inner(fecha_venta)')
          .gte('ventas.fecha_venta', ninetyDaysAgo.toISOString())

        const recentSalesMap = {}
        ;(recentSales || []).forEach((d) => {
          recentSalesMap[d.producto_id] = (recentSalesMap[d.producto_id] || 0) + (d.cantidad || 0)
        })

        const lowRotation = (allProducts || [])
          .filter((p) => (recentSalesMap[p.id] || 0) < 5)
          .slice(0, 5)
          .map((p) => ({
            nombre: p.nombre,
            stock: `Stock: ${p.stock} pz`,
            vtasMes: `${recentSalesMap[p.id] || 0} vtas/90d`,
            inv: `Stock alto`,
          }))

        setBajaRotacion(lowRotation)

        // ── Dead stock: products with NO sales in 90+ days ──
        const soldProductIds = new Set(Object.keys(recentSalesMap))
        const deadStock = (allProducts || [])
          .filter((p) => !soldProductIds.has(p.id) && p.stock > 0)
          .slice(0, 5)
          .map((p) => ({
            nombre: p.nombre,
            sinVentas: 'Sin ventas en 90+ días',
            valor: formatCurrency(p.stock * 100), // approx value
          }))

        setNulaRotacion(deadStock)
      } catch (err) {
        console.error('AnaliticaTarjetas error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (startDate && endDate) fetch()
  }, [startDate, endDate])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#ff8a00] border-t-transparent rounded-full animate-spin" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Más Vendidos */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-[#ff8a00]" />
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Más Vendidos</h3>
        </div>
        <p className="text-xs text-gray-400 mb-5">Top rendimiento en el período</p>
        <div className="space-y-4">
          {masVendidos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
          ) : (
            masVendidos.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">{p.nombre}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-gray-900">{p.cantidad}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Baja Rotación */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-gray-600" />
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Baja Rotación</h3>
        </div>
        <p className="text-xs text-gray-400 mb-5">Revisar stock y promociones</p>
        <div className="space-y-4">
          {bajaRotacion.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin productos en baja rotación</p>
          ) : (
            bajaRotacion.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">{p.nombre}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{p.vtasMes}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.inv}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nula Rotación */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-red-50 text-red-500 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-widest">
            <AlertTriangle className="w-4 h-4" />
            Nula Rotación
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5">Alerta de capital inmovilizado</p>
        <div className="space-y-4">
          {nulaRotacion.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Todos los productos tienen movimiento</p>
          ) : (
            nulaRotacion.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">{p.nombre}</p>
                  <p className="text-[10px] font-bold text-red-400 mt-0.5">{p.sinVentas}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Valor Stock</p>
                  <p className="text-sm font-extrabold text-red-500 mt-0.5">{p.valor}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
