import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalAuth, setModalAuth] = useState({ open: false, isRegister: false })
  const [onboardingUser, setOnboardingUser] = useState(null)
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(() => {
    try {
      const guardado = localStorage.getItem('atap_usuario')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    function handleStorageSync() {
      try {
        const guardado = localStorage.getItem('atap_usuario')
        if (guardado) {
          setUsuarioAutenticado(JSON.parse(guardado))
        }
      } catch {}
    }
    window.addEventListener('atap_data_updated', handleStorageSync)
    return () => window.removeEventListener('atap_data_updated', handleStorageSync)
  }, [])

  function handleLogin(datosUsuario) {
    setUsuarioAutenticado(datosUsuario)
    try {
      localStorage.setItem('atap_usuario', JSON.stringify(datosUsuario))
    } catch (e) {
      console.error('Error al guardar la sesión:', e)
    }
  }

  function handleLogout() {
    setUsuarioAutenticado(null)
    try {
      localStorage.removeItem('atap_usuario')
    } catch (e) {
      console.error('Error al cerrar la sesión:', e)
    }
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
        <Route path="/jugadores" element={<Players usuario={usuarioAutenticado} />} />
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
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/comunidad" element={<Community />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/admin" element={<Admin usuario={usuarioAutenticado} onLoginSuccess={handleLogin} />} />
        <Route path="/dashboard" element={<Admin usuario={usuarioAutenticado} onLoginSuccess={handleLogin} />} />
      </Routes>
      <Footer />

      {modalAuth.open && (
        <LoginModal
          initialRegister={modalAuth.isRegister}
          onClose={() => setModalAuth({ open: false, isRegister: false })}
          onLogin={(user) => {
            handleLogin(user)
            setModalAuth({ open: false, isRegister: false })
          }}
          onStartOnboarding={(newUser) => {
            setModalAuth({ open: false, isRegister: false })
            setOnboardingUser(newUser)
          }}
        />
      )}

      {onboardingUser && (
        <PlayerOnboardingModal
          initialUserData={onboardingUser}
          onClose={() => setOnboardingUser(null)}
          onComplete={(fullProfile) => {
            handleLogin(fullProfile)
            setOnboardingUser(null)
          }}
        />
      )}
    </>
  )
}



export default function App() {
  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  )
}