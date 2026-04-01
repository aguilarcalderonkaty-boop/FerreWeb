import { useState, useEffect, useRef } from 'react'
import { UserPlus, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useVendedores } from '../hooks/useVendedores'
import VendedorCard from '../components/vendedores/VendedorCard'
import VisitaCard from '../components/vendedores/VisitaCard'
import VendedorModal from '../components/vendedores/VendedorModal'
import VisitaDetailModal from '../components/vendedores/VisitaDetailModal'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function Vendedores() {
  const {
    vendedores,
    loading,
    selectedId,
    setSelectedId,
    selectedVendedor,
    visitas,
    visitasLoading,
    addVendedor,
    updateVendedor,
  } = useVendedores()

  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVendedor, setEditingVendedor] = useState(null)
  const [selectedVisitaDetail, setSelectedVisitaDetail] = useState(null)

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const visitasScrollRef = useRef(null)

  const filteredVendedores = vendedores.filter((v) =>
    v.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.zona_nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const defaultCenter = { lat: 19.4326, lng: -99.1332 }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: 12,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [loading]) // eslint-disable-line

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach(m => m.marker.remove())
    markersRef.current = []

    if (visitas.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()

    visitas.forEach(v => {
      if (!v.lat || !v.lng) return

      const isVenta = v.resultado === 'venta_exitosa'
      const isRechazado = v.resultado === 'rechazado'

      const el = document.createElement('div')
      el.style.cssText = `
        width: 32px; height: 32px; border-radius: 50%;
        background: ${isVenta ? '#22c55e' : isRechazado ? '#ef4444' : '#6b7280'};
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 12px; cursor: pointer;
      `
      const svgCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      const svgX = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      const dot = `<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>`

      el.innerHTML = isVenta ? svgCheck : isRechazado ? svgX : dot

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '240px' }).setHTML(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <p style="font-weight: 800; font-size: 13px; margin: 0;">${v.cliente_nombre}</p>
          <p style="color: #999; font-size: 11px; margin: 4px 0 0;">${v.cliente_direccion || ''}</p>
          <p style="color: ${isVenta ? '#22c55e' : '#ef4444'}; font-weight: 700; font-size: 12px; margin: 8px 0 0;">
            ${isVenta ? `Venta: $${(v.total_venta || 0).toLocaleString()}` : isRechazado ? 'Sin venta' : 'En progreso'}
          </p>
          <p style="color: #bbb; font-size: 10px; margin: 4px 0 0;">${v.hora_llegada} → ${v.hora_salida}</p>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([v.lng, v.lat])
        .setPopup(popup)
        .addTo(mapRef.current)

      markersRef.current.push({ id: v.id, marker })
      bounds.extend([v.lng, v.lat])
    })

    try {
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 })
    } catch (e) {
      const first = visitas.find(v => v.lat && v.lng)
      if (first) mapRef.current.flyTo({ center: [first.lng, first.lat], zoom: 14, duration: 800 })
    }
  }, [visitas])

  const handleSaveVendedor = async (data, existingId) => {
    if (existingId) {
      await updateVendedor(existingId, data)
    } else {
      await addVendedor(data)
    }
  }

  const handleVendedorClick = (vendedor) => {
    setSelectedId(vendedor.id)
  }

  const handleVendedorEdit = (vendedor) => {
    setEditingVendedor(vendedor)
    setModalOpen(true)
  }

  const handleVisitaClick = (v) => {
    if (!mapRef.current || !v.lat || !v.lng) return
    mapRef.current.flyTo({ center: [v.lng, v.lat], zoom: 16, duration: 1200 })

    setTimeout(() => {
      const match = markersRef.current.find(m => m.id === v.id)
      if (match && !match.marker.getPopup().isOpen()) {
        match.marker.togglePopup()
      }
    }, 1200)
  }

  const scrollVisitas = (direction) => {
    if (!visitasScrollRef.current) return
    const scrollAmount = 320
    visitasScrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    })
  }

  if (loading) {
    return (
      <div className="-m-6 lg:-m-8 flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#ff8a00] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Cargando equipo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-m-6 lg:-m-8 flex h-[calc(100vh-4rem)] overflow-hidden animate-fade-in">
      {/* ============ LEFT PANEL ============ */}
      <div className="w-[380px] xl:w-[420px] bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
        {/* Header */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Equipo de Ventas
              </h1>
              <p className="text-xs text-gray-400 mt-1">Gestión y seguimiento de rutas</p>
            </div>
            <button
              onClick={() => { setEditingVendedor(null); setModalOpen(true) }}
              className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff8a00] hover:bg-orange-100 transition-colors"
              title="Añadir vendedor"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Buscar vendedor..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-3 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:bg-white transition-all border border-gray-100 font-medium"
            />
          </div>
        </div>

        {/* Vendedores List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex flex-col gap-4">
            {filteredVendedores.map((v) => (
              <VendedorCard
                key={v.id}
                vendedor={v}
                isSelected={v.id === selectedId}
                onClick={handleVendedorClick}
                onEdit={handleVendedorEdit}
              />
            ))}

            {filteredVendedores.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-gray-400">No se encontraron vendedores</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ RIGHT PANEL (MAP) ============ */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Vendedor name indicator */}
        {selectedVendedor && (
          <div className="absolute top-5 left-6 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg border border-gray-100">
              <p className="text-xs font-bold text-gray-900">{selectedVendedor.nombre}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Zona: {selectedVendedor.zona_nombre} &bull; {visitas.length} visita{visitas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Mapbox legend */}
        <div className="absolute top-5 right-16 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-gray-100 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-gray-600">Con venta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[10px] font-medium text-gray-600">Sin venta</span>
            </div>
          </div>
        </div>

        {/* Bottom floating visit cards with scroll */}
        <div className="absolute bottom-6 left-0 right-0 z-10">
          {visitasLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#ff8a00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : visitas.length > 0 ? (
            <div className="relative px-6">
              {visitas.length > 2 && (
                <>
                  <button onClick={() => scrollVisitas('left')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-700 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollVisitas('right')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-700 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <div
                ref={visitasScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {visitas.map((v) => (
                  <VisitaCard key={v.id} visita={v} onClickCard={handleVisitaClick} onOpenDetail={setSelectedVisitaDetail} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-6 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg text-center">
              <p className="text-sm text-gray-400 font-medium">
                No hay visitas registradas para este vendedor
              </p>
            </div>
          )}
        </div>
      </div>

      <VendedorModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingVendedor(null) }}
        vendedor={editingVendedor}
        onSave={handleSaveVendedor}
      />
      <VisitaDetailModal
        item={selectedVisitaDetail}
        onClose={() => setSelectedVisitaDetail(null)}
        vendedorName={selectedVendedor?.nombre}
      />
    </div>
  )
}
