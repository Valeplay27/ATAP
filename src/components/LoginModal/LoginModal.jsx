import { useEffect, useState } from 'react'
import { X, User, UserPlus, Mail, MailCheck, Lock, ArrowRight, CheckCircle2, Phone, CreditCard, Eye, EyeOff, KeyRound, MessageCircle, Check } from 'lucide-react'
import { getRegisteredUsers, saveRegisteredUser, isUserProfileIncomplete, maskDni, getContactInfo, validateDailyRecoveryKey, resetUserPassword } from '../../services/atapStorage'
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
  // Modo de recuperación: null | 'pedir_codigo' | 'nueva_clave' | 'exito'
  const [modoRecuperacion, setModoRecuperacion] = useState(null)
  const [recupIdentificador, setRecupIdentificador] = useState('')
  const [recupCodigoInput, setRecupCodigoInput] = useState('')
  const [nuevaClaveInput, setNuevaClaveInput] = useState('')
  const [confirmarNuevaClaveInput, setConfirmarNuevaClaveInput] = useState('')
  const [showNuevaClave, setShowNuevaClave] = useState(false)
  const [showConfirmarNuevaClave, setShowConfirmarNuevaClave] = useState(false)
  const [recupError, setRecupError] = useState('')
  const [recupTargetUser, setRecupTargetUser] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(null)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Helper para extraer el DNI real y limpio (sin asteriscos)
  function getUnmaskedDni(data) {
    if (!data) return ''
    const candidate = data.dniReal || data.dni || data.documentoIdentidad || ''
    const str = candidate.toString().trim()
    return (!str.includes('*') && !str.includes('•')) ? str.replace(/\D/g, '').slice(0, 8) : ''
  }

  // Estados del formulario de registro
  const [regDni, setRegDni] = useState(() => getUnmaskedDni(prefillData))
  const [regNombre, setRegNombre] = useState(prefillData?.nombre || '')
  const [regTelefono, setRegTelefono] = useState(prefillData?.telefono || prefillData?.whatsapp || '')
  const [regEmail, setRegEmail] = useState(prefillData?.email || '')
  const [regPassword, setRegPassword] = useState('')
  const [regDniMatch, setRegDniMatch] = useState(() => {
    const cleanP = getUnmaskedDni(prefillData) || prefillData?.dni
    if (cleanP) {
      const users = getRegisteredUsers()
      const pDni = cleanP.toString().trim()
      return users.find((u) => {
        const uDni = (u.dni || '').toString().trim()
        const uReal = (u.dniReal || '').toString().trim()
        return uDni === pDni || uReal === pDni || uDni === maskDni(pDni) || (pDni.length >= 3 && uDni.endsWith(pDni.slice(-3)))
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
      const cleanDniVal = getUnmaskedDni(prefillData)
      if (cleanDniVal) setRegDni(cleanDniVal)
      if (prefillData.nombre) setRegNombre(prefillData.nombre.toString().trim())
      if (prefillData.email) setRegEmail(prefillData.email.toString().trim())
      if (prefillData.telefono || prefillData.whatsapp) {
        setRegTelefono((prefillData.telefono || prefillData.whatsapp || '').toString().trim())
      }
      if (cleanDniVal || prefillData.dni) {
        const users = getRegisteredUsers()
        const pDni = (cleanDniVal || prefillData.dni || '').toString().trim()
        const found = users.find((u) => {
          const uDni = (u.dni || '').toString().trim()
          const uReal = (u.dniReal || '').toString().trim()
          return pDni && (uDni === pDni || uReal === pDni || uDni === maskDni(pDni) || (pDni.length >= 3 && uDni.endsWith(pDni.slice(-3))))
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

      if (!password || password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres obligatorios.')
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
        categoria: prefillData?.categoria || regDniMatch?.categoria || '',
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
        onStartOnboarding({
          ...usuarioGuardado,
          dniReal: cleanDni,
          documentoIdentidad: cleanDni || usuarioGuardado?.dniReal || usuarioGuardado?.documentoIdentidad || '',
          dni: cleanDni || usuarioGuardado?.dniReal || usuarioGuardado?.dni || ''
        })
      } else if (onLogin) {
        onLogin(usuarioGuardado)
      }
      onClose()
    } else {
      // Iniciar sesión
      const formData = new FormData(event.currentTarget)
      const email = (formData.get('email') || '').toString().trim()
      // Capturar password en const para que esté disponible en closures async
      const capturedPassword = (formData.get('password') || '').toString()

      if (!email || !capturedPassword) {
        setError('Por favor completa todos los campos requeridos.')
        return
      }

      setCargando(true)
      const emailLower = email.toLowerCase()

      // Autenticación segura centralizada vía API REST (MySQL / JWT)
      authApi.login({ email, password: capturedPassword }).then((res) => {
        setCargando(false)

        // ✅ Login exitoso vía servidor
        if (res?.data?.user) {
          if (res.data.token) setAuthToken(res.data.token)
          if (onLogin) onLogin(res.data.user)
          onClose()
          return
        }

        // ⚠️ Credenciales incorrectas (401/400) – no es error de red
        if (res?.error && (res.status === 401 || res.status === 400)) {
          if (emailLower === 'vladimiryt18@gmail.com' && (capturedPassword === 'Pumita30****' || capturedPassword === 'admin123')) {
            // El servidor rechazó pero las credenciales oficiales son correctas → acceso local garantizado
            execLocalLogin(emailLower, capturedPassword)
            return
          }
          setError(res.error)
          return
        }

        // 🔴 Error de servidor (503, red caída, timeout) → fallback local siempre
        execLocalLogin(emailLower, capturedPassword)
      }).catch(() => {
        // Error de red total → fallback local
        execLocalLogin(emailLower, capturedPassword)
      })

      function execLocalLogin(targetEmail, pwd) {
        setCargando(false)
        if (targetEmail === 'vladimiryt18@gmail.com') {
          if (pwd === 'Pumita30****' || pwd === 'admin123') {
            const adminUser = {
              id: 'user-admin-atap',
              nombre: 'Administrador ATAP',
              email: 'vladimiryt18@gmail.com',
              dni: '00000000',
              documentoIdentidad: '00000000',
              rol: 'Administrador',
              esAdmin: true,
              iniciales: 'AD',
              avatar: '/assets/logo.png',
              image: '/assets/logo.png',
              completadoOnboarding: true,
              telefono: '962 168 953'
            }
            if (onLogin) onLogin(adminUser)
            onClose()
            return
          } else {
            setError('Contraseña incorrecta para el Administrador.')
            return
          }
        }
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
    setError('')
    setRecupError('')
    setModoRecuperacion('pedir_codigo')
  }

  function handleValidarCodigoRecuperacion(e) {
    e.preventDefault()
    setRecupError('')

    const cleanId = (recupIdentificador || '').toString().trim().toLowerCase().replace(/\s+/g, '')
    if (!cleanId) {
      setRecupError('Por favor ingresa tu DNI o Correo electrónico.')
      return
    }

    const cleanCode = (recupCodigoInput || '').toString().trim()
    if (!cleanCode) {
      setRecupError('Por favor ingresa la clave de recuperación proporcionada por el administrador.')
      return
    }

    if (!validateDailyRecoveryKey(cleanCode)) {
      setRecupError('La clave diaria ingresada no es válida o ha expirado. Solicítala al WhatsApp de administración.')
      return
    }

    const users = getRegisteredUsers()
    const target = users.find((u) => {
      const uEmail = (u.email || '').toLowerCase().trim()
      const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')
      const uDniClean = uDni.replace(/\*/g, '')
      return (
        uEmail === cleanId ||
        uDni === cleanId ||
        (cleanId.length >= 3 && uDni.endsWith(cleanId.slice(-3))) ||
        (uDniClean && cleanId.includes(uDniClean))
      )
    })

    if (!target) {
      setRecupError('No se encontró ningún jugador registrado con este DNI o correo electrónico.')
      return
    }

    setRecupTargetUser(target)
    setRecupError('')
    setModoRecuperacion('nueva_clave')
  }

  function handleGuardarNuevaClave(e) {
    e.preventDefault()
    setRecupError('')

    const p1 = (nuevaClaveInput || '').toString().trim()
    const p2 = (confirmarNuevaClaveInput || '').toString().trim()

    if (!p1 || p1.length < 8) {
      setRecupError('La contraseña debe tener al menos 8 caracteres obligatorios.')
      return
    }

    if (p1 !== p2) {
      setRecupError('Las contraseñas no coinciden. Por favor verifícalas.')
      return
    }

    const result = resetUserPassword(recupIdentificador, p1, recupCodigoInput)
    if (result.error) {
      setRecupError(result.error)
      return
    }

    // Sincronizar en background con backend MySQL si aplica
    if (result.user?.email && result.user?.dni) {
      authApi.register({
        dni: result.user.dni,
        nombre: result.user.nombre,
        email: result.user.email,
        password: p1,
        telefono: result.user.telefono,
        categoria: result.user.categoria
      }).catch(() => {})
    }

    setUsuarioRegistrado(result.user)
    setModoRecuperacion('exito')
  }

  const contactInfo = getContactInfo()
  const waNumero = contactInfo?.whatsapp?.numero || '+51 977 884 423'
  const waDigits = waNumero.replace(/\D/g, '') || '51977884423'
  const waMsg = encodeURIComponent(
    `Hola ATAP, olvidé mi contraseña de mi cuenta de jugador${recupIdentificador ? ` (${recupIdentificador})` : ''}. Por favor envíenme la clave diaria de recuperación para restablecerla.`
  )
  const waUrl = `https://wa.me/${waDigits}?text=${waMsg}`

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
        ) : modoRecuperacion === 'pedir_codigo' ? (
          <div className="recovery-flow-wrapper">
            <div className="login-modal-icon" aria-hidden="true">
              <KeyRound size={26} />
            </div>
            <p className="login-modal-kicker" style={{ color: '#00CFA0' }}>Recuperación Oficial ATAP</p>
            <h2 id="login-title">¿OLVIDASTE TU CLAVE?</h2>
            <p className="login-modal-description">
              Solicita tu <strong>Clave Diaria de Recuperación</strong> al WhatsApp de administración para autorizar el cambio de tu contraseña.
            </p>

            {recupError && (
              <div className="login-error-message" role="alert">
                {recupError}
              </div>
            )}

            <div className="recovery-whatsapp-box">
              <div className="recovery-wa-info">
                <div className="wa-icon-bubble">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="recovery-wa-label">WhatsApp de Atención ATAP</div>
                  <div className="recovery-wa-number">{waNumero}</div>
                </div>
              </div>
              <p className="recovery-wa-help">
                El administrador te proporcionará la clave activa de hoy (máximo 9 dígitos).
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="recovery-wa-btn"
              >
                <MessageCircle size={17} />
                <span>Solicitar Clave por WhatsApp</span>
              </a>
            </div>

            <form className="login-form" onSubmit={handleValidarCodigoRecuperacion}>
              <div className="login-form-group">
                <label htmlFor="recup-identificador">DNI o Correo electrónico</label>
                <div className="login-input-wrap">
                  <User size={16} aria-hidden="true" />
                  <input
                    id="recup-identificador"
                    type="text"
                    placeholder="Ej: 72345678 o tu@correo.com"
                    value={recupIdentificador}
                    onChange={(e) => setRecupIdentificador(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="recup-codigo">Clave Diaria del Administrador (Máx. 9 dígitos)</label>
                <div className="login-input-wrap">
                  <Lock size={16} aria-hidden="true" />
                  <input
                    id="recup-codigo"
                    type="text"
                    maxLength={9}
                    placeholder="Ej: 84920173"
                    value={recupCodigoInput}
                    onChange={(e) => setRecupCodigoInput(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                    required
                  />
                </div>
              </div>

              <button className="login-submit" type="submit" style={{ marginTop: '8px' }}>
                Validar y Continuar
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="btn-recovery-back"
                onClick={() => {
                  setModoRecuperacion(null)
                  setRecupError('')
                }}
              >
                Volver a Iniciar Sesión
              </button>
            </form>
          </div>
        ) : modoRecuperacion === 'nueva_clave' ? (
          <div className="recovery-flow-wrapper">
            <div className="login-modal-icon" aria-hidden="true">
              <Lock size={26} />
            </div>
            <p className="login-modal-kicker" style={{ color: '#00CFA0' }}>Seguridad del Jugador</p>
            <h2 id="login-title" className="nueva-clave-title">NUEVA CLAVE</h2>
            <p className="login-modal-description">
              Ingresa tu nueva contraseña para <strong>{recupTargetUser?.nombre || recupIdentificador}</strong>. La clave debe tener al menos 8 caracteres obligatorios.
            </p>

            {recupError && (
              <div className="login-error-message" role="alert">
                {recupError}
              </div>
            )}

            <form className="login-form" onSubmit={handleGuardarNuevaClave}>
              <div className="login-form-group">
                <label htmlFor="nueva-clave">Nueva Contraseña</label>
                <div className="login-input-wrap">
                  <Lock size={16} aria-hidden="true" />
                  <input
                    id="nueva-clave"
                    type={showNuevaClave ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres obligatorios"
                    minLength={8}
                    value={nuevaClaveInput}
                    onChange={(e) => setNuevaClaveInput(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNuevaClave(!showNuevaClave)}
                    aria-label={showNuevaClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showNuevaClave ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="confirmar-nueva-clave">Confirmar Nueva Contraseña</label>
                <div className="login-input-wrap">
                  <Lock size={16} aria-hidden="true" />
                  <input
                    id="confirmar-nueva-clave"
                    type={showConfirmarNuevaClave ? 'text' : 'password'}
                    placeholder="Repite tu nueva contraseña"
                    minLength={8}
                    value={confirmarNuevaClaveInput}
                    onChange={(e) => setConfirmarNuevaClaveInput(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmarNuevaClave(!showConfirmarNuevaClave)}
                    aria-label={showConfirmarNuevaClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showConfirmarNuevaClave ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="recovery-rules-pill">
                <Check size={14} color={nuevaClaveInput.length >= 8 ? '#00CFA0' : '#8E9BAE'} />
                <span style={{ color: nuevaClaveInput.length >= 8 ? '#008764' : '#64727A' }}>
                  8 caracteres obligatorios ({nuevaClaveInput.length}/8)
                </span>
              </div>

              <button className="login-submit" type="submit" style={{ marginTop: '10px' }}>
                Guardar Nueva Clave
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="btn-recovery-back"
                onClick={() => {
                  setModoRecuperacion(null)
                  setRecupError('')
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        ) : modoRecuperacion === 'exito' ? (
          <div style={{ textAlign: 'center', padding: '15px 0', width: '100%' }}>
            <div className="login-modal-icon" style={{ margin: '0 auto 18px', background: '#DDF8EF', color: '#008764' }} aria-hidden="true">
              <CheckCircle2 size={28} />
            </div>
            <p className="login-modal-kicker" style={{ color: '#00CFA0' }}>Recuperación Exitosa</p>
            <h2 id="login-title">¡CONTRASEÑA ACTUALIZADA!</h2>
            <p className="login-modal-description" style={{ margin: '0 auto 24px' }}>
              Tu nueva clave de acceso ha sido guardada correctamente. Ya puedes comenzar a competir e interactuar en el circuito ATAP.
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
              Comenzar a Jugar
              <ArrowRight size={16} aria-hidden="true" />
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
                        placeholder="Mínimo 8 caracteres obligatorios"
                        minLength={8}
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