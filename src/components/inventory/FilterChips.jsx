const filters = [
  { key: 'todo', label: 'TODO' },
  { key: 'alta_rotacion', label: 'ALTA ROTACIÓN' },
  { key: 'stock_bajo', label: 'STOCK BAJO' },
  { key: 'agotados', label: 'SIN STOCK' },
  { key: 'inactivos', label: 'INACTIVOS' },
]

export default function FilterChips({ activeFilter, onFilterChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Filtros de Visualización
      </p>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`
              rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200
              ${activeFilter === f.key
                ? f.key === 'inactivos'
                  ? 'bg-gray-700 text-white border border-gray-600'
                  : 'bg-orange-50 text-[#ff8a00] border border-orange-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100 hover:border-gray-200'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
