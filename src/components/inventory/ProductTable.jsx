import ProductRow from './ProductRow'

export default function ProductTable({ products, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted font-medium">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center gap-2">
          <p className="text-text-muted text-sm font-medium">No se encontraron productos</p>
          <p className="text-text-muted text-xs">Intente cambiar los filtros o agregar un nuevo producto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                Fotografía
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                Descripción
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                Unidad de Medida
              </th>
              <th className="text-center px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                Existencias
              </th>
              <th className="text-center px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                Nivel Rotación
              </th>
              <th className="text-center px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {products.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border-light">
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            isMobile
          />
        ))}
      </div>
    </div>
  )
}
