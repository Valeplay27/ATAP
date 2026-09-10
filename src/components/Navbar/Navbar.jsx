import { CircleUserRound, Menu, Search, X } from 'lucide-react'
import './Navbar.css'

const links = ['Inicio', 'Torneos', 'Jugadores', 'Ranking', 'Comunidad', 'Contacto']

export default function Navbar({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="ATAP inicio">
        <img className="brand-logo" src="/assets/logo.png" alt="" />
        <span>
          <strong>ASOCIACIÓN DE</strong>
          <strong>TENIS DEL PERÚ</strong>
        </span>
      </a>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
        {links.map((item, index) => (
          <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase()}`} key={item}>
            {item}
          </a>
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
    </header>
  );
}