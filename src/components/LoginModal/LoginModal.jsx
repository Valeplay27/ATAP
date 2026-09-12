import { useEffect, useState } from 'react'
import './LoginModal.css'

export default function LoginModal({ onClose }) {
  const [mostrarRegistro, setMostrarRegistro] = useState(false)
  const [correoEnviado, setCorreoEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

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
    if (mostrarRegistro) {
      setCargando(true)
      setTimeout(() => {
        setCargando(false)
        setCorreoEnviado(true)
      }, 1500)
    } else {
      onClose()
    }
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
            <p className="login-modal-kicker" style={{ color: '#00E599' }}>Área de jugadores ATAP</p>
            <h2 id="login-title">¡REVISA TU CORREO!</h2>
            <p className="login-modal-description" style={{ margin: '0 auto 24px' }}>
              Hemos enviado un enlace de confirmación a tu bandeja de entrada para verificar tu cuenta.
            </p>
            <button className="login-submit" type="button" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : (
          <>
            <div className="login-modal-icon" aria-hidden="true">
              <i className={mostrarRegistro ? "fi fi-rr-user-add" : "fi fi-rr-user"} />
            </div>
            <p className="login-modal-kicker" style={{ color: '#00E599' }}>Área de jugadores ATAP</p>
            <h2 id="login-title">{mostrarRegistro ? 'UN POCO SOBRE TI' : 'Bienvenido'}</h2>
            <p className="login-modal-description">
              {mostrarRegistro
                ? 'Regístrate para unirte a los torneos y gestionar tu perfil.'
                : 'Ingresa para revisar tus torneos, ranking y perfil de jugador.'}
            </p>

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
                <a className="login-forgot" href="#recuperar">
                  ¿Olvidaste tu contraseña?
                </a>
              )}

              <button className="login-submit" type="submit" disabled={cargando}>
                {cargando ? 'Enviando...' : (mostrarRegistro ? 'Continúa' : 'Iniciar sesión')}
                {!cargando && <i className="fi fi-rr-arrow-small-right" aria-hidden="true" />}
              </button>
            </form>

            <div className="login-divider">
              <span>o continúa con</span>
            </div>
            <div className="login-socials">
              <button type="button">
                <i className="fi fi-brands-google" aria-hidden="true" />
                Google
              </button>
              <button type="button">
                <i className="fi fi-brands-facebook" aria-hidden="true" />
                Facebook
              </button>
            </div>
            
            <p className="login-register">
              {mostrarRegistro ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'}{' '}
              <button
                type="button"
                className="login-register-link"
                onClick={() => setMostrarRegistro(!mostrarRegistro)}
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