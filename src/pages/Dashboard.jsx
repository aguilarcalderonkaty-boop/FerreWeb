import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  DollarSign, ShoppingCart, Target, Trophy, Star,
  ArrowRight, Pencil, X, Save,
  Database, Package, Users, Clock, AlertTriangle,
  MapPin, Sparkles, UserPlus, FileText
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/* ─────────── HELPERS ─────────── */

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diffToMon)
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)

  const fmt = (d) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${d.getDate()} ${months[d.getMonth()]}`
  }

  const startStr = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
  const endStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}T23:59:59`

  return { start: startStr, end: endStr, label: `${fmt(mon)} — ${fmt(sun)} ${sun.getFullYear()}` }
}

/* ─────────── KPI CARD ─────────── */

function KpiCard({ icon: Icon, iconBg, title, value, valueColor = 'text-gray-900', subtitle, children, badge }) {
  return (
    <div className="relative bg-white/90 px-5 py-4 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <p className={`text-2xl font-extrabold tracking-tight ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          {badge}
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}


/* ─────────── MAIN PAGE ─────────── */

export default function Dashboard() {
  const navigate = useNavigate()
  const week = getWeekRange()

  const [kpis, setKpis] = useState({ ventasTotal: 0, cantidadVentas: 0, visitasCompletadas: 0, visitasMeta: 0 })
  const [topVendedor, setTopVendedor] = useState(null)
  const [systemStatus, setSystemStatus] = useState({ connected: null, latency: 0, totalProducts: 0, vendedoresActivos: 0, agotados: 0 })
  const [loading, setLoading] = useState(true)
  const [historyFeed, setHistoryFeed] = useState([])

  useEffect(() => { fetchDashboardData() }, []) // eslint-disable-line

  async function fetchDashboardData() {
    setLoading(true)
    try {
      // ── Ventas de la semana ──
      const { data: ventasSemana } = await supabase
        .from('ventas')
        .select('total_final, vendedor_id, vendedores(nombre, apellido_paterno, zonas_trabajo(nombre_zona))')
        .gte('fecha_venta', week.start)
        .lte('fecha_venta', week.end)

      const totalVentas = (ventasSemana || []).reduce((s, v) => s + (v.total_final || 0), 0)
      const cantidadVentas = (ventasSemana || []).length

      // ── Top vendedor de la semana ──
      const vendedorTotals = {}
      const vendedorNames = {}
      const vendedorZonas = {}
        ; (ventasSemana || []).forEach(v => {
          if (v.vendedor_id) {
            vendedorTotals[v.vendedor_id] = (vendedorTotals[v.vendedor_id] || 0) + (v.total_final || 0)
            if (v.vendedores) {
              vendedorNames[v.vendedor_id] = `${v.vendedores.nombre || ''} ${v.vendedores.apellido_paterno || ''}`.trim()
              vendedorZonas[v.vendedor_id] = v.vendedores.zonas_trabajo?.nombre_zona || 'Sin zona'
            }
          }
        })

      let topId = null, topTotal = 0
      Object.entries(vendedorTotals).forEach(([id, total]) => {
        if (total > topTotal) { topId = id; topTotal = total }
      })

      if (topId) {
        const ventasDelTop = (ventasSemana || []).filter(v => v.vendedor_id === topId).length
        setTopVendedor({
          nombre: vendedorNames[topId],
          ventasSemana: topTotal,
          zona: vendedorZonas[topId],
          cantidadVentas: ventasDelTop,
          foto: `https://i.pravatar.cc/256?u=${topId}`,
        })
      } else {
        setTopVendedor(null)
      }

      // ── Visitas de la semana ──
      const { data: visitasSemana } = await supabase.from('visitas').select('id').gte('fecha_hora_llegada', week.start).lte('fecha_hora_llegada', week.end)
      setKpis({
        ventasTotal: totalVentas,
        cantidadVentas,
        visitasCompletadas: (visitasSemana || []).length,
      })

      // ── System status ──
      const dbStart = Date.now()
      const { count: totalProducts, error: dbError } = await supabase.from('productos').select('*', { count: 'exact', head: true })
      const latency = Date.now() - dbStart

      const todayStr = new Date().toISOString().split('T')[0]
      const { data: vendActivos } = await supabase.from('visitas').select('vendedor_id').gte('fecha_hora_llegada', todayStr)
      const uniqueVendActivos = new Set((vendActivos || []).map(v => v.vendedor_id)).size

      const { count: agotados } = await supabase.from('productos').select('*', { count: 'exact', head: true }).eq('stock', 0)

      setSystemStatus({
        connected: !dbError,
        latency,
        totalProducts: totalProducts || 0,
        vendedoresActivos: uniqueVendActivos,
        agotados: agotados || 0,
      })

      // ── Historial de Notificaciones ──
      const { data: recientesVisitas } = await supabase.from('visitas').select('id, fecha_hora_llegada, clientes(nombre_negocio), vendedores(nombre, apellido_paterno)').order('fecha_hora_llegada', { ascending: false }).limit(10)
      const { data: recientesClientes } = await supabase.from('clientes').select('id, created_at, nombre_negocio, vendedor_nombre').order('created_at', { ascending: false }).limit(10)
      const { data: recientesProductos } = await supabase.from('productos').select('id, created_at, nombre').order('created_at', { ascending: false }).limit(10)
      const { data: recientesVentas } = await supabase.from('ventas').select('id, fecha_venta, total_final, clientes(nombre_negocio), vendedores(nombre, apellido_paterno)').order('fecha_venta', { ascending: false }).limit(10)

      const feed = []
        ; (recientesVisitas || []).forEach(v => {
          if (v.fecha_hora_llegada) {
            feed.push({ id: `vis-${v.id}`, date: new Date(v.fecha_hora_llegada), title: 'Visita Registrada', text: `A: ${v.clientes?.nombre_negocio || 'Cliente'} | Por: ${v.vendedores?.nombre || 'Vendedor'}`, type: 'visita' })
          }
        })
        ; (recientesClientes || []).forEach(c => {
          if (c.created_at) {
            feed.push({ id: `cli-${c.id}`, date: new Date(c.created_at), title: 'Nuevo Cliente', text: `${c.nombre_negocio} (Por: ${c.vendedor_nombre || 'Usuario'})`, type: 'cliente' })
          }
        })
        ; (recientesProductos || []).forEach(p => {
          if (p.created_at) {
            feed.push({ id: `prod-${p.id}`, date: new Date(p.created_at), title: 'Producto Añadido', text: p.nombre, type: 'producto' })
          }
        })
        ; (recientesVentas || []).forEach(vent => {
          if (vent.fecha_venta) {
            feed.push({ id: `vent-${vent.id}`, date: new Date(vent.fecha_venta), title: 'Venta Concretada', text: `A: ${vent.clientes?.nombre_negocio || 'Cliente'} | Por: ${vent.vendedores?.nombre || 'Vendedor'} | Total: ${formatCurrency(vent.total_final)}`, type: 'venta' })
          }
        })

      feed.sort((a, b) => b.date - a.date)
      setHistoryFeed(feed.slice(0, 8)) // Show latest 8

    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Resumen semanal — <span className="text-gray-600 font-semibold">{week.label}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-3 border-[#ff8a00] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <KpiCard icon={DollarSign} iconBg="bg-orange-50 text-[#ff8a00]"
              title="Ventas Totales" value={formatCurrency(kpis.ventasTotal)} valueColor="text-[#ff8a00]"
            />
            <KpiCard icon={ShoppingCart} iconBg="bg-emerald-50 text-emerald-600"
              title="Cantidad de Ventas" value={kpis.cantidadVentas}
            />
            <KpiCard icon={Target} iconBg="bg-gray-100 text-gray-600"
              title="Visitas Realizadas" value={`${kpis.visitasCompletadas}`}
            />
          </div>

          {/* ── FULL WIDTH FEED ── */}
          <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Actividad Reciente</h3>
                <p className="text-sm text-gray-400 mt-1">El último movimiento y actualizaciones en la base de datos.</p>
              </div>
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#ff8a00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff8a00]"></span>
              </span>
            </div>

            <div className="space-y-4">
              {historyFeed.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Sin actividad reciente</p>
              ) : (
                historyFeed.slice(0, 8).map(evt => (
                  <div key={evt.id} className="flex gap-4 items-center bg-gray-50/50 rounded-2xl p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${evt.type === 'venta' ? 'bg-emerald-100 text-emerald-600' : evt.type === 'visita' ? 'bg-blue-100 text-blue-600' : evt.type === 'cliente' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-[#ff8a00]'}`}>
                      {evt.type === 'venta' ? <Sparkles className="w-5 h-5" /> : evt.type === 'visita' ? <MapPin className="w-5 h-5" /> : evt.type === 'cliente' ? <UserPlus className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-extrabold text-gray-900 truncate">{evt.title}</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{evt.date.toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{evt.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── BOTTOM LAYOUT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
            {/* ─── LEFT COLUMN: SYSTEM STATUS ─── */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Database className="w-5 h-5 text-gray-500" /></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Estado del Sistema</h3>
                    <p className="text-sm text-gray-400">Salud y métricas de la base de datos principal</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 relative">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Conexión</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${systemStatus.connected ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{systemStatus.connected ? 'Estable' : 'Error'}</p>
                        {systemStatus.connected && <p className="text-[10px] text-gray-500 uppercase tracking-widest">{systemStatus.latency}ms de latencia</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vendedores Activos (Hoy)</p>
                    <p className="text-3xl font-extrabold text-blue-600">{systemStatus.vendedoresActivos}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Productos</p>
                    <p className="text-3xl font-extrabold text-gray-900">{systemStatus.totalProducts}</p>
                  </div>
                  <div className="bg-red-50/50 rounded-2xl p-5 border border-red-50">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Productos Agotados</p>
                    <p className="text-3xl font-extrabold text-red-500">{systemStatus.agotados}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: TOP VENDEDOR ─── */}
            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden h-full flex flex-col justify-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#ff8a00]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Vendedor Destacado</h3>
                    <p className="text-sm text-gray-400">Semana actual</p>
                  </div>
                </div>

                {topVendedor ? (
                  <>
                    <Star className="absolute top-12 right-6 w-12 h-12 text-gray-50" fill="currentColor" />
                    <div className="mb-6 mx-auto inline-block bg-[#ff8a00] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full shadow-lg whitespace-nowrap">
                      Mejor Rendimiento
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mt-2">{topVendedor.nombre}</h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1 mb-8">{topVendedor.zona}</p>
                    <div className="flex bg-gray-50 rounded-2xl p-5">
                      <div className="flex-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Vendido</p><p className="text-2xl font-extrabold text-[#ff8a00] mt-1">{formatCurrency(topVendedor.ventasSemana)}</p></div>
                      <div className="w-px bg-gray-200" />
                      <div className="flex-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ventas</p><p className="text-2xl font-extrabold text-gray-900 mt-1">{topVendedor.cantidadVentas}</p></div>
                    </div>
                  </>
                ) : (
                  <div className="py-16"><p className="text-base text-gray-400">Sin progreso en la semana</p></div>
                )}
              </div>
            </div>

          </div>
        </>
      )}


    </div>
  )
}
