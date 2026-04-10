import { ClipboardCheck, AlertCircle } from 'lucide-react'

export default function StatsCards({ totalStock, outOfStock }) {
  return (
    <>
      <div className="bg-white/90 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] px-5 py-4 flex items-center justify-between group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Cantidad de Productos
          </p>
          <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {totalStock.toLocaleString()}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <ClipboardCheck className="w-4.5 h-4.5 text-emerald-500" strokeWidth={2.5} />
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl border border-gray-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] px-5 py-4 flex items-center justify-between group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
        <div>
          <p className="text-[10px] font-bold text-[#ff8a00] uppercase tracking-widest mb-1">
            Agotados
          </p>
          <p className="text-2xl font-extrabold text-red-500 tracking-tight">
            {outOfStock}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <AlertCircle className="w-4.5 h-4.5 text-red-500" strokeWidth={2.5} />
        </div>
      </div>
    </>
  )
}
