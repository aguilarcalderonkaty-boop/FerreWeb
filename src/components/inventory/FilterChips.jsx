const filters = [
  { key: 'todo', label: 'TODO' },
  { key: 'alta_rotacion', label: 'ALTA ROTACIÓN' },
  { key: 'stock_bajo', label: 'STOCK BAJO' },
]

export default function FilterChips({ activeFilter, onFilterChange }) {
  return (
    <div className="bg-white rounded-2xl border border-border-light p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-3">
        Filtros de Visualización
      </p>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200
              ${activeFilter === f.key
                ? f.key === 'alta_rotacion'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-secondary text-white shadow-md'
                : 'bg-surface-alt text-text-secondary hover:bg-border-light hover:text-text-primary border border-border-light'
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
