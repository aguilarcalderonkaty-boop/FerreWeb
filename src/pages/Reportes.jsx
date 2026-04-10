import { useState, useEffect, useRef } from 'react'
import { Calendar, Download, Trophy, TrendingUp, Target, Package, Users, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { exportMultiSheetToExcel } from '../lib/exportExcel'

/* ─────────── HELPERS ─────────── */

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

function getMonthRange(monthOffset = 0) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset
  const d = new Date(year, month, 1)
  const start = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
  const lastDay = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()
  const end = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}T23:59:59`
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return { start, end, label: `${months[d.getMonth()]} ${d.getFullYear()}` }
}

function getMonthOptions() {
  const options = []
  for (let i = 0; i >= -11; i--) {
    options.push(getMonthRange(i))
  }
  return options
}

/* ─────────── BAR CHART (Pure CSS) ─────────── */

function BarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="h-full flex flex-col">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 shrink-0">{label}</p>
      <div className="flex items-end gap-3 flex-1 h-52">
        {data.map((d, i) => (
          <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 shrink-0">{formatCurrency(d.value)}</span>
            <div className="w-full flex-1 flex items-end justify-center relative">
              {/* Background trace line (optional, purely aesthetic) */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-50 -z-10" />
              <div
                className="w-full max-w-[48px] bg-gradient-to-t from-[#ff8a00] to-[#ffb700] rounded-t-md transition-all duration-700 shadow-sm"
                style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-bold tracking-widest shrink-0">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────── DONUT CHART (SVG) ─────────── */

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const colors = ['#ff8a00', '#ffb700', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#64748b']
  let cumulative = 0

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-36 h-36 shrink-0">
        {data.map((d, i) => {
          const pct = total > 0 ? d.value / total : 0
          const start = cumulative
          cumulative += pct
          const startAngle = start * 2 * Math.PI - Math.PI / 2
          const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
          const largeArc = pct > 0.5 ? 1 : 0
          const x1 = 60 + 50 * Math.cos(startAngle)
          const y1 = 60 + 50 * Math.sin(startAngle)
          const x2 = 60 + 50 * Math.cos(endAngle)
          const y2 = 60 + 50 * Math.sin(endAngle)
          if (pct === 0) return null
          return (
            <path key={i}
              d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />
          )
        })}
        <circle cx="60" cy="60" r="30" fill="white" />
        <text x="60" y="58" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1f2937">{total}</text>
        <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#9ca3af" fontWeight="600">VENTAS</text>
      </svg>
      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-xs text-gray-600 flex-1 truncate">{d.label}</span>
            <span className="text-xs font-bold text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────── RANKING TABLE ─────────── */

function RankingTable({ vendedores, sortBy, onSortChange }) {
  const sortOptions = [
    { key: 'ventas', label: 'Dinero Vendido' },
    { key: 'cantidad', label: 'Ventas Logradas' },
    { key: 'visitas', label: 'Visitas Logradas' },
    { key: 'general', label: 'Puntaje Mixto' },
  ]

  const sorted = [...vendedores].sort((a, b) => {
    if (sortBy === 'ventas') return b.totalVentas - a.totalVentas
    if (sortBy === 'cantidad') return b.cantidadVentas - a.cantidadVentas
    if (sortBy === 'visitas') return b.cantidadVisitas - a.cantidadVisitas
    // General: weighted score
    return (b.totalVentas * 0.5 + b.cantidadVentas * 1000 + b.cantidadVisitas * 500) - (a.totalVentas * 0.5 + a.cantidadVentas * 1000 + a.cantidadVisitas * 500)
  })

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ff8a00]" />
          <h2 className="text-lg font-extrabold text-gray-900">Ranking de Vendedores</h2>
        </div>
        <div className="flex gap-1">
          {sortOptions.map(opt => (
            <button key={opt.key} onClick={() => onSortChange(opt.key)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${sortBy === opt.key ? 'bg-[#ff8a00] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 py-3 text-left w-12">#</th>
              <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">Vendedor</th>
              <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">Ventas ($)</th>
              <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">Ventas Logradas</th>
              <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">Visitas Realizadas</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => {
              const tasaCierre = v.cantidadVisitas > 0 ? Math.round((v.cantidadVentas / v.cantidadVisitas) * 100) : 0
              return (
                <tr key={v.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i < 3 ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-6 py-4 text-sm">{i < 3 ? medals[i] : <span className="text-gray-400 font-bold">{i + 1}</span>}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-100 text-[#ff8a00] font-black shrink-0">
                        {v.nombre ? v.nombre.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{v.nombre}</p>
                        <p className="text-[10px] text-gray-400">{v.zona}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-extrabold text-gray-900">{formatCurrency(v.totalVentas)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{v.cantidadVentas}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{v.cantidadVisitas}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────── MAIN PAGE ─────────── */

export default function Reportes() {
  const monthOptions = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(0) // index in monthOptions
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [sortBy, setSortBy] = useState('ventas')

  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ totalVentas: 0, totalVisitas: 0, tasaCierre: 0, ticketPromedio: 0 })
  const [vendedoresRanking, setVendedoresRanking] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [zonaData, setZonaData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [deadProducts, setDeadProducts] = useState([])

  const range = customMode && customStart && customEnd
    ? { start: customStart, end: `${customEnd}T23:59:59`, label: `${customStart} — ${customEnd}` }
    : monthOptions[selectedMonth]

  useEffect(() => { fetchReportData() }, [selectedMonth, customMode, customStart, customEnd]) // eslint-disable-line

  async function fetchReportData() {
    setLoading(true)
    try {
      const { start, end } = range

      // ── Ventas del periodo ──
      const { data: ventas } = await supabase
        .from('ventas')
        .select('id, total_final, vendedor_id, fecha_venta, vendedores(nombre, apellido_paterno, zonas_trabajo(nombre_zona))')
        .gte('fecha_venta', start)
        .lte('fecha_venta', end)

      const totalVentas = (ventas || []).reduce((s, v) => s + (v.total_final || 0), 0)
      const cantVentas = (ventas || []).length
      const ticketProm = cantVentas > 0 ? totalVentas / cantVentas : 0

      // ── Visitas del periodo ──
      const { data: visitas } = await supabase
        .from('visitas')
        .select('id, vendedor_id, ventas(id)')
        .gte('fecha_hora_llegada', start)
        .lte('fecha_hora_llegada', end)

      const totalVisitas = (visitas || []).length
      const visitasConVenta = (visitas || []).filter(v => v.ventas && v.ventas.length > 0).length
      const tasaCierre = totalVisitas > 0 ? Math.round((visitasConVenta / totalVisitas) * 100) : 0

      setKpis({ totalVentas, totalVisitas, tasaCierre, ticketPromedio: ticketProm })

      // ── Ranking vendedores ──
      const vendedorMap = {}
      ;(ventas || []).forEach(v => {
        if (!v.vendedor_id) return
        if (!vendedorMap[v.vendedor_id]) {
          vendedorMap[v.vendedor_id] = {
            id: v.vendedor_id,
            nombre: v.vendedores ? `${v.vendedores.nombre || ''} ${v.vendedores.apellido_paterno || ''}`.trim() : 'Desconocido',
            zona: v.vendedores?.zonas_trabajo?.nombre_zona || 'Sin zona',
            totalVentas: 0, cantidadVentas: 0, cantidadVisitas: 0,
          }
        }
        vendedorMap[v.vendedor_id].totalVentas += (v.total_final || 0)
        vendedorMap[v.vendedor_id].cantidadVentas += 1
      })

      // Add visitas count
      ;(visitas || []).forEach(v => {
        if (v.vendedor_id && vendedorMap[v.vendedor_id]) {
          vendedorMap[v.vendedor_id].cantidadVisitas += 1
        }
      })

      setVendedoresRanking(Object.values(vendedorMap))

      // ── Weekly breakdown ──
      const startDate = new Date(start)
      const weeks = []
      for (let w = 0; w < 5; w++) {
        const wStart = new Date(startDate); wStart.setDate(wStart.getDate() + w * 7)
        const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 6)
        const wVentas = (ventas || []).filter(v => {
          const d = new Date(v.fecha_venta)
          return d >= wStart && d <= wEnd
        })
        if (wStart <= new Date(end)) {
          weeks.push({ label: `S${w + 1}`, value: wVentas.reduce((s, v) => s + (v.total_final || 0), 0) })
        }
      }
      setWeeklyData(weeks)

      // ── Zona breakdown ──
      const zonas = {}
      ;(ventas || []).forEach(v => {
        const zona = v.vendedores?.zonas_trabajo?.nombre_zona || 'Sin zona'
        zonas[zona] = (zonas[zona] || 0) + 1
      })
      setZonaData(Object.entries(zonas).map(([label, value]) => ({ label, value })))

      // ── Top products ──
      const { data: detalles } = await supabase
        .from('detalles_venta')
        .select('producto_id, cantidad, subtotal_linea, productos(nombre), ventas!inner(fecha_venta)')
        .gte('ventas.fecha_venta', start)
        .lte('ventas.fecha_venta', end)

      const prodMap = {}
      ;(detalles || []).forEach(d => {
        if (!d.producto_id) return
        if (!prodMap[d.producto_id]) {
          prodMap[d.producto_id] = { nombre: d.productos?.nombre || 'Producto', cantidad: 0, monto: 0 }
        }
        prodMap[d.producto_id].cantidad += (d.cantidad || 0)
        prodMap[d.producto_id].monto += (d.subtotal_linea || 0)
      })

      const sortedProds = Object.values(prodMap).sort((a, b) => b.monto - a.monto)
      setTopProducts(sortedProds.slice(0, 5))

      // ── Dead stock (0 ventas) ──
      const soldIds = new Set(Object.keys(prodMap))
      const { data: allProducts } = await supabase.from('productos').select('id, nombre, stock').eq('activo', true).order('nombre').limit(10)
      setDeadProducts((allProducts || []).filter(p => !soldIds.has(p.id)).slice(0, 5))

    } catch (err) {
      console.error('Reportes error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      // 1. Ganancias (Ventas)
      const { data: ventasData } = await supabase
        .from('ventas')
        .select('*, clientes(nombre_negocio), vendedores(nombre, apellido_paterno)')
        .gte('fecha_venta', range.start)
        .lte('fecha_venta', range.end)
        .order('fecha_venta', { ascending: false })

      // 2. Visitas
      const { data: visitasData } = await supabase
        .from('visitas')
        .select('*, clientes(nombre_negocio), vendedores(nombre, apellido_paterno)')
        .gte('fecha_hora_llegada', range.start)
        .lte('fecha_hora_llegada', range.end)
        .order('fecha_hora_llegada', { ascending: false })

      const sheetVentas = (ventasData || []).map(v => ({
        Fecha: v.fecha_venta ? new Date(v.fecha_venta).toLocaleDateString('es-MX') : '',
        Cliente: v.clientes?.nombre_negocio || '',
        Vendedor: v.vendedores ? `${v.vendedores.nombre} ${v.vendedores.apellido_paterno || ''}`.trim() : '',
        Subtotal: v.subtotal || 0,
        'Descuento (%)': v.porcentaje_descuento || 0,
        'Total Final': v.total_final || 0,
        Estatus: v.estatus || '',
      }))

      const sheetVisitas = (visitasData || []).map(v => ({
        Fecha: v.fecha_hora_llegada ? new Date(v.fecha_hora_llegada).toLocaleString('es-MX') : '',
        Cliente: v.clientes?.nombre_negocio || '',
        Vendedor: v.vendedores ? `${v.vendedores.nombre} ${v.vendedores.apellido_paterno || ''}`.trim() : '',
        Resultado: v.resultado === 'venta_exitosa' ? 'Venta' : (v.resultado === 'visita_sin_venta' ? 'Sin Venta' : v.resultado),
        'Motivo No Venta': v.motivo_no_venta || '',
        'Notas': v.notas || '',
      }))

      const sheetRanking = vendedoresRanking.map((v, i) => ({
        'Posición': i + 1,
        'Vendedor': v.nombre,
        'Ventas ($)': v.totalVentas,
        '# Ventas': v.cantidadVentas,
        '# Visitas': v.cantidadVisitas,
      }))

      exportMultiSheetToExcel([
        { name: 'Ganancias Desglosadas', data: sheetVentas },
        { name: 'Historial Visitas', data: sheetVisitas },
        { name: 'Ranking Vendedores', data: sheetRanking },
      ], `Reporte_Mensual_${range.label.replace(/\s/g, '_')}.xlsx`)

    } catch (err) { console.error('Export error:', err); alert('Error al exportar.') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Módulo de Reportes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Análisis mensual — <span className="font-semibold text-gray-600">{range.label}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month selector */}
          <div className="relative">
            <button onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4" />{customMode ? 'Personalizado' : monthOptions[selectedMonth].label}
            </button>
            {monthDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMonthDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-40 w-56 py-2 max-h-80 overflow-y-auto">
                  {monthOptions.map((opt, i) => (
                    <button key={i} onClick={() => { setSelectedMonth(i); setCustomMode(false); setMonthDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${!customMode && selectedMonth === i ? 'text-[#ff8a00] bg-orange-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={() => setCustomMode(true)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${customMode ? 'text-[#ff8a00] bg-orange-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                      📅 Rango personalizado
                    </button>
                  </div>
                  {customMode && (
                    <div className="px-4 py-3 space-y-2 border-t border-gray-100">
                      <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                      <button onClick={() => setMonthDropdownOpen(false)}
                        className="w-full py-2 bg-[#ff8a00] text-white text-xs font-bold rounded-lg">Aplicar</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-3 border-[#ff8a00] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* ── KPIs ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white/90 px-5 py-4 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Ventas en el mes</p>
                  <p className="text-2xl font-extrabold text-[#ff8a00]">{formatCurrency(kpis.totalVentas)}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#ff8a00]" />
                </div>
              </div>
            </div>
            <div className="bg-white/90 px-5 py-4 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Visitas en el mes</p>
                  <p className="text-2xl font-extrabold text-gray-900">{kpis.totalVisitas}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ── RANKING ── */}
          <RankingTable vendedores={vendedoresRanking} sortBy={sortBy} onSortChange={setSortBy} />

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              {weeklyData.length > 0 ? (
                <BarChart data={weeklyData} label="Ventas por Semana del Mes" />
              ) : (
                <p className="text-sm text-gray-400 text-center py-12">Sin datos para gráfica</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Distribución por Zona</p>
              {zonaData.length > 0 ? (
                <DonutChart data={zonaData} />
              ) : (
                <p className="text-sm text-gray-400 text-center py-12">Sin datos de zonas</p>
              )}
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 5 Products */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#ff8a00]" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Top 5 Productos</h2>
              </div>
              {topProducts.length === 0 ? (
                <div className="p-6 text-center"><p className="text-sm text-gray-400">Sin datos de productos</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {topProducts.map((p, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                      <span className="text-lg font-extrabold text-gray-300 w-8">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-400">{p.cantidad} unidades vendidas</p>
                      </div>
                      <p className="text-sm font-extrabold text-[#ff8a00]">{formatCurrency(p.monto)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dead stock */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Sin Rotación Este Mes</h2>
              </div>
              {deadProducts.length === 0 ? (
                <div className="p-6 text-center"><p className="text-sm text-gray-400">Todos los productos tuvieron movimiento ✅</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {deadProducts.map((p, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.nombre}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-400">Stock: {p.stock}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
