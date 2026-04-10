import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ReportesKPIs({ startDate, endDate }) {
  const [data, setData] = useState({ totalVentas: 0, notasEmitidas: 0, nuevosClientes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        // Total ventas in date range
        const { data: ventas } = await supabase
          .from('ventas')
          .select('total_final')
          .gte('fecha_venta', startDate)
          .lte('fecha_venta', endDate)

        const totalVentas = (ventas || []).reduce((s, v) => s + (v.total_final || 0), 0)
        const notasEmitidas = (ventas || []).length

        // New clients created in the period (use id creation approximation)
        // Since clientes has no created_at, we count clients whose first venta is in this range
        const { data: clientesConVentas } = await supabase
          .from('ventas')
          .select('cliente_id')
          .gte('fecha_venta', startDate)
          .lte('fecha_venta', endDate)

        const uniqueClients = new Set((clientesConVentas || []).map(v => v.cliente_id))

        setData({
          totalVentas,
          notasEmitidas,
          nuevosClientes: uniqueClients.size,
        })
      } catch (err) {
        console.error('ReportesKPIs error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (startDate && endDate) fetch()
  }, [startDate, endDate])

  function formatCurrency(n) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
  }

  const kpis = [
    {
      icon: DollarSign,
      iconBg: 'bg-orange-50 text-[#ff8a00]',
      title: 'TOTAL VENTAS (PERÍODO)',
      value: loading ? '...' : formatCurrency(data.totalVentas),
    },
    {
      icon: ShoppingCart,
      iconBg: 'bg-emerald-50 text-emerald-600',
      title: 'NOTAS EMITIDAS',
      value: loading ? '...' : data.notasEmitidas.toLocaleString(),
    },
    {
      icon: UserPlus,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'CLIENTES ACTIVOS',
      value: loading ? '...' : `${data.nuevosClientes}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon
        return (
          <div key={i} className="bg-white/90 px-5 py-4 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">{kpi.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
