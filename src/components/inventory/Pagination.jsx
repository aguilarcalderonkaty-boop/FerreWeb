import { ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 5

export default function Pagination({ page, totalPages, totalCount, onPageChange }) {
  const from = (page - 1) * ITEMS_PER_PAGE + 1
  const to = Math.min(page * ITEMS_PER_PAGE, totalCount)

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
    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl border border-gray-100">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        Mostrando {from}-{to} de {totalCount.toLocaleString()} productos
      </p>

      <div className="flex items-center gap-1.5 mt-3 sm:mt-0">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getVisiblePages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`
              w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center
              ${p === page
                ? 'bg-[#ff8a00] text-white shadow-sm'
                : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
              }
            `}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
