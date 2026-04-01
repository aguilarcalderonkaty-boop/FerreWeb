import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  X,
  Phone,
  MapPin,
  ShoppingCart,
  UserCheck,
  Clock,
  Navigation,
  Search,
  MessageCircle,
  Wifi,
  WifiOff,
  FileText,
  User,
} from 'lucide-react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

function ClientMap({ lat, lng }) {
  const mapContainerRef = useRef(null)
  
  useEffect(() => {
    if (!mapContainerRef.current) return
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14,
    })
    new mapboxgl.Marker({ color: '#ff8a00' }).setLngLat([lng, lat]).addTo(map)
    setTimeout(() => { map.resize() }, 200)
    return () => map.remove()
  }, [lat, lng])

  return <div ref={mapContainerRef} className="absolute inset-0" />
}

const tabs = [
  { key: 'todos', label: 'TODOS' },
  { key: 'frecuentes', label: 'FRECUENTES' },
  { key: 'inactivos', label: 'INACTIVOS' },
]

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Sin registro'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) {
    const hours = date.getHours().toString().padStart(2, '0')
    const mins = date.getMinutes().toString().padStart(2, '0')
    return `Hoy ${hours}:${mins}`
  }
  if (diffDays === 1) {
    const hours = date.getHours().toString().padStart(2, '0')
    const mins = date.getMinutes().toString().padStart(2, '0')
    return `Ayer ${hours}:${mins}`
  }
  if (diffDays < 30) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-MX')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const month = months[date.getMonth()]
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month}, ${hours}:${mins}`
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0)
}

function getStatusBadge(tipo) {
  if (tipo === 'frecuente') return { label: 'FRECUENTE', className: 'bg-[#b4f25b] text-black' }
  if (tipo === 'inactivo') return { label: 'INACTIVO', className: 'bg-gray-700 text-white' }
  return { label: 'ACTIVO', className: 'bg-blue-100 text-blue-700' }
}

function openWhatsApp(phone) {
  if (!phone) { alert('Este cliente no tiene teléfono registrado.'); return }
  const digits = phone.replace(/[^\d]/g, '')
  const number = digits.length <= 10 ? `52${digits}` : digits
  window.open(`https://wa.me/${number}`, '_blank')
}

