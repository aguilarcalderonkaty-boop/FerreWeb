import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 5

function calcRotation(stock) {
  if (stock === 0) return 'critica'
  if (stock <= 10) return 'baja'
  if (stock <= 50) return 'media'
  return 'alta'
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('todo')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('productos')
        .select('*, unidades_medida(id, nombre, abreviatura)', { count: 'exact' })

      // Filter by activo status
      if (filter === 'inactivos') {
        query = query.eq('activo', false)
      } else if (filter === 'alta_rotacion') {
        query = query.eq('activo', true).gt('stock', 50)
      } else if (filter === 'stock_bajo') {
        query = query.eq('activo', true).lte('stock', 10).gt('stock', 0)
      } else if (filter === 'agotados') {
        query = query.eq('activo', true).eq('stock', 0)
      } else {
        // 'todo' → only active products
        query = query.eq('activo', true)
      }

      if (searchQuery) {
        query = query.or(`nombre.ilike.%${searchQuery}%,clave.ilike.%${searchQuery}%,descripcion.ilike.%${searchQuery}%`)
      }

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      query = query
        .order('nombre', { ascending: true })
        .range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      const enriched = (data || []).map(p => ({
        ...p,
        nivel_rotacion: calcRotation(p.stock),
      }))

      setProducts(enriched)
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, filter, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const addProduct = async (productData) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([{ ...productData, activo: true }])
        .select('*, unidades_medida(id, nombre, abreviatura)')

      if (error) throw error
      await fetchProducts()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productData)
        .eq('id', id)
        .select('*, unidades_medida(id, nombre, abreviatura)')

      if (error) throw error
      await fetchProducts()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const toggleProductActive = async (id, currentlyActive) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: !currentlyActive })
        .eq('id', id)

      if (error) throw error
      await fetchProducts()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return {
    products,
    loading,
    error,
    totalCount,
    page,
    totalPages,
    filter,
    searchQuery,
    setPage,
    setFilter,
    setSearchQuery,
    addProduct,
    updateProduct,
    toggleProductActive,
    refetch: fetchProducts,
  }
}
