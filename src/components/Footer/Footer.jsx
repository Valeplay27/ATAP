import { NavLink } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-wrap">
          <NavLink className="brand" to="/">
            <img
              className="footer-platino-logo"
              src="/assets/Logo Platino.png"
              alt="Platino Perú"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="footer-atap-tag">ATAP PERÚ</span>
          </NavLink>
        </div>

        <nav className="footer-nav" aria-label="Enlaces del pie de página">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/torneos">Torneos</NavLink>
          <NavLink to="/jugadores">Jugadores</NavLink>
          <NavLink to="/comunidad">Noticias</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
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
        © 2026 Asociación de Tenistas Amateur del Perú (ATAP). Todos los derechos reservados.
      </div>
    </footer>
  )
}