function getStaticMapUrl(lat, lng) {
  if (!lat || !lng) return null
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff8a00(${lng},${lat})/${lng},${lat},15/600x400@2x?access_token=${token}`
}

/* ─────────────── CLIENT CARD ─────────────── */

function ClientCard({ client, onClick }) {
  const badge = getStatusBadge(client.tipo)
  const address = [client.calle_numero, client.colonia, client.ciudad].filter(Boolean).join(', ')

  return (
    <div
      onClick={() => onClick(client)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {client.latitud && client.longitud ? (
          <img src={getStaticMapUrl(client.latitud, client.longitud)} alt="Mapa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : client.foto_fachada_url ? (
          <img src={client.foto_fachada_url} alt={client.nombre_negocio} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`${badge.className} font-bold text-[10px] px-3 py-1 rounded-md uppercase tracking-wider`}>
            {badge.label}
          </span>
          {/* WiFi signal */}
          <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${client.tiene_buena_senal ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {client.tiene_buena_senal ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          </span>
        </div>

        {client.telefono && (
          <button onClick={(e) => { e.stopPropagation(); openWhatsApp(client.telefono) }}
            className="absolute top-4 right-4 w-9 h-9 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors" title="Enviar WhatsApp">
            <MessageCircle className="w-4 h-4" />
          </button>
        )}

        <div className="absolute bottom-4 left-4">
          <p className="text-white/90 text-xs font-medium">Última compra: {formatTimeAgo(client.ultima_compra)}</p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{client.nombre_negocio}</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-gray-500">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{client.telefono || 'Sin teléfono'}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{address || 'Sin dirección'}</span>
          </div>
          {client.referencia && (
            <div className="flex items-start gap-2.5 text-sm text-gray-500">
              <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 italic">{client.referencia}</span>
            </div>
          )}
          {client.vendedor_nombre && (
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <User className="w-4 h-4 text-gray-300 shrink-0" />
              <span>Creó: {client.vendedor_nombre}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────── DETAIL PANEL ─────────────── */

function DetailPanel({ client, activities, onClose, onEdit }) {
  if (!client) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto flex flex-col animate-slide-in">
        <div className="relative h-44 shrink-0 bg-gray-100">
          {client.latitud && client.longitud ? (
            <img src={getStaticMapUrl(client.latitud, client.longitud)} alt="Mapa" className="w-full h-full object-cover" />
          ) : client.foto_fachada_url ? (
            <img src={client.foto_fachada_url} alt={client.nombre_negocio} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="text-2xl font-extrabold text-white leading-tight">{client.nombre_negocio}</h2>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Detalle del cliente</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {client.telefono && (
                <button onClick={() => openWhatsApp(client.telefono)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                  <MessageCircle className="w-4 h-4" />WhatsApp
                </button>
              )}
              {client.telefono && (
                <a href={`tel:${client.telefono}`} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                  <Phone className="w-4 h-4" />Llamar
                </a>
              )}
            </div>
            <span className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${client.tiene_buena_senal ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {client.tiene_buena_senal ? <><Wifi className="w-3.5 h-3.5" /> Buena Señal</> : <><WifiOff className="w-3.5 h-3.5" /> Sin Señal</>}
            </span>
          </div>
          {client.nombre_contacto && (
            <p className="text-sm text-gray-500 mt-4">
              Contacto: {client.nombre_contacto} {client.apellido_paterno_contacto || ''} {client.apellido_materno_contacto || ''}
            </p>
          )}
        </div>

        {/* Info details */}
        <div className="p-6 border-b border-gray-100">
          <div className="space-y-4">
            {client.vendedor_nombre && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendedor Creador</span>
                <span className="text-xs font-bold text-gray-700">{client.vendedor_nombre}</span>
              </div>
            )}
            
            {client.referencia && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 mt-2">Referencia Domicilio</p>
                <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">"{client.referencia}"</p>
              </div>
            )}

            {client.latitud && client.longitud && (
              <div className="pt-2">
                <a href={`https://maps.google.com/?q=${client.latitud},${client.longitud}`} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm rounded-xl transition-colors">
                  <MapPin className="w-4 h-4" /> Abrir en Google Maps
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 pb-6 flex-1">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">Actividad Reciente</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin actividad registrada</p>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'venta' ? 'bg-orange-50' : 'bg-gray-100'}`}>
                    {activity.type === 'venta' ? <ShoppingCart className="w-5 h-5 text-[#ff8a00]" /> : <UserCheck className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{activity.type === 'venta' ? 'Compra Realizada' : 'Visita Vendedor'}</p>
                      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{formatDate(activity.fecha)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.detalle}</p>
                    {activity.type === 'venta' && activity.total && (
                      <p className="text-base font-extrabold text-[#ff8a00] mt-1">{formatCurrency(activity.total)}</p>
                    )}
                    {activity.type === 'visita' && activity.nota && (
                      <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <p className="text-xs text-gray-500 italic leading-relaxed">"{activity.nota}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 mt-auto p-6 border-t border-gray-100 flex gap-4 bg-white shrink-0 z-10 w-full shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)]">
          <button onClick={() => openWhatsApp(client.telefono)}
            className="h-12 flex-1 border border-emerald-200 bg-emerald-50 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />WHATSAPP
          </button>
          <button onClick={() => onEdit(client)}
            className="h-12 flex-1 bg-[#ff8a00] hover:bg-[#e67a00] text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#ff8a00]/20">
            EDITAR CLIENTE
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────── EDIT CLIENT MODAL (no lat/lng) ─────────────── */

function ClientFormModal({ isOpen, onClose, onSave, client }) {
  const emptyForm = { nombre_negocio: '', telefono: '', calle_numero: '', colonia: '', ciudad: '', foto_fachada_url: '', nombre_contacto: '', apellido_paterno_contacto: '', referencia: '', tiene_buena_senal: true }
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (client) {
      setForm({
        nombre_negocio: client.nombre_negocio || '',
        telefono: client.telefono || '',
        calle_numero: client.calle_numero || '',
        colonia: client.colonia || '',
        ciudad: client.ciudad || '',
        foto_fachada_url: client.foto_fachada_url || '',
        nombre_contacto: client.nombre_contacto || '',
        apellido_paterno_contacto: client.apellido_paterno_contacto || '',
        referencia: client.referencia || '',
        tiene_buena_senal: client.tiene_buena_senal !== false,
      })
    } else {
      setForm(emptyForm)
    }
  }, [client, isOpen])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre_negocio.trim()) return
    setSaving(true)
    await onSave({
      nombre_negocio: form.nombre_negocio.trim(),
      telefono: form.telefono.trim() || null,
      calle_numero: form.calle_numero.trim() || null,
      colonia: form.colonia.trim() || null,
      ciudad: form.ciudad.trim() || null,
      foto_fachada_url: form.foto_fachada_url.trim() || null,
      nombre_contacto: form.nombre_contacto.trim() || null,
      apellido_paterno_contacto: form.apellido_paterno_contacto.trim() || null,
      referencia: form.referencia.trim() || null,
      tiene_buena_senal: form.tiene_buena_senal,
    }, client?.id)
    setSaving(false)
    onClose()
  }

  if (!isOpen) return null

  const inputCls = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/40 focus:bg-white transition-all"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#ff8a00]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
              <p className="text-sm text-gray-400 mt-0.5">Modifique los datos del cliente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre del Negocio <span className="text-red-400">*</span></label>
              <input type="text" value={form.nombre_negocio} onChange={(e) => handleChange('nombre_negocio', e.target.value)} placeholder='Ej: Ferretería "El Martillo"' required className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Teléfono</label>
                <input type="text" value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} placeholder="33 1234 5678" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre Contacto</label>
                <input type="text" value={form.nombre_contacto} onChange={(e) => handleChange('nombre_contacto', e.target.value)} placeholder="Juan Pérez" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Calle y Número</label>
              <input type="text" value={form.calle_numero} onChange={(e) => handleChange('calle_numero', e.target.value)} placeholder="Av. Industrial 450" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Colonia</label>
                <input type="text" value={form.colonia} onChange={(e) => handleChange('colonia', e.target.value)} placeholder="Centro" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ciudad</label>
                <input type="text" value={form.ciudad} onChange={(e) => handleChange('ciudad', e.target.value)} placeholder="Guadalajara" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Referencia del domicilio</label>
              <textarea value={form.referencia} onChange={(e) => handleChange('referencia', e.target.value)} placeholder="Ej: A dos cuadras del mercado, portón azul"
                rows={2} className={inputCls} maxLength={255} />
              <p className="text-[10px] text-gray-400 mt-1">{form.referencia.length}/255 caracteres</p>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <div>
                <p className="text-sm font-bold text-gray-700">Buena señal WiFi</p>
                <p className="text-xs text-gray-400">¿El cliente tiene buena conexión a internet?</p>
              </div>
              <button type="button" onClick={() => handleChange('tiene_buena_senal', !form.tiene_buena_senal)}
                className={`w-12 h-7 rounded-full transition-colors relative ${form.tiene_buena_senal ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${form.tiene_buena_senal ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">URL Foto Fachada</label>
              <input type="url" value={form.foto_fachada_url} onChange={(e) => handleChange('foto_fachada_url', e.target.value)} placeholder="https://example.com/fachada.jpg" className={inputCls} />
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-5 py-3.5 bg-[#ff8a00] hover:bg-[#e67a00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8a00]/20 transition-all disabled:opacity-60 active:scale-[0.98]">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────── MAIN PAGE ─────────────── */

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('todos')
  const [selectedClient, setSelectedClient] = useState(null)
  const [activities, setActivities] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    try {
      const { data: clientsData, error } = await supabase
        .from('clientes')
        .select('*, vendedores:vendedor_creador_id(nombre, apellido_paterno)')
        .order('nombre_negocio')

      if (error) throw error

      const { data: ventasData } = await supabase
        .from('ventas')
        .select('cliente_id, fecha_venta')
        .order('fecha_venta', { ascending: false })

      const lastPurchaseMap = {}
      if (ventasData) {
        for (const v of ventasData) {
          if (!lastPurchaseMap[v.cliente_id]) {
            lastPurchaseMap[v.cliente_id] = v.fecha_venta
          }
        }
      }

      const now = new Date()
      const enriched = (clientsData || []).map(c => {
        const lastPurchase = lastPurchaseMap[c.id]
        let tipo = 'activo'
        if (lastPurchase) {
          const daysSince = Math.floor((now - new Date(lastPurchase)) / 86400000)
          tipo = daysSince <= 30 ? 'frecuente' : daysSince > 60 ? 'inactivo' : 'activo'
        } else {
          tipo = 'inactivo'
        }
        const vendedorNombre = c.vendedores
          ? `${c.vendedores.nombre || ''} ${c.vendedores.apellido_paterno || ''}`.trim()
          : null
        return { ...c, ultima_compra: lastPurchase || null, tipo, vendedor_nombre: vendedorNombre }
      })

      setClients(enriched)
    } catch (err) {
      console.error('Error fetching clients:', err)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchActivities(clientId) {
    const all = []
    try {
      const { data: ventas } = await supabase
        .from('ventas')
        .select('*, vendedores(nombre, apellido_paterno), detalles_venta(id)')
        .eq('cliente_id', clientId)
        .order('fecha_venta', { ascending: false })
        .limit(5)

      if (ventas) {
        ventas.forEach(v => {
          const itemCount = v.detalles_venta?.length || 0
          all.push({ type: 'venta', fecha: v.fecha_venta, detalle: `Nota #${v.id.slice(0, 8)} • ${itemCount} items`, total: v.total_final })
        })
      }
    } catch (err) { console.error('Error fetching ventas:', err) }

    try {
      const { data: visitas } = await supabase
        .from('visitas')
        .select('*, vendedores(nombre, apellido_paterno)')
        .eq('cliente_id', clientId)
        .order('fecha_hora_llegada', { ascending: false })
        .limit(5)

      if (visitas) {
        visitas.forEach(v => {
          all.push({
            type: 'visita', fecha: v.fecha_hora_llegada,
            detalle: v.vendedores ? `Ejecutivo: ${v.vendedores.nombre} ${v.vendedores.apellido_paterno || ''}`.trim() : 'Visita registrada',
            nota: v.motivo_no_venta || null,
          })
        })
      }
    } catch (err) { console.error('Error fetching visitas:', err) }

    all.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    setActivities(all)
  }

  const handleSelectClient = (client) => { setSelectedClient(client); fetchActivities(client.id) }
  const handleOpenEdit = (client) => { setEditingClient(client); setModalOpen(true); setSelectedClient(null) }

  const handleSaveClient = async (formData, existingId) => {
    try {
      if (existingId) {
        const { error } = await supabase.from('clientes').update(formData).eq('id', existingId)
        if (error) throw error
      }
      await fetchClients()
    } catch (err) {
      console.error('Error saving client:', err)
      alert(`Error al guardar: ${err.message}`)
    }
  }

  const filtered = clients.filter(c => {
    if (activeTab === 'frecuentes' && c.tipo !== 'frecuente') return false
    if (activeTab === 'inactivos' && c.tipo !== 'inactivo') return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return c.nombre_negocio?.toLowerCase().includes(q) || c.telefono?.toLowerCase().includes(q) || c.ciudad?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Clientes</h1>
          <p className="text-sm text-gray-400 mt-1">Visualiza y administra tu cartera de compradores</p>
        </div>
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg ${activeTab === tab.key ? 'text-[#ff8a00] bg-orange-50 border border-orange-200' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar cliente por nombre, teléfono o ciudad..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/30 transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-3 border-[#ff8a00] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><MapPin className="w-8 h-8 text-gray-300" /></div>
          <p className="text-gray-400 font-medium">No se encontraron clientes</p>
          <p className="text-gray-300 text-sm mt-1">Intenta cambiar los filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} onClick={handleSelectClient} />
          ))}
        </div>
      )}

      {selectedClient && (
        <DetailPanel client={selectedClient} activities={activities} onClose={() => setSelectedClient(null)} onEdit={handleOpenEdit} />
      )}

      <ClientFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null) }}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </div>
  )
}
