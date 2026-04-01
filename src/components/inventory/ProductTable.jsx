import ProductRow from './ProductRow'

export default function ProductTable({ products, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#ff8a00] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-16 flex flex-col items-center justify-center gap-2">
          <p className="text-gray-400 text-sm font-medium">No se encontraron productos</p>
          <p className="text-gray-300 text-xs">Intente cambiar los filtros o agregar un nuevo producto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6 py-4 text-left w-16">
                Foto
              </th>
              <th className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6 py-4 text-left">
                Descripción
              </th>
              <th className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6 py-4 text-left">
                Precio
              </th>
              <th className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6 py-4 text-left">
                Stock
              </th>
              <th className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6 py-4 text-left">
                Rotación
              </th>
              <th className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6 py-4 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
                onEdit={onEdit}
                onToggleActive={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-50">
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            index={index}
            onEdit={onEdit}
            onToggleActive={onDelete}
            isMobile
          />
        ))}
      </div>
    </div>
  )
}
