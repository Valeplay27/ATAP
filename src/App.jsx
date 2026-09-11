import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import Community from './pages/Community/Community'
import Contact from './pages/Contact/Contact'
import Home from './pages/Home/Home'
import Players from './pages/Players/Players'
import Ranking from './pages/Ranking/Ranking'
import Tournaments from './pages/Tournaments/Tournaments'

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/torneos" element={<Tournaments />} />
        <Route path="/jugadores" element={<Players />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/comunidad" element={<Community />} />
        <Route path="/contacto" element={<Contact />} />
      </Routes>
      <Footer />
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