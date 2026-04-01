import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const loginUser = username.trim()
    const { error: authError } = await signIn(loginUser, password)

    if (authError) {
      setError('Credenciales incorrectas. Intente de nuevo.')
      setLoading(false)
    } else {
      navigate('/inventario')
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* --- COLUMNA IZQUIERDA --- */}
      <div className="w-full lg:w-[50%] min-h-screen bg-white flex flex-col">

        {/* Contenedor central del formulario */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-12 py-10">
          {/* CAMBIO 1: Ampliamos el contenedor de max-w-md a max-w-[540px] para que el título quepa en una sola línea */}
          <div className="w-full max-w-[540px]">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <img
                src="src/icono.png"
                alt="FerreApp Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/48x48/E66B1D/FFFFFF?text=FA";
                }}
              />
              <span className="font-extrabold text-2xl text-[#111111] tracking-tight">FerreApp</span>
            </div>

            {/* Títulos */}
            <div className="mb-12">
              {/* CAMBIO 2: Cambiamos mb-4 a mb-8 para dar más espacio entre el título y el subtítulo */}
              <h1 className="font-extrabold text-[32px] lg:text-[36px] text-[#111111] mb-8 tracking-tight leading-tight">
                Bienvenido al Panel de Control
              </h1>
              <p className="text-[15px] text-[#666666] leading-relaxed">
                Ingrese sus credenciales para gestionar el inventario industrial.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Input Usuario */}
              <div>
                <label className="font-bold text-[11px] text-[#666666] uppercase tracking-[0.15em] block mb-3">
                  Correo Electrónico / Usuario
                </label>
                {/* CAMBIO 3: Cambiamos pl-7 a pl-10 para empujar el ícono más hacia la derecha */}
                <div className="bg-gray-100 rounded-xl w-full h-16 pl-10 pr-5 flex items-center gap-4 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all duration-300">
                  <User className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@ferreapp.com"
                    className="text-[15px] text-[#111111] bg-transparent focus:outline-none w-full placeholder:text-gray-400 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f3f4f6_inset]"
                    required
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div>
                <label className="font-bold text-[11px] text-[#666666] uppercase tracking-[0.15em] block mb-3">
                  Contraseña
                </label>
                {/* CAMBIO 3: Cambiamos pl-7 a pl-10 para empujar el ícono más hacia la derecha */}
                <div className="bg-gray-100 rounded-xl w-full h-16 pl-10 pr-5 flex items-center gap-4 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all duration-300">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-[15px] text-[#111111] bg-transparent focus:outline-none w-full placeholder:text-gray-400 tracking-[0.2em] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f3f4f6_inset]"
                    required
                  />
                </div>
              </div>

              {/* Opciones Inferiores */}
              <div className="flex items-center justify-between mt-2 mb-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#E66B1D] focus:ring-[#E66B1D] cursor-pointer"
                  />
                  <span className="text-[14px] font-medium text-[#666666] group-hover:text-[#111111] transition-colors">
                    Recordarme
                  </span>
                </label>
                <button type="button" className="font-bold text-[14px] text-[#E66B1D] hover:underline transition-all">
                  ¿Olvidó su contraseña?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-[15px] p-4 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                className="font-bold text-[16px] text-[#111111] bg-[#b4f25b] hover:bg-[#a3e64b] rounded-xl w-full h-16 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="w-5 h-5 text-[#111111]" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="w-full px-8 lg:px-12 pb-8 pt-6 border-t border-gray-100 flex justify-between items-center text-[11px] text-[#999999] font-bold uppercase tracking-widest mt-auto">
          <span>© 2026 FERREAPP</span>
          <div className="flex gap-4 xl:gap-8">
            <button className="hover:text-[#111111] transition-colors">SOPORTE</button>
            <button className="hover:text-[#111111] transition-colors">PRIVACIDAD</button>
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA --- */}
      <div
        className="hidden lg:flex lg:w-[50%] min-h-screen relative bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80)' }}
      >
        <div className="absolute inset-0 bg-[#0a0a0a]/85 z-0" />

        <div className="absolute inset-0 z-10 p-8 flex flex-col justify-center items-center">

          <div className="w-full max-w-xl">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E66B1D]/10 border border-[#E66B1D]/20 px-3 py-1.5 rounded-full mb-8">
                <span className="w-2 h-2 bg-[#E66B1D] rounded-full inline-block" />
                <span className="font-bold text-[11px] text-[#E66B1D] uppercase tracking-[0.15em]">
                  Sistemas de alta precisión
                </span>
              </div>

              <h2 className="font-extrabold text-[42px] lg:text-[46px] text-white leading-[1.1] tracking-tight mb-6">
                Optimice su cadena de suministro industrial.
              </h2>

              <p className="text-base lg:text-lg text-gray-300 leading-relaxed max-w-lg">
                Control de inventario en tiempo real, logística avanzada y gestión de herramientas para equipos de alto rendimiento.
              </p>
            </div>

            <div className="w-full mt-12 pt-10 border-t border-white/10">
              <div className="flex gap-16">
                <div>
                  <span className="font-extrabold text-4xl lg:text-5xl text-[#E66B1D] tracking-tight block mb-2">99.9%</span>
                  <span className="font-bold text-[11px] text-gray-400 uppercase tracking-[0.15em] block">
                    PRECISIÓN DE STOCK
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-4xl lg:text-5xl text-[#E66B1D] tracking-tight block mb-2">+24k</span>
                  <span className="font-bold text-[11px] text-gray-400 uppercase tracking-[0.15em] block">
                    ACTIVOS MONITOREADOS
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}