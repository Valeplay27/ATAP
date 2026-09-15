import { CircleUserRound, LogOut, Menu, Search, ShieldCheck, Trophy, User, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import LoginModal from '../LoginModal/LoginModal'
import './Navbar.css'

const BASE_LINKS = [
  { label: 'Inicio', path: '/', className: 'nav-link' },
  { label: 'Torneos', path: '/torneos', className: 'nav-link' },
  { label: 'Jugadores', path: '/jugadores', className: 'nav-link' },
  { label: 'Ranking', path: '/ranking', className: 'nav-link' },
  { label: 'Comunidad', path: '/comunidad', className: 'nav-link' },
  { label: 'Contacto', path: '/contacto', className: 'nav-link' },
]

export default function Navbar({
  menuOpen,
  setMenuOpen,
  usuarioAutenticado,
  setUsuarioAutenticado,
  onLogin,
  onLogout,
  onOpenLogin
}) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Acceso exclusivo al Dashboard únicamente para el administrador oficial
  const isAdmin = Boolean(
    usuarioAutenticado &&
      (usuarioAutenticado.esAdmin ||
        usuarioAutenticado.rol === 'admin' ||
        usuarioAutenticado.rol === 'Administrador' ||
        usuarioAutenticado.email?.toLowerCase() === 'vladimiryt18@gmail.com')
  )

  const links = BASE_LINKS

  function handleOpenLogin() {
    if (onOpenLogin) {
      onOpenLogin()
    } else {
      setLoginOpen(true)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  function handleLoginSuccess(userData) {
    if (onLogin) {
      onLogin(userData)
    } else if (setUsuarioAutenticado) {
      setUsuarioAutenticado(userData)
    }
    setLoginOpen(false)
  }

  function handleLogoutClick() {
    setUserMenuOpen(false)
    if (onLogout) {
      onLogout()
    } else if (setUsuarioAutenticado) {
      setUsuarioAutenticado(null)
    }
  }

  return (
    <>
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

            {usuarioAutenticado ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  className={`user-profile-button${isAdmin ? ' is-admin' : ''}`}
                  aria-label="Menú de usuario"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title={usuarioAutenticado.nombre || 'Perfil de usuario'}
                >
                  <span className="user-avatar">
                    {usuarioAutenticado.avatar ? (
                      <img
                        src={usuarioAutenticado.avatar}
                        alt={usuarioAutenticado.nombre || 'Avatar'}
                        className="user-avatar-img"
                      />
                    ) : (
                      <div className="default-avatar-badge">
                        <img src="/assets/logo.png" alt="ATAP" className="default-avatar-logo" />
                      </div>
                    )}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu" role="menu">
                    <div className="user-dropdown-header">
                      <strong className="user-dropdown-name">
                        {usuarioAutenticado.nombre || 'Jugador ATAP'}
                      </strong>
                      <span className="user-dropdown-email">
                        {usuarioAutenticado.email}
                      </span>
                      <span className="user-dropdown-badge">
                        {isAdmin
                          ? 'Administrador Oficial'
                          : (usuarioAutenticado.categoria
                            ? `Categoría ${usuarioAutenticado.categoria}`
                            : (usuarioAutenticado.rol || 'Jugador activo'))}
                      </span>
                    </div>
                    <hr className="user-dropdown-divider" />
                    {isAdmin && (
                      <NavLink
                        to="/dashboard"
                        className="user-dropdown-item admin-item"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ color: '#00CFA0', fontWeight: 'bold' }}
                      >
                        <ShieldCheck size={15} color="#00CFA0" />
                        <span>Panel Dashboard</span>
                      </NavLink>
                    )}
                    <NavLink
                      to="/perfil"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={15} />
                      <span>Mi Perfil</span>
                    </NavLink>
                    <NavLink
                      to="/torneos"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Trophy size={15} />
                      <span>Mis Torneos</span>
                    </NavLink>
                    <hr className="user-dropdown-divider" />
                    <button
                      type="button"
                      className="user-dropdown-item logout"
                      role="menuitem"
                      onClick={handleLogoutClick}
                    >
                      <LogOut size={15} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="icon-button"
                aria-label="Abrir inicio de sesión"
                title="Iniciar sesión"
                onClick={handleOpenLogin}
              >
                <CircleUserRound size={17} />
              </button>
            )}

            <button
              className="icon-button menu-toggle"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>
      {!onOpenLogin && loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLogin={handleLoginSuccess}
        />
      )}
    </>
  )
}