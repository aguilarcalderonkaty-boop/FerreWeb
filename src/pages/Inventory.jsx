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
    deleteProduct,
  } = useProducts()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [stats, setStats] = useState({ totalStock: 0, outOfStock: 0 })
  const [localSearch, setLocalSearch] = useState('')

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: totalProducts } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })

        const { count: outOfStock } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('stock', 0)

        setStats({
          totalStock: totalProducts || 0,
          outOfStock: outOfStock || 0,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    fetchStats()
  }, [products])

  // Debounced search
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setPage(1)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight uppercase">
            Catálogo de Inventario
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gestión de existencias y rotación de productos industriales.
          </p>
        </div>
        <button
          id="btn-new-product"
          onClick={handleNewProduct}
          className="flex items-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary-light text-white font-bold text-sm rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          NUEVO PRODUCTO
        </button>
      </div>

      {/* Stats + Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StatsCards totalStock={stats.totalStock} outOfStock={stats.outOfStock} />
        </div>
        <div>
          <FilterChips activeFilter={filter} onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar producto o código..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteProduct}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  )
}
