import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Trophy,
  Users,
  CreditCard,
  Shuffle,
  Flame,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Save,
  Camera,
  AlertTriangle,
  Award,
  Calendar,
  DollarSign,
  Search,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  Check,
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react'
import {
  getTournaments,
  updateTournamentPrice,
  updateRegistrationStatus,
  generateTournamentBracket,
  recordMatchResult,
  getRanking,
  updatePlayerAvatar,
  getSiteImages,
  saveSiteImage,
  saveHeroSlides,
  createTournament,
  deleteTournament,
  updateTournament,
  updateTournamentModality
} from '../../services/atapStorage'
import TournamentBracket from '../../components/TournamentBracket/TournamentBracket'
import './Admin.css'

export default function Admin({ usuario, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tournaments, setTournaments] = useState([])
  const [ranking, setRanking] = useState([])
  const [siteImages, setSiteImages] = useState({
    heroBanner: '/assets/hero1.png',
    eventoBanner: '/assets/Evento.png',
    logoPlatino: '/assets/Logo Platino.png',
    logoAtap: '/assets/logo.png'
  })
  const [heroSlides, setHeroSlides] = useState([])

  // Selected tournament for tabs
  const [selectedTourneyId, setSelectedTourneyId] = useState('')

  // Notification toast
  const [toastMessage, setToastMessage] = useState('')

  // Price edits state: { [tournamentId]: priceNumber }
  const [priceInputs, setPriceInputs] = useState({})

  // Score Modal state
  const [scoreModalMatch, setScoreModalMatch] = useState(null)
  const [winnerSlot, setWinnerSlot] = useState(1)
  const [set1Score, setSet1Score] = useState('6-4')
  const [set2Score, setSet2Score] = useState('6-3')
  const [set3Score, setSet3Score] = useState('')
  const [pointsAwardInput, setPointsAwardInput] = useState(100)

  // Player Avatar Modal
  const [avatarModalPlayer, setAvatarModalPlayer] = useState(null)
  const [newAvatarUrl, setNewAvatarUrl] = useState('')

  // Site images edit inputs
  const [siteImageInputs, setSiteImageInputs] = useState({})

  // Create Tournament Modal state
  const [showCreateTourneyModal, setShowCreateTourneyModal] = useState(false)
  const [newTourneyTitle, setNewTourneyTitle] = useState('')
  const [newTourneyStartDate, setNewTourneyStartDate] = useState('')
  const [newTourneyEndDate, setNewTourneyEndDate] = useState('')
  const [newTourneyPlace, setNewTourneyPlace] = useState('')
  const [newTourneyPrice, setNewTourneyPrice] = useState(100)
  const [newTourneyLevel, setNewTourneyLevel] = useState('Nacional')
  const [newTourneyModality, setNewTourneyModality] = useState('singles')
  const [newTourneyImage, setNewTourneyImage] = useState('')

  // Edit Tournament Modal state
  const [editTourney, setEditTourney] = useState(null)
  const [editTourneyTitle, setEditTourneyTitle] = useState('')
  const [editTourneyStartDate, setEditTourneyStartDate] = useState('')
  const [editTourneyEndDate, setEditTourneyEndDate] = useState('')
  const [editTourneyPlace, setEditTourneyPlace] = useState('')
  const [editTourneyPrice, setEditTourneyPrice] = useState(100)
  const [editTourneyLevel, setEditTourneyLevel] = useState('Nacional')
  const [editTourneyModality, setEditTourneyModality] = useState('singles')
  const [editTourneyImage, setEditTourneyImage] = useState('')

  // In-page Admin Login state (if not authenticated)
  const [loginEmail, setLoginEmail] = useState('vladimiryt18@gmail.com')
  const [loginPassword, setLoginPassword] = useState('Pumita30****')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  function loadData() {
    const tourneys = getTournaments()
    setTournaments(tourneys)
    if (tourneys.length > 0 && !selectedTourneyId) {
      setSelectedTourneyId(tourneys[0].id)
    }

    const currentPrices = {}
    tourneys.forEach((t) => {
      currentPrices[t.id] = t.precio || 100
    })
    setPriceInputs(currentPrices)

    setRanking(getRanking())
    const imgs = getSiteImages()
    setSiteImages(imgs)
    setSiteImageInputs(imgs)
    setHeroSlides(imgs.heroSlides || [])
  }

  useEffect(() => {
    loadData()

    function handleDataUpdate() {
      loadData()
    }

    window.addEventListener('atap_data_updated', handleDataUpdate)
    return () => window.removeEventListener('atap_data_updated', handleDataUpdate)
  }, [])

  // Check admin authorization
  const isAdminAuthorized =
    usuario &&
    (usuario.esAdmin ||
      usuario.email?.toLowerCase() === 'vladimiryt18@gmail.com')

  function handleDirectAdminLogin(e) {
    if (e) e.preventDefault()
    setLoginError('')

    const emailClean = (loginEmail || '').trim().toLowerCase()
    if (emailClean !== 'vladimiryt18@gmail.com') {
      setLoginError('Correo no autorizado. Únicamente vladimiryt18@gmail.com tiene acceso de administrador.')
      return
    }

    if (loginPassword !== 'Pumita30****') {
      setLoginError('Contraseña incorrecta para el acceso de Administrador.')
      return
    }

    setLoginLoading(true)
    setTimeout(() => {
      setLoginLoading(false)
      const adminUser = {
        nombre: 'Administrador ATAP',
        email: 'vladimiryt18@gmail.com',
        rol: 'Administrador',
        esAdmin: true,
        iniciales: 'AD',
        categoria: 'Comité ATAP'
      }

      if (onLoginSuccess) {
        onLoginSuccess(adminUser)
      } else {
        localStorage.setItem('atap_usuario', JSON.stringify(adminUser))
        window.dispatchEvent(new Event('atap_data_updated'))
      }
      showToast('¡Bienvenido al Dashboard Administrador ATAP!')
    }, 400)
  }

  // IF NOT LOGGED IN AS ADMIN: RENDER THE DEDICATED DASHBOARD LOGIN PORTAL
  if (!isAdminAuthorized) {
    return (
      <main className="page-content admin-login-portal-page">
        <div className="admin-portal-card panel">
          <div className="portal-header">
            <div className="portal-badge-icon">
              <ShieldCheck size={36} color="#00CFA0" />
            </div>
            <span className="portal-kicker">Panel Administrativo</span>
            <h1>Dashboard de Control ATAP</h1>
            <p className="portal-subtitle">
              Ingresa con las credenciales oficiales de administrador para gestionar torneos, precios, pagos, llaves y ranking.
            </p>
          </div>

          {loginError && (
            <div className="portal-error-alert" role="alert">
              <AlertTriangle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleDirectAdminLogin} className="portal-form">
            <div className="form-group">
              <label htmlFor="portal-email">Correo Electrónico Administrador</label>
              <div className="portal-input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="portal-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="vladimiryt18@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="portal-pass">Contraseña de Administrador</label>
              <div className="portal-input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="portal-pass"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="button button-lime portal-submit-btn" disabled={loginLoading}>
              {loginLoading ? 'Accediendo al Dashboard...' : 'Ingresar al Dashboard'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="portal-quick-access">
            <p className="quick-access-hint">¿Deseas ingresar de inmediato con 1 solo clic?</p>
            <button
              type="button"
              className="quick-admin-btn"
              onClick={() => {
                setLoginEmail('vladimiryt18@gmail.com')
                setLoginPassword('Pumita30****')
                handleDirectAdminLogin()
              }}
            >
              ⚡ Ingresar con Credenciales Oficiales (1 Clic)
            </button>
          </div>

          <div className="portal-footer">
            <a href="/" className="back-home-link">
              ← Volver al sitio público de ATAP
            </a>
          </div>
        </div>
      </main>
    )
  }

  // CALCULATE DASHBOARD METRICS
  const currentTourney = tournaments.find((t) => t.id === selectedTourneyId) || tournaments[0] || {}

  let totalInscripciones = 0
  let totalAprobadas = 0
  let totalPendientes = 0
  let totalRecaudado = 0
  const recentInscriptions = []

  tournaments.forEach((t) => {
    const list = t.inscripciones || []
    totalInscripciones += list.length
    list.forEach((insc) => {
      if (insc.estadoPago === 'aprobado') {
        totalAprobadas++
        totalRecaudado += Number(t.precio || 100)
      } else if (insc.estadoPago === 'pendiente') {
        totalPendientes++
      }
      recentInscriptions.push({
        ...insc,
        tourneyTitle: t.title,
        tourneyPrice: t.precio || 100,
        tourneyId: t.id
      })
    })
  })

  // Sort recent by date
  recentInscriptions.sort((a, b) => (b.id || '').localeCompare(a.id || ''))

  // Handler: Update Tournament Price
  function handleSavePrice(tourneyId) {
    const newPrice = priceInputs[tourneyId]
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      showToast('Por favor ingresa un precio válido en Soles.')
      return
    }
    updateTournamentPrice(tourneyId, newPrice)
    showToast('¡Precio de inscripción actualizado con éxito!')
  }

  // Handler: Change Registration Status
  function handleStatusChange(tourneyId, regId, newStatus) {
    updateRegistrationStatus(tourneyId, regId, newStatus)
    showToast(
      newStatus === 'aprobado'
        ? '¡Pago aprobado! El jugador fue habilitado para el sorteo.'
        : 'Estado de inscripción actualizado a: ' + newStatus
    )
  }

  // Handler: Execute Random Draw
  function handleGenerateBracket(tourneyId) {
    const res = generateTournamentBracket(tourneyId)
    if (res.error) {
      showToast(res.error)
    } else {
      showToast('¡Sorteo aleatorio realizado con éxito! Llaves generadas.')
    }
  }

  // Handler: Save Match Score & Advance Winner
  function handleSaveScore(e) {
    e.preventDefault()
    if (!scoreModalMatch || !currentTourney) return

    const parts = [set1Score, set2Score, set3Score].filter(Boolean)
    const scoreStr = parts.join(', ')

    const res = recordMatchResult(
      currentTourney.id,
      scoreModalMatch.id,
      winnerSlot,
      scoreStr,
      Number(pointsAwardInput) || 100
    )

    if (res.error) {
      showToast(res.error)
    } else {
      showToast('¡Marcador guardado! El ganador avanzó y se sumaron los puntos al ranking.')
      setScoreModalMatch(null)
    }
  }

  // Handler: Open Score Modal from bracket
  function handleOpenScoreModal(match) {
    setScoreModalMatch(match)
    setWinnerSlot(1)
    setSet1Score('6-4')
    setSet2Score('6-3')
    setSet3Score('')
    setPointsAwardInput(match.nextMatchId ? 100 : 250)
  }

  // Handler: Save Site Image
  function handleSaveSiteImage(key) {
    const url = siteImageInputs[key]
    if (!url) return
    saveSiteImage(key, url)
    showToast('Imagen del sitio actualizada correctamente.')
  }

  // Handler: File Upload for Site Image
  function handleImageFileUpload(key, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setSiteImageInputs((prev) => ({ ...prev, [key]: dataUrl }))
      saveSiteImage(key, dataUrl)
      showToast('Imagen cargada y guardada con éxito.')
    }
    reader.readAsDataURL(file)
  }

  // Carrusel Hero Handlers
  function handleUpdateHeroSlide(index, field, value) {
    setHeroSlides((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  function handleUploadHeroSlideFile(index, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      handleUpdateHeroSlide(index, 'image', dataUrl)
      showToast(`Imagen de diapositiva #${index + 1} cargada. Clic en "Guardar Carrusel" para aplicar.`)
    }
    reader.readAsDataURL(file)
  }

  function handleAddHeroSlide() {
    const defaultTennisImages = [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1530915365347-9b4b6e0b3d16?auto=format&fit=crop&w=1920&q=85'
    ]
    const nextImg = defaultTennisImages[heroSlides.length % defaultTennisImages.length]
    const newSlide = {
      id: 'slide-' + Date.now(),
      image: nextImg,
      eyebrow: 'Circuito Oficial ATAP',
      title: 'Vive la emoción de la competencia',
      description: 'Inscríbete en los mejores torneos y sé protagonista del tenis amateur del Perú.'
    }
    const updated = [...heroSlides, newSlide]
    setHeroSlides(updated)
    saveHeroSlides(updated)
    showToast(`¡Nueva diapositiva agregada (#${updated.length}) y guardada!`)
  }

  function handleDeleteHeroSlide(index) {
    if (heroSlides.length <= 1) {
      showToast('El carrusel debe conservar al menos 1 imagen.')
      return
    }
    const updated = heroSlides.filter((_, idx) => idx !== index)
    setHeroSlides(updated)
    saveHeroSlides(updated)
    showToast(`Diapositiva #${index + 1} eliminada correctamente.`)
  }

  function handleMoveHeroSlide(index, direction) {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return
    const updated = [...heroSlides]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setHeroSlides(updated)
    saveHeroSlides(updated)
    showToast(`Diapositiva reordenada a la posición #${targetIdx + 1}.`)
  }

  function handleSaveAllHeroSlides() {
    saveHeroSlides(heroSlides)
    showToast('¡Carrusel de imágenes guardado con éxito! Visible de inmediato en el Home.')
  }

  // Handler: Save Player Avatar (dedicated update)
  function handleSavePlayerAvatar() {
    if (!avatarModalPlayer || !newAvatarUrl) return
    updatePlayerAvatar(avatarModalPlayer.name, newAvatarUrl)
    showToast('Foto de ' + avatarModalPlayer.name + ' actualizada sin alterar sus puntos.')
    setAvatarModalPlayer(null)
    setNewAvatarUrl('')
  }

  // Handler: File Upload for Player Avatar
  function handlePlayerAvatarFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setNewAvatarUrl(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Helper: Format tournament date range into Spanish readable label
  function formatTournamentDates(startDateStr, endDateStr) {
    if (!startDateStr) return ''
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
    
    const [y1, m1, d1] = startDateStr.split('-').map(Number)
    if (!endDateStr || startDateStr === endDateStr) {
      return `${d1} ${months[m1 - 1]} ${y1}`
    }
    
    const [y2, m2, d2] = endDateStr.split('-').map(Number)
    
    if (y1 === y2 && m1 === m2) {
      return `${d1} - ${d2} ${months[m1 - 1]} ${y1}`
    }
    if (y1 === y2) {
      return `${d1} ${months[m1 - 1]} - ${d2} ${months[m2 - 1]} ${y1}`
    }
    return `${d1} ${months[m1 - 1]} ${y1} - ${d2} ${months[m2 - 1]} ${y2}`
  }

  // Helper: Parse tournament date string into { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  function parseDateRange(dateStr) {
    if (!dateStr) return { start: '', end: '' }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      return { start: dateStr.trim(), end: dateStr.trim() }
    }

    const monthsMap = {
      ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
      jul: '07', ago: '08', set: '09', sep: '09', oct: '10', nov: '11', dic: '12',
      jan: '01', apr: '04', aug: '08', dec: '12'
    }

    const clean = dateStr.trim().toLowerCase()
    const yearMatch = clean.match(/20\d\d/)
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()

    const parts = clean.split('-').map((p) => p.trim())
    if (parts.length === 2) {
      const p1 = parts[0]
      const p2 = parts[1]

      let m1 = null, m2 = null
      for (const [k, v] of Object.entries(monthsMap)) {
        if (p1.includes(k)) m1 = v
        if (p2.includes(k)) m2 = v
      }
      if (!m1 && m2) m1 = m2
      if (!m2 && m1) m2 = m1
      if (!m1) m1 = '05'
      if (!m2) m2 = '05'

      const d1Match = p1.match(/\d+/)
      const d2Match = p2.match(/\d+/)
      const d1 = d1Match ? d1Match[0].padStart(2, '0') : '01'
      const d2 = d2Match ? d2Match[0].padStart(2, '0') : '05'

      return {
        start: `${year}-${m1}-${d1}`,
        end: `${year}-${m2}-${d2}`
      }
    } else {
      let m = null
      for (const [k, v] of Object.entries(monthsMap)) {
        if (clean.includes(k)) m = v
      }
      if (!m) m = '05'
      const dMatch = clean.match(/\d+/)
      const d = dMatch ? dMatch[0].padStart(2, '0') : '01'
      const fullDate = `${year}-${m}-${d}`
      return { start: fullDate, end: fullDate }
    }
  }

  // Handler: Tournament image file upload (FileReader to base64)
  function handleTourneyImageFile(file, isEdit = false) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      if (isEdit) {
        setEditTourneyImage(dataUrl)
      } else {
        setNewTourneyImage(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handler: Open Edit Tournament Modal
  function handleOpenEditTournament(t) {
    setEditTourney(t)
    setEditTourneyTitle(t.title || '')
    const dates = parseDateRange(t.date)
    setEditTourneyStartDate(dates.start)
    setEditTourneyEndDate(dates.end)
    setEditTourneyPlace(t.place || '')
    setEditTourneyPrice(t.precio || 100)
    setEditTourneyLevel(t.level || 'Nacional')
    setEditTourneyModality(t.modalidad || 'singles')
    setEditTourneyImage(t.image || '')
  }

  // Handler: Save Edited Tournament
  function handleSaveEditTournament(e) {
    if (e) e.preventDefault()
    if (!editTourney) return
    if (!editTourneyTitle.trim() || !editTourneyStartDate || !editTourneyPlace.trim()) {
      showToast('Por favor completa todos los campos obligatorios: Nombre, Fechas y Lugar.')
      return
    }
    const priceNum = Number(editTourneyPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Por favor ingresa un precio de inscripción válido (mayor a 0).')
      return
    }

    const formattedDate = formatTournamentDates(editTourneyStartDate, editTourneyEndDate || editTourneyStartDate)

    const updated = updateTournament(editTourney.id, {
      title: editTourneyTitle.trim(),
      date: formattedDate,
      place: editTourneyPlace.trim(),
      precio: priceNum,
      level: editTourneyLevel || 'Nacional',
      modalidad: editTourneyModality || 'singles',
      image: editTourneyImage.trim() || editTourney.image
    })

    const tourneys = getTournaments()
    setTournaments(tourneys)
    setPriceInputs((prev) => ({ ...prev, [editTourney.id]: priceNum }))
    setEditTourney(null)
    showToast(`¡Torneo "${updated.title}" actualizado con éxito!`)
  }

  // Handler: Toggle Tournament Modality (Singles <-> Dúo) directly on card
  function handleToggleTournamentModality(tourney) {
    const nextModality = tourney.modalidad === 'dobles' ? 'singles' : 'dobles'
    updateTournamentModality(tourney.id, nextModality)
    const tourneys = getTournaments()
    setTournaments(tourneys)
    showToast(
      nextModality === 'dobles'
        ? `¡"${tourney.title}" configurado como torneo DÚO / DOBLES!`
        : `¡"${tourney.title}" configurado como torneo SINGLES!`
    )
  }

  // Handler: Create New Tournament
  function handleCreateTournament(e) {
    if (e) e.preventDefault()
    if (!newTourneyTitle.trim() || !newTourneyStartDate || !newTourneyPlace.trim()) {
      showToast('Por favor completa todos los campos obligatorios: Nombre, Fechas y Lugar.')
      return
    }
    const priceNum = Number(newTourneyPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Por favor ingresa un precio de inscripción válido (mayor a 0).')
      return
    }

    const formattedDate = formatTournamentDates(newTourneyStartDate, newTourneyEndDate || newTourneyStartDate)

    const created = createTournament({
      title: newTourneyTitle.trim(),
      date: formattedDate,
      place: newTourneyPlace.trim(),
      precio: priceNum,
      level: newTourneyLevel || 'Nacional',
      modalidad: newTourneyModality || 'singles',
      image: newTourneyImage.trim() || '/assets/Evento.png'
    })

    const updated = getTournaments()
    setTournaments(updated)
    setSelectedTourneyId(created.id)
    setShowCreateTourneyModal(false)
    setNewTourneyTitle('')
    setNewTourneyStartDate('')
    setNewTourneyEndDate('')
    setNewTourneyPlace('')
    setNewTourneyPrice(100)
    setNewTourneyLevel('Nacional')
    setNewTourneyModality('singles')
    setNewTourneyImage('')
    showToast(`¡Torneo "${created.title}" creado con éxito!`)
  }

  // Handler: Delete Tournament
  function handleDeleteTournament(t) {
    deleteTournament(t.id)
    const updated = getTournaments()
    setTournaments(updated)
    if (selectedTourneyId === t.id && updated.length > 0) {
      setSelectedTourneyId(updated[0].id)
    }
    showToast(`Torneo "${t.title}" eliminado correctamente.`)
  }

  return (
    <main className="page-content admin-page">
      {toastMessage && (
        <div className="admin-toast-banner" role="alert">
          <CheckCircle2 size={20} color="#00CFA0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DASHBOARD TOP CARD: HEADER & TABS NAVIGATION */}
      <div className="admin-top-card panel">
        <div className="admin-header-strip">
          <div>
            <span className="admin-pill-badge">Dashboard Oficial ATAP</span>
            <h1>Panel de Administración del Circuito</h1>
            <p>
              Bienvenido, <strong>{usuario?.nombre || 'Administrador'}</strong> ({usuario?.email})
            </p>
          </div>
          <div className="admin-header-actions">
            <a href="/" className="btn-secondary-link" target="_blank" rel="noreferrer">
              Ver Sitio Web <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* ADMIN TABS NAVIGATION */}
        <nav className="admin-nav-tabs" aria-label="Secciones del panel">
          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'dashboard' ? ' active' : '')}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard General</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'precios' ? ' active' : '')}
            onClick={() => setActiveTab('precios')}
          >
            <DollarSign size={16} />
            <span>Torneos y Precios</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'pagos' ? ' active' : '')}
            onClick={() => setActiveTab('pagos')}
          >
            <CreditCard size={16} />
            <span>Aprobación de Pagos {totalPendientes > 0 && <span className="tab-bubble-alert">{totalPendientes}</span>}</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'sorteo' ? ' active' : '')}
            onClick={() => setActiveTab('sorteo')}
          >
            <Shuffle size={16} />
            <span>Sorteo de Llaves</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'marcadores' ? ' active' : '')}
            onClick={() => setActiveTab('marcadores')}
          >
            <Flame size={16} />
            <span>Marcadores y Ranking en Vivo</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'imagenes' ? ' active' : '')}
            onClick={() => setActiveTab('imagenes')}
          >
            <ImageIcon size={16} />
            <span>Imágenes y Fotos</span>
          </button>
        </nav>
      </div>

      {/* TAB 0: DASHBOARD GENERAL (OVERVIEW) */}
      {activeTab === 'dashboard' && (
        <section className="admin-tab-panel">
          {/* KPI CARDS GRID */}
          <div className="kpi-cards-grid">
            <div className="kpi-card kpi-money panel">
              <div className="kpi-icon-wrap">
                <DollarSign size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Recaudación Confirmada</span>
                <strong className="kpi-value">S/ {totalRecaudado.toLocaleString()} PEN</strong>
                <small className="kpi-subtext">Por {totalAprobadas} inscripciones validadas</small>
              </div>
            </div>

            <div className="kpi-card kpi-users panel">
              <div className="kpi-icon-wrap">
                <Users size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Inscripciones Totales</span>
                <strong className="kpi-value">{totalInscripciones}</strong>
                <small className="kpi-subtext">{totalAprobadas} aprobadas • {totalPendientes} pendientes</small>
              </div>
            </div>

            <div className="kpi-card kpi-pending panel">
              <div className="kpi-icon-wrap">
                <Clock size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Pagos por Validar</span>
                <strong className="kpi-value">{totalPendientes}</strong>
                <button
                  type="button"
                  className="kpi-action-link"
                  onClick={() => setActiveTab('pagos')}
                >
                  Ir a validar comprobantes →
                </button>
              </div>
            </div>

            <div className="kpi-card kpi-tourneys panel">
              <div className="kpi-icon-wrap">
                <Trophy size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Torneos Oficiales</span>
                <strong className="kpi-value">{tournaments.length}</strong>
                <small className="kpi-subtext">Competiciones en calendario</small>
              </div>
            </div>

            <div className="kpi-card kpi-ranking panel">
              <div className="kpi-icon-wrap">
                <Award size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Jugadores en Ranking</span>
                <strong className="kpi-value">{ranking.length}</strong>
                <small className="kpi-subtext">Tenistas registrados en circuito</small>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS ROW */}
          <div className="dashboard-quick-actions-bar panel">
            <h3>⚡ Accesos Rápidos del Administrador</h3>
            <div className="quick-actions-buttons">
              <button
                type="button"
                className="btn-quick-nav"
                onClick={() => setActiveTab('pagos')}
              >
                <CreditCard size={15} />
                <span>Aprobar Pagos ({totalPendientes})</span>
              </button>
              <button
                type="button"
                className="btn-quick-nav"
                onClick={() => setActiveTab('sorteo')}
              >
                <Shuffle size={15} />
                <span>Sortear Llaves de Torneo</span>
              </button>
              <button
                type="button"
                className="btn-quick-nav"
                onClick={() => setActiveTab('marcadores')}
              >
                <Flame size={15} />
                <span>Cargar Marcador en Vivo</span>
              </button>
              <button
                type="button"
                className="btn-quick-nav"
                onClick={() => setActiveTab('precios')}
              >
                <DollarSign size={15} />
                <span>Ajustar Precios de Torneos</span>
              </button>
              <button
                type="button"
                className="btn-quick-nav"
                onClick={() => setActiveTab('imagenes')}
              >
                <Camera size={15} />
                <span>Cambiar Fotos y Banners</span>
              </button>
            </div>
          </div>

          {/* DASHBOARD 2-COLUMN SECTION: RECENT INSCRIPTIONS & TOURNAMENT STATUS */}
          <div className="dashboard-two-columns">
            {/* COLUMN 1: RECENT INSCRIPTIONS */}
            <div className="dashboard-col panel">
              <div className="col-header">
                <h3>Últimas Inscripciones Registradas</h3>
                <button
                  type="button"
                  className="link-all"
                  onClick={() => setActiveTab('pagos')}
                >
                  Ver todas ({recentInscriptions.length})
                </button>
              </div>

              {recentInscriptions.length === 0 ? (
                <p className="empty-subtext">Aún no hay inscripciones registradas.</p>
              ) : (
                <div className="recent-list">
                  {recentInscriptions.slice(0, 5).map((insc) => (
                    <div className="recent-item" key={insc.id}>
                      <div className="recent-avatar-circle">
                        {insc.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="recent-info">
                        <strong>{insc.nombre}</strong>
                        <small>{insc.tourneyTitle} • S/ {insc.tourneyPrice}.00</small>
                      </div>
                      <div className="recent-status-col">
                        <span className={'status-tag ' + (insc.estadoPago === 'aprobado' ? 'approved' : 'pending')}>
                          {insc.estadoPago}
                        </span>
                        {insc.estadoPago === 'pendiente' && (
                          <button
                            type="button"
                            className="btn-mini-approve"
                            onClick={() => handleStatusChange(insc.tourneyId, insc.id, 'aprobado')}
                            title="Aprobar pago"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: TOURNAMENTS STATUS OVERVIEW */}
            <div className="dashboard-col panel">
              <div className="col-header">
                <h3>Estado de Torneos Activos</h3>
                <button
                  type="button"
                  className="link-all"
                  onClick={() => setActiveTab('precios')}
                >
                  Gestionar precios
                </button>
              </div>

              <div className="tourney-status-list">
                {tournaments.map((t) => {
                  const approvedCount = (t.inscripciones || []).filter((i) => i.estadoPago === 'aprobado').length
                  const hasBracket = Boolean(t.bracket && t.bracket.rounds)

                  return (
                    <div className="tourney-status-card" key={t.id}>
                      <img src={t.image} alt={t.title} className="tourney-status-img" />
                      <div className="tourney-status-content">
                        <h4>{t.title}</h4>
                        <span className="tourney-status-fee">Inscripción: S/ {t.precio || 100}.00</span>
                        <div className="tourney-status-meta">
                          <span>{approvedCount} listos para llave</span>
                          <span className={'bracket-badge ' + (hasBracket ? 'ready' : 'waiting')}>
                            {hasBracket ? 'Llave Armada' : 'Pendiente de Sorteo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 1: TORNEOS Y PRECIOS */}
      {activeTab === 'precios' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Gestión de Torneos y Precios</h2>
                <p>
                  Crea torneos oficiales y configura los precios de inscripción (en Soles PEN) para orientar a los jugadores.
                </p>
              </div>
              <button
                type="button"
                className="button button-lime btn-open-create-tourney"
                onClick={() => setShowCreateTourneyModal(true)}
              >
                <Plus size={16} /> Crear Nuevo Torneo
              </button>
            </div>

            <div className="admin-tourneys-grid">
              {tournaments.map((t) => (
                <div className="admin-tourney-card" key={t.id}>
                  <div className="tourney-card-thumb">
                    <img src={t.image} alt={t.title} />
                    <span className="tourney-badge-level">{t.level}</span>
                  </div>
                  <div className="tourney-card-body">
                    <div className="tourney-card-top-row">
                      <h3>{t.title}</h3>
                      <div className="tourney-card-actions">
                        <button
                          type="button"
                          className="btn-edit-tourney"
                          title="Editar torneo"
                          onClick={() => handleOpenEditTournament(t)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-delete-tourney"
                          title="Eliminar torneo"
                          onClick={() => handleDeleteTournament(t)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="tourney-meta-line">
                      <Calendar size={12} /> {t.date} | {t.place}
                    </p>

                    {/* TOGGLE SWITCH: SINGLES <-> DÚO */}
                    <div className="modality-switch-row">
                      <span className="modality-row-label">Tipo:</span>
                      <div
                        className="modality-toggle-control"
                        onClick={() => handleToggleTournamentModality(t)}
                        title="Clic para alternar entre Singles y Dúo"
                      >
                        <span className={`modality-option-label ${t.modalidad !== 'dobles' ? 'active' : ''}`}>
                          Singles
                        </span>
                        <div className={`modality-switch-pill ${t.modalidad === 'dobles' ? 'is-duo' : 'is-singles'}`}>
                          <div className="modality-switch-knob" />
                        </div>
                        <span className={`modality-option-label ${t.modalidad === 'dobles' ? 'active' : ''}`}>
                          Dúo
                        </span>
                      </div>
                    </div>

                    <div className="tourney-stats-pill">
                      <span>
                        {(t.inscripciones || []).length} jugadores inscritos (
                        {(t.inscripciones || []).filter((i) => i.estadoPago === 'aprobado').length}{' '}
                        aprobados)
                      </span>
                    </div>

                    <div className="tourney-price-edit-box">
                      <label htmlFor={'price-' + t.id}>Precio de Inscripción (S/):</label>
                      <div className="price-input-row">
                        <span className="currency-symbol">S/</span>
                        <input
                          id={'price-' + t.id}
                          type="number"
                          min="0"
                          step="5"
                          value={priceInputs[t.id] ?? t.precio ?? 100}
                          onChange={(e) =>
                            setPriceInputs({
                              ...priceInputs,
                              [t.id]: e.target.value
                            })
                          }
                        />
                        <button
                          type="button"
                          className="btn-save-price"
                          onClick={() => handleSavePrice(t.id)}
                        >
                          <Save size={14} /> Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: APROBACIÓN DE PAGOS */}
      {activeTab === 'pagos' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Validación y Aprobación de Pagos</h2>
                <p>
                  Revisa las inscripciones pendientes y aprueba el pago una vez validado el comprobante de WhatsApp.
                </p>
              </div>
              <div className="tourney-selector-wrap">
                <label htmlFor="select-tourney-pay">Torneo:</label>
                <select
                  id="select-tourney-pay"
                  value={selectedTourneyId}
                  onChange={(e) => setSelectedTourneyId(e.target.value)}
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="inscriptions-table-card">
              {(!currentTourney.inscripciones || currentTourney.inscripciones.length === 0) ? (
                <div className="empty-table-state">
                  <Users size={36} color="#A096B4" />
                  <p>No hay inscripciones registradas en este torneo aún.</p>
                </div>
              ) : (
              <div className="table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Jugador</th>
                      <th>DNI / Doc</th>
                      <th>Teléfono</th>
                      <th>Categoría</th>
                      <th>Método</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTourney.inscripciones.map((insc) => {
                      const isPending = insc.estadoPago === 'pendiente'
                      const isApproved = insc.estadoPago === 'aprobado'
                      const isRejected = insc.estadoPago === 'rechazado'

                      const waMsg = encodeURIComponent(
                        '¡Hola ' +
                          insc.nombre +
                          '! Te saludamos de la Asociación de Tenistas Amateur del Perú (ATAP) respecto a tu inscripción en el ' +
                          currentTourney.title +
                          '.'
                      )
                      const waLink = 'https://wa.me/51' + (insc.telefono || '').replace(/D/g, '') + '?text=' + waMsg

                      return (
                        <tr key={insc.id} className={isPending ? 'row-pending' : ''}>
                          <td>
                            <strong>{insc.nombre}</strong>
                            <span className="player-sub-email">{insc.email}</span>
                          </td>
                          <td>{insc.dni || '-'}</td>
                          <td>
                            {insc.telefono ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="phone-wa-link"
                                title="Contactar por WhatsApp"
                              >
                                <Send size={12} /> {insc.telefono}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <span className="badge-cat">{insc.categoria}</span>
                          </td>
                          <td>{insc.metodoPago || 'Yape / Plin'}</td>
                          <td>{insc.fechaRegistro || '-'}</td>
                          <td>
                            {isPending && <span className="status-tag pending">Pendiente</span>}
                            {isApproved && <span className="status-tag approved">Aprobado</span>}
                            {isRejected && <span className="status-tag rejected">Rechazado</span>}
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              {!isApproved && (
                                <button
                                  type="button"
                                  className="btn-action-approve"
                                  title="Aprobar pago"
                                  onClick={() =>
                                    handleStatusChange(currentTourney.id, insc.id, 'aprobado')
                                  }
                                >
                                  <CheckCircle2 size={15} /> Aprobar
                                </button>
                              )}
                              {!isRejected && (
                                <button
                                  type="button"
                                  className="btn-action-reject"
                                  title="Rechazar inscripción"
                                  onClick={() =>
                                    handleStatusChange(currentTourney.id, insc.id, 'rechazado')
                                  }
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        </section>
      )}

      {/* TAB 3: SORTEO DE LLAVES */}
      {activeTab === 'sorteo' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Sorteo Aleatorio de Llaves (Fixture)</h2>
                <p>
                  Genera el cuadro de eliminación directa con los jugadores que tengan el pago aprobado.
                </p>
              </div>
              <div className="tourney-selector-wrap">
                <label htmlFor="select-tourney-draw">Torneo:</label>
                <select
                  id="select-tourney-draw"
                  value={selectedTourneyId}
                  onChange={(e) => setSelectedTourneyId(e.target.value)}
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="draw-control-card">
              <div className="draw-control-left">
                <h3>Participantes con Pago Aprobado:</h3>
                <div className="approved-players-pills">
                  {(currentTourney.inscripciones || [])
                    .filter((i) => i.estadoPago === 'aprobado')
                    .map((p) => (
                      <span className="approved-pill" key={p.id}>
                        🎾 {p.nombre} ({p.categoria})
                      </span>
                    ))}
                  {(currentTourney.inscripciones || []).filter((i) => i.estadoPago === 'aprobado')
                    .length === 0 && (
                    <span className="no-approved-warning">
                      No hay jugadores aprobados aún. Aprueba pagos en la pestaña anterior para poder sortear.
                    </span>
                  )}
                </div>
              </div>

              <div className="draw-control-right">
                <button
                  type="button"
                  className="btn-execute-draw"
                  onClick={() => handleGenerateBracket(currentTourney.id)}
                >
                  <Shuffle size={18} />
                  <span>Realizar Sorteo Aleatorio</span>
                </button>
                <small className="draw-hint">
                  Baraja aleatoriamente los cruces formando Cuartos o Semifinales.
                </small>
              </div>
            </div>

            <div className="bracket-preview-card">
              <div className="bracket-preview-header">
                <h3>Cuadro Actual del Torneo</h3>
                <span className="bracket-status-tag">
                  {currentTourney.bracket ? 'Llave Generada' : 'Sin Sorteo'}
                </span>
              </div>
              <TournamentBracket
                bracket={currentTourney.bracket}
                isAdmin={true}
                onOpenScoreModal={handleOpenScoreModal}
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: MARCADORES Y RANKING EN VIVO */}
      {activeTab === 'marcadores' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Marcadores y Puntos en Vivo</h2>
                <p>
                  Ingresa resultados de partidos por set. El ganador avanzará automáticamente y sumará puntos al ranking en tiempo real.
                </p>
              </div>
              <div className="tourney-selector-wrap">
                <label htmlFor="select-tourney-score">Torneo Activo:</label>
                <select
                  id="select-tourney-score"
                  value={selectedTourneyId}
                  onChange={(e) => setSelectedTourneyId(e.target.value)}
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-scores-layout">
              <div className="scores-bracket-area">
                <div className="scores-bracket-header">
                  <h3>{currentTourney.title} — Haz clic en "Cargar Marcador"</h3>
                </div>
                <TournamentBracket
                  bracket={currentTourney.bracket}
                  isAdmin={true}
                  onOpenScoreModal={handleOpenScoreModal}
                />
              </div>

              {/* LIVE RANKING PREVIEW */}
              <div className="scores-ranking-sidebar">
                <div className="ranking-sidebar-header">
                  <Trophy size={20} color="#FFD700" />
                  <h3>Ranking Oficial en Vivo</h3>
                </div>
                <div className="sidebar-ranking-list">
                  {ranking.slice(0, 8).map((p) => (
                    <div className="sidebar-ranking-item" key={p.id || p.position}>
                      <span className="rank-pos-badge">{p.position}</span>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="sidebar-avatar"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/assets/logo.png'
                        }}
                      />
                      <div className="sidebar-player-info">
                        <strong>{p.name}</strong>
                        <small>{p.categoria}</small>
                      </div>
                      <span className="sidebar-points">{p.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: GESTIÓN DE IMÁGENES Y FOTOS DE JUGADORES */}
      {activeTab === 'imagenes' && (
        <section className="admin-tab-panel">
          {/* SECCIÓN 1: CARRUSEL DEL HERO BANNER PRINCIPAL (SLIDER MULTI-IMAGEN) */}
          <div className="admin-section-card panel hero-carousel-manager-card">
            <div className="panel-title-row">
              <div>
                <div className="title-with-badge">
                  <h2>Carrusel del Hero Banner Principal (Slider)</h2>
                  <span className="dimension-pill">📐 1920x1080 px</span>
                  <span className="slide-count-badge">
                    <Layers size={13} /> {heroSlides.length} imágenes activas
                  </span>
                </div>
                <p>
                  Agrega, reemplaza, reordena y elimina las imágenes que se deslizan automáticamente en el banner principal del Inicio.
                </p>
              </div>
              <div className="carousel-top-actions">
                <button
                  type="button"
                  className="button button-lime"
                  onClick={handleAddHeroSlide}
                >
                  <Plus size={16} /> Agregar Nueva Diapositiva
                </button>
              </div>
            </div>

            <div className="hero-slides-admin-grid">
              {heroSlides.map((slide, idx) => (
                <div className="hero-slide-admin-item panel" key={slide.id || idx}>
                  <div className="slide-item-topbar">
                    <div className="slide-tag-group">
                      <span className="slide-index-pill">
                        #{idx + 1} {idx === 0 ? '• Portada Principal' : ''}
                      </span>
                      <span className="slide-indicator-hint">
                        Punto #{idx + 1} del carrusel
                      </span>
                    </div>
                    <div className="slide-actions-btns">
                      <button
                        type="button"
                        className="btn-slide-order"
                        onClick={() => handleMoveHeroSlide(idx, -1)}
                        disabled={idx === 0}
                        title="Subir orden"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-slide-order"
                        onClick={() => handleMoveHeroSlide(idx, 1)}
                        disabled={idx === heroSlides.length - 1}
                        title="Bajar orden"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-slide-delete"
                        onClick={() => handleDeleteHeroSlide(idx)}
                        disabled={heroSlides.length <= 1}
                        title={heroSlides.length <= 1 ? 'Mínimo 1 diapositiva requerida' : 'Eliminar diapositiva'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="slide-admin-preview banner-preview-box">
                    <img
                      src={slide.image || '/assets/hero1.png'}
                      alt={`Diapositiva ${idx + 1}`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/assets/hero1.png'
                      }}
                    />
                    <span className="preview-overlay-badge">1920x1080 px (16:9)</span>
                  </div>

                  <div className="slide-admin-controls">
                    <div className="form-group">
                      <label>URL de Imagen:</label>
                      <input
                        type="text"
                        value={slide.image || ''}
                        placeholder="https://... o sube un archivo desde tu PC"
                        onChange={(e) => handleUpdateHeroSlide(idx, 'image', e.target.value)}
                      />
                    </div>

                    <label className="btn-file-upload full-width">
                      <Camera size={15} /> Subir imagen desde mi PC (1920x1080 px)
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleUploadHeroSlideFile(idx, e.target.files[0])}
                      />
                    </label>

                    <div className="slide-text-accordion">
                      <div className="form-group">
                        <label>Título de la Diapositiva (Opcional):</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          placeholder="Ej: Grandes torneos, grandes historias"
                          onChange={(e) => handleUpdateHeroSlide(idx, 'title', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Subtítulo / Antetítulo (Opcional):</label>
                        <input
                          type="text"
                          value={slide.eyebrow || ''}
                          placeholder="Ej: Vive la pasión del tenis"
                          onChange={(e) => handleUpdateHeroSlide(idx, 'eyebrow', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Descripción breve (Opcional):</label>
                        <input
                          type="text"
                          value={slide.description || ''}
                          placeholder="Texto descriptivo de la diapositiva"
                          onChange={(e) => handleUpdateHeroSlide(idx, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-slides-footer-bar">
              <button
                type="button"
                className="btn-add-slide-ghost"
                onClick={handleAddHeroSlide}
              >
                <Plus size={16} /> Agregar otra diapositiva
              </button>
              <button
                type="button"
                className="button button-lime btn-save-all-slides"
                onClick={handleSaveAllHeroSlides}
              >
                <Save size={16} /> Guardar Todos los Cambios del Carrusel
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: OTRAS IMÁGENES Y LOGOS DEL SITIO */}
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Otras Imágenes y Logos del Sitio Web</h2>
                <p>Cambia el banner de eventos de la página de inicio y los logos oficiales en tiempo real.</p>
              </div>
            </div>

            <div className="site-images-grid">

              {/* EVENTO BANNER */}
              <div className="image-edit-card panel banner-card">
                <div className="card-header-with-badge">
                  <h4>Banner de Eventos (Home)</h4>
                  <span className="dimension-pill">📐 1920x1080 px</span>
                </div>
                <p className="banner-spec-note">Formato requerido: Banner panorámico 1920x1080 píxeles (16:9)</p>
                <div className="img-preview-box banner-preview-box">
                  <img src={siteImageInputs.eventoBanner || siteImages.eventoBanner} alt="Evento Banner" />
                  <span className="preview-overlay-badge">1920x1080 px</span>
                </div>
                <div className="img-input-controls">
                  <input
                    type="text"
                    value={siteImageInputs.eventoBanner || ''}
                    placeholder="URL de imagen https://..."
                    onChange={(e) =>
                      setSiteImageInputs({ ...siteImageInputs, eventoBanner: e.target.value })
                    }
                  />
                  <label className="btn-file-upload">
                    <Camera size={14} /> Subir archivo (1920x1080 px)
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageFileUpload('eventoBanner', e.target.files[0])}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-save-img"
                    onClick={() => handleSaveSiteImage('eventoBanner')}
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {/* LOGO PLATINO */}
              <div className="image-edit-card panel">
                <h4>Logo Platino Sponsor</h4>
                <div className="img-preview-box" style={{ background: '#00304A' }}>
                  <img src={siteImageInputs.logoPlatino || siteImages.logoPlatino} alt="Logo Platino" />
                </div>
                <div className="img-input-controls">
                  <input
                    type="text"
                    value={siteImageInputs.logoPlatino || ''}
                    placeholder="URL de imagen https://..."
                    onChange={(e) =>
                      setSiteImageInputs({ ...siteImageInputs, logoPlatino: e.target.value })
                    }
                  />
                  <label className="btn-file-upload">
                    <Camera size={14} /> Subir archivo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageFileUpload('logoPlatino', e.target.files[0])}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-save-img"
                    onClick={() => handleSaveSiteImage('logoPlatino')}
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {/* LOGO ATAP */}
              <div className="image-edit-card panel">
                <h4>Logo Oficial ATAP</h4>
                <div className="img-preview-box" style={{ background: '#00304A' }}>
                  <img src={siteImageInputs.logoAtap || siteImages.logoAtap} alt="Logo ATAP" />
                </div>
                <div className="img-input-controls">
                  <input
                    type="text"
                    value={siteImageInputs.logoAtap || ''}
                    placeholder="URL de imagen https://..."
                    onChange={(e) =>
                      setSiteImageInputs({ ...siteImageInputs, logoAtap: e.target.value })
                    }
                  />
                  <label className="btn-file-upload">
                    <Camera size={14} /> Subir archivo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageFileUpload('logoAtap', e.target.files[0])}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-save-img"
                    onClick={() => handleSaveSiteImage('logoAtap')}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN B: FOTOS DE JUGADORES DEL CIRCUITO */}
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Gestión de Fotos de Jugadores del Circuito</h2>
                <p>
                  Cada jugador tiene un botón exclusivo <strong>"Cambiar foto"</strong> para actualizar su foto de perfil sin alterar puntos, categoría ni estadísticas.
                </p>
              </div>
              <div className="dimension-spec-badge">
                <span className="dimension-pill">📐 500x500 px</span>
                <small>Formato oficial de jugadores: Foto cuadrada 500x500 píxeles (1:1)</small>
              </div>
            </div>

            <div className="admin-players-photo-grid">
              {ranking.map((p) => (
                <div className="player-photo-item panel" key={p.id || p.position}>
                  <div className="player-photo-thumb">
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/assets/logo.png'
                      }}
                    />
                    <span className="photo-rank-tag">#{p.position}</span>
                  </div>
                  <div className="player-photo-info">
                    <h4>{p.name}</h4>
                    <span className="photo-category">{p.categoria}</span>
                    <span className="photo-points">{p.points}</span>
                    <button
                      type="button"
                      className="btn-change-photo"
                      onClick={() => {
                        setAvatarModalPlayer(p)
                        setNewAvatarUrl(p.image)
                      }}
                    >
                      <Camera size={14} /> Cambiar foto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MODAL PARA CARGAR MARCADOR */}
      {scoreModalMatch && (
        <div className="admin-modal-backdrop" onClick={() => setScoreModalMatch(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3>Ingresar Marcador — Match #{scoreModalMatch.matchNum}</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setScoreModalMatch(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="score-form">
              <p className="score-hint">
                Selecciona al jugador ganador e ingresa los games de cada set. El jugador avanzará automáticamente a la siguiente ronda.
              </p>

              <div className="score-player-selector">
                <label
                  className={'player-pick-card' + (winnerSlot === 1 ? ' selected' : '')}
                  onClick={() => setWinnerSlot(1)}
                >
                  <input
                    type="radio"
                    name="winner"
                    checked={winnerSlot === 1}
                    onChange={() => setWinnerSlot(1)}
                  />
                  <div className="pick-info">
                    <span className="pick-role">Jugador 1</span>
                    <strong>{scoreModalMatch.player1?.name || 'Por definir'}</strong>
                    <small>{scoreModalMatch.player1?.categoria}</small>
                  </div>
                </label>

                <div className="pick-vs">vs</div>

                <label
                  className={'player-pick-card' + (winnerSlot === 2 ? ' selected' : '')}
                  onClick={() => setWinnerSlot(2)}
                >
                  <input
                    type="radio"
                    name="winner"
                    checked={winnerSlot === 2}
                    onChange={() => setWinnerSlot(2)}
                  />
                  <div className="pick-info">
                    <span className="pick-role">Jugador 2</span>
                    <strong>{scoreModalMatch.player2?.name || 'Por definir'}</strong>
                    <small>{scoreModalMatch.player2?.categoria}</small>
                  </div>
                </label>
              </div>

              <div className="form-group-row-3">
                <div className="form-group">
                  <label htmlFor="set-1">Set 1</label>
                  <input
                    id="set-1"
                    type="text"
                    value={set1Score}
                    onChange={(e) => setSet1Score(e.target.value)}
                    placeholder="6-4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="set-2">Set 2</label>
                  <input
                    id="set-2"
                    type="text"
                    value={set2Score}
                    onChange={(e) => setSet2Score(e.target.value)}
                    placeholder="6-3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="set-3">Set 3 (Opcional)</label>
                  <input
                    id="set-3"
                    type="text"
                    value={set3Score}
                    onChange={(e) => setSet3Score(e.target.value)}
                    placeholder="10-8 o 7-5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="points-award">Puntos a Otorgar al Ganador:</label>
                <input
                  id="points-award"
                  type="number"
                  value={pointsAwardInput}
                  onChange={(e) => setPointsAwardInput(e.target.value)}
                  min="50"
                  step="25"
                />
                <small style={{ color: '#796E8A', fontSize: '11px', marginTop: '4px' }}>
                  Estos puntos se sumarán inmediatamente a su récord en el ranking global.
                </small>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setScoreModalMatch(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-lime">
                  Guardar y Avanzar Ganador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA CAMBIAR FOTO DE JUGADOR */}
      {avatarModalPlayer && (
        <div className="admin-modal-backdrop" onClick={() => setAvatarModalPlayer(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3>Cambiar Foto: {avatarModalPlayer.name}</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setAvatarModalPlayer(null)}
              >
                ✕
              </button>
            </div>

            <div className="avatar-modal-body">
              <div className="dimension-spec-badge" style={{ marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}>
                <span className="dimension-pill">📐 500x500 px</span>
                <small>Formato requerido: Foto cuadrada 500x500 píxeles (1:1)</small>
              </div>

              <div className="avatar-preview-box">
                <img
                  src={newAvatarUrl || avatarModalPlayer.image}
                  alt={avatarModalPlayer.name}
                  className="modal-avatar-img"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = '/assets/logo.png'
                  }}
                />
                <span className="preview-overlay-badge">500x500 px</span>
              </div>

              <p className="avatar-modal-kicker">
                Actualizarás exclusivamente la fotografía de <strong>{avatarModalPlayer.name}</strong>.
                Sus puntos ({avatarModalPlayer.points}), categoría ({avatarModalPlayer.categoria}) y posición se conservan intactos.
              </p>

              <div className="form-group">
                <label htmlFor="avatar-url-input">URL de la imagen (500x500 px):</label>
                <input
                  id="avatar-url-input"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                />
              </div>

              <div className="upload-divider">o también</div>

              <label className="btn-file-upload full-width">
                <Camera size={16} /> Seleccionar archivo desde mi computadora (500x500 px)
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePlayerAvatarFile(e.target.files[0])}
                />
              </label>

              <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setAvatarModalPlayer(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="button button-lime"
                  onClick={handleSavePlayerAvatar}
                >
                  Guardar Nueva Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR NUEVO TORNEO */}
      {showCreateTourneyModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateTourneyModal(false)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3>Crear Nuevo Torneo</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowCreateTourneyModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="create-tourney-form">
              <div className="dimension-spec-badge">
                <span className="dimension-pill">📐 500x500 px</span>
                <small>Formato requerido para portada: Tarjeta cuadrada 500x500 píxeles (1:1)</small>
              </div>

              <div className="form-group">
                <label htmlFor="new-tourney-name">Nombre del Torneo *</label>
                <input
                  id="new-tourney-name"
                  type="text"
                  placeholder="Ej: Torneo Abierto de Primavera ATAP"
                  value={newTourneyTitle}
                  onChange={(e) => setNewTourneyTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="new-tourney-start-date">Fecha de Inicio *</label>
                  <input
                    id="new-tourney-start-date"
                    type="date"
                    value={newTourneyStartDate}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewTourneyStartDate(val)
                      if (!newTourneyEndDate || newTourneyEndDate < val) {
                        setNewTourneyEndDate(val)
                      }
                    }}
                    onClick={(e) => {
                      if (e.target && typeof e.target.showPicker === 'function') {
                        e.target.showPicker()
                      }
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-tourney-end-date">Fecha de Fin *</label>
                  <input
                    id="new-tourney-end-date"
                    type="date"
                    min={newTourneyStartDate || undefined}
                    value={newTourneyEndDate}
                    onChange={(e) => setNewTourneyEndDate(e.target.value)}
                    onClick={(e) => {
                      if (e.target && typeof e.target.showPicker === 'function') {
                        e.target.showPicker()
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {newTourneyStartDate && (
                <div className="date-preview-pill">
                  <Calendar size={13} />
                  <span>
                    Fecha de Competencia: <strong>{formatTournamentDates(newTourneyStartDate, newTourneyEndDate || newTourneyStartDate)}</strong>
                  </span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="new-tourney-place">Lugar / Sede *</label>
                <input
                  id="new-tourney-place"
                  type="text"
                  placeholder="Ej: Club Lawn Tennis de la Exposición"
                  value={newTourneyPlace}
                  onChange={(e) => setNewTourneyPlace(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="new-tourney-price">Precio de Inscripción (S/ PEN) *</label>
                  <input
                    id="new-tourney-price"
                    type="number"
                    min="10"
                    step="5"
                    placeholder="100"
                    value={newTourneyPrice}
                    onChange={(e) => setNewTourneyPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-tourney-level">Nivel del Torneo</label>
                  <select
                    id="new-tourney-level"
                    value={newTourneyLevel}
                    onChange={(e) => setNewTourneyLevel(e.target.value)}
                  >
                    <option value="Nacional">Nacional</option>
                    <option value="Regional">Regional</option>
                    <option value="Internacional">Internacional</option>
                    <option value="Master">Master</option>
                    <option value="Amateur">Amateur</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Modalidad / Formato del Torneo</label>
                <div className="modality-switch-row-modal">
                  <div
                    className="modality-toggle-control"
                    onClick={() => setNewTourneyModality(newTourneyModality === 'dobles' ? 'singles' : 'dobles')}
                    title="Clic para cambiar entre Singles y Dúo"
                  >
                    <span className={`modality-option-label ${newTourneyModality !== 'dobles' ? 'active' : ''}`}>
                      Singles
                    </span>
                    <div className={`modality-switch-pill ${newTourneyModality === 'dobles' ? 'is-duo' : 'is-singles'}`}>
                      <div className="modality-switch-knob" />
                    </div>
                    <span className={`modality-option-label ${newTourneyModality === 'dobles' ? 'active' : ''}`}>
                      Dúo
                    </span>
                  </div>
                  <span className="modality-hint-text">
                    {newTourneyModality === 'dobles' ? '🏸 Modalidad en Parejas / Dobles' : '🎾 Modalidad Individual (1 vs 1)'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-tourney-img">Imagen de Portada (500x500 px)</label>
                {newTourneyImage && (
                  <div className="tourney-img-preview-box">
                    <img src={newTourneyImage} alt="Vista previa 500x500" />
                    <span className="preview-overlay-badge">500x500 px</span>
                  </div>
                )}
                <input
                  id="new-tourney-img"
                  type="text"
                  placeholder="https://images.unsplash.com/... o déjalo en blanco para imagen por defecto"
                  value={newTourneyImage}
                  onChange={(e) => setNewTourneyImage(e.target.value)}
                />
                <label className="btn-file-upload full-width" style={{ marginTop: '6px' }}>
                  <Camera size={14} /> Subir archivo desde mi computadora (500x500 px)
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleTourneyImageFile(e.target.files[0], false)}
                  />
                </label>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateTourneyModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-lime">
                  <Plus size={16} /> Crear Torneo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR TORNEO */}
      {editTourney && (
        <div className="admin-modal-backdrop" onClick={() => setEditTourney(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3>Editar Torneo: {editTourney.title}</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setEditTourney(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTournament} className="create-tourney-form">
              <div className="dimension-spec-badge">
                <span className="dimension-pill">📐 500x500 px</span>
                <small>Formato requerido para portada: Tarjeta cuadrada 500x500 píxeles (1:1)</small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-tourney-name">Nombre del Torneo *</label>
                <input
                  id="edit-tourney-name"
                  type="text"
                  placeholder="Ej: Torneo Abierto de Primavera ATAP"
                  value={editTourneyTitle}
                  onChange={(e) => setEditTourneyTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="edit-tourney-start-date">Fecha de Inicio *</label>
                  <input
                    id="edit-tourney-start-date"
                    type="date"
                    value={editTourneyStartDate}
                    onChange={(e) => {
                      const val = e.target.value
                      setEditTourneyStartDate(val)
                      if (!editTourneyEndDate || editTourneyEndDate < val) {
                        setEditTourneyEndDate(val)
                      }
                    }}
                    onClick={(e) => {
                      if (e.target && typeof e.target.showPicker === 'function') {
                        e.target.showPicker()
                      }
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-tourney-end-date">Fecha de Fin *</label>
                  <input
                    id="edit-tourney-end-date"
                    type="date"
                    min={editTourneyStartDate || undefined}
                    value={editTourneyEndDate}
                    onChange={(e) => setEditTourneyEndDate(e.target.value)}
                    onClick={(e) => {
                      if (e.target && typeof e.target.showPicker === 'function') {
                        e.target.showPicker()
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {editTourneyStartDate && (
                <div className="date-preview-pill">
                  <Calendar size={13} />
                  <span>
                    Fecha de Competencia: <strong>{formatTournamentDates(editTourneyStartDate, editTourneyEndDate || editTourneyStartDate)}</strong>
                  </span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-tourney-place">Lugar / Sede *</label>
                <input
                  id="edit-tourney-place"
                  type="text"
                  placeholder="Ej: Club Lawn Tennis de la Exposición"
                  value={editTourneyPlace}
                  onChange={(e) => setEditTourneyPlace(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="edit-tourney-price">Precio de Inscripción (S/ PEN) *</label>
                  <input
                    id="edit-tourney-price"
                    type="number"
                    min="10"
                    step="5"
                    placeholder="100"
                    value={editTourneyPrice}
                    onChange={(e) => setEditTourneyPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-tourney-level">Nivel del Torneo</label>
                  <select
                    id="edit-tourney-level"
                    value={editTourneyLevel}
                    onChange={(e) => setEditTourneyLevel(e.target.value)}
                  >
                    <option value="Nacional">Nacional</option>
                    <option value="Regional">Regional</option>
                    <option value="Internacional">Internacional</option>
                    <option value="Master">Master</option>
                    <option value="Amateur">Amateur</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Modalidad / Formato del Torneo</label>
                <div className="modality-switch-row-modal">
                  <div
                    className="modality-toggle-control"
                    onClick={() => setEditTourneyModality(editTourneyModality === 'dobles' ? 'singles' : 'dobles')}
                    title="Clic para cambiar entre Singles y Dúo"
                  >
                    <span className={`modality-option-label ${editTourneyModality !== 'dobles' ? 'active' : ''}`}>
                      Singles
                    </span>
                    <div className={`modality-switch-pill ${editTourneyModality === 'dobles' ? 'is-duo' : 'is-singles'}`}>
                      <div className="modality-switch-knob" />
                    </div>
                    <span className={`modality-option-label ${editTourneyModality === 'dobles' ? 'active' : ''}`}>
                      Dúo
                    </span>
                  </div>
                  <span className="modality-hint-text">
                    {editTourneyModality === 'dobles' ? '🏸 Modalidad en Parejas / Dobles' : '🎾 Modalidad Individual (1 vs 1)'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-tourney-img">Imagen de Portada (500x500 px)</label>
                {(editTourneyImage || editTourney.image) && (
                  <div className="tourney-img-preview-box">
                    <img src={editTourneyImage || editTourney.image} alt="Vista previa 500x500" />
                    <span className="preview-overlay-badge">500x500 px</span>
                  </div>
                )}
                <input
                  id="edit-tourney-img"
                  type="text"
                  placeholder="URL de imagen https://..."
                  value={editTourneyImage}
                  onChange={(e) => setEditTourneyImage(e.target.value)}
                />
                <label className="btn-file-upload full-width" style={{ marginTop: '6px' }}>
                  <Camera size={14} /> Subir archivo desde mi computadora (500x500 px)
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleTourneyImageFile(e.target.files[0], true)}
                  />
                </label>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditTourney(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-lime">
                  <Save size={16} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
