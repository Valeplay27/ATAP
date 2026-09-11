import { CircleUserRound, Menu, Search, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { label: 'Inicio', path: '/', className: 'nav-link' },
  { label: 'Torneos', path: '/torneos', className: 'nav-link' },
  { label: 'Jugadores', path: '/jugadores', className: 'nav-link' },
  { label: 'Ranking', path: '/ranking', className: 'nav-link' },
  { label: 'Comunidad', path: '/comunidad', className: 'nav-link' },
  { label: 'Contacto', path: '/contacto', className: 'nav-link' },
]

export default function Navbar({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header navbar-pill">
      <NavLink className="brand" to="/" aria-label="ATAP inicio">
        <img className="brand-logo" src="/assets/logo.png" alt="" />
        <span>
          <strong>ASOCIACIÓN DE</strong>
          <strong>TENISTAS AMATEUR</strong>
          <strong>DEL PERÚ</strong>
        </span>
      </NavLink>
      <div className="navbar-surface">
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
          {links.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `${item.className}${isActive ? ' active' : ''}`
              }
              to={item.path}
              key={item.path}
              end={item.path === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Buscar">
            <Search size={17} />
          </button>
          <button className="icon-button" aria-label="Mi cuenta">
            <CircleUserRound size={17} />
          </button>
          <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}