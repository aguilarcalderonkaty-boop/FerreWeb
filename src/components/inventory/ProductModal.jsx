import { useState, useEffect } from 'react'
import { X, Package, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const emptyForm = {
  nombre: '',
  clave: '',
  descripcion: '',
  empaque: '',
  unidad_id: '',
  precio_mayoreo: '',
  precio_distribuidor: '',
  stock: 0,
  foto_url: '',
}

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [unidades, setUnidades] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!product

  // Fetch unidades de medida
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
        descripcion: product.descripcion || '',
        empaque: product.empaque || '',
        unidad_id: product.unidad_id || '',
        precio_mayoreo: product.precio_mayoreo ?? '',
        precio_distribuidor: product.precio_distribuidor ?? '',
        stock: product.stock ?? 0,
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

    // Prepare data — convert numeric fields
    const saveData = {
      nombre: form.nombre.trim(),
      clave: form.clave.trim() || null,
      descripcion: form.descripcion.trim() || null,
      empaque: form.empaque.trim() || null,
      unidad_id: form.unidad_id || null,
      precio_mayoreo: form.precio_mayoreo !== '' ? parseFloat(form.precio_mayoreo) : null,
      precio_distribuidor: form.precio_distribuidor !== '' ? parseFloat(form.precio_distribuidor) : null,
      stock: parseInt(form.stock) || 0,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="text-xs text-text-muted">
                {isEditing ? 'Modifique los campos necesarios' : 'Complete los datos del producto'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-alt text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder='Ej: Rotomartillo Industrial 1/2"'
              className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Clave + Empaque */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
                Clave
              </label>
              <input
                type="text"
                value={form.clave}
                onChange={(e) => handleChange('clave', e.target.value)}
                placeholder="DEW-7492"
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
                Empaque
              </label>
              <input
                type="text"
                value={form.empaque}
                onChange={(e) => handleChange('empaque', e.target.value)}
                placeholder="Caja 100u"
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Unidad + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
                Unidad de Medida
              </label>
              <select
                value={form.unidad_id}
                onChange={(e) => handleChange('unidad_id', e.target.value)}
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Seleccionar...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.abreviatura ? `(${u.abreviatura})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
                Precio Mayoreo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precio_mayoreo}
                onChange={(e) => handleChange('precio_mayoreo', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
                Precio Distribuidor
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precio_distribuidor}
                onChange={(e) => handleChange('precio_distribuidor', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción breve del producto..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* URL de imagen */}
          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1.5">
              URL de Foto
            </label>
            <input
              type="url"
              value={form.foto_url}
              onChange={(e) => handleChange('foto_url', e.target.value)}
              placeholder="https://example.com/foto.jpg"
              className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-alt transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg transition-all disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
