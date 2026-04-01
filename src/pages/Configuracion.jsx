import { useState, useEffect } from 'react'
import { User, Settings, Shield, Save, LogOut, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SETTINGS_KEY = 'ferreweb_settings'
function getSettings() {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || JSON.stringify({
    umbral_stock_bajo: 20,
    meta_ventas_mensual: 180000,
    meta_vendedor: 120000,
    moneda: 'MXN',
    frecuencia_purgado: 'nunca',
  }))
}

const tabs = [
  { key: 'perfil', label: 'Perfil de Usuario', icon: User },
  { key: 'parametros', label: 'Parámetros de Inventario', icon: Settings },
  { key: 'seguridad', label: 'Seguridad', icon: Shield },
]

/* ═══════════ PERFIL DE USUARIO ═══════════ */

function PerfilPanel() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    if (user) setUsername(user.email || '')
  }, [user])

  const handleSave = async () => {
    setMessage({ text: '', type: '' })

    if (newPassword && !currentPassword) {
      setMessage({ text: 'Debe ingresar su contraseña actual para poder cambiarla.', type: 'error' })
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: 'Las nuevas contraseñas no coinciden.', type: 'error' })
      return
    }

    setSaving(true)
    try {
      // Si se desea cambiar la contraseña, verificamos la actual primero
      if (newPassword && currentPassword) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        })
        if (authError) throw new Error('Contraseña actual incorrecta.')
      }

      const updates = {}
      if (username !== user?.email) updates.email = username
      if (newPassword) updates.password = newPassword

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates)
        if (error) throw error
        setMessage({ text: 'Perfil actualizado correctamente.', type: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ text: 'No hay cambios por guardar.', type: 'info' })
      }
    } catch (err) {
      setMessage({ text: err.message || 'Error al guardar.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/40 focus:bg-white transition-all"

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Perfil de Usuario</h2>
        <p className="text-sm text-gray-400">Actualice su correo electrónico o contraseña de acceso.</p>
      </div>

      {/* Info de cuenta */}
      <div className="flex items-center gap-5">
        <div>
          <p className="text-lg font-bold text-gray-900">{username}</p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Administrador General
          </p>
        </div>
      </div>

      {/* Usuario */}
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Usuario</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Contraseña Actual *</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nueva Contraseña</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Confirmar Contraseña</label>
          <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`px-4 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${message.type === 'error' ? 'bg-red-500' : message.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          {message.text}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="bg-[#ff8a00] hover:bg-[#e67a00] text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-[#ff8a00]/20 transition-all disabled:opacity-60 active:scale-[0.98]">
        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar Cambios
      </button>
    </div>
  )
}

/* ═══════════ PARÁMETROS DE INVENTARIO ═══════════ */

function ParametrosPanel() {
  const [settings, setSettings] = useState(getSettings)
  const [saved, setSaved] = useState(false)

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputCls = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/20 focus:border-[#ff8a00]/40 focus:bg-white transition-all"

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Parámetros de Inventario</h2>
        <p className="text-sm text-gray-400">Configure los umbrales y metas que afectan los reportes y alertas del sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5 text-[#ff8a00]" /></div>
            <div><p className="text-sm font-bold text-gray-900">Umbral de Stock Bajo</p><p className="text-xs text-gray-400">Productos por debajo aparecen en alertas</p></div>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" min="1" value={settings.umbral_stock_bajo}
              onChange={(e) => handleChange('umbral_stock_bajo', parseInt(e.target.value) || 20)}
              className={`${inputCls} w-32 text-center text-lg font-bold`} />
            <span className="text-sm text-gray-400 font-medium">unidades</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><span className="text-emerald-600 font-bold text-lg">$</span></div>
            <div><p className="text-sm font-bold text-gray-900">Meta de Ventas Mensual</p><p className="text-xs text-gray-400">Objetivo total del equipo</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg text-gray-400">$</span>
            <input type="number" min="0" step="1000" value={settings.meta_ventas_mensual}
              onChange={(e) => handleChange('meta_ventas_mensual', parseInt(e.target.value) || 180000)}
              className={`${inputCls} flex-1 text-lg font-bold`} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm font-bold text-gray-900">Meta de Ventas por Vendedor</p><p className="text-xs text-gray-400">Objetivo individual utilizado en barras de progreso de la vista Vendedores</p></div>
          </div>
          <div className="flex items-center gap-3 w-1/2">
            <span className="text-lg text-gray-400">$</span>
            <input type="number" min="0" step="1000" value={settings.meta_vendedor}
              onChange={(e) => handleChange('meta_vendedor', parseInt(e.target.value) || 120000)}
              className={`${inputCls} flex-1 text-lg font-bold text-blue-600`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Moneda</label>
          <select value={settings.moneda} onChange={(e) => handleChange('moneda', e.target.value)}
            className={`${inputCls} appearance-none cursor-pointer`}>
            <option value="MXN">MXN — Peso Mexicano</option>
            <option value="USD">USD — Dólar Americano</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-red-500">Purga de Base de Datos</label>
          <select value={settings.frecuencia_purgado} onChange={(e) => handleChange('frecuencia_purgado', e.target.value)}
            className={`${inputCls} appearance-none cursor-pointer font-medium text-gray-700`}>
            <option value="nunca">Nunca (Recomendado)</option>
            <option value="trimestral">Borrado automático cada 3 meses</option>
            <option value="semestral">Borrado automático cada 6 meses</option>
            <option value="anual">Borrado automático cada año</option>
          </select>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-600 text-sm font-medium px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Parámetros guardados correctamente.
        </div>
      )}

      <button onClick={handleSave}
        className="bg-[#ff8a00] hover:bg-[#e67a00] text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-[#ff8a00]/20 transition-all active:scale-[0.98]">
        <Save className="w-4 h-4" />Guardar Parámetros
      </button>
    </div>
  )
}

/* ═══════════ SEGURIDAD ═══════════ */

function SeguridadPanel() {
  const { user, signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Seguridad</h2>
        <p className="text-sm text-gray-400">Información de la sesión actual y control de acceso.</p>
      </div>

      {/* Session info */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Sesión Activa</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Correo</span>
            <span className="text-sm font-bold text-gray-900">{user?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">ID de Usuario</span>
            <span className="text-sm font-mono text-gray-400">{user?.id?.slice(0, 12) || '—'}...</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Último acceso</span>
            <span className="text-sm font-bold text-gray-900">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Estado</span>
            <span className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />Activa
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-700">Cerrar Sesión</p>
            <p className="text-xs text-red-400 mt-0.5">Se cerrará su sesión actual y deberá iniciar sesión nuevamente.</p>
          </div>
          <button onClick={handleLogout} disabled={loggingOut}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-60 active:scale-[0.98] shadow-sm">
            {loggingOut ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogOut className="w-4 h-4" />}
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════ MAIN PAGE ═══════════ */

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('perfil')

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Configuración del Sistema</h1>
          <p className="text-sm text-gray-400 mt-1">Administra las preferencias, perfil y parámetros de la ferretería.</p>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left menu */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24">
            <div className="flex flex-col gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'bg-orange-50 text-[#ff8a00] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {activeTab === 'perfil' && <PerfilPanel />}
            {activeTab === 'parametros' && <ParametrosPanel />}
            {activeTab === 'seguridad' && <SeguridadPanel />}
          </div>
        </div>
      </div>

      {/* Derechos Reservados */}
      <div className="text-center pt-6 pb-4 border-t border-gray-100 mt-4">
        <p className="text-xs font-bold text-gray-500">© {new Date().getFullYear()} Etereo Software</p>
        <p className="text-[11px] text-gray-400 mt-1">Todos los derechos reservados.</p>
        <p className="text-[10px] text-gray-400 mt-2">
          Developers: Katia Aguilar Calderon y Julio Cesar Araujo Hernandez
        </p>
      </div>
    </div>
  )
}
