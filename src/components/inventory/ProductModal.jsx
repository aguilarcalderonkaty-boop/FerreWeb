import { useState, useEffect } from 'react'
import { X, Package, Save, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const emptyForm = {
  nombre: '',
  clave: '',
  empaque: '',
  unidad_id: '',
  precio_mayoreo: '',
  stock: '',
  foto_url: '',
}

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [unidades, setUnidades] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!product

  useEffect(() => {
    async function fetchUnidades() {
      const { data } = await supabase
        .from('unidades_medida')
        .select('*')
        .order('nombre')
      setUnidades(data || [])
    }
    if (isOpen) fetchUnidades()
  }, [isOpen])

  useEffect(() => {
    if (product) {
      setForm({
        nombre: product.nombre || '',
        clave: product.clave || '',
        empaque: product.empaque || '',
        unidad_id: product.unidad_id || '',
        precio_mayoreo: product.precio_mayoreo != null ? String(product.precio_mayoreo) : '',
        stock: product.stock != null ? String(product.stock) : '',
        foto_url: product.foto_url || '',
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [product, isOpen])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    setSaving(true)

    const saveData = {
      nombre: form.nombre.trim(),
      clave: form.clave.trim() || null,
      empaque: form.empaque.trim() || null,
      unidad_id: form.unidad_id || null,
      precio_mayoreo: form.precio_mayoreo !== '' ? parseFloat(form.precio_mayoreo) : null,
      stock: form.stock !== '' ? parseInt(form.stock) : 0,
      foto_url: form.foto_url.trim() || null,
    }

    const result = await onSave(saveData)

    if (result?.error) {
      setError(result.error)
      setSaving(false)
    } else {
      setSaving(false)
      onClose()
    }
  }

  if (!isOpen) return null

  const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/40 focus:bg-white transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-[#ff8a00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditing ? 'Modifique los campos necesarios' : 'Complete los datos del producto'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white m-4 rounded-2xl border border-gray-100">
          <div className="p-6 space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Nombre del producto <span className="text-red-400">*</span>
              </label>
              <input
                type="text" value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder='Ej: Rotomartillo Industrial 1/2"'
                className={inputCls} required
              />
            </div>

            {/* Clave + Empaque */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Clave</label>
                <input type="text" value={form.clave}
                  onChange={(e) => handleChange('clave', e.target.value)}
                  placeholder="DEW-7492" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Empaque</label>
                <input type="text" value={form.empaque}
                  onChange={(e) => handleChange('empaque', e.target.value)}
                  placeholder="Caja 100u" className={inputCls} />
              </div>
            </div>

            {/* Unidad + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Unidad de Medida</label>
                <select value={form.unidad_id}
                  onChange={(e) => handleChange('unidad_id', e.target.value)}
                  className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="">Seleccionar...</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre} {u.abreviatura ? `(${u.abreviatura})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Stock</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => {
                    const val = e.target.value
                    // Allow empty string or digits only
                    if (val === '' || /^\d+$/.test(val)) {
                      handleChange('stock', val)
                    }
                  }}
                  onFocus={(e) => {
                    // Select all text on focus so user can overwrite easily
                    e.target.select()
                  }}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Precio Público */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Precio</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">$</span>
                <input type="number" min="0" step="0.01" value={form.precio_mayoreo}
                  onChange={(e) => handleChange('precio_mayoreo', e.target.value)}
                  placeholder="0.00" className={`${inputCls} pl-8`} />
              </div>
            </div>

            {/* URL de imagen */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">URL de Foto</label>
              <div className="flex gap-3">
                <input type="url" value={form.foto_url}
                  onChange={(e) => handleChange('foto_url', e.target.value)}
                  placeholder="https://example.com/foto.jpg"
                  className={`${inputCls} flex-1`} />
                {form.foto_url && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img src={form.foto_url} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
              {error}
            </div>
          )}

          {/* Actions — stuck to bottom with bg */}
          <div className="flex gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button type="button" onClick={onClose}
              className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-white hover:text-gray-700 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-5 py-3 bg-[#ff8a00] hover:bg-[#e67a00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8a00]/20 transition-all disabled:opacity-60 active:scale-[0.98]">
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4" />{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
