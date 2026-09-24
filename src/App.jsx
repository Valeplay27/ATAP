import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import LoginModal from './components/LoginModal/LoginModal'
import PlayerOnboardingModal from './components/PlayerOnboardingModal/PlayerOnboardingModal'
import Community from './pages/Community/Community'
import Contact from './pages/Contact/Contact'
import Home from './pages/Home/Home'
import Players from './pages/Players/Players'
import Ranking from './pages/Ranking/Ranking'
import Tournaments from './pages/Tournaments/Tournaments'
import Profile from './pages/Profile/Profile'
import Admin from './pages/Admin/Admin'
import Rules from './pages/Rules/Rules'
import ScrollToTopButton from './components/ScrollToTopButton/ScrollToTopButton'
import { saveRegisteredUser, maskDni } from './services/atapStorage'

function SiteLayout() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalAuth, setModalAuth] = useState({ open: false, isRegister: false })
  const [onboardingUser, setOnboardingUser] = useState(null)
  const [logoutNotification, setLogoutNotification] = useState(null)
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(() => {
    try {
      const guardado = localStorage.getItem('atap_usuario')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!logoutNotification) return
    const timer = setTimeout(() => {
      setLogoutNotification(null)
    }, 4500)
    return () => clearTimeout(timer)
  }, [logoutNotification])

  useEffect(() => {
    function handleStorageSync() {
      try {
        const guardado = localStorage.getItem('atap_usuario')
        if (guardado) {
          setUsuarioAutenticado(JSON.parse(guardado))
        }
      } catch {}
    }

    function handleOpenLoginModal() {
      setModalAuth({ open: true, isRegister: false, prefill: null })
    }

    function handleOpenRegisterModal(event) {
      setModalAuth({ open: true, isRegister: true, prefill: event?.detail || null })
    }

    window.addEventListener('atap_data_updated', handleStorageSync)
    window.addEventListener('atap_open_login', handleOpenLoginModal)
    window.addEventListener('atap_open_register', handleOpenRegisterModal)
    return () => {
      window.removeEventListener('atap_data_updated', handleStorageSync)
      window.removeEventListener('atap_open_login', handleOpenLoginModal)
      window.removeEventListener('atap_open_register', handleOpenRegisterModal)
    }
  }, [])

  function handleLogin(datosUsuario) {
    let cleanUserData = datosUsuario
    if (datosUsuario && (datosUsuario.dni || datosUsuario.documentoIdentidad || datosUsuario.dniReal)) {
      const rawDni = (datosUsuario.dniReal || datosUsuario.dni || datosUsuario.documentoIdentidad || '').toString().trim()
      const cleanReal = (!rawDni.includes('*') && !rawDni.includes('•')) ? rawDni.replace(/\D/g, '').slice(0, 8) : (datosUsuario.dniReal || '')
      const masked = maskDni(datosUsuario.dni || datosUsuario.documentoIdentidad || cleanReal)
      cleanUserData = {
        ...datosUsuario,
        dni: masked,
        documentoIdentidad: masked,
        dniReal: cleanReal || datosUsuario.dniReal || ''
      }
    }
    setUsuarioAutenticado(cleanUserData)
    try {
      localStorage.setItem('atap_usuario', JSON.stringify(cleanUserData))
      if (cleanUserData && (cleanUserData.dni || cleanUserData.documentoIdentidad)) {
        saveRegisteredUser(cleanUserData)
      }
    } catch (e) {
      console.error('Error al guardar la sesión:', e)
    }
  }

  function handleLogout(nombreOEmail) {
    const nombre =
      nombreOEmail ||
      usuarioAutenticado?.nombre ||
      usuarioAutenticado?.email ||
      'tu cuenta'

    setUsuarioAutenticado(null)
    try {
      localStorage.removeItem('atap_usuario')
      window.dispatchEvent(new Event('atap_data_updated'))
    } catch (e) {
      console.error('Error al cerrar la sesión:', e)
    }

    setLogoutNotification({
      nombre,
      timestamp: Date.now()
    })

    // Redirigir siempre a la página de inicio ('/') al cerrar sesión de cualquier perfil
    navigate('/')
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  return (
    <>
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        usuarioAutenticado={usuarioAutenticado}
        setUsuarioAutenticado={setUsuarioAutenticado}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenLogin={() => setModalAuth({ open: true, isRegister: false })}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              onOpenRegister={() => setModalAuth({ open: true, isRegister: true })}
            />
          }
        />
        <Route path="/torneos" element={<Tournaments usuario={usuarioAutenticado} />} />
        <Route
          path="/jugadores"
          element={
            <Players
              usuario={usuarioAutenticado}
              onOpenLogin={() => setModalAuth({ open: true, isRegister: false })}
            />
          }
        />
        <Route
          path="/perfil"
          element={
            <Profile
              usuario={usuarioAutenticado}
              onUpdateUser={handleLogin}
              onOpenLogin={() => setModalAuth({ open: true, isRegister: false })}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/ranking"
          element={
            <Ranking
              usuario={usuarioAutenticado}
              onOpenLogin={() => setModalAuth({ open: true, isRegister: false })}
            />
          }
        />
        <Route path="/comunidad" element={<Community />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/reglas" element={<Rules />} />
        <Route path="/politicas" element={<Rules />} />
        <Route path="/politicas-y-reglas" element={<Rules />} />
        <Route
          path="/admin"
          element={
            <Admin
              usuario={usuarioAutenticado}
              onLoginSuccess={handleLogin}
              onOpenLogin={() => setModalAuth({ open: true, isRegister: false, prefill: null })}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <Admin
              usuario={usuarioAutenticado}
              onLoginSuccess={handleLogin}
              onOpenLogin={() => setModalAuth({ open: true, isRegister: false, prefill: null })}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
      <Footer />
      <ScrollToTopButton />

      {/* NOTIFICACIÓN GLOBAL VISIBLE DE CIERRE DE SESIÓN */}
      {logoutNotification && (
        <aside
          className="global-logout-toast"
          role="status"
          aria-live="polite"
        >
          <div className="logout-toast-icon-wrap">
            <CheckCircle2 size={22} />
          </div>
          <div className="logout-toast-body">
            <strong className="logout-toast-title">Sesión cerrada con éxito</strong>
            <p className="logout-toast-desc">
              Has salido de <strong>{logoutNotification.nombre}</strong> correctamente.
            </p>
          </div>
          <button
            type="button"
            className="logout-toast-close-btn"
            onClick={() => setLogoutNotification(null)}
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {modalAuth.open && (
        <LoginModal
          initialRegister={modalAuth.isRegister}
          prefillData={modalAuth.prefill}
          onClose={() => {
            setModalAuth({ open: false, isRegister: false, prefill: null })
            try {
              if (typeof sessionStorage !== 'undefined') {
                const rawDraft = sessionStorage.getItem('atap_tournament_register_draft')
                if (rawDraft) {
                  const draft = JSON.parse(rawDraft)
                  if (draft?.tournamentId) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('atap_open_tournament_register', { detail: { tournamentId: draft.tournamentId, tournament: draft.tournament } }))
                    }, 120)
                  }
                }
              }
            } catch {}
          }}
          onLogin={(user) => {
            handleLogin(user)
            setModalAuth({ open: false, isRegister: false, prefill: null })
            try {
              if (typeof sessionStorage !== 'undefined') {
                const rawDraft = sessionStorage.getItem('atap_tournament_register_draft')
                if (rawDraft) {
                  const draft = JSON.parse(rawDraft)
                  if (draft?.tournamentId) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('atap_open_tournament_register', { detail: { tournamentId: draft.tournamentId, tournament: draft.tournament } }))
                    }, 120)
                  }
                }
              }
            } catch {}
          }}
          onStartOnboarding={(newUser) => {
            setModalAuth({ open: false, isRegister: false, prefill: null })
            setOnboardingUser(newUser)
          }}
        />
      )}

      {onboardingUser && (
        <PlayerOnboardingModal
          initialUserData={onboardingUser}
          onClose={() => {
            setOnboardingUser(null)
            try {
              if (typeof sessionStorage !== 'undefined') {
                const rawDraft = sessionStorage.getItem('atap_tournament_register_draft')
                if (rawDraft) {
                  const draft = JSON.parse(rawDraft)
                  if (draft?.tournamentId) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('atap_open_tournament_register', { detail: { tournamentId: draft.tournamentId, tournament: draft.tournament } }))
                    }, 120)
                  }
                }
              }
            } catch {}
          }}
          onComplete={(fullProfile) => {
            handleLogin(fullProfile)
            setOnboardingUser(null)
            try {
              if (typeof sessionStorage !== 'undefined') {
                const rawDraft = sessionStorage.getItem('atap_tournament_register_draft')
                if (rawDraft) {
                  const draft = JSON.parse(rawDraft)
                  if (draft?.tournamentId) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('atap_open_tournament_register', { detail: { tournamentId: draft.tournamentId, tournament: draft.tournament } }))
                    }, 120)
                  }
                }
              }
            } catch {}
          }}
        />
      )}
    </>
  )
}



export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SiteLayout />
    </BrowserRouter>
  )
}