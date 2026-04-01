import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

export default function BannerProyeccion() {
  const [data, setData] = useState({ totalMes: 0, meta: 180000, porcentaje: 0, proyeccion: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const now = new Date()
        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const dayOfMonth = now.getDate()
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

        const { data: ventas } = await supabase
          .from('ventas')
          .select('total_final')
          .gte('fecha_venta', startOfMonth)

        const totalMes = (ventas || []).reduce((s, v) => s + (v.total_final || 0), 0)
        const meta = 180000 // Meta mensual configurable
        const dailyAvg = dayOfMonth > 0 ? totalMes / dayOfMonth : 0
        const proyeccion = dailyAvg * daysInMonth
        const porcentaje = meta > 0 ? Math.min(Math.round((proyeccion / meta) * 100), 100) : 0

        setData({ totalMes, meta, porcentaje, proyeccion })
      } catch (err) {
        console.error('BannerProyeccion error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="bg-[#1e293b] text-white p-8 lg:p-10 rounded-2xl relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none hidden md:block">
        <div className="absolute top-8 right-8 flex flex-col items-end gap-3">
          <div className="flex items-end gap-2 h-32">
            <div className="w-6 bg-[#ff8a00] rounded-t-md" style={{ height: '40%' }} />
            <div className="w-6 bg-[#ff8a00] rounded-t-md" style={{ height: '60%' }} />
            <div className="w-6 bg-[#ff8a00] rounded-t-md" style={{ height: '85%' }} />
            <div className="w-6 bg-[#ff8a00] rounded-t-md" style={{ height: '45%' }} />
            <div className="w-6 bg-[#ff8a00] rounded-t-md" style={{ height: '70%' }} />
            <div className="w-6 bg-[#ff8a00] rounded-t-md" style={{ height: `${data.porcentaje}%` }} />
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <BarChart3 className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest">Analytics</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl">
        <span className="inline-block bg-[#ff8a00] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
          Analítica de Venta
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight">
          Proyección de Cierre Mensual:
        </h2>
        <p className="text-3xl lg:text-4xl font-extrabold text-[#ff8a00] italic mt-1">
          {loading ? '...' : `${data.porcentaje}% del Objetivo`}
        </p>
        <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
          {loading ? 'Calculando...' : (
            <>
              Acumulado del mes: {formatCurrency(data.totalMes)}. Proyección estimada: {formatCurrency(data.proyeccion)} MXN.
              {data.porcentaje >= 100
                ? ' ¡Ya se alcanzó la meta mensual!'
                : ` Se recomienda impulsar ventas para alcanzar la meta de ${formatCurrency(data.meta)}.`}
            </>
          )}
        </p>

        {/* Progress bar */}
        <div className="mt-6 w-full max-w-md">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff8a00] rounded-full transition-all duration-1000"
              style={{ width: `${data.porcentaje}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
