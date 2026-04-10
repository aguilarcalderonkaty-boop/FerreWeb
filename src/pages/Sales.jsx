import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import {
  ShoppingCart, Users, XCircle, Search,
  ChevronDown, ChevronUp, Eye, MapPin, Clock, X, Package, DollarSign
} from 'lucide-react'

/* ══════════════ HELPERS ══════════════ */

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  const day = dt.getDate()
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const h = dt.getHours().toString().padStart(2, '0')
  const m = dt.getMinutes().toString().padStart(2, '0')
  return `${day} ${months[dt.getMonth()]}, ${h}:${m}`
}

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const mon = new Date(now); mon.setDate(now.getDate() + diffToMon); mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23, 59, 59, 999)
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { start: fmt(mon), end: `${fmt(sun)}T23:59:59` }
}

/* ══════════════ KPI CARDS ══════════════ */

function KpiCards({ stats }) {
  const cards = [
    { label: 'Clientes Visitados', value: stats.clientesVisitados, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Esta semana' },
    { label: 'Visitas Sin Venta', value: stats.visitasSinVenta, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', sub: 'Esta semana' },
    { label: 'Ventas Realizadas', value: stats.ventasRealizadas, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Esta semana' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div key={i} className="bg-white/90 px-5 py-4 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{c.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{c.value}</p>
                <p className="text-[10px] text-gray-400 mt-1">{c.sub}</p>
              </div>
              <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════ DETAIL PANEL MODAL ══════════════ */

function DetailPanel({ item, type, onClose }) {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) return
    async function loadDetails() {
      // Determine what to query
      let ventaId = null
      if (type === 'ventas') ventaId = item.id
      else if (type === 'visitas' && item.venta_id) ventaId = item.venta_id

      if (ventaId) {
        setLoading(true)
        const { data } = await supabase
          .from('detalles_venta')
          .select('*, productos(nombre, clave)')
          .eq('venta_id', ventaId)
        setDetails(data || [])
        setLoading(false)
      } else {
        setDetails([])
      }
    }
    loadDetails()
  }, [item, type])

  if (!item) return null

  const isVenta = type === 'ventas' || !!item.venta_total

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
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{type === 'ventas' ? 'Detalle de Nota' : 'Detalle de Visita'}</p>
                <h2 className="text-2xl font-black text-gray-900 leading-tight mt-0.5">{item.cliente}</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {type === 'ventas' ? fmtDate(item.fecha) : fmtDate(item.inicio)}
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
                <Users className="w-4 h-4 text-[#ff8a00]" /> {item.vendedor}
              </p>
            </div>
            {type === 'visitas' && (
              <div className={`p-5 rounded-2xl border ${isVenta ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                <p className={`text-base font-extrabold ${isVenta ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isVenta ? 'Venta Exitosa' : 'Sin Venta'}
                </p>
              </div>
            )}
            {type === 'ventas' && (
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Total Cerrado</p>
                <p className="text-xl font-extrabold text-emerald-600 flex items-center gap-1">
                  {formatCurrency(item.total)}
                </p>
              </div>
            )}
          </div>

          {!isVenta && item.motivo && (
            <div className="bg-white p-6 rounded-2xl border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo reportado (Sin venta)</p>
              <p className="text-base text-gray-900 font-medium italic">"{item.motivo}"</p>
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
                <p className="p-6 text-sm text-gray-400 text-center">No hay productos en esta nota.</p>
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
                    <span className="text-2xl font-black text-[#ff8a00]">{formatCurrency(item.total || item.venta_total)}</span>
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

/* ══════════════ LIST TABS ══════════════ */

function VentasTab({ ventas, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-extrabold text-gray-900">Ventas Recientes</h2>
        <p className="text-xs text-gray-400 mt-0.5">Haga clic en una venta para expandir la nota de venta.</p>
      </div>
      {ventas.length === 0 ? (
        <div className="text-center py-12 px-6"><p className="text-sm text-gray-400">No hay ventas registradas</p></div>
      ) : (
        <div className="divide-y divide-gray-50">
          {ventas.map(v => (
            <button key={v.id} onClick={() => onSelect(v, 'ventas')}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#ff8a00] transition-colors">{v.cliente}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.vendedor} — {fmtDate(v.fecha)}</p>
              </div>
              <p className="text-sm font-extrabold text-gray-900 shrink-0 mr-4">{formatCurrency(v.total)}</p>
              <Eye className="w-4 h-4 text-gray-300 group-hover:text-[#ff8a00]" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function VisitasTab({ visitas, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-extrabold text-gray-900">Visitas Recientes</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Con venta
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-3 mr-1" /> Sin venta
        </p>
      </div>
      {visitas.length === 0 ? (
        <div className="text-center py-12 px-6"><p className="text-sm text-gray-400">No hay visitas registradas</p></div>
      ) : (
        <div className="divide-y divide-gray-50">
          {visitas.map(v => {
            const conVenta = !!v.venta_total
            const dotColor = conVenta ? 'bg-emerald-500' : 'bg-red-500'

            return (
              <button key={v.id} onClick={() => onSelect(v, 'visitas')}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#ff8a00] transition-colors">{v.cliente}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{fmtDate(v.inicio)} → {v.fin ? fmtDate(v.fin) : 'En curso'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 mr-4">
                  {conVenta ? (
                    <p className="text-sm font-extrabold text-emerald-600">{formatCurrency(v.venta_total)}</p>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Sin venta</span>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">{v.vendedor}</p>
                </div>
                <Eye className="w-4 h-4 text-gray-300 group-hover:text-[#ff8a00]" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════ MAIN PAGE ══════════════ */

const tabs = [
  { key: 'ventas', label: 'Ventas Recientes' },
  { key: 'visitas', label: 'Visitas Recientes' },
]

export default function Sales() {
  const [activeTab, setActiveTab] = useState('ventas')
  const [ventas, setVentas] = useState([])
  const [visitas, setVisitas] = useState([])
  const [stats, setStats] = useState({ clientesVisitados: 0, visitasSinVenta: 0, ventasRealizadas: 0 })
  const [loading, setLoading] = useState(true)

  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState('ventas')

  useEffect(() => { fetchAllData() }, [])

  async function fetchAllData() {
    setLoading(true)
    const week = getWeekRange()

    try {
      // ── Ventas recientes ──
      const { data: ventasData } = await supabase
        .from('ventas')
        .select('id, fecha_venta, total_final, clientes(nombre_negocio), vendedores(nombre, apellido_paterno)')
        .order('fecha_venta', { ascending: false })
        .limit(30)

      setVentas((ventasData || []).map(v => ({
        id: v.id,
        cliente: v.clientes?.nombre_negocio || 'Cliente desconocido',
        vendedor: v.vendedores ? `${v.vendedores.nombre} ${v.vendedores.apellido_paterno || ''}`.trim() : '—',
        fecha: v.fecha_venta,
        total: v.total_final || 0,
      })))

      // ── Visitas recientes ──
      const { data: visitasData } = await supabase
        .from('visitas')
        // include ventas(id) to link to details later
        .select('id, fecha_hora_llegada, fecha_hora_salida, motivo_no_venta, clientes(nombre_negocio), vendedores(nombre, apellido_paterno), ventas(id, total_final)')
        .order('fecha_hora_llegada', { ascending: false })
        .limit(30)

      setVisitas((visitasData || []).map(v => ({
        id: v.id,
        cliente: v.clientes?.nombre_negocio || 'Cliente desconocido',
        vendedor: v.vendedores ? `${v.vendedores.nombre} ${v.vendedores.apellido_paterno || ''}`.trim() : '—',
        inicio: v.fecha_hora_llegada,
        fin: v.fecha_hora_salida,
        motivo: v.motivo_no_venta,
        venta_total: v.ventas?.[0]?.total_final || null,
        venta_id: v.ventas?.[0]?.id || null, // pass venta_id to detail panel
      })))

      // ── Stats semanales ──
      const { data: visitasSemana } = await supabase
        .from('visitas')
        .select('id, cliente_id, ventas(id)')
        .gte('fecha_hora_llegada', week.start)
        .lte('fecha_hora_llegada', week.end)

      const clientesUnicos = new Set((visitasSemana || []).map(v => v.cliente_id)).size
      const sinVenta = (visitasSemana || []).filter(v => !v.ventas || v.ventas.length === 0).length
      const conVenta = (visitasSemana || []).filter(v => v.ventas && v.ventas.length > 0).length

      setStats({ clientesVisitados: clientesUnicos, visitasSinVenta: sinVenta, ventasRealizadas: conVenta })
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item, type) => {
    setSelectedItem(item)
    setSelectedType(type)
  }

  if (loading) return <div className="animate-fade-in flex items-center justify-center py-24"><div className="w-8 h-8 border-3 border-[#ff8a00] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Ventas y Visitas</h1>
          <p className="text-sm text-gray-400 mt-1">Historial de operaciones y seguimiento de actividad comercial.</p>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 text-sm font-bold transition-all whitespace-nowrap rounded-lg ${activeTab === tab.key ? 'text-white bg-[#ff8a00] shadow-md shadow-orange-500/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <KpiCards stats={stats} />

      {activeTab === 'ventas' && <VentasTab ventas={ventas} onSelect={handleSelect} />}
      {activeTab === 'visitas' && <VisitasTab visitas={visitas} onSelect={handleSelect} />}

      <DetailPanel item={selectedItem} type={selectedType} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
