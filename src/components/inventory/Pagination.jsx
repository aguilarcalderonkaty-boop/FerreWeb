import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, totalCount, onPageChange }) {
  const from = (page - 1) * 10 + 1
  const to = Math.min(page * 10, totalCount)

  // Generate visible pages
  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 3
    let start = Math.max(1, page - 1)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="bg-white rounded-2xl border border-border-light px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
        Mostrando {from}-{to} de {totalCount.toLocaleString()} productos
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-surface-alt text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getVisiblePages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`
              w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200
              ${p === page
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }
            `}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-surface-alt text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
