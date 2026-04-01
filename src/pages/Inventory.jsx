import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import StatsCards from '../components/inventory/StatsCards'
import FilterChips from '../components/inventory/FilterChips'
import ProductTable from '../components/inventory/ProductTable'
import Pagination from '../components/inventory/Pagination'
import ProductModal from '../components/inventory/ProductModal'
import { supabase } from '../lib/supabase'

export default function Inventory() {
  const {
    products,
    loading,
    totalCount,
    page,
    totalPages,
    filter,
    setPage,
    setFilter,
    setSearchQuery,
    addProduct,
    updateProduct,
    toggleProductActive,
  } = useProducts()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [stats, setStats] = useState({ totalStock: 0, outOfStock: 0 })
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: totalProducts } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        const { count: outOfStock } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)
          .eq('stock', 0)

        setStats({ totalStock: totalProducts || 0, outOfStock: outOfStock || 0 })
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    fetchStats()
  }, [products])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery, setPage])

  const handleEdit = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleSave = async (formData) => {
    if (editingProduct) {
      return await updateProduct(editingProduct.id, formData)
    } else {
      return await addProduct(formData)
    }
  }

  const handleToggleActive = async (productId) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      await toggleProductActive(productId, product.activo !== false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
            Catálogo de Inventario
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestión de existencias y rotación de productos industriales.
          </p>
        </div>
        <button
          id="btn-new-product"
          onClick={handleNewProduct}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ffe600] hover:bg-[#e6cf00] text-black font-bold rounded-full shadow-sm transition-all duration-200 active:scale-[0.98] whitespace-nowrap text-sm"
        >
          <div className="bg-black text-[#ffe600] rounded-full p-0.5">
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          </div>
          NUEVO PRODUCTO
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar producto por nombre, clave o descripción..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/30 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCards totalStock={stats.totalStock} outOfStock={stats.outOfStock} />
        <FilterChips activeFilter={filter} onFilterChange={(f) => { setFilter(f); setPage(1) }} />
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleToggleActive}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      <ProductModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(null) }}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  )
}
