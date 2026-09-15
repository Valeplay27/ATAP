import { useEffect, useState } from 'react'
import './LoginModal.css'

export default function LoginModal({
  onClose,
  onLogin,
  onStartOnboarding,
  initialRegister = false
}) {
  const [mostrarRegistro, setMostrarRegistro] = useState(initialRegister)
  const [correoEnviado, setCorreoEnviado] = useState(false)
  const [olvidoEnviado, setOlvidoEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(null)

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

    const formData = new FormData(event.currentTarget)
    const email = (formData.get('email') || '').toString().trim()
    const password = (formData.get('password') || '').toString()
    const name = (formData.get('name') || '').toString().trim()

    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    if (mostrarRegistro) {
      if (!name) {
        setError('Por favor ingresa tu nombre completo.')
        return
      }

      setCargando(true)
      setTimeout(() => {
        setCargando(false)
        const iniciales = name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'J'

        const nuevoUsuario = {
          nombre: name,
          email: email,
          rol: 'Jugador ATAP',
          iniciales: iniciales
        }

        if (onStartOnboarding) {
          onStartOnboarding(nuevoUsuario)
        } else {
          setUsuarioRegistrado(nuevoUsuario)
          setCorreoEnviado(true)
        }
      }, 500)
    } else {
      setCargando(true)
      setTimeout(() => {
        setCargando(false)
        const emailLower = email.toLowerCase()

        let usuario = null

        // Acceso exclusivo de administrador
        if (emailLower === 'vladimiryt18@gmail.com') {
          if (password !== 'Pumita30****') {
            setError('Contraseña incorrecta para la cuenta de Administrador.')
            return
          }
          usuario = {
            nombre: 'Administrador ATAP',
            email: 'vladimiryt18@gmail.com',
            rol: 'Administrador',
            esAdmin: true,
            iniciales: 'AD',
            categoria: 'Comité ATAP'
          }
        } else {
          // Cualquier otro usuario ingresa exclusivamente con rol de usuario normal
          const partesEmail = email.split('@')[0].replace(/[._-]/g, ' ')
          const nombreDisplay = partesEmail.charAt(0).toUpperCase() + partesEmail.slice(1)
          const iniciales = email.substring(0, 2).toUpperCase()

          usuario = {
            nombre: nombreDisplay || 'Jugador ATAP',
            email: email,
            rol: 'Jugador ATAP',
            esAdmin: false,
            iniciales: iniciales
          }
        }

        if (onLogin) {
          onLogin(usuario)
        }
        onClose()
      }, 500)
    }
  }

  function handleSocialLogin(proveedor) {
    setError('')
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      const mockSocial = {
        nombre: `Jugador ${proveedor}`,
        email: `jugador.${proveedor.toLowerCase()}@atap.pe`,
        rol: 'Jugador ATAP',
        esAdmin: false,
        iniciales: proveedor.substring(0, 2).toUpperCase()
      }
      if (onLogin) {
        onLogin(mockSocial)
      }
      onClose()
    }, 400)
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
          <i className="fi fi-rr-cross-small" aria-hidden="true" />
        </button>

        {correoEnviado ? (
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <div className="login-modal-icon" style={{ margin: '0 auto 18px' }} aria-hidden="true">
              <i className="fi fi-rr-envelope-check" />
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
              <i className="fi fi-rr-arrow-small-right" aria-hidden="true" />
            </button>
          </div>
        ) : olvidoEnviado ? (
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <div className="login-modal-icon" style={{ margin: '0 auto 18px' }} aria-hidden="true">
              <i className="fi fi-rr-lock" />
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
              <i className={mostrarRegistro ? "fi fi-rr-user-add" : "fi fi-rr-user"} />
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

            <form className="login-form" onSubmit={handleSubmit}>
              {mostrarRegistro && (
                <>
                  <label htmlFor="register-name">Nombre completo</label>
                  <div className="login-input-wrap">
                    <i className="fi fi-rr-user" aria-hidden="true" />
                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      autoComplete="name"
                      required
                    />
                  </div>
                </>
              )}

              <label htmlFor="login-email">Correo electrónico</label>
              <div className="login-input-wrap">
                <i className="fi fi-rr-envelope" aria-hidden="true" />
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
                <i className="fi fi-rr-lock" aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder={mostrarRegistro ? "Crea una contraseña" : "Ingresa tu contraseña"}
                  autoComplete={mostrarRegistro ? "new-password" : "current-password"}
                  required
                />
              </div>

              {!mostrarRegistro && (
                <button
                  type="button"
                  className="login-forgot-button"
                  onClick={handleOlvidoPassword}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              <button className="login-submit" type="submit" disabled={cargando}>
                {cargando
                  ? 'Procesando...'
                  : (mostrarRegistro ? 'Crear cuenta' : 'Iniciar sesión')}
                {!cargando && <i className="fi fi-rr-arrow-small-right" aria-hidden="true" />}
              </button>
            </form>

            <div className="login-divider">
              <span>o continúa con</span>
            </div>
            <div className="login-socials">
              <button
                type="button"
                disabled={cargando}
                onClick={() => handleSocialLogin('Google')}
              >
                <i className="fi fi-brands-google" aria-hidden="true" />
                Google
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={() => handleSocialLogin('Facebook')}
              >
                <i className="fi fi-brands-facebook" aria-hidden="true" />
                Facebook
              </button>
            </div>

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