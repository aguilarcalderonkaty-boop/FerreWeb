import { useState, useEffect } from 'react'
import { X, Save, User, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const emptyForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  zona_id: '',
  numero_control: '',
}

export default function VendedorModal({ isOpen, onClose, vendedor, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [zonas, setZonas] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!vendedor

  useEffect(() => {
    async function fetchZonas() {
      const { data } = await supabase
        .from('zonas_trabajo')
        .select('*')
        .order('nombre_zona')
      setZonas(data || [])
    }
    if (isOpen) fetchZonas()
  }, [isOpen])

  useEffect(() => {
    if (vendedor) {
      // vendedor comes from the hook with mapped name, we need to refetch raw data
      supabase
        .from('vendedores')
        .select('*')
        .eq('id', vendedor.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              nombre: data.nombre || '',
              apellido_paterno: data.apellido_paterno || '',
              apellido_materno: data.apellido_materno || '',
              zona_id: data.zona_id || '',
              numero_control: data.numero_control || '',
            })
          }
        })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [vendedor, isOpen])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim()) {
      setError('El nombre del vendedor es obligatorio.')
      return
    }

    setSaving(true)

    const saveData = {
      nombre: form.nombre.trim(),
      apellido_paterno: form.apellido_paterno.trim() || null,
      apellido_materno: form.apellido_materno.trim() || null,
      zona_id: form.zona_id || null,
      numero_control: form.numero_control.trim() || null,
    }

    try {
      await onSave(saveData, vendedor?.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const inputCls = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/40 focus:bg-white transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-[#ff8a00]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Vendedor' : 'Nuevo Vendedor'}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {isEditing ? 'Modifique la información del vendedor' : 'Registre un nuevo vendedor en el equipo'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text" value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Carlos" required className={inputCls}
              />
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Apellido Paterno</label>
                <input type="text" value={form.apellido_paterno}
                  onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                  placeholder="González" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Apellido Materno</label>
                <input type="text" value={form.apellido_materno}
                  onChange={(e) => handleChange('apellido_materno', e.target.value)}
                  placeholder="López" className={inputCls} />
              </div>
            </div>

            {/* Zona + Número de Control */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <MapPin className="w-3 h-3 inline mr-1" />Zona de Trabajo
                </label>
                <select value={form.zona_id} onChange={(e) => handleChange('zona_id', e.target.value)}
                  className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="">Seleccionar zona...</option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>{z.nombre_zona}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Usuario</label>
                <input type="text" value={form.numero_control}
                  onChange={(e) => handleChange('numero_control', e.target.value)}
                  placeholder="juan.perez" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3.5 rounded-xl border border-red-100 mt-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-5 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-5 py-3.5 bg-[#ff8a00] hover:bg-[#e67a00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8a00]/20 transition-all disabled:opacity-60 active:scale-[0.98]">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" />{isEditing ? 'Guardar Cambios' : 'Registrar Vendedor'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
