import { useEffect } from 'react'
import './RegistroModal.css'

export default function RegistroModal({ onClose }) {
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
  }

  return (
    <div className="login-modal-backdrop" onMouseDown={onClose}>
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="login-modal-close"
          type="button"
          aria-label="Cerrar registro"
          onClick={onClose}
        >
          <i className="fi fi-rr-cross-small" aria-hidden="true" />
        </button>

        <div className="login-modal-icon" aria-hidden="true">
          <i className="fi fi-rr-user-add" />
        </div>
        <p className="login-modal-kicker"></p>
        <h2 id="register-title" style={{ color: '#00E599', textAlign: 'center' }}>DATOS DEL JUGADOR</h2>
        <p className="login-modal-description" style={{ textAlign: 'center' }}>
          Completa tu perfil de jugador
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
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

          <label htmlFor="register-email">Correo electrónico</label>
          <div className="login-input-wrap">
            <i className="fi fi-rr-envelope" aria-hidden="true" />
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Atap@correo.com"
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="register-password">Contraseña</label>
          <div className="login-input-wrap">
            <i className="fi fi-rr-lock" aria-hidden="true" />
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Crea una contraseña"
              autoComplete="new-password"
              required
            />
          </div>

          <button className="login-submit" type="submit">
            Continuar
            <i className="fi fi-rr-arrow-small-right" aria-hidden="true" />
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
      </section>
    </div>
  )
}