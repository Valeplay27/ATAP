import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getSiteImages } from '../../services/atapStorage'
import './Footer.css'

export default function Footer() {
  const [siteImages, setSiteImages] = useState(() => getSiteImages())

  useEffect(() => {
    function handleUpdate() {
      setSiteImages(getSiteImages())
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-wrap">
          <NavLink className="brand footer-brand" to="/" aria-label="ATAP - Asociación de Tenistas Amateur del Perú">
            <img
              className="footer-logo"
              src={siteImages.logoAtap || '/assets/logo.png'}
              alt="Asociación de Tenistas Amateur del Perú"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/assets/logo.png'
              }}
            />
            <span className="footer-brand-text">
              <strong>ASOCIACIÓN DE</strong>
              <strong>TENISTAS AMATEUR</strong>
              <strong>DEL PERÚ</strong>
            </span>
          </NavLink>
        </div>

        <nav className="footer-nav" aria-label="Enlaces del pie de página">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/torneos">Torneos</NavLink>
          <NavLink to="/jugadores">Jugadores</NavLink>
          <NavLink to="/ranking">Ranking</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          <NavLink to="/reglas">Políticas & Reglas</NavLink>
        </nav>

        <div className="footer-social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="footer-social-circle"
          >
            <i className="fi fi-brands-facebook" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter / X"
            className="footer-social-circle"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="footer-social-circle"
          >
            <i className="fi fi-brands-instagram" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="footer-social-circle"
          >
            <i className="fi fi-brands-youtube" />
          </a>
        </div>
      </div>
      <div className="footer-copyright">
        <span>© 2026 Asociación de Tenistas Amateur del Perú (ATAP). Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}