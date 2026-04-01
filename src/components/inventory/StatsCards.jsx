import { Package, AlertTriangle } from 'lucide-react'

export default function StatsCards({ totalStock, outOfStock }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Stock Disponible */}
      <div className="bg-white rounded-2xl border border-border-light p-5 sm:p-6 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1">
            Stock Disponible
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            {totalStock.toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Package className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Agotados */}
      <div className="bg-white rounded-2xl border border-border-light p-5 sm:p-6 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-red mb-1">
            Agotados
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-accent-red tracking-tight">
            {outOfStock}
          </p>
        </div>
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <AlertTriangle className="w-6 h-6 text-accent-red" />
        </div>
      </div>
    </div>
  )
}
