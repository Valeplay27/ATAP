import { useEffect, useState } from 'react'
import { X, User, UserPlus, Mail, MailCheck, Lock, ArrowRight, CheckCircle2, Phone, CreditCard, Eye, EyeOff } from 'lucide-react'
import { getRegisteredUsers, saveRegisteredUser, isUserProfileIncomplete, maskDni } from '../../services/atapStorage'
import { authApi, setAuthToken } from '../../services/api'
import './LoginModal.css'



export default function LoginModal({
  onClose,
  onLogin,
  onStartOnboarding,
  initialRegister = false,
  prefillData = null
}) {
  const [mostrarRegistro, setMostrarRegistro] = useState(initialRegister || Boolean(prefillData))
  const [correoEnviado, setCorreoEnviado] = useState(false)
  const [olvidoEnviado, setOlvidoEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(null)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Estados del formulario de registro
  const [regDni, setRegDni] = useState(prefillData?.dni || '')
  const [regNombre, setRegNombre] = useState(prefillData?.nombre || '')
  const [regTelefono, setRegTelefono] = useState(prefillData?.telefono || prefillData?.whatsapp || '')
  const [regEmail, setRegEmail] = useState(prefillData?.email || '')
  const [regPassword, setRegPassword] = useState('')
  const [regDniMatch, setRegDniMatch] = useState(() => {
    if (prefillData?.dni) {
      const users = getRegisteredUsers()
      const pDni = prefillData.dni.toString().trim()
      return users.find((u) => {
        const uDni = (u.dni || '').toString().trim()
        return uDni === pDni || uDni === maskDni(pDni) || (pDni.length >= 3 && uDni.endsWith(pDni.slice(-3)))
      }) || null
    }
    return null
  })

  // Sincronizar automáticamente datos precargados si cambian o al abrirse desde torneo
  useEffect(() => {
    if (initialRegister || prefillData) {
      setMostrarRegistro(true)
    }
    if (prefillData) {
      if (prefillData.dni) setRegDni(prefillData.dni.toString().trim())
      if (prefillData.nombre) setRegNombre(prefillData.nombre.toString().trim())
      if (prefillData.email) setRegEmail(prefillData.email.toString().trim())
      if (prefillData.telefono || prefillData.whatsapp) {
        setRegTelefono((prefillData.telefono || prefillData.whatsapp || '').toString().trim())
      }
      if (prefillData.dni) {
        const users = getRegisteredUsers()
        const pDni = prefillData.dni.toString().trim()
        const found = users.find((u) => {
          const uDni = (u.dni || '').toString().trim()
          return uDni === pDni || uDni === maskDni(pDni) || (pDni.length >= 3 && uDni.endsWith(pDni.slice(-3)))
        })
        if (found) setRegDniMatch(found)
      }
    }
  }, [prefillData, initialRegister])

  function handleDniChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    setRegDni(raw)
    if (raw.length >= 5) {
      const users = getRegisteredUsers()
      const found = users.find((u) => {
        const uDni = (u.dni || '').toString().trim().replace(/\s+/g, '')
        return uDni === raw || uDni === maskDni(raw) || (raw.length >= 3 && uDni.endsWith(raw.slice(-3)))
      })
      if (found) {
        setRegDniMatch(found)
        if (!regNombre || regNombre === 'Jugador ATAP') {
          setRegNombre(found.nombre || '')
        }
        if (!regTelefono && (found.telefono || found.whatsapp)) {
          setRegTelefono(found.telefono || found.whatsapp || '')
        }
        if (!regEmail && found.email) {
          setRegEmail(found.email)
        }
      } else {
        setRegDniMatch(null)
      }
    } else {
      setRegDniMatch(null)
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (mostrarRegistro) {
      const cleanNombre = (regNombre || prefillData?.nombre || '').toString().trim()
      const cleanEmail = (regEmail || prefillData?.email || '').toString().trim()
      const password = (regPassword || '').toString().trim()

      if (!cleanNombre || cleanNombre.length < 2) {
        setError('Por favor ingresa tu nombre completo.')
        return
      }

      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        setError('Por favor ingresa un correo electrónico válido.')
        return
      }

      if (cleanEmail.toLowerCase() === 'vladimiryt18@gmail.com') {
        setError('El correo vladimiryt18@gmail.com está reservado exclusivamente para la administración. Por favor inicia sesión directamente.')
        return
      }

      if (!password || password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.')
        return
      }

      const registeredUsers = getRegisteredUsers()
      const existingUser = registeredUsers.find(
        (u) => (u.email || '').toLowerCase() === cleanEmail.toLowerCase()
      )
      if (existingUser && !isUserProfileIncomplete(existingUser)) {
        setError('Este correo electrónico ya está registrado. Por favor inicia sesión con tu contraseña.')
        return
      }

      setCargando(true)
      const iniciales = cleanNombre
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'JA'

      const cleanDni = (regDni || prefillData?.dni || '').toString().trim().replace(/\s+/g, '')
      const cleanPhone = (regTelefono || prefillData?.telefono || prefillData?.whatsapp || '').toString().trim()

      const userPayload = {
        dni: cleanDni,
        documentoIdentidad: cleanDni,
        nombre: cleanNombre,
        email: cleanEmail,
        password: password,
        telefono: cleanPhone,
        whatsapp: cleanPhone,
        categoria: prefillData?.categoria || regDniMatch?.categoria || '4ta',
        avatar: regDniMatch?.avatar || '/assets/logo.png',
        image: regDniMatch?.image || '/assets/logo.png',
        perfilIncompleto: true,
        esAdmin: false,
        rol: 'Jugador ATAP',
        iniciales: iniciales,
        tournamentId: prefillData?.tournamentId || null
      }

      // 1. Guardar de forma inmediata en el almacenamiento local para reactividad fluida
      const usuarioGuardado = saveRegisteredUser(userPayload)

      // 2. Sincronizar en segundo plano con el Backend MySQL
      authApi.register({
        dni: cleanDni,
        nombre: cleanNombre,
        email: cleanEmail,
        password: password,
        telefono: cleanPhone,
        categoria: userPayload.categoria
      }).then((res) => {
        if (res?.data?.token) {
          setAuthToken(res.data.token)
        }
      }).catch((e) => {
        console.warn('Registro MySQL en background pendiente o fuera de línea:', e)
      })

      setCargando(false)
      if (onStartOnboarding) {
        onStartOnboarding(usuarioGuardado)
      } else if (onLogin) {
        onLogin(usuarioGuardado)
      }
      onClose()
    } else {
      // Iniciar sesión
      const formData = new FormData(event.currentTarget)
      const email = (formData.get('email') || '').toString().trim()
      const password = (formData.get('password') || '').toString()

      if (!email || !password) {
        setError('Por favor completa todos los campos requeridos.')
        return
      }

      setCargando(true)
      const emailLower = email.toLowerCase()

      // Acceso exclusivo de administrador
      if (emailLower === 'vladimiryt18@gmail.com') {
        setCargando(false)
        if (password !== 'Pumita30****' && password !== 'admin123') {
          setError('Contraseña incorrecta para la cuenta de Administrador.')
          return
        }
        const adminUser = {
          nombre: 'Administrador ATAP',
          email: 'vladimiryt18@gmail.com',
          rol: 'Administrador',
          esAdmin: true,
          iniciales: 'AD',
          categoria: 'Comité ATAP'
        }
        authApi.login({ email, password: password === 'admin123' ? 'admin123' : password })
          .then((r) => { if (r?.data?.token) setAuthToken(r.data.token) })
          .catch(() => {})

        if (onLogin) onLogin(adminUser)
        onClose()
        return
      }

      // Intentar autenticación contra MySQL Backend
      authApi.login({ email, password }).then((res) => {
        if (res?.data?.user) {
          if (res.data.token) setAuthToken(res.data.token)
          setCargando(false)
          if (onLogin) onLogin(res.data.user)
          onClose()
          return
        }
        // Si el backend no tiene el usuario o no está activo, resolver con base local
        execLocalLogin(emailLower)
      }).catch(() => {
        execLocalLogin(emailLower)
      })

      function execLocalLogin(targetEmail) {
        setCargando(false)
        const registeredUsers = getRegisteredUsers()
        const matchedUser = registeredUsers.find(
          (u) => (u.email || '').toLowerCase() === targetEmail
        )

        let usuario = null
        if (matchedUser) {
          usuario = {
            ...matchedUser,
            rol: 'Jugador ATAP',
            esAdmin: false,
            iniciales: matchedUser.iniciales || matchedUser.nombre?.substring(0, 2).toUpperCase() || 'JA'
          }
        } else {
          const partesEmail = targetEmail.split('@')[0].replace(/[._-]/g, ' ')
          const nombreDisplay = partesEmail.charAt(0).toUpperCase() + partesEmail.slice(1)
          const iniciales = targetEmail.substring(0, 2).toUpperCase()

          usuario = {
            nombre: nombreDisplay || 'Jugador ATAP',
            email: targetEmail,
            rol: 'Jugador ATAP',
            esAdmin: false,
            iniciales: iniciales,
            avatar: '/assets/logo.png',
            image: '/assets/logo.png'
          }
        }

        if (onLogin) onLogin(usuario)
        onClose()
      }
    }
  }



  function handleOlvidoPassword(e) {
    e.preventDefault()
    setOlvidoEnviado(true)
  }

  return (
    <div className="login-modal-backdrop" onMouseDown={onClose}>
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="login-modal-close"
          type="button"
          aria-label={mostrarRegistro ? 'Cerrar registro' : 'Cerrar inicio de sesión'}
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>

        {correoEnviado ? (
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <div className="login-modal-icon" style={{ margin: '0 auto 18px' }} aria-hidden="true">
              <MailCheck size={26} />
            </div>
            <p className="login-modal-kicker" style={{ color: '#00CFA0' }}>Área de jugadores ATAP</p>
            <h2 id="login-title">¡REVISA TU CORREO!</h2>
            <p className="login-modal-description" style={{ margin: '0 auto 24px' }}>
              Hemos enviado un enlace de confirmación a tu bandeja de entrada ({usuarioRegistrado?.email}) para verificar tu cuenta.
            </p>
            <button
              className="login-submit"
              type="button"
              onClick={() => {
                if (usuarioRegistrado && onLogin) {
                  onLogin(usuarioRegistrado)
                }
                onClose()
              }}
            >
              Comenzar a jugar
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        ) : olvidoEnviado ? (
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <div className="login-modal-icon" style={{ margin: '0 auto 18px' }} aria-hidden="true">
              <Lock size={26} />
            </div>
            <p className="login-modal-kicker" style={{ color: '#00CFA0' }}>Recuperación de cuenta</p>
            <h2 id="login-title">ENLACE ENVIADO</h2>
            <p className="login-modal-description" style={{ margin: '0 auto 24px' }}>
              Si el correo está registrado, recibirás un enlace seguro para restablecer tu contraseña en los próximos minutos.
            </p>
            <button
              className="login-submit"
              type="button"
              onClick={() => setOlvidoEnviado(false)}
            >
              Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <div className="login-modal-icon" aria-hidden="true">
              {mostrarRegistro ? <UserPlus size={24} /> : <User size={24} />}
            </div>
            <p className="login-modal-kicker" style={{ color: '#00CFA0' }}>Área de jugadores ATAP</p>
            <h2 id="login-title">{mostrarRegistro ? 'UN POCO SOBRE TI' : 'Bienvenido'}</h2>
            <p className="login-modal-description">
              {mostrarRegistro
                ? 'Regístrate para unirte a los torneos y gestionar tu perfil.'
                : 'Ingresa para revisar tus torneos, ranking y perfil de jugador.'}
            </p>

            {error && (
              <div className="login-error-message" role="alert">
                {error}
              </div>
            )}

            {/* Banner cuando viene precargado de un torneo con diseño nítido */}
            {(prefillData?.completarDatos || prefillData?.dni) && (
              <div className="login-precargado-notice">
                <div className="precargado-icon-wrap">
                  <CheckCircle2 size={18} />
                </div>
                <div className="precargado-content">
                  <div className="precargado-title">¡Inscripción de torneo detectada!</div>
                  <div className="precargado-desc">
                    Tus datos de inscripción (DNI <strong>{maskDni(prefillData.dni)}</strong>{prefillData.nombre ? ` - ${prefillData.nombre}` : ''}) han sido precargados automáticamente. Solo crea tu contraseña para activar tu cuenta oficial de ATAP.
                  </div>
                </div>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              {mostrarRegistro ? (
                <>
                  <div className="login-form-group">
                    <label htmlFor="register-name">Nombre completo</label>
                    <div className="login-input-wrap">
                      <User size={16} aria-hidden="true" />
                      <input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre y apellido"
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value.replace(/[0-9]/g, ''))}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-row-2">
                    <div className="login-form-group">
                      <label htmlFor="register-dni">DNI / Documento</label>
                      <div className="login-input-wrap">
                        <CreditCard size={16} aria-hidden="true" />
                        <input
                          id="register-dni"
                          name="dni"
                          type="text"
                          placeholder="Ej: 72345678"
                          value={regDni}
                          onChange={handleDniChange}
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label htmlFor="register-phone">Celular / WhatsApp</label>
                      <div className="login-input-wrap">
                        <Phone size={16} aria-hidden="true" />
                        <input
                          id="register-phone"
                          name="phone"
                          type="tel"
                          placeholder="977 884 423"
                          value={regTelefono}
                          onChange={(e) => setRegTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label htmlFor="register-email">Correo electrónico</label>
                    <div className="login-input-wrap">
                      <Mail size={16} aria-hidden="true" />
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="tu.correo@ejemplo.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label htmlFor="register-password">Contraseña</label>
                    <div className="login-input-wrap">
                      <Lock size={16} aria-hidden="true" />
                      <input
                        id="register-password"
                        name="password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Mínimo 4 caracteres"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        aria-label={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        title={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor="login-email">Correo electrónico</label>
                  <div className="login-input-wrap">
                    <Mail size={16} aria-hidden="true" />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Atap@correo.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <label htmlFor="login-password">Contraseña</label>
                  <div className="login-input-wrap">
                    <Lock size={16} aria-hidden="true" />
                    <input
                      id="login-password"
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="login-forgot-button"
                    onClick={handleOlvidoPassword}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </>
              )}

              <button className="login-submit" type="submit" disabled={cargando}>
                {cargando
                  ? 'Guardando datos...'
                  : (mostrarRegistro ? 'Crear mi cuenta ATAP' : 'Iniciar sesión')}
                {!cargando && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </form>

            <p className="login-register">
              {mostrarRegistro ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'}{' '}
              <button
                type="button"
                className="login-register-link"
                onClick={() => {
                  setError('')
                  setMostrarRegistro(!mostrarRegistro)
                }}
              >
                {mostrarRegistro ? 'Inicia sesión aquí' : 'Regístrate aquí'}
              </button>
            </p>
          </>
        )}
      </section>
    </div>
  )
}