import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useVendedores() {
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [visitas, setVisitas] = useState([])
  const [visitasLoading, setVisitasLoading] = useState(false)

  const fetchVendedores = useCallback(async () => {
    setLoading(true)
    try {
      const { data: vendedoresData, error } = await supabase
        .from('vendedores')
        .select('*, zonas_trabajo(nombre_zona)')
        .order('nombre')

      if (error) throw error
      if (!vendedoresData || vendedoresData.length === 0) {
        setVendedores([])
        setLoading(false)
        return
      }

      // Fetch total ventas per vendedor (current week)
      const getWeekRange = () => {
        const now = new Date()
        const day = now.getDay()
        const diffToMon = day === 0 ? -6 : 1 - day
        const mon = new Date(now); mon.setDate(now.getDate() + diffToMon); mon.setHours(0,0,0,0)
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999)
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        return { start: fmt(mon), end: `${fmt(sun)}T23:59:59` }
      }
      const { start, end } = getWeekRange()

      const { data: ventasAll } = await supabase
        .from('ventas')
        .select('vendedor_id, total_final')
        .gte('fecha_venta', start)
        .lte('fecha_venta', end)

      const ventasTotals = {}
      ;(ventasAll || []).forEach(v => {
        if (v.vendedor_id) {
          ventasTotals[v.vendedor_id] = (ventasTotals[v.vendedor_id] || 0) + (v.total_final || 0)
        }
      })

      const mapped = vendedoresData.map(v => ({
        id: v.id,
        nombre: `${v.nombre || ''} ${v.apellido_paterno || ''}`.trim(),
        apellido_materno: v.apellido_materno || '',
        zona_nombre: v.zonas_trabajo?.nombre_zona || 'Sin zona',
        zona_id: v.zona_id,
        numero_control: v.numero_control || '',
        foto_url: `https://i.pravatar.cc/150?u=${v.id}`,
        ventas_total: ventasTotals[v.id] || 0,
        meta_visitas_diarias: v.meta_visitas_diarias || 30,
        meta_ventas_diarias: v.meta_ventas_diarias || 15,
      }))

      setVendedores(mapped)
      if (!selectedId && mapped.length > 0) setSelectedId(mapped[0].id)
    } catch (err) {
      console.error('Error fetching vendedores:', err)
      setVendedores([])
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVisitas = useCallback(async (vendedorId) => {
    setVisitasLoading(true)
    try {
      const { data, error } = await supabase
        .from('visitas')
        .select('*, clientes(nombre_negocio, calle_numero, latitud, longitud), ventas(total_final)')
        .eq('vendedor_id', vendedorId)
        .order('fecha_hora_llegada', { ascending: false })
        .limit(100)

      if (error) throw error

      const mapped = (data || []).map(v => {
        const llegada = v.fecha_hora_llegada ? new Date(v.fecha_hora_llegada) : null
        const salida = v.fecha_hora_salida ? new Date(v.fecha_hora_salida) : null

        let resultado = 'pendiente'
        if (v.estado === 'COMPLETADA' || v.estado === 'FINALIZADA') {
          resultado = v.ventas && v.ventas.length > 0 ? 'venta_exitosa' : 'rechazado'
        }

        return {
          id: v.id,
          cliente_nombre: v.clientes?.nombre_negocio || 'Cliente',
          cliente_direccion: v.clientes?.calle_numero || '',
          resultado,
          hora_llegada: llegada
            ? llegada.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '--',
          hora_salida: salida
            ? salida.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '--',
          motivo_no_venta: v.motivo_no_venta,
          total_venta: v.ventas?.[0]?.total_final || null,
          lat: v.latitud_visita || v.clientes?.latitud || null,
          lng: v.longitud_visita || v.clientes?.longitud || null,
        }
      })

      setVisitas(mapped)
    } catch (err) {
      console.error('Error fetching visitas:', err)
      setVisitas([])
    } finally {
      setVisitasLoading(false)
    }
  }, [])

  useEffect(() => { fetchVendedores() }, [fetchVendedores])
  useEffect(() => { if (selectedId) fetchVisitas(selectedId) }, [selectedId, fetchVisitas])

  const selectedVendedor = vendedores.find(v => v.id === selectedId) || null

  const addVendedor = async (data) => {
    const { error } = await supabase.from('vendedores').insert([data])
    if (error) throw error
    await fetchVendedores()
  }

  const updateVendedor = async (id, data) => {
    const { error } = await supabase.from('vendedores').update(data).eq('id', id)
    if (error) throw error
    await fetchVendedores()
  }

  return {
    vendedores,
    loading,
    selectedId,
    setSelectedId,
    selectedVendedor,
    visitas,
    visitasLoading,
    addVendedor,
    updateVendedor,
    refetch: fetchVendedores,
  }
}
