import { ClipboardCheck, AlertCircle } from 'lucide-react'

export default function StatsCards({ totalStock, outOfStock }) {
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Cantidad de Productos
          </p>
          <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {totalStock.toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <ClipboardCheck className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <p className="text-[11px] font-bold text-[#ff8a00] uppercase tracking-widest mb-2">
            Agotados
          </p>
          <p className="text-4xl font-extrabold text-red-500 tracking-tight">
            {outOfStock}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={2.5} />
        </div>
      </div>
    </>
  )
}
