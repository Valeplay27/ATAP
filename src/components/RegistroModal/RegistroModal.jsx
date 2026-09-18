import { useEffect, useState } from 'react'
import { X, User, UserPlus, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import './RegistroModal.css'



export default function RegistroModal({ onClose }) {
  const [showPassword, setShowPassword] = useState(false)
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
          <X size={18} aria-hidden="true" />
        </button>

        <div className="login-modal-icon" aria-hidden="true">
          <UserPlus size={24} />
        </div>
        <p className="login-modal-kicker"></p>
        <h2 id="register-title" style={{ color: '#25005C', textAlign: 'center' }}>DATOS DEL JUGADOR</h2>
        <p className="login-modal-description" style={{ textAlign: 'center' }}>
          Completa tu perfil de jugador
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">Nombre completo</label>
          <div className="login-input-wrap">
            <User size={16} aria-hidden="true" />
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
            <Mail size={16} aria-hidden="true" />
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
            <Lock size={16} aria-hidden="true" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Crea una contraseña"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button className="login-submit" type="submit">
            Continuar
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  )
}