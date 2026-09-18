import { CircleUserRound, LogOut, Menu, ShieldCheck, Trophy, User, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import LoginModal from '../LoginModal/LoginModal'
import { getAssetUrl } from '../../utils/assetHelper'
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
  const headerRef = useRef(null)

  // Acceso exclusivo al Dashboard únicamente para el administrador oficial (vladimiryt18@gmail.com)
  const isAdmin = Boolean(
    usuarioAutenticado &&
      usuarioAutenticado.email?.toLowerCase() === 'vladimiryt18@gmail.com'
  )

  const links = BASE_LINKS

  function handleOpenLogin() {
    setMenuOpen(false)
    setUserMenuOpen(false)
    if (onOpenLogin) {
      onOpenLogin()
    } else {
      setLoginOpen(true)
    }
  }

  // Mutua exclusión: al abrir el menú de usuario, cerramos la hamburguesa
  function handleToggleUserMenu() {
    setUserMenuOpen((prev) => {
      const next = !prev
      if (next) {
        setMenuOpen(false)
      }
      return next
    })
  }

  // Mutua exclusión: al abrir la hamburguesa, cerramos el menú de usuario
  function handleToggleMobileMenu() {
    setMenuOpen((prev) => {
      const next = !prev
      if (next) {
        setUserMenuOpen(false)
      }
      return next
    })
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (userMenuOpen || menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [userMenuOpen, menuOpen, setMenuOpen])

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
    const nombre = usuarioAutenticado?.nombre || usuarioAutenticado?.email
    if (onLogout) {
      onLogout(nombre)
    } else if (setUsuarioAutenticado) {
      setUsuarioAutenticado(null)
    }
  }

  return (
    <>
      <header className="site-header navbar-pill" ref={headerRef}>
        <NavLink className="brand" to="/" aria-label="ATAP inicio">
          <img className="brand-logo" src={getAssetUrl('/assets/logo.png')} alt="" />
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
            {usuarioAutenticado ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  className={`user-profile-button${isAdmin ? ' is-admin' : ''}`}
                  aria-label="Menú de usuario"
                  aria-expanded={userMenuOpen}
                  onClick={handleToggleUserMenu}
                  title={usuarioAutenticado.nombre || 'Perfil de usuario'}
                >
                  <span className="user-avatar">
                    {usuarioAutenticado.avatar &&
                    usuarioAutenticado.avatar !== '/assets/logo.png' &&
                    !usuarioAutenticado.avatar.includes('logo.png') ? (
                      <img
                        src={getAssetUrl(usuarioAutenticado.avatar)}
                        alt={usuarioAutenticado.nombre || 'Avatar'}
                        className="user-avatar-img"
                      />
                    ) : (
                      <div className="default-avatar-badge is-atap-logo">
                        <img src={getAssetUrl('/assets/logo.png')} alt="ATAP" className="default-avatar-logo" />
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
              onClick={handleToggleMobileMenu}
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