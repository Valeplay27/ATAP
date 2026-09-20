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
  LogIn,
  LogOut,
  Eye,
  Check,
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Layers,
  X,
  GripVertical,
  Newspaper,
  FileText,
  Star,
  Lock,
  ScrollText,
  UserPlus,
  UserCheck,
  PhoneCall,
  MessageSquare,
  MapPin,
  Mail,
  Zap
} from 'lucide-react'
import {
  getTournaments,
  updateTournamentPrice,
  updateRegistrationStatus,
  generateTournamentBracket,
  recordMatchResult,
  recordByeMatch,
  getRanking,
  updatePlayerAvatar,
  getSiteImages,
  saveSiteImage,
  saveHeroSlides,
  createTournament,
  deleteTournament,
  updateTournament,
  updateTournamentModality,
  updateTournamentStatus,
  addTournamentResult,
  updateTournamentResult,
  deleteTournamentResult,
  getSponsors,
  saveSponsors,
  addSponsor,
  updateSponsor,
  deleteSponsor,
  createDefaultGroups,
  generateGroupMatches,
  generateKnockoutStructure,
  saveManualFixture,
  OFFICIAL_CATEGORIES,
  ALL_OFFICIAL_CATEGORIES,
  normalizeCategory,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  toggleFeatureNews,
  quickCreateTournamentPlayer,
  isUserProfileIncomplete,
  getActiveSeasonYear,
  getAvailableSeasons,
  closeAnnualSeason,
  getSeasonsArchive,
  getPoliciesAndRules,
  savePoliciesAndRules,
  resetPoliciesAndRules,
  getRegisteredUsers,
  saveRegisteredUser,
  deleteRegisteredUser,
  addPlayerToTournamentBank,
  maskDni,
  getHomeBanners,
  saveHomeBanners,
  getContactInfo,
  saveContactInfo,
  resetContactInfo,
  getAssetUrl,
  handleImageFallback
} from '../../services/atapStorage'
import { api, playerApi, tournamentApi, rankingApi, contentApi } from '../../services/api'
import TournamentBracket from '../../components/TournamentBracket/TournamentBracket'
import { Link } from 'react-router-dom'
import './Admin.css'

export default function Admin({ usuario, onLoginSuccess, onOpenLogin, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tournaments, setTournaments] = useState([])
  const [ranking, setRanking] = useState([])
  const [siteImages, setSiteImages] = useState(() => getSiteImages())
  const [heroSlides, setHeroSlides] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [sponsorUrlInputs, setSponsorUrlInputs] = useState({})
  const [homeBanners, setHomeBanners] = useState(() => getHomeBanners())
  const [homeBannerInputs, setHomeBannerInputs] = useState(() => getHomeBanners())

  // Selected tournament for tabs
  const [selectedTourneyId, setSelectedTourneyId] = useState('')

  // Notification toast
  const [toastMessage, setToastMessage] = useState('')

  // Annual Seasons management state
  const [activeSeasonYear, setActiveSeasonYear] = useState(() => getActiveSeasonYear())
  const [seasonsList, setSeasonsList] = useState(() => getAvailableSeasons())
  const [showCloseSeasonModal, setShowCloseSeasonModal] = useState(false)
  const [isClosingSeason, setIsClosingSeason] = useState(false)

  // Policies and Rules state
  const [policiesList, setPoliciesList] = useState(() => getPoliciesAndRules())
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0)
  const [isSavingPolicies, setIsSavingPolicies] = useState(false)
  const [hasPoliciesChanges, setHasPoliciesChanges] = useState(false)

  // Contact and Support info state
  const [contactInfo, setContactInfo] = useState(() => getContactInfo())
  const [contactInputs, setContactInputs] = useState(() => getContactInfo())
  const [isSavingContact, setIsSavingContact] = useState(false)

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
  const [newTourneyCategories, setNewTourneyCategories] = useState([
    { id: 'cat-4', nombre: '4ta', cupos: 16 },
    { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
    { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
    { id: 'cat-6', nombre: '6ta', cupos: 32 }
  ])

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
  const [editTourneyCategories, setEditTourneyCategories] = useState([])
  const [newTourneyStatus, setNewTourneyStatus] = useState('inscripciones_abiertas')
  const [editTourneyStatus, setEditTourneyStatus] = useState('inscripciones_abiertas')

  // Results Manager state (for tournament results loading)
  const [selectedCategoryForResult, setSelectedCategoryForResult] = useState('')
  const [resultRound, setResultRound] = useState('Gran Final')
  const [resultPlayer1, setResultPlayer1] = useState('')
  const [resultPlayer2, setResultPlayer2] = useState('')
  const [resultSet1, setResultSet1] = useState('6-4')
  const [resultSet2, setResultSet2] = useState('6-3')
  const [resultSet3, setResultSet3] = useState('')
  const [resultWinner, setResultWinner] = useState('')
  const [resultPoints, setResultPoints] = useState(250)
  const [resultSumarRanking, setResultSumarRanking] = useState(true)
  const [resultObservations, setResultObservations] = useState('')
  const [editingResultId, setEditingResultId] = useState(null)

  // Manual Draw / Group Stage state
  const [manualGroups, setManualGroups] = useState([])
  const [draggedPlayer, setDraggedPlayer] = useState(null)
  const [playoffSize, setPlayoffSize] = useState(4)
  const [byeModalData, setByeModalData] = useState(null)
  const [byePointsAward, setByePointsAward] = useState(100)

  // News / Community state
  const [newsList, setNewsList] = useState([])
  const [showNewsModal, setShowNewsModal] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [newsFilterCategory, setNewsFilterCategory] = useState('todas')
  const [newsFormatType, setNewsFormatType] = useState('imagen') // 'imagen' | 'texto'
  const [newsTitle, setNewsTitle] = useState('')
  const [newsCategory, setNewsCategory] = useState('Torneos')
  const [newsSummary, setNewsSummary] = useState('')
  const [newsContent, setNewsContent] = useState('')
  const [newsImage, setNewsImage] = useState('')
  const [newsAuthor, setNewsAuthor] = useState('Prensa ATAP')
  const [newsDate, setNewsDate] = useState('')
  const [newsFeatured, setNewsFeatured] = useState(false)

  // Quick Player Registration for Finalized Tournaments (Only Name and DNI)
  const [showQuickPlayerModal, setShowQuickPlayerModal] = useState(false)
  const [quickPlayerName, setQuickPlayerName] = useState('')
  const [quickPlayerDni, setQuickPlayerDni] = useState('')
  const [quickPlayerCategory, setQuickPlayerCategory] = useState('4ta')

  // Central Players Bank Management (CRUD Tab)
  const [registeredUsersList, setRegisteredUsersList] = useState(() => getRegisteredUsers())
  const [playerFormData, setPlayerFormData] = useState({
    originalDni: '',
    nombre: '',
    dni: '',
    categoria: '4ta',
    puntos: 0,
    titulosGanados: 0,
    telefono: '',
    email: '',
    instagram: '',
    image: '/assets/logo.png'
  })
  const [isEditingExistingPlayer, setIsEditingExistingPlayer] = useState(false)
  const [playerTableSearch, setPlayerTableSearch] = useState('')
  const [playerTableCategory, setPlayerTableCategory] = useState('todas')
  const [playerActionNotice, setPlayerActionNotice] = useState(null)

  // Bank of Participants Add Player Modal (for Sorteos & Tournaments)
  const [showBankAddModal, setShowBankAddModal] = useState(false)
  const [bankModalTargetField, setBankModalTargetField] = useState('bank') // 'bank' | 'player1' | 'player2'
  const [bankModalSearch, setBankModalSearch] = useState('')
  const [bankModalCategoryFilter, setBankModalCategoryFilter] = useState('todas')

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
    setRegisteredUsersList(getRegisteredUsers())

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

    const sp = getSponsors()
    setSponsors(sp)
    const spInputs = {}
    sp.forEach((s) => {
      spInputs[s.id] = s.logo || ''
    })
    setSponsorUrlInputs(spInputs)

    setNewsList(getNews())
    setActiveSeasonYear(getActiveSeasonYear())
    setSeasonsList(getAvailableSeasons())
    setPoliciesList(getPoliciesAndRules())

    const hb = getHomeBanners()
    setHomeBanners(hb)
    setHomeBannerInputs(hb)

    const ci = getContactInfo()
    setContactInfo(ci)
    setContactInputs(ci)
  }

  function handleSaveContactSettings() {
    setIsSavingContact(true)
    try {
      const saved = saveContactInfo(contactInputs)
      setContactInfo(saved)
      setContactInputs(saved)
      showToast('¡Información de contacto, sedes y atención guardada exitosamente!')
    } catch (e) {
      console.error('Error saving contact settings:', e)
      showToast('Error al guardar la información de contacto.')
    } finally {
      setIsSavingContact(false)
    }
  }

  function handleResetContactSettings() {
    if (window.confirm('¿Estás seguro de restablecer los datos de contacto y sedes a los valores oficiales predeterminados?')) {
      const reset = resetContactInfo()
      setContactInfo(reset)
      setContactInputs(reset)
      showToast('Datos de contacto restablecidos a los valores oficiales.')
    }
  }

  function handleUpdatePolicyField(index, field, value) {
    setPoliciesList((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
    setHasPoliciesChanges(true)
  }

  function handleSaveAllPolicies() {
    setIsSavingPolicies(true)
    try {
      const saved = savePoliciesAndRules(policiesList)
      setPoliciesList(saved)
      setHasPoliciesChanges(false)
      showToast('Políticas & Reglas oficiales guardadas y sincronizadas exitosamente.')
    } catch (err) {
      console.error('Error saving policies:', err)
      showToast('Error al guardar políticas y reglas.')
    } finally {
      setIsSavingPolicies(false)
    }
  }

  function handleResetDefaultPolicies() {
    const confirm = window.confirm(
      '¿Deseas restaurar las 6 secciones de Políticas y Reglas a los textos oficiales originales redactados por ATAP? Esto reemplazará cualquier cambio actual.'
    )
    if (!confirm) return
    const defaults = resetPoliciesAndRules()
    setPoliciesList(defaults)
    setHasPoliciesChanges(false)
    showToast('Se restablecieron los textos oficiales de Políticas y Reglas.')
  }

  function handleConfirmCloseSeason() {
    setIsClosingSeason(true)
    try {
      const nextYear = String(Number(activeSeasonYear) + 1)
      const res = closeAnnualSeason(activeSeasonYear, nextYear)
      if (res && res.success) {
        showToast(res.message || `Temporada ${activeSeasonYear} cerrada con éxito. La Temporada ${nextYear} ha iniciado en 0 pts.`)
        setShowCloseSeasonModal(false)
        setActiveSeasonYear(getActiveSeasonYear())
        setSeasonsList(getAvailableSeasons())
        setRanking(getRanking())
      } else {
        showToast('Error al cerrar la temporada: ' + (res?.error || 'Intenta nuevamente'))
      }
    } catch (err) {
      console.error('Error closing season:', err)
      showToast('Ocurrió un error inesperado al procesar el cierre de temporada.')
    } finally {
      setIsClosingSeason(false)
    }
  }

  useEffect(() => {
    loadData()

    function handleDataUpdate() {
      loadData()
    }

    window.addEventListener('atap_data_updated', handleDataUpdate)
    return () => window.removeEventListener('atap_data_updated', handleDataUpdate)
  }, [])

  // Verificación estricta: ÚNICAMENTE vladimiryt18@gmail.com es el administrador oficial
  const isAdminAuthorized = Boolean(
    usuario &&
      usuario.email?.toLowerCase() === 'vladimiryt18@gmail.com'
  )

  function handleOpenAdminLogin() {
    if (onOpenLogin) {
      onOpenLogin()
    } else {
      window.dispatchEvent(new CustomEvent('atap_open_login'))
    }
  }

  // Si no está autenticado como administrador oficial: Pantalla de Acceso Restringido conectada al Login Normal
  if (!isAdminAuthorized) {
    return (
      <main className="page-content admin-restricted-page">
        <div className="admin-restricted-card panel">
          <div className="restricted-badge-icon">
            <ShieldCheck size={42} color="#00CFA0" />
          </div>
          <span className="restricted-kicker">Panel Administrativo</span>
          <h1>Acceso Restringido</h1>
          <p className="restricted-subtitle">
            El Dashboard de Control de ATAP está reservado exclusivamente para la administración.
            Para acceder debes iniciar sesión con la cuenta oficial autorizada.
          </p>

          {usuario ? (
            <div className="restricted-current-user-box">
              <AlertTriangle size={18} color="#D97706" />
              <div className="restricted-user-info">
                <p className="current-user-title">
                  Sesión activa: <strong>{usuario.nombre || usuario.email}</strong>
                </p>
                <p className="current-user-desc">
                  Esta cuenta no posee privilegios de administrador. Inicia sesión con la cuenta oficial autorizada.
                </p>
              </div>
            </div>
          ) : (
            <div className="restricted-info-pill">
              <span>🔒 Requiere iniciar sesión como Administrador</span>
            </div>
          )}

          <div className="restricted-actions-wrap">
            <button
              type="button"
              className="button button-lime restricted-login-btn"
              onClick={handleOpenAdminLogin}
            >
              <LogIn size={18} />
              <span>Iniciar Sesión</span>
            </button>

            <Link to="/" className="back-home-link">
              ← Volver al sitio principal
            </Link>
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

  // Sync manualGroups and playoffSize with currentTourney
  useEffect(() => {
    if (!currentTourney) return
    if (currentTourney.bracket?.faseGrupos && currentTourney.bracket.faseGrupos.length > 0) {
      setManualGroups(JSON.parse(JSON.stringify(currentTourney.bracket.faseGrupos)))
    } else {
      setManualGroups(createDefaultGroups(currentTourney))
    }
    if (currentTourney.bracket?.size) {
      setPlayoffSize(Number(currentTourney.bracket.size))
    }
  }, [selectedTourneyId, currentTourney?.id])

  // Approved players for the active tournament
  const approvedPlayers = (currentTourney?.inscripciones || []).filter((i) => i.estadoPago === 'aprobado')

  // Helper: Find which group a player is in
  function getPlayerAssignedGroup(playerId) {
    for (const g of manualGroups) {
      if ((g.participantes || []).some((p) => p.id === playerId)) {
        return g
      }
    }
    return null
  }

  function handleDragStartPlayer(e, player) {
    setDraggedPlayer(player)
    e.dataTransfer.setData('text/plain', player.id)
  }

  function handleDropPlayerToGroup(e, targetGroupId) {
    e.preventDefault()
    const playerId = e.dataTransfer.getData('text/plain') || draggedPlayer?.id
    if (!playerId) return
    assignPlayerToGroup(playerId, targetGroupId)
    setDraggedPlayer(null)
  }

  function assignPlayerToGroup(playerId, targetGroupId) {
    const player = approvedPlayers.find((p) => p.id === playerId)
    if (!player) return

    setManualGroups((prev) => {
      // Remove player from any existing group
      const cleaned = prev.map((g) => ({
        ...g,
        participantes: (g.participantes || []).filter((p) => p.id !== playerId)
      }))

      // Add to target group
      return cleaned.map((g) => {
        if (g.id === targetGroupId) {
          return {
            ...g,
            participantes: [
              ...(g.participantes || []),
              {
                id: player.id,
                nombre: player.nombre,
                categoria: player.categoria,
                dni: player.dni
              }
            ]
          }
        }
        return g
      })
    })

    const targetGroup = manualGroups.find((g) => g.id === targetGroupId)
    showToast(`🎾 ${player.nombre} asignado a ${targetGroup?.nombre || 'grupo'}.`)
  }

  function handleRemovePlayerFromGroup(playerId, groupId) {
    setManualGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            participantes: (g.participantes || []).filter((p) => p.id !== playerId)
          }
        }
        return g
      })
    )
    showToast('Jugador retirado del grupo y devuelto al banco de aprobados.')
  }

  function handleRenameGroup(groupId, newName) {
    if (!newName || !newName.trim()) return
    setManualGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, nombre: newName.trim() } : g))
    )
  }

  function handleAddManualGroup() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const nextLetter = letters[manualGroups.length] || String(manualGroups.length + 1)
    const newGroup = {
      id: 'grupo-' + nextLetter.toLowerCase() + '-' + Date.now().toString().slice(-4),
      nombre: `Grupo ${nextLetter}`,
      participantes: [],
      partidos: []
    }
    setManualGroups((prev) => [...prev, newGroup])
    showToast(`¡Grupo ${nextLetter} agregado! Ahora tienes ${manualGroups.length + 1} grupos disponibles.`)
  }

  function handleRemoveManualGroup(groupId) {
    if (manualGroups.length <= 1) {
      showToast('Debe mantenerse al menos un grupo.')
      return
    }
    setManualGroups((prev) => prev.filter((g) => g.id !== groupId))
    showToast('Grupo eliminado y sus participantes devueltos al banco de disponibles.')
  }

  function handleSaveManualGroups() {
    if (!currentTourney) return
    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups
    })
    if (res.error) {
      showToast(res.error)
    } else {
      setTournaments(getTournaments())
      showToast('¡Fase de grupos y asignaciones guardadas con éxito!')
    }
  }

  function handleGenerateMatchesForGroups() {
    if (!currentTourney) return
    const updatedGroups = manualGroups.map((g) => {
      const matches = generateGroupMatches(g.participantes, g.id, g.nombre)
      return { ...g, partidos: matches }
    })
    setManualGroups(updatedGroups)
    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: updatedGroups
    })
    if (res.error) {
      showToast(res.error)
    } else {
      setTournaments(getTournaments())
      showToast('¡Partidos de fase de grupos generados con éxito! Ahora puedes cargar marcadores.')
    }
  }

  // PLAYOFF & KNOCKOUT BRACKET HANDLERS (Connected with manualGroups)
  const allGroupPlayers = manualGroups.flatMap((g) =>
    (g.participantes || []).map((p) => ({
      ...p,
      grupoId: g.id,
      grupoNombre: g.nombre
    }))
  )

  function handleChangePlayoffSize(newSize) {
    const sizeNum = Number(newSize) || 4
    setPlayoffSize(sizeNum)
    const newRounds = generateKnockoutStructure(sizeNum)
    if (!currentTourney) return
    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups,
      rounds: newRounds,
      size: sizeNum
    })
    if (!res.error) {
      setTournaments(getTournaments())
      const sizeLabels = {
        4: 'Semifinales',
        8: 'Cuartos de final',
        16: 'Octavos de final',
        32: 'Dieciseisavos de final',
        64: '32-avos de final'
      }
      showToast(`Estructura de eliminatorias cambiada a ${sizeNum} clasificados (${sizeLabels[sizeNum] || 'Eliminatorias'}).`)
    }
  }

  function handleAssignPlayerToMatchSlot(matchId, slotNum, playerId) {
    if (!currentTourney) return

    const currentRounds = currentTourney.bracket?.rounds?.length
      ? JSON.parse(JSON.stringify(currentTourney.bracket.rounds))
      : generateKnockoutStructure(playoffSize)

    const firstRound = currentRounds[0]
    if (!firstRound) return

    const targetMatch = (firstRound.matches || []).find((m) => m.id === matchId)
    if (!targetMatch) return

    // CASO ESPECIAL: ASIGNACIÓN DE BYE (PASE LIBRE)
    if (playerId === '__BYE__' || playerId === 'bye') {
      const oppositePlayer = slotNum === 1 ? targetMatch.player2 : targetMatch.player1
      const byeData = {
        id: 'bye',
        name: 'BYE',
        nombre: 'BYE',
        categoria: 'Pase Libre',
        grupoNombre: 'Pase Libre',
        isBye: true
      }

      if (slotNum === 1) targetMatch.player1 = byeData
      else targetMatch.player2 = byeData

      // Si la casilla contraria ya tiene un jugador real, abrir modal para confirmar victoria por BYE y puntos
      if (oppositePlayer && !oppositePlayer.isBye && oppositePlayer.name !== 'BYE') {
        const oppSlot = slotNum === 1 ? 2 : 1
        setByeModalData({
          match: targetMatch,
          winnerSlot: oppSlot,
          byeSlot: slotNum,
          player: oppositePlayer
        })
        setByePointsAward(100)
        return
      }

      // Si la otra casilla aún está vacía, guardar la casilla como BYE
      targetMatch.score = ''
      targetMatch.winnerSlot = null
      targetMatch.winnerName = null
      targetMatch.isBye = false

      const res = saveManualFixture(currentTourney.id, {
        faseGrupos: manualGroups,
        rounds: currentRounds,
        size: playoffSize
      })
      if (!res.error) {
        setTournaments(getTournaments())
        showToast(`⚡ Casilla ${slotNum} del Match #${targetMatch.matchNum} asignada como BYE (Pase Libre).`)
      }
      return
    }

    let foundPlayer = null
    let foundGroup = null
    for (const g of manualGroups) {
      const p = (g.participantes || []).find((x) => x.id === playerId)
      if (p) {
        foundPlayer = p
        foundGroup = g
        break
      }
    }
    if (!foundPlayer) return

    const norm = (str) => (str || '').trim().toLowerCase()
    const pId = foundPlayer.id
    const pName = norm(foundPlayer.nombre)
    const pDni = (foundPlayer.dni || '').toString().trim()

    const isMatch = (target) => {
      if (!target) return false
      if (target.isBye || target.id === 'bye' || target.name === 'BYE') return false
      if (pId && target.id && pId === target.id) return true
      if (pDni && target.dni && pDni === (target.dni || '').toString().trim()) return true
      if (pName && target.name && pName === norm(target.name)) return true
      return false
    }

    // REGLA 1: No permitir escoger el mismo jugador en el mismo campo / partido
    const oppositePlayer = slotNum === 1 ? targetMatch.player2 : targetMatch.player1
    if (oppositePlayer && isMatch(oppositePlayer)) {
      showToast(`⚠️ No puedes asignar a "${foundPlayer.nombre}" contra sí mismo en el Match #${targetMatch.matchNum}.`)
      return
    }

    // REGLA 2: No permitir escoger si ya jugó o ya está asignado en otra llave de la primera ronda
    for (const m of (firstRound.matches || [])) {
      if (m.id === matchId) continue

      if (isMatch(m.player1) || isMatch(m.player2)) {
        if (m.winnerSlot != null) {
          showToast(`⚠️ "${foundPlayer.nombre}" ya jugó en el Match #${m.matchNum} de esta ronda y no puede reingresar.`)
        } else {
          showToast(`⚠️ "${foundPlayer.nombre}" ya está asignado en el Match #${m.matchNum}. Quítalo de esa casilla si deseas moverlo.`)
        }
        return
      }
    }

    const playerData = {
      id: foundPlayer.id,
      name: foundPlayer.nombre,
      categoria: foundPlayer.categoria,
      dni: foundPlayer.dni,
      grupoNombre: foundGroup?.nombre || ''
    }

    if (slotNum === 1) {
      targetMatch.player1 = playerData
    } else {
      targetMatch.player2 = playerData
    }

    // Si la casilla contraria ya es BYE, abrir modal para confirmar puntos y victoria por BYE!
    if (oppositePlayer && (oppositePlayer.isBye || oppositePlayer.name === 'BYE')) {
      setByeModalData({
        match: targetMatch,
        winnerSlot: slotNum,
        byeSlot: slotNum === 1 ? 2 : 1,
        player: playerData
      })
      setByePointsAward(100)
      return
    }

    targetMatch.score = ''
    targetMatch.winnerSlot = null
    targetMatch.winnerName = null

    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups,
      rounds: currentRounds,
      size: playoffSize
    })
    if (!res.error) {
      setTournaments(getTournaments())
      showToast(`🎾 ${foundPlayer.nombre} (${foundGroup?.nombre || 'Grupo'}) asignado al Match #${targetMatch.matchNum}.`)
    }
  }

  function handleOpenByeModal(match, byeSlot) {
    if (!currentTourney || !match) return
    const targetSlot = Number(byeSlot) || 2
    const winnerSlot = targetSlot === 1 ? 2 : 1
    const realPlayer = winnerSlot === 1 ? match.player1 : match.player2
    if (!realPlayer || realPlayer.isBye || realPlayer.name === 'BYE') {
      showToast('⚠️ Asigna primero al jugador en la casilla contraria para otorgarle la victoria por BYE.')
      return
    }
    setByeModalData({
      match,
      winnerSlot,
      byeSlot: targetSlot,
      player: realPlayer
    })
    setByePointsAward(100)
  }

  function handleConfirmBye() {
    if (!byeModalData || !currentTourney) return
    const { match, winnerSlot, player } = byeModalData
    const points = Math.max(0, parseInt(byePointsAward, 10) || 0)

    const res = recordByeMatch(currentTourney.id, match.id, winnerSlot, points)
    if (res.error) {
      showToast(res.error)
    } else {
      setTournaments(getTournaments())
      showToast(`¡Pase libre (BYE) asignado a ${player.name}! Avanzó a la siguiente ronda con +${points} pts de ranking.`)
      setByeModalData(null)
    }
  }

  function handleSwapMatchSlots(matchId) {
    if (!currentTourney) return
    const currentRounds = currentTourney.bracket?.rounds?.length
      ? JSON.parse(JSON.stringify(currentTourney.bracket.rounds))
      : generateKnockoutStructure(playoffSize)

    let updated = false
    for (const r of currentRounds) {
      const match = (r.matches || []).find((m) => m.id === matchId)
      if (match) {
        const temp = match.player1
        match.player1 = match.player2
        match.player2 = temp
        if (match.winnerSlot === 1) match.winnerSlot = 2
        else if (match.winnerSlot === 2) match.winnerSlot = 1
        updated = true
        break
      }
    }

    if (updated) {
      const res = saveManualFixture(currentTourney.id, {
        faseGrupos: manualGroups,
        rounds: currentRounds,
        size: playoffSize
      })
      if (!res.error) {
        setTournaments(getTournaments())
        showToast(`Posiciones de contrincantes intercambiadas en ${currentTourney.title} (P1 ⇅ P2).`)
      }
    }
  }

  function handleClearMatchSlot(matchId, slotNum) {
    if (!currentTourney) return
    const currentRounds = currentTourney.bracket?.rounds?.length
      ? JSON.parse(JSON.stringify(currentTourney.bracket.rounds))
      : generateKnockoutStructure(playoffSize)

    let updated = false
    for (const r of currentRounds) {
      const match = (r.matches || []).find((m) => m.id === matchId)
      if (match) {
        if (slotNum === 1) match.player1 = null
        else match.player2 = null
        match.score = ''
        match.winnerSlot = null
        match.winnerName = null
        match.isBye = false

        // Si este partido avanzó a un jugador a la siguiente ronda, retirarlo de la siguiente ronda
        if (match.nextMatchId) {
          for (const nextR of currentRounds) {
            const nextMatch = (nextR.matches || []).find((nm) => nm.id === match.nextMatchId)
            if (nextMatch && !nextMatch.winnerSlot) {
              if (match.nextSlot === 1) nextMatch.player1 = null
              else if (match.nextSlot === 2) nextMatch.player2 = null
            }
          }
        }

        updated = true
        break
      }
    }

    if (updated) {
      const res = saveManualFixture(currentTourney.id, {
        faseGrupos: manualGroups,
        rounds: currentRounds,
        size: playoffSize
      })
      if (!res.error) {
        setTournaments(getTournaments())
        showToast(`Casilla eliminatoria de ${currentTourney.title} vaciada.`)
      }
    }
  }

  function handleAutoPairKnockout() {
    if (!currentTourney) return
    if (allGroupPlayers.length < 2) {
      showToast(`Se necesitan al menos 2 jugadores asignados a los grupos de ${currentTourney.title} para armar las llaves.`)
      return
    }

    const currentRounds = generateKnockoutStructure(playoffSize)
    const firstRound = currentRounds[0]
    if (!firstRound || !firstRound.matches) return

    // Order seeds across groups: 1º from each group, then 2º from each group
    const activeGroups = manualGroups.filter((g) => (g.participantes || []).length > 0)
    const seeds = []
    
    // Top 1 from each group
    activeGroups.forEach((g) => {
      if (g.participantes[0]) {
        seeds.push({ ...g.participantes[0], grupoNombre: g.nombre })
      }
    })
    // Top 2 from each group
    activeGroups.forEach((g) => {
      if (g.participantes[1]) {
        seeds.push({ ...g.participantes[1], grupoNombre: g.nombre })
      }
    })
    // Remaining players if needed
    activeGroups.forEach((g) => {
      (g.participantes || []).slice(2).forEach((p) => {
        seeds.push({ ...p, grupoNombre: g.nombre })
      })
    })

    // Deduplicar para garantizar que ningún jugador se empareje contra sí mismo
    const seenSeedKeys = new Set()
    const uniqueSeeds = []
    for (const s of seeds) {
      const k = (s.id || s.nombre || '').toString().trim().toLowerCase()
      if (!seenSeedKeys.has(k)) {
        seenSeedKeys.add(k)
        uniqueSeeds.push(s)
      }
    }

    let seedIdx = 0
    firstRound.matches.forEach((m) => {
      if (uniqueSeeds[seedIdx]) {
        m.player1 = {
          id: uniqueSeeds[seedIdx].id,
          name: uniqueSeeds[seedIdx].nombre,
          categoria: uniqueSeeds[seedIdx].categoria,
          dni: uniqueSeeds[seedIdx].dni,
          grupoNombre: uniqueSeeds[seedIdx].grupoNombre
        }
        seedIdx++
      } else {
        m.player1 = null
      }

      if (uniqueSeeds[seedIdx]) {
        m.player2 = {
          id: uniqueSeeds[seedIdx].id,
          name: uniqueSeeds[seedIdx].nombre,
          categoria: uniqueSeeds[seedIdx].categoria,
          dni: uniqueSeeds[seedIdx].dni,
          grupoNombre: uniqueSeeds[seedIdx].grupoNombre
        }
        seedIdx++
      } else {
        m.player2 = null
      }
    })

    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups,
      rounds: currentRounds,
      size: playoffSize
    })
    if (!res.error) {
      setTournaments(getTournaments())
      showToast(`¡Auto-emparejamiento cruzado de grupos aplicado con éxito en ${currentTourney.title}!`)
    }
  }

  function handleRandomPairKnockout() {
    if (!currentTourney) return
    if (allGroupPlayers.length < 2) {
      showToast(`Se necesitan al menos 2 jugadores en los grupos de ${currentTourney.title} para realizar el sorteo aleatorio.`)
      return
    }

    const currentRounds = generateKnockoutStructure(playoffSize)
    const firstRound = currentRounds[0]
    if (!firstRound || !firstRound.matches) return

    // Deduplicar lista de jugadores de grupos
    const seenGroupKeys = new Set()
    const uniqueGroupPlayers = []
    for (const p of allGroupPlayers) {
      const k = (p.id || p.nombre || '').toString().trim().toLowerCase()
      if (!seenGroupKeys.has(k)) {
        seenGroupKeys.add(k)
        uniqueGroupPlayers.push(p)
      }
    }

    const shuffled = [...uniqueGroupPlayers].sort(() => Math.random() - 0.5)

    let idx = 0
    firstRound.matches.forEach((m) => {
      if (shuffled[idx]) {
        m.player1 = {
          id: shuffled[idx].id,
          name: shuffled[idx].nombre,
          categoria: shuffled[idx].categoria,
          dni: shuffled[idx].dni,
          grupoNombre: shuffled[idx].grupoNombre
        }
        idx++
      } else {
        m.player1 = null
      }

      if (shuffled[idx]) {
        m.player2 = {
          id: shuffled[idx].id,
          name: shuffled[idx].nombre,
          categoria: shuffled[idx].categoria,
          dni: shuffled[idx].dni,
          grupoNombre: shuffled[idx].grupoNombre
        }
        idx++
      } else {
        m.player2 = null
      }
    })

    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups,
      rounds: currentRounds,
      size: playoffSize
    })
    if (!res.error) {
      setTournaments(getTournaments())
      showToast(`¡Sorteo aleatorio de llaves generado exitosamente en ${currentTourney.title}!`)
    }
  }

  function handleClearAllKnockout() {
    if (!currentTourney) return
    const cleanRounds = generateKnockoutStructure(playoffSize)
    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups,
      rounds: cleanRounds,
      size: playoffSize
    })
    if (!res.error) {
      setTournaments(getTournaments())
      showToast(`Llaves eliminatorias de ${currentTourney.title} vaciadas.`)
    }
  }

  function handleSavePlayoffBracket() {
    if (!currentTourney) return
    const currentRounds = currentTourney.bracket?.rounds?.length
      ? currentTourney.bracket.rounds
      : generateKnockoutStructure(playoffSize)

    const res = saveManualFixture(currentTourney.id, {
      faseGrupos: manualGroups,
      rounds: currentRounds,
      size: playoffSize
    })
    if (res.error) {
      showToast(res.error)
    } else {
      setTournaments(getTournaments())
      showToast(`¡Cuadro Eliminatorio oficial de ${currentTourney.title} guardado y publicado en Torneos!`)
    }
  }

  function handleResetGroups() {
    setManualGroups(createDefaultGroups(currentTourney))
    showToast('Grupos restablecidos. Todos los jugadores volvieron al banco de disponibles.')
  }

  // Category Configuration Handlers for Modals
  function handleAddCategory(isEdit = false) {
    const newCat = {
      id: 'cat-' + Date.now(),
      nombre: `Categoría ${(isEdit ? editTourneyCategories.length : newTourneyCategories.length) + 1}`,
      cupos: 16
    }
    if (isEdit) {
      setEditTourneyCategories((prev) => [...prev, newCat])
    } else {
      setNewTourneyCategories((prev) => [...prev, newCat])
    }
  }

  function handleUpdateCategory(idx, field, value, isEdit = false) {
    if (isEdit) {
      setEditTourneyCategories((prev) => {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], [field]: field === 'cupos' ? Number(value) || 0 : value }
        return copy
      })
    } else {
      setNewTourneyCategories((prev) => {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], [field]: field === 'cupos' ? Number(value) || 0 : value }
        return copy
      })
    }
  }

  function handleDeleteCategory(idx, isEdit = false) {
    if (isEdit) {
      if (editTourneyCategories.length <= 1) {
        showToast('Debe existir al menos una categoría en el torneo.')
        return
      }
      setEditTourneyCategories((prev) => prev.filter((_, i) => i !== idx))
    } else {
      if (newTourneyCategories.length <= 1) {
        showToast('Debe existir al menos una categoría en el torneo.')
        return
      }
      setNewTourneyCategories((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  // Handler: Save Match Score & Advance Winner
  function handleSaveScore(e) {
    e.preventDefault()
    if (!scoreModalMatch || !currentTourney) return

    const p1 = scoreModalMatch.player1
    const p2 = scoreModalMatch.player2
    const norm = (str) => (str || '').trim().toLowerCase()

    if (
      p1 && p2 && !p1.isBye && !p2.isBye && p1.name !== 'BYE' && p2.name !== 'BYE' &&
      ((p1.id && p2.id && p1.id === p2.id) ||
       (p1.name && p2.name && norm(p1.name) === norm(p2.name)) ||
       (p1.dni && p2.dni && (p1.dni + '').trim() === (p2.dni + '').trim()))
    ) {
      showToast('⚠️ No es posible guardar el marcador: ambos contrincantes son el mismo jugador. Corrige la llave antes de continuar.')
      return
    }

    const isByeMode = set1Score === 'BYE' || scoreModalMatch.isBye || p1?.isBye || p2?.isBye
    if (isByeMode) {
      const winner = winnerSlot === 1 ? p1 : p2
      const res = recordByeMatch(
        currentTourney.id,
        scoreModalMatch.id,
        winnerSlot,
        Number(pointsAwardInput) || 0
      )
      if (res.error) {
        showToast(res.error)
      } else {
        setTournaments(getTournaments())
        showToast(`¡Victoria por BYE guardada para ${winner?.name || 'el ganador'}! Avanzó a la siguiente ronda con +${pointsAwardInput} pts.`)
        setScoreModalMatch(null)
      }
      return
    }

    const parts = [set1Score, set2Score, set3Score].filter(Boolean)
    const scoreStr = parts.join(', ') || '6-4, 6-3'

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
      setTournaments(getTournaments())
      showToast('¡Marcador guardado! El ganador avanzó y se sumaron los puntos al ranking.')
      setScoreModalMatch(null)
    }
  }

  // Handler: Open Score Modal from bracket
  function handleOpenScoreModal(match) {
    setScoreModalMatch(match)
    if (match.player1?.isBye || match.player1?.name === 'BYE') {
      setWinnerSlot(2)
      setSet1Score('BYE')
      setSet2Score('')
      setSet3Score('')
    } else if (match.player2?.isBye || match.player2?.name === 'BYE') {
      setWinnerSlot(1)
      setSet1Score('BYE')
      setSet2Score('')
      setSet3Score('')
    } else if (match.score === 'BYE' || match.isBye) {
      setWinnerSlot(match.winnerSlot || 1)
      setSet1Score('BYE')
      setSet2Score('')
      setSet3Score('')
    } else {
      setWinnerSlot(match.winnerSlot || 1)
      setSet1Score('6-4')
      setSet2Score('6-3')
      setSet3Score('')
    }
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
  async function handleImageFileUpload(key, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen excede el límite de 5 MB para no sobrecargar la base de datos.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        setSiteImageInputs((prev) => ({ ...prev, [key]: res.url }))
        saveSiteImage(key, res.url)
        contentApi.saveSetting(`img_${key}`, res.url).catch(() => {})
        showToast('Imagen subida al servidor y guardada con éxito.')
        return
      }
    } catch (e) {
      console.warn('Upload image to server failed, using local reader:', e)
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setSiteImageInputs((prev) => ({ ...prev, [key]: dataUrl }))
      saveSiteImage(key, dataUrl)
      showToast('Imagen cargada y guardada con éxito.')
    }
    reader.readAsDataURL(file)
  }

  // Sponsor Handlers
  async function handleSponsorFileUpload(sponsorId, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('El logo del auspiciador no puede superar los 5 MB.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        setSponsorUrlInputs((prev) => ({ ...prev, [sponsorId]: res.url }))
        const updated = updateSponsor(sponsorId, res.url)
        setSponsors(updated)
        contentApi.saveSponsor({ id: sponsorId, logo_url: res.url }).catch(() => {})
        showToast('¡Logo de auspiciador subido al servidor con éxito!')
        return
      }
    } catch (e) {
      console.warn('Upload sponsor logo failed, using local reader:', e)
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setSponsorUrlInputs((prev) => ({ ...prev, [sponsorId]: dataUrl }))
      const updated = updateSponsor(sponsorId, dataUrl)
      setSponsors(updated)
      showToast('¡Logo de auspiciador cargado y guardado con éxito!')
    }
    reader.readAsDataURL(file)
  }

  function handleSaveSponsorUrl(sponsorId) {
    const url = (sponsorUrlInputs[sponsorId] || '').trim()
    const updated = updateSponsor(sponsorId, url)
    setSponsors(updated)
    showToast('¡Logo de auspiciador guardado correctamente!')
  }

  function handleClearSponsorLogo(sponsorId) {
    setSponsorUrlInputs((prev) => ({ ...prev, [sponsorId]: '' }))
    const updated = updateSponsor(sponsorId, '')
    setSponsors(updated)
    showToast('Logo removido del espacio de auspiciador.')
  }

  function handleAddSponsor() {
    const updated = addSponsor('', `Auspiciador ${sponsors.length + 1}`)
    setSponsors(updated)
    showToast(`¡Espacio #${updated.length} para auspiciador creado con éxito!`)
  }

  function handleDeleteSponsor(sponsorId) {
    const updated = deleteSponsor(sponsorId)
    setSponsors(updated)
    showToast('Espacio de auspiciador eliminado.')
  }

  // Home Banners Handlers
  async function handleBannerFileUpload(section, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no puede superar los 5 MB para no sobrecargar el almacenamiento.')
      return
    }
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        setHomeBannerInputs((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            image: res.url
          }
        }))
        showToast('Imagen subida con éxito al servidor. Haz clic en Guardar para confirmar.')
        return
      }
    } catch (e) {
      console.warn('Upload banner image failed, using local reader:', e)
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setHomeBannerInputs((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          image: dataUrl
        }
      }))
      showToast('Imagen cargada localmente. Haz clic en Guardar para confirmar.')
    }
    reader.readAsDataURL(file)
  }

  function handleSaveSingleBanner(sectionKey, label) {
    const current = getHomeBanners()
    const updated = {
      ...current,
      [sectionKey]: homeBannerInputs[sectionKey]
    }
    saveHomeBanners(updated)
    setHomeBanners(getHomeBanners())
    showToast(`¡${label} guardado con éxito!`)
  }

  function handleSaveAllHomeBanners() {
    saveHomeBanners(homeBannerInputs)
    setHomeBanners(getHomeBanners())
    showToast('¡Todos los banners e información del Home fueron guardados con éxito!')
  }

  // Carrusel Hero Handlers
  function handleUpdateHeroSlide(index, field, value) {
    setHeroSlides((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  async function handleUploadHeroSlideFile(index, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen de la diapositiva no puede superar los 5 MB.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        handleUpdateHeroSlide(index, 'image', res.url)
        showToast(`Imagen de diapositiva #${index + 1} subida al servidor. Clic en "Guardar Carrusel" para aplicar.`)
        return
      }
    } catch (e) {
      console.warn('Upload hero slide failed, using local reader:', e)
    }
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
    if (avatarModalPlayer.id) {
      playerApi.updateAvatar(avatarModalPlayer.id, newAvatarUrl).catch(() => {})
    }
    setRanking(getRanking())
    setRegisteredUsersList(getRegisteredUsers())
    setTournaments(getTournaments())
    setPlayerFormData((prev) => {
      if (prev.originalDni === avatarModalPlayer.dni || prev.nombre === avatarModalPlayer.name) {
        return { ...prev, image: newAvatarUrl }
      }
      return prev
    })
    showToast('Foto de ' + avatarModalPlayer.name + ' actualizada sin alterar sus puntos.')
    setAvatarModalPlayer(null)
    setNewAvatarUrl('')
  }

  // Handler: File Upload for Player Avatar
  async function handlePlayerAvatarFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La foto del jugador no puede superar los 5 MB.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        setNewAvatarUrl(res.url)
        return
      }
    } catch (e) {
      console.warn('Upload player avatar failed, using local reader:', e)
    }
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

  // Handler: Tournament image file upload
  async function handleTourneyImageFile(file, isEdit = false) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('El afiche del torneo no puede superar los 5 MB.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        if (isEdit) {
          setEditTourneyImage(res.url)
        } else {
          setNewTourneyImage(res.url)
        }
        return
      }
    } catch (e) {
      console.warn('Upload tournament image failed, using local reader:', e)
    }
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
    setEditTourneyStatus(t.estado || 'inscripciones_abiertas')
    setEditTourneyImage(t.image || '')
    setEditTourneyCategories(
      t.categorias && t.categorias.length > 0
        ? JSON.parse(JSON.stringify(t.categorias))
        : [
            { id: 'cat-4', nombre: '4ta', cupos: 16 },
            { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
            { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
            { id: 'cat-6', nombre: '6ta', cupos: 32 }
          ]
    )
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
      estado: editTourneyStatus,
      categorias: editTourneyCategories,
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

  // Handler: Create Tournament
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
      estado: newTourneyStatus,
      categorias: newTourneyCategories,
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
    setNewTourneyStatus('inscripciones_abiertas')
    setNewTourneyImage('')
    setNewTourneyCategories([
      { id: 'cat-4', nombre: '4ta', cupos: 16 },
      { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
      { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
      { id: 'cat-6', nombre: '6ta', cupos: 32 }
    ])
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

  // Handlers for Tournament Results Management
  function handleSaveResult(e) {
    if (e) e.preventDefault()
    if (!currentTourney) return

    const cat = selectedCategoryForResult || currentTourney.categorias?.[0]?.nombre || '4ta'
    const p1 = (resultPlayer1 || '').trim()
    const p2 = (resultPlayer2 || '').trim()

    if (!p1 || !p2) {
      showToast('Por favor ingresa los nombres de ambos participantes.')
      return
    }

    if (p1.toLowerCase() === p2.toLowerCase()) {
      showToast('⚠️ No puedes registrar un resultado con el mismo participante en ambos lados.')
      return
    }

    const winner = resultWinner || p1
    const scoreStr = [resultSet1, resultSet2, resultSet3].filter(Boolean).join(', ')

    if (editingResultId) {
      const res = updateTournamentResult(currentTourney.id, editingResultId, {
        categoria: cat,
        ronda: resultRound,
        jugador1: p1,
        jugador2: p2,
        set1: resultSet1,
        set2: resultSet2,
        set3: resultSet3,
        score: scoreStr,
        ganador: winner,
        puntos: Number(resultPoints) || 0,
        observaciones: resultObservations
      })
      if (res.error) {
        showToast(res.error)
      } else {
        setTournaments(getTournaments())
        resetResultForm()
        showToast('¡Resultado actualizado con éxito!')
      }
    } else {
      const res = addTournamentResult(currentTourney.id, {
        categoria: cat,
        ronda: resultRound,
        jugador1: p1,
        jugador2: p2,
        set1: resultSet1,
        set2: resultSet2,
        set3: resultSet3,
        score: scoreStr,
        ganador: winner,
        puntos: Number(resultPoints) || 0,
        sumarRanking: resultSumarRanking,
        observaciones: resultObservations
      })
      if (res.error) {
        showToast(res.error)
      } else {
        setTournaments(getTournaments())
        setRanking(getRanking())
        resetResultForm()
        showToast('¡Resultado registrado y guardado en el torneo!')
      }
    }
  }

  function resetResultForm() {
    setResultPlayer1('')
    setResultPlayer2('')
    setResultSet1('6-4')
    setResultSet2('6-3')
    setResultSet3('')
    setResultWinner('')
    setResultPoints(250)
    setResultObservations('')
    setEditingResultId(null)
  }

  function handleEditResult(res) {
    setEditingResultId(res.id)
    setSelectedCategoryForResult(res.categoria)
    setResultRound(res.ronda || 'Gran Final')
    setResultPlayer1(res.jugador1 || '')
    setResultPlayer2(res.jugador2 || '')
    setResultSet1(res.set1 || '')
    setResultSet2(res.set2 || '')
    setResultSet3(res.set3 || '')
    setResultWinner(res.ganador || res.jugador1 || '')
    setResultPoints(res.puntos || 250)
    setResultObservations(res.observaciones || '')
  }

  function handleDeleteResult(resId) {
    if (!currentTourney) return
    deleteTournamentResult(currentTourney.id, resId)
    setTournaments(getTournaments())
    if (editingResultId === resId) resetResultForm()
    showToast('Resultado eliminado.')
  }

  function handleQuickToggleStatus(tourney, newStatus) {
    updateTournamentStatus(tourney.id, newStatus)
    setTournaments(getTournaments())
    showToast(`Estado del torneo actualizado a: ${newStatus === 'finalizado' ? 'Finalizado 🏁' : newStatus}`)
  }

  // Handlers for News / Community
  function handleOpenCreateNews() {
    setEditingNews(null)
    setNewsFormatType('imagen')
    setNewsTitle('')
    setNewsCategory('Torneos')
    setNewsSummary('')
    setNewsContent('')
    setNewsImage('')
    setNewsAuthor(usuario?.nombre || 'Prensa ATAP')
    setNewsDate(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }))
    setNewsFeatured(false)
    setShowNewsModal(true)
  }

  function handleOpenEditNews(item) {
    setEditingNews(item)
    setNewsFormatType(item.tipo === 'texto' ? 'texto' : 'imagen')
    setNewsTitle(item.titulo || '')
    setNewsCategory(item.categoria || 'Torneos')
    setNewsSummary(item.resumen || '')
    setNewsContent(item.contenido || '')
    setNewsImage(item.imagen || '')
    setNewsAuthor(item.autor || 'Prensa ATAP')
    setNewsDate(item.fecha || '')
    setNewsFeatured(Boolean(item.destacada))
    setShowNewsModal(true)
  }

  async function handleNewsImageFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen de la publicación no puede superar los 5 MB.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        setNewsImage(res.url)
        return
      }
    } catch (e) {
      console.warn('Upload news image failed, using local reader:', e)
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setNewsImage(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  function handleSaveNews(e) {
    if (e) e.preventDefault()
    if (!newsTitle.trim()) {
      showToast('Por favor ingresa un título para la publicación.')
      return
    }
    if (!newsSummary.trim()) {
      showToast('Por favor ingresa un breve resumen o bajada.')
      return
    }
    if (newsFormatType === 'imagen' && !newsImage.trim()) {
      showToast('Has seleccionado formato con imagen. Por favor adjunta una foto o ingresa una URL.')
      return
    }

    const payload = {
      tipo: newsFormatType,
      titulo: newsTitle.trim(),
      categoria: newsCategory,
      resumen: newsSummary.trim(),
      contenido: newsContent.trim() || newsSummary.trim(),
      imagen: newsFormatType === 'imagen' ? newsImage.trim() : '',
      autor: newsAuthor.trim() || 'Prensa ATAP',
      fecha: newsDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      destacada: newsFeatured
    }

    if (editingNews) {
      updateNews(editingNews.id, payload)
      showToast(`¡Publicación "${payload.titulo}" actualizada con éxito!`)
    } else {
      createNews(payload)
      showToast(`¡Publicación "${payload.titulo}" creada y publicada en Comunidad!`)
    }

    setNewsList(getNews())
    setShowNewsModal(false)
  }

  function handleDeleteNewsItem(item) {
    if (window.confirm(`¿Estás seguro de eliminar la publicación "${item.titulo}"?`)) {
      deleteNews(item.id)
      setNewsList(getNews())
      showToast('Publicación eliminada.')
    }
  }

  function handleToggleFeature(id) {
    const updated = toggleFeatureNews(id)
    setNewsList(updated)
    showToast('Estado de noticia destacada actualizado.')
  }

  // Quick Player Registration handler for finalized tournaments
  function handleSaveQuickPlayer(e) {
    if (e) e.preventDefault()
    const nameClean = (quickPlayerName || '').trim()
    const dniClean = (quickPlayerDni || '').trim().replace(/\s+/g, '')

    if (!nameClean) {
      showToast('Por favor ingresa el nombre del jugador.')
      return
    }
    if (!dniClean || dniClean.length < 5) {
      showToast('Por favor ingresa un DNI válido (mínimo 5 dígitos).')
      return
    }

    const res = quickCreateTournamentPlayer({
      tournamentId: currentTourney?.id,
      nombre: nameClean,
      dni: dniClean,
      categoria: quickPlayerCategory
    })

    if (res.error) {
      showToast(res.error)
      return
    }

    showToast(`¡Jugador "${nameClean}" (DNI: ${maskDni(dniClean)}) creado con logo ATAP y asignado al torneo!`)
    setTournaments(getTournaments())
    setRanking(getRanking())

    // Auto-asignar en formulario de resultados si está vacío
    if (!resultPlayer1) {
      setResultPlayer1(nameClean)
      if (!resultWinner) setResultWinner(nameClean)
    } else if (!resultPlayer2) {
      setResultPlayer2(nameClean)
    }

    setQuickPlayerName('')
    setQuickPlayerDni('')
    setShowQuickPlayerModal(false)
  }

  // Handlers para Gestión de Jugadores (CRUD)
  function handleSavePlayer(e) {
    e.preventDefault()
    setPlayerActionNotice(null)

    const cleanNombre = (playerFormData.nombre || '').trim()
    const cleanDni = (playerFormData.dni || '').toString().trim().replace(/\s+/g, '')
    const cleanCat = playerFormData.categoria || '4ta'
    const cleanPoints = Number(playerFormData.puntos) || 0
    const cleanTitulos = Math.max(0, parseInt(playerFormData.titulosGanados, 10) || 0)
    const cleanTel = (playerFormData.telefono || '').trim()
    const cleanEmail = (playerFormData.email || '').trim()
    const cleanInstagram = (playerFormData.instagram || '').trim().replace(/^@/, '')

    if (!cleanNombre || cleanNombre.length < 2) {
      setPlayerActionNotice({ type: 'error', message: 'Por favor ingresa un nombre y apellido válido (mínimo 2 caracteres).' })
      return
    }

    if (!cleanDni || cleanDni.length < 5) {
      setPlayerActionNotice({ type: 'error', message: 'Por favor ingresa un DNI o documento válido (mínimo 5 dígitos).' })
      return
    }

    const allUsers = getRegisteredUsers()
    if (isEditingExistingPlayer && playerFormData.originalDni && playerFormData.originalDni !== cleanDni && maskDni(playerFormData.originalDni) !== maskDni(cleanDni)) {
      const duplicate = allUsers.find((u) => {
        const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')
        return uDni === cleanDni || uDni === maskDni(cleanDni) || (cleanDni.length >= 3 && uDni.endsWith(cleanDni.slice(-3)))
      })
      if (duplicate && duplicate.dni !== playerFormData.originalDni && maskDni(duplicate.dni) !== maskDni(playerFormData.originalDni)) {
        setPlayerActionNotice({ type: 'error', message: `El DNI ${maskDni(cleanDni)} ya está asignado al jugador "${duplicate.nombre}".` })
        return
      }
      deleteRegisteredUser(playerFormData.originalDni)
    }

    const cleanImage = (playerFormData.image || '').trim() || '/assets/logo.png'

    const saved = saveRegisteredUser({
      originalDni: playerFormData.originalDni,
      dni: cleanDni,
      documentoIdentidad: cleanDni,
      nombre: cleanNombre,
      categoria: cleanCat,
      puntosNum: cleanPoints,
      points: cleanPoints.toLocaleString() + ' pts',
      titulosGanados: cleanTitulos,
      titulos: cleanTitulos,
      telefono: cleanTel,
      whatsapp: cleanTel,
      email: cleanEmail,
      instagram: cleanInstagram,
      avatar: cleanImage,
      image: cleanImage,
      perfilIncompleto: isEditingExistingPlayer ? undefined : true,
      completadoOnboarding: isEditingExistingPlayer ? undefined : false
    })

    if (saved) {
      setRegisteredUsersList(getRegisteredUsers())
      setRanking(getRanking())
      setTournaments(getTournaments())
      setPlayerActionNotice({
        type: 'success',
        message: isEditingExistingPlayer
          ? `¡Datos de "${cleanNombre}" actualizados correctamente (${cleanPoints} pts, ${cleanTitulos} ${cleanTitulos === 1 ? 'título' : 'títulos'})!`
          : `¡Jugador "${cleanNombre}" creado con éxito en Categoría ${cleanCat} (${cleanPoints} pts, ${cleanTitulos} ${cleanTitulos === 1 ? 'título' : 'títulos'})!`
      })
      setPlayerFormData({
        originalDni: '',
        nombre: '',
        dni: '',
        categoria: '4ta',
        puntos: 0,
        titulosGanados: 0,
        telefono: '',
        email: '',
        instagram: '',
        image: '/assets/logo.png'
      })
      setIsEditingExistingPlayer(false)
      showToast(isEditingExistingPlayer ? 'Jugador modificado exitosamente.' : 'Nuevo jugador registrado en el circuito.')
    }
  }

  async function handlePlayerFormImageFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La foto del jugador no puede superar los 5 MB.')
      return
    }
    try {
      const res = await api.uploadImage(file)
      if (res?.url) {
        setPlayerFormData((prev) => ({ ...prev, image: res.url }))
        showToast('Foto cargada al servidor. Guarda los cambios para confirmar.')
        return
      }
    } catch (e) {
      console.warn('Upload player form image failed, using local reader:', e)
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setPlayerFormData((prev) => ({ ...prev, image: event.target.result }))
      showToast('Foto cargada en el formulario. Guarda los cambios para confirmar.')
    }
    reader.readAsDataURL(file)
  }

  function handleOpenAvatarModalFromTable(player) {
    const pName = player.nombre || player.name || 'Jugador'
    const cleanDni = (player.dni || player.documentoIdentidad || '').toString().trim()
    const img = player.image || player.avatar || '/assets/logo.png'
    setAvatarModalPlayer({
      name: pName,
      id: player.id,
      dni: cleanDni,
      image: img,
      points: player.points || `${player.puntosNum || 0} pts`,
      categoria: player.categoria || '4ta'
    })
    setNewAvatarUrl(img === '/assets/logo.png' ? '' : img)
  }

  function handleStartEditPlayer(player) {
    const cleanDni = (player.dni || player.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')
    const pts = player.puntosNum !== undefined ? Number(player.puntosNum) : (parseInt(player.points) || 0)
    const tits = player.titulosGanados !== undefined ? Number(player.titulosGanados) : (player.titulos !== undefined ? Number(player.titulos) : 0)
    const cleanImage = player.image || player.avatar || '/assets/logo.png'
    setPlayerFormData({
      originalDni: cleanDni,
      nombre: player.nombre || player.name || '',
      dni: cleanDni,
      categoria: player.categoria || '4ta',
      puntos: pts,
      titulosGanados: tits,
      telefono: player.telefono || player.whatsapp || '',
      email: player.email || '',
      instagram: player.instagram || player.ig || '',
      image: cleanImage
    })
    setIsEditingExistingPlayer(true)
    setPlayerActionNotice(null)
    const formElement = document.getElementById('player-crud-form-card')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleCancelEditPlayer() {
    setIsEditingExistingPlayer(false)
    setPlayerFormData({
      originalDni: '',
      nombre: '',
      dni: '',
      categoria: '4ta',
      puntos: 0,
      titulosGanados: 0,
      telefono: '',
      email: '',
      instagram: '',
      image: '/assets/logo.png'
    })
    setPlayerActionNotice(null)
  }

  function handleDeletePlayer(player) {
    const playerName = player.nombre || player.name || 'Jugador'
    const cleanDni = (player.dni || player.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')
    if (player.email?.toLowerCase() === 'vladimiryt18@gmail.com' || cleanDni === '00000000' || cleanDni === '*****000') {
      alert('La cuenta del Administrador no puede ser eliminada.')
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar al jugador "${playerName}" (DNI: ${maskDni(cleanDni) || 'N/A'})?\n\nEsta acción quitará al jugador de la base de datos de ATAP, del ranking del circuito y de torneos.`
    )
    if (!confirmDelete) return

    const deleted = deleteRegisteredUser(cleanDni || player.email || playerName)
    if (deleted) {
      setRegisteredUsersList(getRegisteredUsers())
      setRanking(getRanking())
      setTournaments(getTournaments())
      showToast(`Jugador "${playerName}" eliminado de la base de datos y ranking.`)
      setPlayerActionNotice({ type: 'success', message: `El jugador "${playerName}" fue eliminado correctamente del sistema.` })
      if (isEditingExistingPlayer && playerFormData.originalDni === cleanDni) {
        handleCancelEditPlayer()
      }
    } else {
      showToast('No se pudo eliminar al jugador.')
    }
  }

  function handleAddPlayerToTournamentBank(player) {
    if (!currentTourney) return
    const updated = addPlayerToTournamentBank(currentTourney.id, player)
    if (updated) {
      setTournaments(getTournaments())
      showToast(`¡${player.nombre} agregado al banco de participantes de ${currentTourney.title}!`)
    }
  }

  // Filtrado de jugadores registrados para la tabla CRUD
  const filteredRegisteredPlayers = registeredUsersList.filter((p) => {
    if (p.email?.toLowerCase() === 'vladimiryt18@gmail.com' || p.dni === '00000000') return false

    if (playerTableCategory !== 'todas') {
      const pCat = normalizeCategory(p.categoria || '')
      const fCat = normalizeCategory(playerTableCategory)
      if (pCat !== fCat) return false
    }

    if (playerTableSearch.trim()) {
      const q = playerTableSearch.trim().toLowerCase()
      const matchName = (p.nombre || '').toLowerCase().includes(q)
      const matchDni = (p.dni || p.documentoIdentidad || '').toString().toLowerCase().includes(q)
      const matchEmail = (p.email || '').toLowerCase().includes(q)
      if (!matchName && !matchDni && !matchEmail) return false
    }

    return true
  })

  // Filtrado de candidatos para el modal de llamada al banco de participantes
  const filteredBankCandidates = registeredUsersList.filter((p) => {
    if (p.email?.toLowerCase() === 'vladimiryt18@gmail.com' || p.dni === '00000000') return false

    if (bankModalCategoryFilter !== 'todas') {
      const pCat = normalizeCategory(p.categoria || '')
      const fCat = normalizeCategory(bankModalCategoryFilter)
      if (pCat !== fCat) return false
    }

    if (bankModalSearch.trim()) {
      const q = bankModalSearch.trim().toLowerCase()
      const matchName = (p.nombre || '').toLowerCase().includes(q)
      const matchDni = (p.dni || p.documentoIdentidad || '').toString().toLowerCase().includes(q)
      if (!matchName && !matchDni) return false
    }

    return true
  })

  // Filtered news for admin view
  const filteredAdminNews = newsList.filter((n) => {
    if (newsFilterCategory === 'todas') return true
    if (newsFilterCategory === 'imagen') return n.tipo === 'imagen'
    if (newsFilterCategory === 'texto') return n.tipo === 'texto'
    if (newsFilterCategory === 'destacadas') return Boolean(n.destacada)
    return true
  })

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
            <a href={getAssetUrl('/')} className="btn-secondary-link" target="_blank" rel="noreferrer">
              Ver Sitio Web <ExternalLink size={14} />
            </a>
            <button
              type="button"
              className="btn-admin-logout"
              onClick={() => onLogout && onLogout(usuario?.nombre || usuario?.email || 'Administrador ATAP')}
              title="Cerrar sesión de administrador"
            >
              <LogOut size={14} />
              <span>Cerrar sesión</span>
            </button>
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
            className={'admin-tab-btn' + (activeTab === 'jugadores' ? ' active' : '')}
            onClick={() => setActiveTab('jugadores')}
          >
            <Users size={16} />
            <span>Gestión de Jugadores</span>
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
            className={'admin-tab-btn' + (activeTab === 'comunidad' ? ' active' : '')}
            onClick={() => setActiveTab('comunidad')}
          >
            <Newspaper size={16} />
            <span>Comunidad y Noticias</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'imagenes' ? ' active' : '')}
            onClick={() => setActiveTab('imagenes')}
          >
            <ImageIcon size={16} />
            <span>Imágenes y Auspiciadores</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'temporadas' ? ' active' : '')}
            onClick={() => setActiveTab('temporadas')}
          >
            <Calendar size={16} />
            <span>Temporadas Anuales</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'reglas' ? ' active' : '')}
            onClick={() => setActiveTab('reglas')}
          >
            <ScrollText size={16} />
            <span>Políticas & Reglas {hasPoliciesChanges && <span className="tab-bubble-alert">●</span>}</span>
          </button>

          <button
            type="button"
            className={'admin-tab-btn' + (activeTab === 'contacto' ? ' active' : '')}
            onClick={() => setActiveTab('contacto')}
          >
            <PhoneCall size={16} />
            <span>Contacto y Sedes</span>
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
                onClick={() => setActiveTab('comunidad')}
              >
                <Newspaper size={15} />
                <span>Noticias Comunidad ({newsList.length})</span>
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

      {/* TAB: GESTIÓN DE JUGADORES (CRUD & CATEGORIZACIÓN) */}
      {activeTab === 'jugadores' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Gestión de Jugadores</h2>
                <p>
                  Crea, edita y elimina jugadores de la base de datos de ATAP. Asígnales su categoría correspondiente para que estén listos para inscribirse o llamarse a torneos.
                </p>
              </div>
              <div className="players-stat-badge">
                <Users size={16} />
                <span>{filteredRegisteredPlayers.length} Jugadores Activos</span>
              </div>
            </div>

            {playerActionNotice && (
              <div className={`player-notice-banner notice-${playerActionNotice.type}`}>
                {playerActionNotice.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                <span>{playerActionNotice.message}</span>
                <button
                  type="button"
                  className="notice-close-btn"
                  onClick={() => setPlayerActionNotice(null)}
                  aria-label="Cerrar aviso"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="players-management-layout">
              {/* FORMULARIO DE REGISTRO / EDICIÓN */}
              <div className="player-form-card" id="player-crud-form-card">
                <div className="card-header-accent">
                  <div className="header-title-flex">
                    {isEditingExistingPlayer ? <Pencil size={18} color="#00CFA0" /> : <UserPlus size={18} color="#00CFA0" />}
                    <h3>{isEditingExistingPlayer ? 'Editar Jugador' : 'Registrar Nuevo Jugador'}</h3>
                  </div>
                  {isEditingExistingPlayer && (
                    <span className="editing-indicator-pill">Modo Edición</span>
                  )}
                </div>

                <form onSubmit={handleSavePlayer} className="player-form-body">
                  {/* FOTO DE PERFIL / AVATAR DEL JUGADOR */}
                  <div className="player-form-avatar-section">
                    <div className="form-avatar-preview">
                      {playerFormData.image && playerFormData.image !== '/assets/logo.png' ? (
                        <img
                          src={playerFormData.image}
                          alt={playerFormData.nombre || 'Avatar'}
                          className="player-form-avatar-img"
                        />
                      ) : (
                        <div className="player-form-avatar-placeholder">
                          {playerFormData.nombre ? playerFormData.nombre.charAt(0).toUpperCase() : '🎾'}
                        </div>
                      )}
                    </div>
                    <div className="form-avatar-controls">
                      <span className="form-avatar-title">Foto de Perfil del Jugador</span>
                      <small className="form-avatar-hint">Foto cuadrada 500x500 px (1:1) recomendada · Máx. 5 MB</small>
                      <div className="form-avatar-actions-row">
                        <label className="btn-upload-player-photo">
                          <Camera size={14} color="#00CFA0" className="icon-camera-upload" />
                          <span className="btn-upload-text" style={{ color: '#00CFA0' }}>
                            {playerFormData.image && playerFormData.image !== '/assets/logo.png' ? 'Cambiar Foto' : 'Subir Foto'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePlayerFormImageFile(e.target.files[0])
                              }
                            }}
                          />
                        </label>
                        {playerFormData.image && playerFormData.image !== '/assets/logo.png' && (
                          <button
                            type="button"
                            className="btn-clear-player-photo"
                            onClick={() => setPlayerFormData({ ...playerFormData, image: '/assets/logo.png' })}
                            title="Restablecer logo ATAP oficial"
                          >
                            <Trash2 size={12} />
                            <span>Quitar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="player-input-nombre">
                      Nombre Completo <span className="req-star">*</span>
                    </label>
                    <input
                      id="player-input-nombre"
                      type="text"
                      placeholder="Ej: Carlos Mendoza"
                      value={playerFormData.nombre}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, nombre: e.target.value.replace(/[0-9]/g, '') })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="player-input-dni">
                      DNI / Documento de Identidad <span className="req-star">*</span>
                    </label>
                    <input
                      id="player-input-dni"
                      type="text"
                      placeholder="Ej: 72345678"
                      value={playerFormData.dni}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                      required
                    />
                    <small className="field-hint">El DNI identifica al jugador y se utiliza para acceder a su perfil y torneos.</small>
                  </div>

                  <div className="form-row-3col">
                    <div className="form-group">
                      <label htmlFor="player-input-categoria">
                        Categoría Asignada <span className="req-star">*</span>
                      </label>
                      <select
                        id="player-input-categoria"
                        value={playerFormData.categoria}
                        onChange={(e) => setPlayerFormData({ ...playerFormData, categoria: e.target.value })}
                        className="input-select"
                      >
                        {ALL_OFFICIAL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            Categoría {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="player-input-puntos">
                        Puntos de Ranking (Pts)
                      </label>
                      <input
                        id="player-input-puntos"
                        type="number"
                        min="0"
                        step="5"
                        placeholder="0"
                        value={playerFormData.puntos}
                        onChange={(e) => setPlayerFormData({ ...playerFormData, puntos: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="player-input-titulos">
                        Títulos Ganados (🏆)
                      </label>
                      <input
                        id="player-input-titulos"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={playerFormData.titulosGanados}
                        onChange={(e) => setPlayerFormData({ ...playerFormData, titulosGanados: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label htmlFor="player-input-tel">Teléfono / WhatsApp (Opcional)</label>
                      <input
                        id="player-input-tel"
                        type="tel"
                        placeholder="Ej: 977884423"
                        value={playerFormData.telefono}
                        onChange={(e) => setPlayerFormData({ ...playerFormData, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="player-input-email">Email (Opcional)</label>
                      <input
                        id="player-input-email"
                        type="email"
                        placeholder="jugador@ejemplo.com"
                        value={playerFormData.email}
                        onChange={(e) => setPlayerFormData({ ...playerFormData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label htmlFor="player-input-instagram">Instagram (Opcional)</label>
                      <input
                        id="player-input-instagram"
                        type="text"
                        placeholder="Ej: @lucianaperez o lucianaperez"
                        value={playerFormData.instagram}
                        onChange={(e) => setPlayerFormData({ ...playerFormData, instagram: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="player-form-actions">
                    {isEditingExistingPlayer ? (
                      <>
                        <button type="submit" className="button btn-player-primary">
                          <Save size={16} /> Guardar Cambios
                        </button>
                        <button
                          type="button"
                          className="button btn-secondary"
                          onClick={handleCancelEditPlayer}
                        >
                          <X size={16} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <button type="submit" className="button btn-player-primary">
                        <UserPlus size={16} /> Guardar Jugador
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* LISTADO Y TABLA DE JUGADORES */}
              <div className="players-list-card">
                <div className="players-list-topbar">
                  <div className="search-box player-search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, DNI o email..."
                      value={playerTableSearch}
                      onChange={(e) => setPlayerTableSearch(e.target.value)}
                    />
                  </div>

                  <div className="player-category-filter">
                    <label>Categoría:</label>
                    <select
                      value={playerTableCategory}
                      onChange={(e) => setPlayerTableCategory(e.target.value)}
                      className="input-select"
                    >
                      <option value="todas">Todas ({registeredUsersList.length - 1})</option>
                      {ALL_OFFICIAL_CATEGORIES.map((cat) => {
                        const count = registeredUsersList.filter(
                          (u) =>
                            u.email?.toLowerCase() !== 'vladimiryt18@gmail.com' &&
                            u.dni !== '00000000' &&
                            normalizeCategory(u.categoria || '') === normalizeCategory(cat)
                        ).length
                        return (
                          <option key={cat} value={cat}>
                            {cat} ({count})
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div className="players-table-container">
                  {filteredRegisteredPlayers.length === 0 ? (
                    <div className="empty-players-placeholder">
                      <Users size={32} color="#666" />
                      <p>No se encontraron jugadores que coincidan con la búsqueda o filtro.</p>
                      {playerTableSearch && (
                        <button
                          type="button"
                          className="btn-clear-search"
                          onClick={() => {
                            setPlayerTableSearch('')
                            setPlayerTableCategory('todas')
                          }}
                        >
                          Limpiar Filtros
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="admin-players-data-table">
                      <thead>
                        <tr>
                          <th>Jugador</th>
                          <th>DNI</th>
                          <th>Categoría</th>
                          <th>Puntos</th>
                          <th>Títulos</th>
                          <th>Estado</th>
                          <th>Contacto</th>
                          <th className="th-actions">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegisteredPlayers.map((player) => {
                          const pDni = (player.dni || player.documentoIdentidad || '').toString().trim()
                          const pCat = player.categoria || '4ta'
                          const isCurrentlyEditing = isEditingExistingPlayer && playerFormData.originalDni === pDni

                          return (
                            <tr key={pDni || player.id || player.email} className={isCurrentlyEditing ? 'row-editing' : ''}>
                              <td className="td-player-name">
                                <div className="player-table-name-cell">
                                  <div
                                    className="player-avatar-circle player-avatar-clickable"
                                    onClick={() => handleOpenAvatarModalFromTable(player)}
                                    title={`Clic para cambiar foto de ${player.nombre || player.name}`}
                                  >
                                    {player.image && player.image !== '/assets/logo.png' ? (
                                      <img src={player.image} alt={player.nombre || player.name} className="player-table-avatar-img" />
                                    ) : (
                                      (player.nombre || player.name) ? (player.nombre || player.name).charAt(0).toUpperCase() : 'J'
                                    )}
                                    <span className="avatar-hover-cam-overlay" title="Cambiar foto">
                                      <Camera size={11} />
                                    </span>
                                  </div>
                                  <div className="player-name-text">
                                    <span className="player-full-name">{player.nombre || player.name}</span>
                                    {player.email && <span className="player-email-hint">{player.email}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="td-player-dni">
                                <code className="dni-pill">{maskDni(pDni) || 'S/D'}</code>
                              </td>
                              <td className="td-player-cat">
                                <span className={`category-tag-badge cat-${pCat.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {pCat}
                                </span>
                              </td>
                              <td className="td-player-points">
                                <span className="points-pill-badge">
                                  {player.points || `${player.puntosNum || 0} pts`}
                                </span>
                              </td>
                              <td className="td-player-titles">
                                <span className="titles-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 215, 0, 0.12)', border: '1px solid rgba(255, 215, 0, 0.3)', color: '#FFD700', borderRadius: '12px', padding: '3px 8px', fontSize: '12px', fontWeight: '700' }}>
                                  🏆 {player.titulosGanados !== undefined ? player.titulosGanados : (player.titulos || 0)}
                                </span>
                              </td>
                              <td className="td-player-status">
                                <span
                                  className={`player-status-badge ${player.perfilIncompleto ? 'status-pending' : 'status-complete'}`}
                                  title={player.perfilIncompleto ? 'Pre-cargado por administración para torneos, pendiente de registro web' : 'Cuenta registrada en la plataforma'}
                                >
                                  {player.perfilIncompleto ? 'Pre-cargado' : 'Registrado Web'}
                                </span>
                              </td>
                              <td className="td-player-contact">
                                <span className="contact-text">{player.telefono || player.whatsapp || '—'}</span>
                                {player.instagram && (
                                  <span className="player-ig-hint" style={{ display: 'block', fontSize: '11px', color: '#00CFA0', marginTop: '2px' }}>
                                    @{player.instagram.replace(/^@/, '')}
                                  </span>
                                )}
                              </td>
                              <td className="td-actions">
                                <div className="player-actions-row">
                                  <button
                                    type="button"
                                    className="btn-action-photo"
                                    onClick={() => handleOpenAvatarModalFromTable(player)}
                                    title={`Cambiar foto de ${player.nombre || player.name}`}
                                  >
                                    <Camera size={13} />
                                    <span>Foto</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-action-edit"
                                    onClick={() => handleStartEditPlayer(player)}
                                    title={`Editar a ${player.nombre}`}
                                  >
                                    <Pencil size={13} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-action-delete"
                                    onClick={() => handleDeletePlayer(player)}
                                    title={`Eliminar a ${player.nombre}`}
                                  >
                                    <Trash2 size={13} />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
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
              {tournaments.map((t) => {
                const totalInscritos = (t.inscripciones || []).length
                const aprobados = (t.inscripciones || []).filter((i) => i.estadoPago === 'aprobado').length
                const resultadosCount = t.resultados?.length || 0
                const isFinalizado = t.estado === 'finalizado'
                const isEnCurso = t.estado === 'en_curso'

                return (
                  <div className="admin-tourney-card" key={t.id}>
                    {/* THUMBNAIL CONTAINER (INSET / COMPACT) */}
                    <div className="tourney-card-thumb-wrap">
                      <img src={t.image} alt={t.title} className="tourney-card-thumb-img" />
                      <span className="tourney-badge-level">{t.level}</span>
                    </div>

                    {/* CARD MAIN CONTENT */}
                    <div className="tourney-card-body">
                      {/* ROW 1: TITLE & ACTIONS */}
                      <div className="tourney-card-header-row">
                        <h3 title={t.title}>{t.title}</h3>
                        <div className="tourney-card-actions">
                          <button
                            type="button"
                            className="btn-tourney-action-mini"
                            title="Editar torneo"
                            onClick={() => handleOpenEditTournament(t)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-tourney-action-mini btn-delete"
                            title="Eliminar torneo"
                            onClick={() => handleDeleteTournament(t)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* ROW 2: DATE & VENUE */}
                      <p className="tourney-meta-line" title={`${t.date} | ${t.place}`}>
                        <Calendar size={12} className="meta-icon" />
                        <span>{t.date}</span>
                        <span className="meta-divider">•</span>
                        <span className="meta-place">{t.place}</span>
                      </p>

                      {/* ROW 3: MODALITY & STATUS (COMBINED IN ONE ROW) */}
                      <div className="tourney-controls-row">
                        {/* Modality mini switch */}
                        <div
                          className="modality-toggle-control-mini"
                          onClick={() => handleToggleTournamentModality(t)}
                          title="Clic para cambiar formato: Singles ↔ Dúo"
                        >
                          <span className={`modality-chip ${t.modalidad !== 'dobles' ? 'active' : ''}`}>Singles</span>
                          <span className={`modality-chip ${t.modalidad === 'dobles' ? 'active' : ''}`}>Dúo</span>
                        </div>

                        {/* Status chip & quick toggle */}
                        <div className="tourney-status-inline-wrap">
                          <span className={`tourney-status-chip-compact ${t.estado || 'inscripciones_abiertas'}`}>
                            {isFinalizado ? '🏁 Finalizado' : isEnCurso ? '🔵 En Curso' : '🟢 Abierto'}
                          </span>
                          <button
                            type="button"
                            className="btn-status-micro-toggle"
                            onClick={() =>
                              handleQuickToggleStatus(
                                t,
                                isFinalizado ? 'inscripciones_abiertas' : 'finalizado'
                              )
                            }
                            title={isFinalizado ? 'Reabrir inscripciones' : 'Marcar torneo como finalizado'}
                          >
                            {isFinalizado ? 'Reabrir' : 'Finalizar 🏁'}
                          </button>
                        </div>
                      </div>

                      {/* ROW 4: PARTICIPANTS PILL & QUICK PRICE */}
                      <div className="tourney-stats-and-price-row">
                        <div className="tourney-players-counter-badge" title={`${totalInscritos} inscritos en total (${aprobados} aprobados con pago verificado)`}>
                          <Users size={12} />
                          <span><strong>{aprobados}</strong>/{totalInscritos} jugadores</span>
                        </div>

                        <div className="tourney-compact-price-field">
                          <span className="price-tag-prefix">S/</span>
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
                            title="Precio de inscripción"
                          />
                          <button
                            type="button"
                            className="btn-save-price-mini"
                            onClick={() => handleSavePrice(t.id)}
                            title="Guardar precio"
                          >
                            <Save size={11} />
                          </button>
                        </div>
                      </div>

                      {/* ROW 5: RESULTS ACTION BUTTON & QUICK PLAYER FOR FINALIZED */}
                      <div className="tourney-card-footer-actions-row">
                        <button
                          type="button"
                          className={`btn-tourney-results-action-compact ${isFinalizado ? 'highlight-final' : ''}`}
                          onClick={() => {
                            setSelectedTourneyId(t.id)
                            setActiveTab('marcadores')
                          }}
                        >
                          <Trophy size={13} />
                          <span>Ver / Cargar Resultados ({resultadosCount})</span>
                          <ArrowRight size={12} className="arrow-right-icon" />
                        </button>

                        {isFinalizado && (
                          <button
                            type="button"
                            className="btn-tourney-quick-player-compact"
                            onClick={() => {
                              setSelectedTourneyId(t.id)
                              setQuickPlayerCategory((t.categorias && t.categorias[0]?.nombre) || '4ta')
                              setShowQuickPlayerModal(true)
                            }}
                            title="Registrar jugador rápido con Nombre y DNI para este torneo finalizado"
                          >
                            <Plus size={12} />
                            <span>+ Jugador (DNI)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
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
                      const waLink = 'https://wa.me/51' + (insc.telefono || '').replace(/\D/g, '') + '?text=' + waMsg

                      return (
                        <tr key={insc.id} className={isPending ? 'row-pending' : ''}>
                          <td>
                            <strong>{insc.nombre}</strong>
                            <span className="player-sub-email">{insc.email}</span>
                          </td>
                          <td>{maskDni(insc.dni) || '-'}</td>
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
                          <td>{insc.metodoPago || 'Yape'}</td>
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

      {/* TAB 3: SORTEO MANUAL Y FASE DE GRUPOS A CUADRO ELIMINATORIO */}
      {activeTab === 'sorteo' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Flujo de Sorteo: Fase de Grupos a Cuadro Eliminatorio</h2>
                <p>
                  Estructura el torneo en 3 pasos: distribuye a los participantes en tantos grupos como sean necesarios, define el formato de eliminatorias y empareja visualmente a los contrincantes en el cuadro de llaves.
                </p>
              </div>
              <div className="tourney-selector-wrap">
                <label htmlFor="select-tourney-draw">Torneo Activo:</label>
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

            {/* PROGRESS FLOW STEPS TRACKER */}
            <div className="draw-flow-steps-tracker">
              <div className="step-track-item active">
                <div className="step-track-bubble">1</div>
                <div className="step-track-content">
                  <span className="step-track-label">Paso 1 • {currentTourney.title}</span>
                  <strong>Sorteo y Asignación de Grupos</strong>
                  <small>{manualGroups.length} grupos ({allGroupPlayers.length} clasificados)</small>
                </div>
              </div>
              <div className="step-track-divider"></div>
              <div className="step-track-item active">
                <div className="step-track-bubble">2</div>
                <div className="step-track-content">
                  <span className="step-track-label">Paso 2 • {currentTourney.title}</span>
                  <strong>Formato de Cuadro Eliminatorio</strong>
                  <small>{playoffSize} clasificados ({
                    playoffSize === 64 ? '32-avos de final' :
                    playoffSize === 32 ? 'Dieciseisavos de final' :
                    playoffSize === 16 ? 'Octavos de final' :
                    playoffSize === 8 ? 'Cuartos de final' : 'Semifinales'
                  })</small>
                </div>
              </div>
              <div className="step-track-divider"></div>
              <div className="step-track-item active">
                <div className="step-track-bubble">3</div>
                <div className="step-track-content">
                  <span className="step-track-label">Paso 3 • {currentTourney.title}</span>
                  <strong>Emparejamiento desde Grupos</strong>
                  <small>Asignación visual en llaves de {currentTourney.title}</small>
                </div>
              </div>
            </div>

            {/* SECCIÓN PASO 1: SORTEO Y FASE DE GRUPOS */}
            <div className="sorteo-step1-section">
              <div className="step-section-header">
                <div className="step-section-badge">
                  <Users size={18} color="#00CFA0" />
                  <h3>Paso 1: Sorteo y Asignación de Grupos Oficiales</h3>
                  <span className="tourney-connection-badge">🏆 Torneo: <strong>{currentTourney.title}</strong></span>
                </div>
                <span className="step-section-hint">Puedes agregar tantos grupos como requiera {currentTourney.title} (Grupo A, B, C, D, E...)</span>
              </div>

              {/* ACTION TOOLBAR PARA GRUPOS */}
              <div className="manual-draw-toolbar">
                <div className="toolbar-left-actions">
                  <button
                    type="button"
                    className="btn-draw-action primary"
                    onClick={handleSaveManualGroups}
                  >
                    <Save size={16} />
                    <span>Guardar Asignación de Grupos</span>
                  </button>

                  <button
                    type="button"
                    className="btn-draw-action secondary"
                    onClick={handleGenerateMatchesForGroups}
                  >
                    <Flame size={16} />
                    <span>Generar Partidos de Grupos</span>
                  </button>
                </div>

                <div className="toolbar-right-actions">
                  <button
                    type="button"
                    className="btn-draw-action outline"
                    onClick={handleAddManualGroup}
                  >
                    <Plus size={15} />
                    <span>+ Agregar Grupo Dinámico</span>
                  </button>

                  <button
                    type="button"
                    className="btn-draw-action danger-outline"
                    onClick={handleResetGroups}
                    title="Devolver todos los jugadores al banco"
                  >
                    <Shuffle size={15} />
                    <span>Restablecer Asignaciones</span>
                  </button>
                </div>
              </div>

              {/* MAIN 2-COLUMN WORKSPACE: BANK vs GROUPS */}
              <div className="manual-draw-workspace-grid">
                {/* BANK OF APPROVED PLAYERS */}
                <div className="draw-players-bank-col">
                  <div className="bank-header">
                    <div className="bank-title-wrap">
                      <Users size={18} color="#00CFA0" />
                      <h3>Banco de Participantes Aprobados</h3>
                    </div>
                    <div className="bank-header-actions">
                      <span className="bank-count-pill">
                        {approvedPlayers.filter((p) => !getPlayerAssignedGroup(p.id)).length} / {approvedPlayers.length} sin asignar
                      </span>
                      <button
                        type="button"
                        className="btn-bank-add-player"
                        onClick={() => setShowBankAddModal(true)}
                        title="Llamar o agregar jugadores registrados al banco de este torneo"
                      >
                        <UserPlus size={14} />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>

                  <div className="bank-instructions-hint">
                    <small>
                      ✋ <strong>Arrastra</strong> la tarjeta del jugador hacia la caja del grupo, o usa <strong>"Mover a..."</strong> en el menú desplegable.
                    </small>
                  </div>

                  <div className="bank-players-cards-list">
                    {approvedPlayers.length === 0 ? (
                      <div className="bank-empty-alert">
                        <AlertTriangle size={18} color="#D32F2F" />
                        <span>No hay jugadores con pago aprobado en este torneo. Valida pagos en la pestaña de Pagos para habilitarlos en el sorteo.</span>
                      </div>
                    ) : (
                      approvedPlayers.map((player) => {
                        const assignedGroup = getPlayerAssignedGroup(player.id)

                        return (
                          <div
                            key={player.id}
                            className={'bank-player-item-card' + (assignedGroup ? ' is-assigned' : '')}
                            draggable={true}
                            onDragStart={(e) => handleDragStartPlayer(e, player)}
                          >
                            <div className="player-card-grip" title="Arrastrar">
                              <GripVertical size={16} />
                            </div>

                            <div className="player-card-details">
                              <div className="player-card-top">
                                <strong className="player-name-text">🎾 {player.nombre}</strong>
                                <span className="player-cat-chip">{player.categoria || '4ta'}</span>
                              </div>
                              <div className="player-card-sub">
                                <span className="player-dni-text">DNI: {maskDni(player.dni) || 'N/A'}</span>
                                {player.esDobles && <span className="player-dobles-tag">👥 Dúo</span>}
                              </div>
                            </div>

                            <div className="player-card-actions">
                              {assignedGroup ? (
                                <div className="assigned-status-box">
                                  <span className="assigned-group-badge">{assignedGroup.nombre}</span>
                                  <button
                                    type="button"
                                    className="btn-unassign-micro"
                                    onClick={() => handleRemovePlayerFromGroup(player.id, assignedGroup.id)}
                                    title="Quitar de este grupo"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <select
                                  className="quick-assign-select"
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      assignPlayerToGroup(player.id, e.target.value)
                                      e.target.value = ''
                                    }
                                  }}
                                >
                                  <option value="" disabled>Mover a...</option>
                                  {manualGroups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                      {g.nombre}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* GROUPS LIST / DROP ZONES */}
                <div className="draw-groups-container-col">
                  <div className="groups-column-header">
                    <h3>Grupos Oficiales del Torneo ({manualGroups.length})</h3>
                    <small>Sección configurable: puedes renombrar o eliminar grupos</small>
                  </div>

                  <div className="manual-groups-drop-grid">
                    {manualGroups.map((grupo) => {
                      const groupPlayers = grupo.participantes || []
                      const groupMatches = grupo.partidos || []

                      return (
                        <div className="manual-group-panel" key={grupo.id}>
                          <div className="group-panel-header">
                            <div className="group-title-tag">
                              <input
                                type="text"
                                className="group-title-edit-input"
                                value={grupo.nombre}
                                onChange={(e) => handleRenameGroup(grupo.id, e.target.value)}
                                title="Haz clic para editar el nombre del grupo"
                              />
                              <span className="group-count-badge">
                                {groupPlayers.length} {groupPlayers.length === 1 ? 'jugador' : 'jugadores'}
                              </span>
                            </div>
                            {manualGroups.length > 1 && (
                              <button
                                type="button"
                                className="btn-delete-group"
                                onClick={() => handleRemoveManualGroup(grupo.id)}
                                title={`Eliminar ${grupo.nombre}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {/* DROP ZONE */}
                          <div
                            className="group-drop-target-zone"
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                            }}
                            onDrop={(e) => handleDropPlayerToGroup(e, grupo.id)}
                          >
                            {groupPlayers.length === 0 ? (
                              <div className="drop-target-empty-prompt">
                                <Plus size={20} color="#00CFA0" />
                                <span>Arrastra jugadores aquí</span>
                                <small>O usa "Mover a..." en el banco</small>
                              </div>
                            ) : (
                              <div className="group-assigned-players-list">
                                {groupPlayers.map((p, idx) => (
                                  <div className="assigned-player-row" key={p.id}>
                                    <span className="slot-order-num">#{idx + 1}</span>
                                    <span className="slot-player-name">{p.nombre}</span>
                                    <span className="slot-player-cat">{p.categoria}</span>
                                    <button
                                      type="button"
                                      className="btn-remove-from-slot"
                                      onClick={() => handleRemovePlayerFromGroup(p.id, grupo.id)}
                                      title="Quitar jugador"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {groupMatches.length > 0 && (
                            <div className="group-fixtures-status-banner">
                              <span>✓ {groupMatches.length} partidos programados</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN PASO 2 Y PASO 3: CONFIGURACIÓN Y EMPAREJAMIENTO DE CUADRO ELIMINATORIO */}
            <div className="bracket-interactive-card" style={{ marginTop: '36px' }}>
              <div className="bracket-flow-header">
                <div>
                  <div className="flow-step-kicker">
                    <span className="step-pill">Paso 2 y Paso 3</span>
                    <span className="tourney-connection-badge">🏆 Torneo Activo: <strong>{currentTourney.title}</strong></span>
                    <span className="step-tag-pill">Conectado a Grupos de {currentTourney.title}</span>
                  </div>
                  <h3>Configuración y Visualización de Enfrentamientos (Playoffs) — {currentTourney.title}</h3>
                  <p className="subtext-preview">
                    Empareja manualmente a los contrincantes en cada casilla eliminatoria de <strong>{currentTourney.title}</strong>. El cuadro toma como base directa a las personas asignadas en los grupos oficiales de este torneo ({allGroupPlayers.length} clasificados disponibles).
                  </p>
                </div>

                <div className="bracket-header-status-group">
                  {/* SINCRONIZADOR RÁPIDO DE TORNEO EN PASO 2 Y 3 */}
                  <div className="bracket-tourney-sync-box">
                    <label htmlFor="select-bracket-tourney">Torneo:</label>
                    <select
                      id="select-bracket-tourney"
                      value={selectedTourneyId}
                      onChange={(e) => setSelectedTourneyId(e.target.value)}
                      className="select-bracket-tourney-input"
                    >
                      {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="group-pool-count-badge">
                    🎾 {allGroupPlayers.length} clasificados en {currentTourney.title}
                  </span>
                  <span className="bracket-status-tag">
                    {currentTourney.bracket?.rounds?.length ? `Llave Generada (${currentTourney.title})` : `Pendiente de Configuración (${currentTourney.title})`}
                  </span>
                </div>
              </div>

              {/* CONTROLS & ASSISTANTS BAR */}
              <div className="knockout-controls-bar">
                <div className="controls-left-group">
                  <div className="control-field-inline">
                    <label htmlFor="select-playoff-size">Formato:</label>
                    <select
                      id="select-playoff-size"
                      value={playoffSize}
                      onChange={(e) => handleChangePlayoffSize(e.target.value)}
                      className="select-bracket-format"
                    >
                      <option value={4}>Semifinales + Final (4 clasificados)</option>
                      <option value={8}>Cuartos + Semis + Final (8 clasificados)</option>
                      <option value={16}>Octavos de final (16 clasificados)</option>
                      <option value={32}>Dieciseisavos de final (32 clasificados)</option>
                      <option value={64}>32-avos de final (64 clasificados)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn-bracket-assistant primary"
                    onClick={handleAutoPairKnockout}
                    title="Emparejar automáticamente los primeros y segundos lugares de cada grupo"
                  >
                    <Flame size={15} />
                    <span>Auto-emparejar Cruces de Grupos</span>
                  </button>

                  <button
                    type="button"
                    className="btn-bracket-assistant secondary"
                    onClick={handleRandomPairKnockout}
                    title="Sorteo aleatorio entre todos los integrantes de grupos"
                  >
                    <Shuffle size={14} />
                    <span>Sorteo Aleatorio</span>
                  </button>

                  <button
                    type="button"
                    className="btn-bracket-assistant danger-ghost"
                    onClick={handleClearAllKnockout}
                    title="Vaciar las casillas para asignar manualmente"
                  >
                    <Trash2 size={14} />
                    <span>Vaciar Llaves</span>
                  </button>
                </div>

                <div className="controls-right-group">
                  <button
                    type="button"
                    className="btn-bracket-assistant save-btn"
                    onClick={handleSavePlayoffBracket}
                  >
                    <Save size={15} />
                    <span>Guardar Cuadro Oficial ({currentTourney.title})</span>
                  </button>
                </div>
              </div>

              {/* INSTRUCTION HINT */}
              <div className="knockout-interactive-hint">
                <small>
                  💡 <strong>Asignación Manual en Casillas ({currentTourney.title}):</strong> En cada partido de la primera ronda, haz clic en <strong>"+ Asignar jugador de grupo..."</strong> para elegir a cualquier clasificado de <strong>{currentTourney.title}</strong>. Utiliza <strong>"⇅ Swap"</strong> para invertir de lado o <strong>"✕"</strong> para cambiar de jugador. Con ambos contrincantes asignados, presiona <strong>"Cargar Marcador"</strong> y el ganador avanzará automáticamente a la Gran Final.
                </small>
              </div>

              {/* BRACKET VISUAL TREE */}
              <TournamentBracket
                key={`${currentTourney.id}-${playoffSize}-${currentTourney.bracket?.rounds?.length || 0}`}
                bracket={
                  currentTourney.bracket?.rounds?.length
                    ? currentTourney.bracket
                    : {
                        faseGrupos: manualGroups,
                        rounds: generateKnockoutStructure(playoffSize),
                        champion: null
                      }
                }
                isAdmin={true}
                isInteractive={true}
                manualGroups={manualGroups}
                availableGroupPlayers={allGroupPlayers}
                onAssignPlayerToSlot={handleAssignPlayerToMatchSlot}
                onSwapMatchSlots={handleSwapMatchSlots}
                onClearMatchSlot={handleClearMatchSlot}
                onOpenScoreModal={handleOpenScoreModal}
                onAssignBye={handleOpenByeModal}
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: RESULTADOS OFICIALES Y MARCADORES */}
      {activeTab === 'marcadores' && (() => {
        const activeCatName =
          selectedCategoryForResult || currentTourney.categorias?.[0]?.nombre || '4ta'
        const activeCatResults = (currentTourney.resultados || []).filter(
          (r) => normalizeCategory(r.categoria) === normalizeCategory(activeCatName)
        )
        const finalMatch = activeCatResults.find((r) => r.ronda === 'Gran Final')
        const isFinalizado = currentTourney.estado === 'finalizado'

        return (
          <section className="admin-tab-panel">
            <div className="admin-section-card panel">
              {/* TOP HEADER & SELECTORS */}
              <div className="panel-title-row">
                <div>
                  <div className="results-badge-strip">
                    <span className="results-super-pill">Gestión de Partidos</span>
                    <span
                      className={`tourney-status-chip ${currentTourney.estado || 'inscripciones_abiertas'}`}
                    >
                      {isFinalizado
                        ? '🏁 Torneo Finalizado'
                        : currentTourney.estado === 'en_curso'
                        ? '🔵 En Curso'
                        : '🟢 Inscripciones Abiertas'}
                    </span>
                  </div>
                  <h2>Resultados Oficiales y Marcadores</h2>
                  <p>
                    Carga resultados por categoría a través de formularios. Cuando el torneo esté finalizado, publica los marcadores y corona a los campeones.
                  </p>
                </div>

                <div className="tourney-selector-wrap">
                  <label htmlFor="select-tourney-score">Torneo Activo:</label>
                  <select
                    id="select-tourney-score"
                    value={selectedTourneyId}
                    onChange={(e) => {
                      setSelectedTourneyId(e.target.value)
                      const target = tournaments.find((t) => t.id === e.target.value)
                      if (target?.categorias?.[0]?.nombre) {
                        setSelectedCategoryForResult(target.categorias[0].nombre)
                      }
                      resetResultForm()
                    }}
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} {t.estado === 'finalizado' ? '(🏁 Finalizado)' : ''}
                      </option>
                    ))}
                  </select>

                  <div className="tourney-status-quick-select-row">
                    <label htmlFor="quick-status-selector">Estado:</label>
                    <select
                      id="quick-status-selector"
                      value={currentTourney.estado || 'inscripciones_abiertas'}
                      onChange={(e) => handleQuickToggleStatus(currentTourney, e.target.value)}
                      className="quick-status-dropdown"
                    >
                      <option value="inscripciones_abiertas">🟢 Inscripciones</option>
                      <option value="en_curso">🔵 En Curso</option>
                      <option value="finalizado">🏁 Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STATUS BANNER ALERT */}
              {isFinalizado ? (
                <div className="results-status-banner banner-finalized">
                  <div className="banner-icon-badge">🏁</div>
                  <div className="banner-content">
                    <strong>Torneo Finalizado Oficialmente</strong>
                    <p>
                      Las inscripciones están cerradas. Los resultados que registres en los formularios se publicarán de inmediato en el cuadro de honor y la vista pública del torneo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="results-status-banner banner-open">
                  <div className="banner-icon-badge">ℹ️</div>
                  <div className="banner-content">
                    <strong>Torneo en Desarrollo / Inscripciones</strong>
                    <p>
                      Puedes cargar resultados previos o{' '}
                      <button
                        type="button"
                        className="btn-text-link-action"
                        onClick={() => handleQuickToggleStatus(currentTourney, 'finalizado')}
                      >
                        marcar este torneo como Finalizado 🏁
                      </button>{' '}
                      para concluir la competencia.
                    </p>
                  </div>
                </div>
              )}

              {/* CATEGORIAS Y CUPOS DEL TORNEO */}
              <div className="results-categories-bar">
                <span className="results-bar-label">
                  <Layers size={14} />
                  <span>Categorías y Cupos del Torneo:</span>
                </span>
                <div className="results-category-tabs" role="tablist">
                  {(currentTourney.categorias || []).map((cat) => {
                    const count = (currentTourney.resultados || []).filter(
                      (r) => r.categoria === cat.nombre
                    ).length
                    const isActive = activeCatName === cat.nombre
                    return (
                      <button
                        key={cat.id || cat.nombre}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`results-cat-btn ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategoryForResult(cat.nombre)
                          if (editingResultId) resetResultForm()
                        }}
                      >
                        <strong>{cat.nombre}</strong>
                        <span className="results-cat-meta">
                          {cat.cupos} cupos • {count} {count === 1 ? 'partido' : 'partidos'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* CUADRO DE HONOR SI HAY GRAN FINAL */}
              {finalMatch && (
                <div className="honor-roll-card panel">
                  <div className="honor-header">
                    <span className="honor-trophy-icon">🏆</span>
                    <div>
                      <h4>CUADRO DE HONOR — {activeCatName}</h4>
                      <small>{currentTourney.title} • ATAP Oficial</small>
                    </div>
                  </div>
                  <div className="honor-podium-duo">
                    <div className="honor-podium-box champion">
                      <span className="honor-pill champ">🥇 CAMPEÓN OFICIAL</span>
                      <h3>{finalMatch.ganador}</h3>
                      <p className="honor-match-score">
                        Marcador Final: <strong>{finalMatch.score}</strong>
                      </p>
                      <span className="honor-points-badge">
                        +{finalMatch.puntos || 250} pts ATAP
                      </span>
                    </div>
                    <div className="honor-podium-box runnerup">
                      <span className="honor-pill sub">🥈 SUBCAMPEÓN</span>
                      <h3>
                        {finalMatch.ganador === finalMatch.jugador1
                          ? finalMatch.jugador2
                          : finalMatch.jugador1}
                      </h3>
                      <p className="honor-match-score">Finalista de Categoría</p>
                      <span className="honor-points-badge">
                        +{Math.round((finalMatch.puntos || 250) * 0.6)} pts ATAP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* BANNER REGISTRO RÁPIDO DE JUGADORES SI TORNEO ESTÁ FINALIZADO */}
              {currentTourney.estado === 'finalizado' && (
                <div className="finalized-quick-player-banner panel">
                  <div className="finalized-banner-left">
                    <span className="finalized-pulse-tag">🏁 Torneo Finalizado</span>
                    <h4>Registro Rápido de Jugadores para Resultados</h4>
                    <p>
                      ¿Participó un jugador que no estaba en el sistema? Ingrésalo con solo su <strong>Nombre y DNI</strong>. Su foto tendrá el logo oficial ATAP por defecto y cuando él se registre, el sistema le pedirá completar sus datos.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-lime btn-quick-player-trigger"
                    onClick={() => {
                      setQuickPlayerCategory(selectedCategoryForResult || activeCatName || '4ta')
                      setShowQuickPlayerModal(true)
                    }}
                  >
                    <Plus size={16} /> + Registrar Jugador (Nombre y DNI)
                  </button>
                </div>
              )}

              {/* MAIN 2-COLUMN LAYOUT: FORMULARIO vs LISTADO */}
              <div className="admin-results-layout-grid">
                {/* FORMULARIO PARA CARGAR RESULTADOS */}
                <div className="admin-results-form-card panel">
                  <div className="results-form-header">
                    <div className="form-header-title">
                      <Pencil size={18} color="#00CFA0" />
                      <h3>
                        {editingResultId
                          ? 'Editando Resultado de Partido'
                          : `Cargar Resultado en ${activeCatName}`}
                      </h3>
                    </div>
                    {editingResultId && (
                      <button
                        type="button"
                        className="btn-cancel-edit"
                        onClick={resetResultForm}
                      >
                        ✕ Cancelar edición
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveResult} className="admin-match-result-form">
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Categoría *</label>
                        <select
                          value={selectedCategoryForResult || activeCatName}
                          onChange={(e) => setSelectedCategoryForResult(e.target.value)}
                        >
                          {(currentTourney.categorias || []).map((c) => (
                            <option key={c.id || c.nombre} value={c.nombre}>
                              {c.nombre} ({c.cupos} cupos)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Instancia / Ronda *</label>
                        <select
                          value={resultRound}
                          onChange={(e) => {
                            setResultRound(e.target.value)
                            if (e.target.value === 'Gran Final') setResultPoints(250)
                            else if (e.target.value === 'Semifinales') setResultPoints(150)
                            else if (e.target.value === 'Cuartos de Final') setResultPoints(90)
                            else setResultPoints(50)
                          }}
                        >
                          <option value="Gran Final">🏆 Gran Final</option>
                          <option value="Semifinales">Semifinales</option>
                          <option value="Cuartos de Final">Cuartos de Final</option>
                          <option value="Octavos de Final">Octavos de Final</option>
                          <option value="Fase de Grupos">Fase de Grupos</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <div className="label-with-quick-add">
                          <label>
                            {currentTourney.modalidad === 'dobles'
                              ? 'Pareja / Dupla 1 *'
                              : 'Jugador 1 *'}
                          </label>
                          <div className="label-actions-inline">
                            <button
                              type="button"
                              className="btn-link-quick-player btn-call-bank-players"
                              onClick={() => {
                                setBankModalTargetField('player1')
                                setBankModalCategoryFilter(selectedCategoryForResult || activeCatName || 'todas')
                                setShowBankAddModal(true)
                              }}
                              title="Buscar o llamar jugador de la base general del circuito"
                            >
                              <Search size={12} /> Buscar en Base
                            </button>
                            {currentTourney.estado === 'finalizado' && (
                              <button
                                type="button"
                                className="btn-link-quick-player"
                                onClick={() => {
                                  setQuickPlayerCategory(selectedCategoryForResult || activeCatName || '4ta')
                                  setShowQuickPlayerModal(true)
                                }}
                                title="Registrar nuevo jugador con solo Nombre y DNI"
                              >
                                + Crear con DNI
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          list="tourney-approved-players"
                          placeholder={
                            currentTourney.modalidad === 'dobles'
                              ? 'Ej: Diego Sánchez & Mateo Rojas'
                              : 'Ej: Diego Sánchez'
                          }
                          value={resultPlayer1}
                          onChange={(e) => {
                            setResultPlayer1(e.target.value)
                            if (!resultWinner) setResultWinner(e.target.value)
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <div className="label-with-quick-add">
                          <label>
                            {currentTourney.modalidad === 'dobles'
                              ? 'Pareja / Dupla 2 *'
                              : 'Jugador 2 *'}
                          </label>
                          <div className="label-actions-inline">
                            <button
                              type="button"
                              className="btn-link-quick-player btn-call-bank-players"
                              onClick={() => {
                                setBankModalTargetField('player2')
                                setBankModalCategoryFilter(selectedCategoryForResult || activeCatName || 'todas')
                                setShowBankAddModal(true)
                              }}
                              title="Buscar o llamar jugador de la base general del circuito"
                            >
                              <Search size={12} /> Buscar en Base
                            </button>
                            {currentTourney.estado === 'finalizado' && (
                              <button
                                type="button"
                                className="btn-link-quick-player"
                                onClick={() => {
                                  setQuickPlayerCategory(selectedCategoryForResult || activeCatName || '4ta')
                                  setShowQuickPlayerModal(true)
                                }}
                                title="Registrar nuevo jugador con solo Nombre y DNI"
                              >
                                + Crear con DNI
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          list="tourney-approved-players"
                          placeholder={
                            currentTourney.modalidad === 'dobles'
                              ? 'Ej: Carlos Benavides & Fernando Gálvez'
                              : 'Ej: Mateo Rojas'
                          }
                          value={resultPlayer2}
                          onChange={(e) => setResultPlayer2(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <datalist id="tourney-approved-players">
                      {approvedPlayers.map((p) => (
                        <option
                          key={`app-${p.id || p.nombre}`}
                          value={p.nombre}
                          label={`Inscrito • Cat ${p.categoria || '4ta'}${p.dni ? ` • DNI: ${maskDni(p.dni)}` : ''}`}
                        />
                      ))}
                      {registeredUsersList
                        .filter(
                          (u) =>
                            !approvedPlayers.some(
                              (ap) => (ap.nombre || '').toLowerCase().trim() === (u.nombre || '').toLowerCase().trim()
                            )
                        )
                        .map((u) => {
                          const ptsStr = u.points || `${u.puntosNum || 0} pts`
                          return (
                            <option
                              key={`reg-${u.dni || u.id || u.nombre}`}
                              value={u.nombre}
                              label={`Base ATAP • Cat ${u.categoria || '4ta'} • ${ptsStr} • DNI: ${maskDni(u.dni || 'S/D')}`}
                            />
                          )
                        })}
                    </datalist>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Set 1 *</label>
                        <input
                          type="text"
                          placeholder="6-4"
                          value={resultSet1}
                          onChange={(e) => setResultSet1(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Set 2 *</label>
                        <input
                          type="text"
                          placeholder="6-3"
                          value={resultSet2}
                          onChange={(e) => setResultSet2(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Set 3 (Opcional)</label>
                        <input
                          type="text"
                          placeholder="10-7 o vacío"
                          value={resultSet3}
                          onChange={(e) => setResultSet3(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Ganador del Partido *</label>
                        <select
                          value={resultWinner || resultPlayer1}
                          onChange={(e) => setResultWinner(e.target.value)}
                        >
                          <option value={resultPlayer1 || 'Jugador 1'}>
                            {resultPlayer1 || 'Jugador 1'}
                          </option>
                          <option value={resultPlayer2 || 'Jugador 2'}>
                            {resultPlayer2 || 'Jugador 2'}
                          </option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Puntos a Otorgar *</label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={resultPoints}
                          onChange={(e) => setResultPoints(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Observaciones del Partido (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej: Final emocionante definida en match tie-break"
                        value={resultObservations}
                        onChange={(e) => setResultObservations(e.target.value)}
                      />
                    </div>

                    <div className="form-ranking-checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={resultSumarRanking}
                          onChange={(e) => setResultSumarRanking(e.target.checked)}
                        />
                        <span>
                          Sumar automáticamente {resultPoints} pts al ranking oficial de{' '}
                          <strong>{resultWinner || resultPlayer1 || 'el ganador'}</strong>
                        </span>
                      </label>
                    </div>

                    <div className="form-actions-right">
                      <button type="submit" className="button button-lime btn-save-result">
                        <Save size={16} />
                        <span>
                          {editingResultId
                            ? 'Actualizar Resultado'
                            : 'Guardar Resultado de Partido'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* LISTADO DE RESULTADOS REGISTRADOS */}
                <div className="results-recorded-section panel">
                  <div className="recorded-header-row">
                    <h4>Partidos Registrados en {activeCatName} ({activeCatResults.length})</h4>
                  </div>

                  {activeCatResults.length === 0 ? (
                    <div className="no-results-banner">
                      <p>
                        No hay resultados registrados aún para {activeCatName}. Usa el formulario de la izquierda para cargar el primer partido.
                      </p>
                    </div>
                  ) : (
                    <div className="recorded-matches-grid">
                      {activeCatResults.map((res) => {
                        const isFinal = res.ronda === 'Gran Final'
                        const isP1Winner = res.ganador === res.jugador1
                        return (
                          <div
                            key={res.id}
                            className={`result-card-item ${isFinal ? 'is-final' : ''}`}
                          >
                            <div className="result-card-top">
                              <span
                                className={`round-pill ${isFinal ? 'final-pill' : ''}`}
                              >
                                {res.ronda}
                              </span>
                              <span className="points-pill">+{res.puntos} pts</span>
                            </div>
                            <div className="result-players-scoreboard">
                              <div
                                className={`score-player-line ${
                                  isP1Winner ? 'winner-line' : ''
                                }`}
                              >
                                <strong>{res.jugador1}</strong>
                                {isP1Winner && (
                                  <span className="winner-crown">👑 Ganador</span>
                                )}
                              </div>
                              <div className="vs-badge-tiny">vs</div>
                              <div
                                className={`score-player-line ${
                                  !isP1Winner ? 'winner-line' : ''
                                }`}
                              >
                                <strong>{res.jugador2}</strong>
                                {!isP1Winner && (
                                  <span className="winner-crown">👑 Ganador</span>
                                )}
                              </div>
                            </div>
                            <div className="result-card-score-box">
                              <span className="score-label">Marcador:</span>
                              <strong className="score-value">{res.score}</strong>
                            </div>
                            {res.observaciones && (
                              <p className="result-obs-text">📝 {res.observaciones}</p>
                            )}
                            <div className="result-card-actions">
                              <button
                                type="button"
                                className="btn-edit-result-tiny"
                                onClick={() => handleEditResult(res)}
                              >
                                <Pencil size={12} /> Editar
                              </button>
                              <button
                                type="button"
                                className="btn-delete-result-tiny"
                                onClick={() => handleDeleteResult(res.id)}
                              >
                                <Trash2 size={12} /> Eliminar
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* LLAVES Y CUADRO INTERACTIVO DE SOPORTE */}
              {currentTourney.bracket && (
                <div className="scores-bracket-area-embedded panel">
                  <div className="scores-bracket-header">
                    <h3>Cuadro de Llaves Oficial — {currentTourney.title}</h3>
                  </div>
                  <TournamentBracket
                    bracket={currentTourney.bracket}
                    isAdmin={true}
                    onOpenScoreModal={handleOpenScoreModal}
                    onAssignBye={handleOpenByeModal}
                  />
                </div>
              )}
            </div>
          </section>
        )
      })()}

      {/* TAB: GESTIÓN DE NOTICIAS Y PUBLICACIONES DE LA COMUNIDAD */}
      {activeTab === 'comunidad' && (
        <section className="admin-tab-panel">
          <div className="admin-section-card panel">
            <div className="panel-title-row">
              <div>
                <h2>Gestión de Noticias y Publicaciones de la Comunidad</h2>
                <p>
                  Sube y organiza las noticias, crónicas y comunicados oficiales que se publican en la página de Comunidad.
                </p>
              </div>
              <button
                type="button"
                className="button button-lime btn-open-create-news"
                onClick={handleOpenCreateNews}
              >
                <Plus size={16} /> Publicar Nueva Noticia
              </button>
            </div>

            {/* BARRA DE ESTADÍSTICAS Y FILTROS */}
            <div className="news-admin-toolbar">
              <div className="news-stats-pills">
                <span className="news-stat-pill">
                  Total Publicadas: <strong>{newsList.length}</strong>
                </span>
                <span className="news-stat-pill highlight-featured">
                  Destacada: <strong>{newsList.filter((n) => n.destacada).length}</strong>
                </span>
                <span className="news-stat-pill highlight-image">
                  Con Imagen: <strong>{newsList.filter((n) => n.tipo === 'imagen').length}</strong>
                </span>
                <span className="news-stat-pill highlight-text">
                  Solo Texto: <strong>{newsList.filter((n) => n.tipo === 'texto').length}</strong>
                </span>
              </div>

              <div className="news-filter-chips">
                <button
                  type="button"
                  className={`btn-news-filter-chip ${newsFilterCategory === 'todas' ? 'active' : ''}`}
                  onClick={() => setNewsFilterCategory('todas')}
                >
                  Todas ({newsList.length})
                </button>
                <button
                  type="button"
                  className={`btn-news-filter-chip ${newsFilterCategory === 'imagen' ? 'active' : ''}`}
                  onClick={() => setNewsFilterCategory('imagen')}
                >
                  🖼️ Con Imagen ({newsList.filter((n) => n.tipo === 'imagen').length})
                </button>
                <button
                  type="button"
                  className={`btn-news-filter-chip ${newsFilterCategory === 'texto' ? 'active' : ''}`}
                  onClick={() => setNewsFilterCategory('texto')}
                >
                  📝 Solo Texto ({newsList.filter((n) => n.tipo === 'texto').length})
                </button>
                <button
                  type="button"
                  className={`btn-news-filter-chip ${newsFilterCategory === 'destacadas' ? 'active' : ''}`}
                  onClick={() => setNewsFilterCategory('destacadas')}
                >
                  ⭐ Destacada ({newsList.filter((n) => n.destacada).length})
                </button>
              </div>
            </div>

            {/* ESPACIOS ESTABLECIDOS / BANDEJA DE NOTICIAS */}
            <div className="news-established-spaces-grid">
              {filteredAdminNews.map((n, idx) => (
                <div
                  key={n.id}
                  className={`news-slot-card ${n.destacada ? 'is-featured-slot' : ''} ${n.tipo === 'texto' ? 'is-text-slot' : ''}`}
                >
                  <div className="slot-card-topbar">
                    <div className="slot-badge-group">
                      <span className="slot-number-pill">Espacio #{idx + 1}</span>
                      {n.destacada && <span className="slot-featured-badge">⭐ Destacada (Portada)</span>}
                      <span className={`slot-type-badge ${n.tipo === 'imagen' ? 'badge-img' : 'badge-txt'}`}>
                        {n.tipo === 'imagen' ? '🖼️ Con Imagen' : '📝 Solo Texto'}
                      </span>
                      <span className="slot-cat-badge">{n.categoria}</span>
                    </div>

                    <div className="slot-actions-btns">
                      <button
                        type="button"
                        className={`btn-slot-star ${n.destacada ? 'active' : ''}`}
                        title={n.destacada ? 'Quitar de portada destacada' : 'Fijar como portada destacada'}
                        onClick={() => handleToggleFeature(n.id)}
                      >
                        <Star size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-slot-edit"
                        title="Editar publicación"
                        onClick={() => handleOpenEditNews(n)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-slot-delete"
                        title="Eliminar publicación"
                        onClick={() => handleDeleteNewsItem(n)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="slot-card-body">
                    {n.tipo === 'imagen' && n.imagen ? (
                      <div className="slot-img-preview">
                        <img src={n.imagen} alt={n.titulo} />
                      </div>
                    ) : (
                      <div className="slot-text-preview-box">
                        <FileText size={24} className="text-quote-icon" />
                        <span className="text-format-tag">COMUNICADO OFICIAL</span>
                      </div>
                    )}

                    <div className="slot-content-col">
                      <h4>{n.titulo}</h4>
                      <p className="slot-summary-text">{n.resumen}</p>
                      <div className="slot-meta-footer">
                        <span>📅 {n.fecha}</span>
                        <span>✍️ {n.autor}</span>
                        <a
                          href={getAssetUrl('/comunidad')}
                          target="_blank"
                          rel="noreferrer"
                          className="slot-view-link"
                          title="Ver en la sección de Comunidad"
                        >
                          Ver en Comunidad <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAdminNews.length === 0 && (
                <div className="news-empty-state-card">
                  <Newspaper size={40} color="#00CFA0" />
                  <h4>No hay publicaciones en este filtro</h4>
                  <p>Crea tu primera noticia o comunicado para la comunidad tenística.</p>
                  <button
                    type="button"
                    className="button button-lime"
                    onClick={handleOpenCreateNews}
                  >
                    <Plus size={15} /> Publicar Noticia Ahora
                  </button>
                </div>
              )}
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
                      src={getAssetUrl(slide.image || '/assets/hero1.png')}
                      alt={`Diapositiva ${idx + 1}`}
                      onError={(e) => handleImageFallback(e, '/assets/hero1.png')}
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
                      <Camera size={15} /> Subir imagen desde mi PC (1920x1080 px · Máx. 5 MB)
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

          {/* SECCIÓN 2: BANNERS DEL HOME Y CONTENIDO DE PORTADA */}
          <div className="admin-section-card panel home-banners-admin-section">
            <div className="panel-title-row">
              <div>
                <div className="title-with-badge">
                  <h2>Banners del Home y Contenido de Portada</h2>
                  <span className="dimension-pill">Personalización Total</span>
                </div>
                <p>
                  Edita la información, títulos, descripciones, botones e imágenes de los banners y tarjetas del Home en tiempo real.
                </p>
              </div>
              <button
                type="button"
                className="button button-lime btn-save-all-banners"
                onClick={handleSaveAllHomeBanners}
              >
                <Save size={16} /> Guardar Todos los Banners
              </button>
            </div>

            <div className="home-banners-admin-grid">

              {/* BANNER 1: INSCRIPCIONES Y REGISTRO */}
              <div className="banner-config-card panel">
                <div className="card-header-with-badge">
                  <div>
                    <span className="banner-kicker-label">Sección 1</span>
                    <h4>Banner de Inscripciones y Torneos</h4>
                  </div>
                  <span className="dimension-pill">📐 1920x1080 px (16:9)</span>
                </div>
                <p className="banner-card-hint">
                  Aparece debajo de las tarjetas de torneos rápidos. Invita a los tenistas a registrarse e inscribirse.
                </p>

                {/* Vista previa en vivo del banner */}
                <div className="banner-live-preview-box">
                  <img
                    src={getAssetUrl(homeBannerInputs.signupBanner?.image || '/assets/Evento.png')}
                    alt="Vista previa banner"
                    onError={(e) => handleImageFallback(e, '/assets/Evento.png')}
                  />
                  <div className="preview-content-overlay">
                    <span className="preview-kicker">{homeBannerInputs.signupBanner?.kicker || 'Regístrate ahora'}</span>
                    <h5>
                      {homeBannerInputs.signupBanner?.title || 'Inscripciones abiertas'}
                      {homeBannerInputs.signupBanner?.highlight && (
                        <em> {homeBannerInputs.signupBanner.highlight}</em>
                      )}
                    </h5>
                    <p>{homeBannerInputs.signupBanner?.description || 'Participa en nuestros torneos...'}</p>
                    <span className="preview-btn-mock">
                      {homeBannerInputs.signupBanner?.buttonText || 'Registrarse'} →
                    </span>
                  </div>
                </div>

                <div className="banner-form-fields">
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Antetítulo (Kicker):</label>
                      <input
                        type="text"
                        value={homeBannerInputs.signupBanner?.kicker || ''}
                        placeholder="Ej. Regístrate ahora"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            signupBanner: { ...prev.signupBanner, kicker: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Texto destacado (color lima):</label>
                      <input
                        type="text"
                        value={homeBannerInputs.signupBanner?.highlight || ''}
                        placeholder="Ej. torneos de tenis"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            signupBanner: { ...prev.signupBanner, highlight: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Título principal:</label>
                    <input
                      type="text"
                      value={homeBannerInputs.signupBanner?.title || ''}
                      placeholder="Ej. Inscripciones abiertas"
                      onChange={(e) =>
                        setHomeBannerInputs((prev) => ({
                          ...prev,
                          signupBanner: { ...prev.signupBanner, title: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Descripción / Bajada:</label>
                    <textarea
                      rows={2}
                      value={homeBannerInputs.signupBanner?.description || ''}
                      placeholder="Ej. Participa en nuestros torneos y demuestra tu talento en la cancha."
                      onChange={(e) =>
                        setHomeBannerInputs((prev) => ({
                          ...prev,
                          signupBanner: { ...prev.signupBanner, description: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Texto del Botón:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.signupBanner?.buttonText || ''}
                        placeholder="Ej. Registrarse"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            signupBanner: { ...prev.signupBanner, buttonText: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Acción del Botón:</label>
                      <select
                        value={homeBannerInputs.signupBanner?.buttonAction || 'register'}
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            signupBanner: { ...prev.signupBanner, buttonAction: e.target.value }
                          }))
                        }
                      >
                        <option value="register">Abrir ventana modal de Registro</option>
                        <option value="link">Enlace web / URL personalizado</option>
                      </select>
                    </div>
                  </div>

                  {homeBannerInputs.signupBanner?.buttonAction === 'link' && (
                    <div className="admin-form-group">
                      <label>URL o Ancla del Botón:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.signupBanner?.buttonLink || ''}
                        placeholder="Ej. /torneos o https://..."
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            signupBanner: { ...prev.signupBanner, buttonLink: e.target.value }
                          }))
                        }
                      />
                    </div>
                  )}

                  {/* Imagen de fondo */}
                  <div className="banner-image-controls">
                    <label>Imagen de Fondo (Banner 16:9):</label>
                    <div className="image-input-upload-row">
                      <input
                        type="text"
                        value={homeBannerInputs.signupBanner?.image || ''}
                        placeholder="URL de imagen https://..."
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            signupBanner: { ...prev.signupBanner, image: e.target.value }
                          }))
                        }
                      />
                      <label className="btn-file-upload">
                        <Camera size={14} /> Subir archivo (1920x1080 px · Máx. 5 MB)
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleBannerFileUpload('signupBanner', e.target.files[0])
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="card-save-footer">
                    <button
                      type="button"
                      className="button button-lime"
                      onClick={() => handleSaveSingleBanner('signupBanner', 'Banner de Inscripciones')}
                    >
                      <Save size={14} /> Guardar Banner de Registro
                    </button>
                  </div>
                </div>
              </div>

              {/* BANNER 2: REDES SOCIALES */}
              <div className="banner-config-card panel">
                <div className="card-header-with-badge">
                  <div>
                    <span className="banner-kicker-label">Sección 2</span>
                    <h4>Banner de Redes Sociales (Comunidad)</h4>
                  </div>
                  <span className="dimension-pill">📐 Formato PNG / Ilustración</span>
                </div>
                <p className="banner-card-hint">
                  Tarjeta para invitar a la comunidad a seguir las redes oficiales de Instagram y WhatsApp.
                </p>

                {/* Vista previa en vivo */}
                <div className="banner-live-preview-box social-preview-box">
                  <div className="social-preview-art">
                    <img
                      src={getAssetUrl(homeBannerInputs.socialBanner?.image || '/assets/Redes.png')}
                      alt="Arte redes sociales"
                      onError={(e) => handleImageFallback(e, '/assets/Redes.png')}
                    />
                  </div>
                  <div className="social-preview-text">
                    <span className="preview-eyebrow">{homeBannerInputs.socialBanner?.eyebrow || '// SÍGUENOS EN REDES'}</span>
                    <h5>{homeBannerInputs.socialBanner?.title || 'Todo el tenis, en un solo lugar.'}</h5>
                    <p>{homeBannerInputs.socialBanner?.description || 'Mantente al día con los torneos...'}</p>
                  </div>
                </div>

                <div className="banner-form-fields">
                  <div className="admin-form-group">
                    <label>Antetítulo (Eyebrow):</label>
                    <input
                      type="text"
                      value={homeBannerInputs.socialBanner?.eyebrow || ''}
                      placeholder="Ej. // SÍGUENOS EN REDES"
                      onChange={(e) =>
                        setHomeBannerInputs((prev) => ({
                          ...prev,
                          socialBanner: { ...prev.socialBanner, eyebrow: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Título principal:</label>
                    <input
                      type="text"
                      value={homeBannerInputs.socialBanner?.title || ''}
                      placeholder="Ej. Todo el tenis, en un solo lugar."
                      onChange={(e) =>
                        setHomeBannerInputs((prev) => ({
                          ...prev,
                          socialBanner: { ...prev.socialBanner, title: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Descripción:</label>
                    <textarea
                      rows={2}
                      value={homeBannerInputs.socialBanner?.description || ''}
                      placeholder="Ej. Mantente al día con los torneos, resultados, noticias..."
                      onChange={(e) =>
                        setHomeBannerInputs((prev) => ({
                          ...prev,
                          socialBanner: { ...prev.socialBanner, description: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Enlace de Instagram:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.socialBanner?.instagramUrl || ''}
                        placeholder="https://www.instagram.com/..."
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            socialBanner: { ...prev.socialBanner, instagramUrl: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Enlace de WhatsApp:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.socialBanner?.whatsappUrl || ''}
                        placeholder="https://wa.me/51..."
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            socialBanner: { ...prev.socialBanner, whatsappUrl: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Imagen / Ilustración */}
                  <div className="banner-image-controls">
                    <label>Ilustración / Imagen de Redes:</label>
                    <div className="image-input-upload-row">
                      <input
                        type="text"
                        value={homeBannerInputs.socialBanner?.image || ''}
                        placeholder="URL de imagen https://..."
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            socialBanner: { ...prev.socialBanner, image: e.target.value }
                          }))
                        }
                      />
                      <label className="btn-file-upload">
                        <Camera size={14} /> Subir imagen (máx. 5 MB)
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleBannerFileUpload('socialBanner', e.target.files[0])
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="card-save-footer">
                    <button
                      type="button"
                      className="button button-lime"
                      onClick={() => handleSaveSingleBanner('socialBanner', 'Banner de Redes Sociales')}
                    >
                      <Save size={14} /> Guardar Banner de Redes
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: PREGUNTAS FRECUENTES Y REGLAS */}
              <div className="banner-config-card panel">
                <div className="card-header-with-badge">
                  <div>
                    <span className="banner-kicker-label">Sección 3</span>
                    <h4>Preguntas Frecuentes y Enlaces de Reglas</h4>
                  </div>
                  <span className="dimension-pill">⚙️ Información Home</span>
                </div>
                <p className="banner-card-hint">
                  Personaliza los textos de la tarjeta de contacto rápido y el encabezado de reglas del circuito.
                </p>

                <div className="banner-form-fields">
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Título Preguntas Frecuentes:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.faqSection?.title || ''}
                        placeholder="Ej. Preguntas frecuentes"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            faqSection: { ...prev.faqSection, title: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Subtítulo de Ayuda:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.faqSection?.subtitle || ''}
                        placeholder="Ej. ¿No se resolvió tu duda?"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            faqSection: { ...prev.faqSection, subtitle: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Texto Botón Escríbenos:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.faqSection?.buttonText || ''}
                        placeholder="Ej. Escríbenos"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            faqSection: { ...prev.faqSection, buttonText: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Enlace de WhatsApp de Soporte:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.faqSection?.whatsappUrl || ''}
                        placeholder="https://wa.me/51..."
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            faqSection: { ...prev.faqSection, whatsappUrl: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Antetítulo de Reglas:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.faqSection?.rulesEyebrow || ''}
                        placeholder="Ej. Información para jugadores"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            faqSection: { ...prev.faqSection, rulesEyebrow: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Título de Reglas:</label>
                      <input
                        type="text"
                        value={homeBannerInputs.faqSection?.rulesTitle || ''}
                        placeholder="Ej. Reglas de torneos"
                        onChange={(e) =>
                          setHomeBannerInputs((prev) => ({
                            ...prev,
                            faqSection: { ...prev.faqSection, rulesTitle: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="card-save-footer">
                    <button
                      type="button"
                      className="button button-lime"
                      onClick={() => handleSaveSingleBanner('faqSection', 'Sección de Preguntas y Reglas')}
                    >
                      <Save size={14} /> Guardar Preguntas y Reglas
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: LOGOS OFICIALES PLATINO Y ATAP */}
              <div className="banner-config-card panel logos-config-card">
                <div className="card-header-with-badge">
                  <div>
                    <span className="banner-kicker-label">Sección 4</span>
                    <h4>Logos Oficiales del Sitio (Platino y ATAP)</h4>
                  </div>
                  <span className="dimension-pill">📐 Logos Oficiales</span>
                </div>
                <p className="banner-card-hint">
                  Cambia el logo del Main Sponsor Platino Perú y el escudo oficial de la Asociación ATAP.
                </p>

                <div className="official-logos-subgrid">
                  {/* LOGO PLATINO */}
                  <div className="mini-logo-edit-box">
                    <h5>Logo Platino Sponsor</h5>
                    <div className="img-preview-box" style={{ background: '#00304A' }}>
                      <img
                        src={getAssetUrl(siteImageInputs.logoPlatino || siteImages.logoPlatino)}
                        alt="Logo Platino"
                        onError={(e) => handleImageFallback(e, '/assets/Logo Platino.png')}
                      />
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
                        <Camera size={14} /> Subir archivo (máx. 5 MB)
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
                  <div className="mini-logo-edit-box">
                    <h5>Logo Oficial ATAP</h5>
                    <div className="img-preview-box" style={{ background: '#00304A' }}>
                      <img
                        src={getAssetUrl(siteImageInputs.logoAtap || siteImages.logoAtap)}
                        alt="Logo ATAP"
                        onError={(e) => handleImageFallback(e, '/assets/logo.png')}
                      />
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
                        <Camera size={14} /> Subir archivo (máx. 5 MB)
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

            </div>
          </div>

          {/* SECCIÓN C: GESTIÓN DE AUSPICIADORES / SPONSORS */}
          <div className="admin-section-card panel sponsors-admin-section">
            <div className="panel-title-row">
              <div>
                <div className="title-with-pill">
                  <h2>Auspiciadores Oficiales del Circuito (Sponsors)</h2>
                  <span className="sponsor-count-pill">{sponsors.length} Espacios</span>
                </div>
                <p>
                  Espacio configurado para logos de auspiciadores. Solo se agrega una imagen por auspiciador (sube archivo o pega URL). Puedes agregar más espacios en cualquier momento.
                </p>
                <div className="sponsors-filter-notice-box">
                  <span className="notice-icon">💡</span>
                  <div>
                    <strong>Regla visual en el Home:</strong>
                    <p>Para garantizar una presentación limpia y oficial, los auspiciadores que no tengan una imagen o logo cargado NO aparecerán como nombres de texto en la página principal. Solo se mostrarán las marcas que cuenten con su logo oficial.</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-add-sponsor-action"
                onClick={handleAddSponsor}
              >
                <Plus size={16} /> Agregar otro auspiciador
              </button>
            </div>

            <div className="admin-sponsors-grid">
              {sponsors.map((sp, idx) => (
                <div key={sp.id} className="sponsor-edit-card panel">
                  <div className="sponsor-card-top">
                    <span className="sponsor-card-badge">Auspiciador #{idx + 1}</span>
                    <button
                      type="button"
                      className="btn-delete-sponsor-slot"
                      title={`Eliminar espacio #${idx + 1}`}
                      onClick={() => handleDeleteSponsor(sp.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="sponsor-img-preview-box">
                    {sp.logo ? (
                      <div className="sponsor-logo-wrap">
                        <img src={sp.logo} alt={`Logo Auspiciador #${idx + 1}`} />
                        <button
                          type="button"
                          className="btn-clear-sponsor-img"
                          title="Quitar imagen"
                          onClick={() => handleClearSponsorLogo(sp.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="sponsor-empty-state">
                        <ImageIcon size={26} className="sponsor-placeholder-icon" />
                        <span className="empty-text">Sin logo cargado</span>
                        <small className="empty-subtext">Sube una imagen o pega URL</small>
                      </div>
                    )}
                  </div>

                  <div className="sponsor-card-controls">
                    <label className="btn-sponsor-upload">
                      <Camera size={13} /> Subir imagen (máx. 5 MB)
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleSponsorFileUpload(sp.id, e.target.files[0])
                          }
                        }}
                      />
                    </label>

                    <div className="sponsor-url-row">
                      <input
                        type="text"
                        placeholder="URL https://... logo.png"
                        value={sponsorUrlInputs[sp.id] !== undefined ? sponsorUrlInputs[sp.id] : (sp.logo || '')}
                        onChange={(e) =>
                          setSponsorUrlInputs({ ...sponsorUrlInputs, [sp.id]: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="btn-save-sponsor-url"
                        onClick={() => handleSaveSponsorUrl(sp.id)}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* BOTÓN / TARJETA PARA AGREGAR OTRO AUSPICIADOR */}
              <button
                type="button"
                className="add-sponsor-slot-card panel"
                onClick={handleAddSponsor}
              >
                <div className="add-sponsor-circle">
                  <Plus size={24} />
                </div>
                <strong>+ Agregar otro auspiciador</strong>
                <small>Crear espacio #{sponsors.length + 1}</small>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 7: TEMPORADAS ANUALES Y ARCHIVO HISTORICO */}
      {activeTab === 'temporadas' && (
        <section className="admin-tab-panel">
          <div className="section-title-wrap">
            <div className="title-with-pill">
              <h2>Gestión de Temporadas Anuales y Cierre Oficial</h2>
              <span className="live-season-kicker-pill">
                <span className="live-dot-mini" /> Temporada {activeSeasonYear} Activa
              </span>
            </div>
            <p>
              El circuito ATAP funciona mediante ciclos anuales oficiales (<strong>1 de Enero al 31 de Diciembre</strong>).
              Al finalizar el año calendario, los puntos acumulados por los jugadores en Singles y Dobles quedan
              congelados en el archivo histórico y todos los tenistas inician la nueva temporada con 0 puntos.
            </p>
          </div>

          {/* ACTIVE SEASON CONTROL CARD */}
          <div className="admin-active-season-card panel">
            <div className="season-card-status-badge">
              <span className="pulse-indicator" />
              <span>Temporada en Curso • Acumulando Puntos en Vivo</span>
            </div>

            <div className="season-card-main-info">
              <div className="season-card-year-block">
                <span className="season-badge-label">Año Oficial</span>
                <h1 className="season-display-year">{activeSeasonYear}</h1>
                <span className="season-calendar-range">
                  <Calendar size={14} /> 1 de Enero - 31 de Diciembre, {activeSeasonYear}
                </span>
              </div>

              <div className="season-card-details">
                <div className="season-rule-box">
                  <h4>Reglamento Oficial de Ciclo Deportivo ATAP:</h4>
                  <ul>
                    <li>
                      <strong>Puntos en Vivo:</strong> Todos los partidos y torneos jugados durante {activeSeasonYear} suman directamente al ranking oficial.
                    </li>
                    <li>
                      <strong>Cierre Anual (31 Dic):</strong> Al cerrarse la temporada, los puntos alcanzados quedan inalterables ("quietos sin sumar") en el archivo histórico de ATAP.
                    </li>
                    <li>
                      <strong>Reinicio a 0:</strong> El 1 de Enero del nuevo año, todos los tenistas del circuito inician con 0 pts, preservando sus categorías, historiales, fotos y perfiles intactos.
                    </li>
                  </ul>
                </div>

                <div className="season-stats-summary-grid">
                  <div className="season-mini-stat">
                    <span className="stat-label">Jugadores en Circuito</span>
                    <strong className="stat-val">{ranking.length} Tenistas</strong>
                  </div>
                  <div className="season-mini-stat">
                    <span className="stat-label">Modalidades</span>
                    <strong className="stat-val">Singles & Dobles</strong>
                  </div>
                  <div className="season-mini-stat">
                    <span className="stat-label">Categorías Oficiales</span>
                    <strong className="stat-val">4ta, 5ta A, 5ta B, 6ta</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="season-card-footer-action">
              <div className="season-action-disclaimer">
                <AlertTriangle size={18} className="warn-icon" />
                <span>
                  El botón a continuación ejecuta el cierre oficial de la <strong>Temporada {activeSeasonYear}</strong>,
                  archivando los puntajes al 31 de Diciembre e iniciando la <strong>Temporada {Number(activeSeasonYear) + 1}</strong> con todos los jugadores en 0 pts.
                </span>
              </div>
              <button
                type="button"
                className="btn-close-season-trigger"
                onClick={() => setShowCloseSeasonModal(true)}
              >
                <Lock size={16} />
                <span>Cerrar Temporada {activeSeasonYear} y Reiniciar a 0</span>
              </button>
            </div>
          </div>

          {/* ARCHIVED SEASONS LIST */}
          <div className="admin-seasons-archive-card panel">
            <div className="archive-card-header">
              <div className="title-with-pill">
                <h3>Archivo Histórico de Temporadas Culminadas</h3>
                <span className="archive-count-badge">
                  {seasonsList.filter((s) => !s.esActiva).length} Temporadas Guardadas
                </span>
              </div>
              <p>
                Estas temporadas representan ciclos deportivos anteriores que ya culminaron su período oficial del 1 Ene al 31 Dic.
                Los puntos de estas temporadas no se alteran y se encuentran disponibles para consulta pública en la página de Ranking.
              </p>
            </div>

            <div className="table-responsive">
              <table className="admin-archive-table">
                <thead>
                  <tr>
                    <th>Temporada</th>
                    <th>Período Oficial</th>
                    <th>Estado</th>
                    <th>Fecha de Cierre</th>
                    <th>Campeón Singles (4ta)</th>
                    <th>Campeón Dobles (4ta)</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonsList.filter((s) => !s.esActiva).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#64727A' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>🎾</span>
                          <strong style={{ color: '#00304A', fontSize: '15px' }}>
                            Temporada Inaugural en Curso ({activeSeasonYear})
                          </strong>
                          <p style={{ margin: 0, fontSize: '13px', maxWidth: '520px', lineHeight: 1.5 }}>
                            Los torneos del circuito ATAP arrancan desde este año {activeSeasonYear}. Al culminar el ciclo anual el 31 de Diciembre (o al ejecutar el cierre de temporada), los puntos alcanzados quedarán archivados aquí y los tenistas iniciarán en 0 puntos.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    seasonsList.filter((s) => !s.esActiva).map((s) => (
                      <tr key={s.year}>
                        <td>
                          <div className="archive-year-pill">
                            <Lock size={13} />
                            <strong>Temporada {s.year}</strong>
                          </div>
                        </td>
                        <td>{s.periodo}</td>
                        <td>
                          <span className="archive-status-badge">
                            🔒 Finalizada y Congelada
                          </span>
                        </td>
                        <td>{s.fechaCierre || `31 de Diciembre, ${s.year}`}</td>
                        <td>
                          <strong className="champ-name-text">🏆 {s.campeonSingles || 'Luciana Pérez (4ta)'}</strong>
                        </td>
                        <td>
                          <strong className="champ-name-text">🏆 {s.campeonDobles || 'Diego Sánchez (4ta)'}</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <a
                            href={getAssetUrl('/ranking')}
                            className="btn-view-archive-ranking"
                            title="Ver en Ranking Oficial"
                          >
                            <ExternalLink size={13} />
                            <span>Ver en Ranking</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 8: POLÍTICAS & REGLAS OFICIALES */}
      {activeTab === 'reglas' && (
        <section className="admin-tab-panel">
          <div className="section-title-wrap policies-admin-header">
            <div className="title-with-pill">
              <h2>Editor Oficial de Políticas & Reglas</h2>
              <span className="live-season-kicker-pill">
                <ScrollText size={13} /> {policiesList.length} Capítulos Oficiales
              </span>
            </div>
            <p>
              Modifica, amplía o ajusta el reglamento oficial de ATAP en tiempo real. Los cambios guardados se reflejan inmediatamente en la página pública <code>/reglas</code>, en el Footer del sitio y en el modal obligatorio de inscripción a torneos.
            </p>

            <div className="policies-admin-top-actions">
              <a
                href={getAssetUrl('/reglas')}
                target="_blank"
                rel="noreferrer"
                className="btn-view-public-rules"
              >
                <ExternalLink size={14} />
                <span>Ver Reglamento Público</span>
              </a>
              <button
                type="button"
                className="btn-reset-policies"
                onClick={handleResetDefaultPolicies}
                title="Restablecer textos oficiales iniciales de ATAP"
              >
                <XCircle size={14} />
                <span>Restaurar Predeterminado</span>
              </button>
              <button
                type="button"
                className={'btn-save-policies' + (hasPoliciesChanges ? ' btn-highlight-save' : '')}
                onClick={handleSaveAllPolicies}
                disabled={isSavingPolicies}
              >
                <Save size={15} />
                <span>{isSavingPolicies ? 'Guardando...' : 'Guardar Todo el Reglamento'}</span>
              </button>
            </div>
          </div>

          {/* WARNING BANNER IF UNSAVED */}
          {hasPoliciesChanges && (
            <div className="policies-unsaved-alert panel">
              <AlertTriangle size={18} className="warn-icon" />
              <div className="unsaved-alert-content">
                <strong>Tienes modificaciones sin guardar en el reglamento</strong>
                <span>Haz clic en "Guardar Todo el Reglamento" para aplicar los cambios en vivo en la plataforma.</span>
              </div>
              <button
                type="button"
                className="btn-save-quick"
                onClick={handleSaveAllPolicies}
              >
                Guardar Ahora
              </button>
            </div>
          )}

          {/* MAIN TWO-COLUMN WORKBENCH */}
          <div className="policies-editor-workbench">
            {/* SIDEBAR: CHAPTER LIST */}
            <div className="policies-chapters-sidebar panel">
              <div className="sidebar-header">
                <h3>Capítulos del Reglamento</h3>
                <span className="chapter-count-chip">{policiesList.length} Secciones</span>
              </div>

              <div className="policies-nav-list">
                {policiesList.map((sec, idx) => (
                  <button
                    key={sec.id || idx}
                    type="button"
                    className={'policy-nav-item' + (selectedPolicyIndex === idx ? ' active' : '')}
                    onClick={() => setSelectedPolicyIndex(idx)}
                  >
                    <div className="policy-nav-num">Cap. {sec.num || idx + 1}</div>
                    <div className="policy-nav-title">{sec.title || `Capítulo ${idx + 1}`}</div>
                    <div className="policy-nav-snippet">
                      {sec.summary || (sec.content ? sec.content.slice(0, 70) + '...' : '')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIVE CHAPTER EDITOR */}
            <div className="policies-chapter-editor panel">
              {policiesList[selectedPolicyIndex] ? (
                (() => {
                  const currentPolicy = policiesList[selectedPolicyIndex]
                  return (
                    <div className="policy-editor-form">
                      <div className="editor-form-header">
                        <div className="editor-cap-badge">
                          Capítulo {currentPolicy.num || selectedPolicyIndex + 1}
                        </div>
                        <span className="editor-sync-status">
                          <CheckCircle2 size={14} color="#00CFA0" /> Editando en vivo
                        </span>
                      </div>

                      <div className="form-group-admin">
                        <label>Título del Capítulo Oficial</label>
                        <input
                          type="text"
                          className="admin-input-text"
                          value={currentPolicy.title || ''}
                          onChange={(e) =>
                            handleUpdatePolicyField(selectedPolicyIndex, 'title', e.target.value)
                          }
                          placeholder="Ej: 1. Uso de Imagen"
                        />
                      </div>

                      <div className="form-group-admin">
                        <label>Resumen Breve / Descripción Rápida</label>
                        <input
                          type="text"
                          className="admin-input-text"
                          value={currentPolicy.summary || ''}
                          onChange={(e) =>
                            handleUpdatePolicyField(selectedPolicyIndex, 'summary', e.target.value)
                          }
                          placeholder="Breve descripción del capítulo para tablas y resúmenes..."
                        />
                      </div>

                      <div className="form-group-admin">
                        <div className="label-with-hint">
                          <label>Cuerpo Oficial del Reglamento (Párrafos, Reglas y Viñetas)</label>
                          <small className="label-tip">
                            Tip: Separa los párrafos con saltos de línea e inicia las viñetas con "• " o "-"
                          </small>
                        </div>
                        <textarea
                          rows={14}
                          className="admin-textarea policy-content-textarea"
                          value={currentPolicy.content || ''}
                          onChange={(e) =>
                            handleUpdatePolicyField(selectedPolicyIndex, 'content', e.target.value)
                          }
                          placeholder="Escribe o pega aquí el texto del capítulo..."
                        />
                      </div>

                      {/* LIVE PREVIEW CARD */}
                      <div className="policy-preview-section">
                        <div className="preview-label">
                          <Eye size={14} /> Vista Previa para el Jugador:
                        </div>
                        <div className="policy-preview-box">
                          <div className="preview-header">
                            <span className="preview-num-badge">Cap. {currentPolicy.num || selectedPolicyIndex + 1}</span>
                            <h4>{currentPolicy.title}</h4>
                          </div>
                          {currentPolicy.summary && (
                            <p className="preview-summary">{currentPolicy.summary}</p>
                          )}
                          <div className="preview-body">
                            {(currentPolicy.content || '').split('\n\n').map((paragraph, pIdx) => (
                              <p key={pIdx}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="editor-footer-actions">
                        <button
                          type="button"
                          className="btn-save-policies"
                          onClick={handleSaveAllPolicies}
                          disabled={isSavingPolicies}
                        >
                          <Save size={15} />
                          <span>{isSavingPolicies ? 'Guardando...' : 'Guardar y Publicar Todo'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <p>Selecciona un capítulo de la lista lateral para editar su contenido.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 9: CONTACTO Y SOPORTE OFICIAL */}
      {activeTab === 'contacto' && (
        <section className="admin-tab-panel contact-admin-panel">
          <div className="admin-panel-topbar">
            <div>
              <span className="admin-pill-badge">Canales Oficiales</span>
              <h2>Configuración de Contacto, Sedes y Atención</h2>
              <p>
                Personaliza la información que ven los jugadores en la página de Contacto: número y mensajes de WhatsApp, correos de atención, sedes del circuito y la visibilidad de los horarios de servicio.
              </p>
            </div>
            <div className="admin-panel-topbar-actions">
              <a
                href={getAssetUrl('/contacto')}
                target="_blank"
                rel="noopener noreferrer"
                className="button btn-secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={14} /> Ver Página de Contacto
              </a>
              <button
                type="button"
                className="button button-lime"
                onClick={handleSaveContactSettings}
                disabled={isSavingContact}
              >
                <Save size={15} /> {isSavingContact ? 'Guardando...' : 'Guardar Todo'}
              </button>
            </div>
          </div>

          <div className="contact-config-cards-grid">
            {/* SECCIÓN 1: ENCABEZADO DE LA PÁGINA */}
            <div className="banner-config-card panel">
              <div className="card-header-with-badge">
                <div>
                  <span className="banner-kicker-label">Encabezado</span>
                  <h4>Título y Presentación de Contacto</h4>
                </div>
                <span className="dimension-pill">📝 Textos de Portada</span>
              </div>
              <p className="banner-card-hint">
                Mensaje introductorio que aparece en la parte superior de la página de contacto.
              </p>
              <div className="banner-form-fields">
                <div className="admin-form-group">
                  <label>Antetítulo (Eyebrow):</label>
                  <input
                    type="text"
                    value={contactInputs.header?.eyebrow || ''}
                    placeholder="Ej. ATENCIÓN AL JUGADOR Y AFILIADOS"
                    onChange={(e) =>
                      setContactInputs((prev) => ({
                        ...prev,
                        header: { ...prev.header, eyebrow: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>Título Principal:</label>
                  <input
                    type="text"
                    value={contactInputs.header?.title || ''}
                    placeholder="Ej. Contacto y Soporte Oficial ATAP"
                    onChange={(e) =>
                      setContactInputs((prev) => ({
                        ...prev,
                        header: { ...prev.header, title: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>Descripción / Mensaje a los Jugadores:</label>
                  <textarea
                    rows={2}
                    value={contactInputs.header?.description || ''}
                    placeholder="Describe el soporte que brinda la coordinación técnica y administrativa..."
                    onChange={(e) =>
                      setContactInputs((prev) => ({
                        ...prev,
                        header: { ...prev.header, description: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CANAL WHATSAPP */}
            <div className="banner-config-card panel">
              <div className="card-header-with-badge">
                <div>
                  <span className="banner-kicker-label">Canal 1</span>
                  <h4>WhatsApp Oficial de ATAP</h4>
                </div>
                <span className="dimension-pill">💬 Enlace Directo</span>
              </div>
              <p className="banner-card-hint">
                Configura el número y los textos de la tarjeta para envío de comprobantes y consultas rápidas.
              </p>
              <div className="banner-form-fields">
                <div className="form-row-2col">
                  <div className="admin-form-group">
                    <label>Título de la Tarjeta:</label>
                    <input
                      type="text"
                      value={contactInputs.whatsapp?.title || ''}
                      placeholder="Ej. WhatsApp Oficial"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          whatsapp: { ...prev.whatsapp, title: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Texto del Botón:</label>
                    <input
                      type="text"
                      value={contactInputs.whatsapp?.btnText || ''}
                      placeholder="Ej. Iniciar Chat WhatsApp"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          whatsapp: { ...prev.whatsapp, btnText: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="admin-form-group">
                    <label>Teléfono Visible (con formato):</label>
                    <input
                      type="text"
                      value={contactInputs.whatsapp?.phone || ''}
                      placeholder="Ej. +51 977 884 423"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          whatsapp: { ...prev.whatsapp, phone: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Número WhatsApp para wa.me (solo dígitos con código de país):</label>
                    <input
                      type="text"
                      value={contactInputs.whatsapp?.number || ''}
                      placeholder="Ej. 51977884423"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          whatsapp: { ...prev.whatsapp, number: e.target.value.replace(/\D/g, '') }
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Subtexto / Descripción:</label>
                  <input
                    type="text"
                    value={contactInputs.whatsapp?.subtext || ''}
                    placeholder="Ej. Atención ágil para envío de comprobantes de pago y consultas en tiempo real."
                    onChange={(e) =>
                      setContactInputs((prev) => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, subtext: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CORREO ELECTRÓNICO */}
            <div className="banner-config-card panel">
              <div className="card-header-with-badge">
                <div>
                  <span className="banner-kicker-label">Canal 2</span>
                  <h4>Correo Electrónico Oficial</h4>
                </div>
                <span className="dimension-pill">✉️ Asuntos Formales</span>
              </div>
              <p className="banner-card-hint">
                Canal para solicitudes formales, contratos de auspicio y trámites administrativos.
              </p>
              <div className="banner-form-fields">
                <div className="form-row-2col">
                  <div className="admin-form-group">
                    <label>Título de la Tarjeta:</label>
                    <input
                      type="text"
                      value={contactInputs.email?.title || ''}
                      placeholder="Ej. Correo Electrónico"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          email: { ...prev.email, title: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Dirección de Correo:</label>
                    <input
                      type="email"
                      value={contactInputs.email?.email || ''}
                      placeholder="contacto@atap.pe"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          email: { ...prev.email, email: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Subtexto / Descripción:</label>
                  <input
                    type="text"
                    value={contactInputs.email?.subtext || ''}
                    placeholder="Ej. Para consultas formales, solicitudes de auspicios y asuntos administrativos."
                    onChange={(e) =>
                      setContactInputs((prev) => ({
                        ...prev,
                        email: { ...prev.email, subtext: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: SEDES DEL CIRCUITO ("LA SEDE") */}
            <div className="banner-config-card panel">
              <div className="card-header-with-badge">
                <div>
                  <span className="banner-kicker-label">Canal 3</span>
                  <h4>Sedes Oficiales del Circuito ("La Sede")</h4>
                </div>
                <span className="dimension-pill">📍 Ubicación & Canchas</span>
              </div>
              <p className="banner-card-hint">
                Especifica la ciudad, sedes centrales y clubes asociados donde se disputan los torneos.
              </p>
              <div className="banner-form-fields">
                <div className="form-row-2col">
                  <div className="admin-form-group">
                    <label>Título de la Tarjeta:</label>
                    <input
                      type="text"
                      value={contactInputs.sede?.title || ''}
                      placeholder="Ej. Sedes del Circuito"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          sede: { ...prev.sede, title: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Ubicación / Ciudad Principal:</label>
                    <input
                      type="text"
                      value={contactInputs.sede?.location || ''}
                      placeholder="Ej. Lima Metropolitana, Perú"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          sede: { ...prev.sede, location: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="admin-form-group">
                    <label>Clubes / Canchas Asociadas:</label>
                    <input
                      type="text"
                      value={contactInputs.sede?.subtext || ''}
                      placeholder="Ej. Club Lawn Tennis de la Exposición y clubes asociados del circuito amateur."
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          sede: { ...prev.sede, subtext: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Etiqueta / Badge:</label>
                    <input
                      type="text"
                      value={contactInputs.sede?.tagText || ''}
                      placeholder="Ej. Canchas Oficiales"
                      onChange={(e) =>
                        setContactInputs((prev) => ({
                          ...prev,
                          sede: { ...prev.sede, tagText: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: HORARIOS DE SERVICIO */}
            <div className="banner-config-card panel">
              <div className="card-header-with-badge">
                <div>
                  <span className="banner-kicker-label">Canal 4</span>
                  <h4>Horarios de Servicio y Atención</h4>
                </div>
                <span className={`dimension-pill ${contactInputs.horario?.visible ? 'status-pill-green' : 'status-pill-gray'}`}>
                  {contactInputs.horario?.visible ? '🟢 Tarjeta Activa' : '⚪ Tarjeta Oculta'}
                </span>
              </div>
              <p className="banner-card-hint">
                Activa o desactiva la visualización de la tarjeta de horarios según la disponibilidad del equipo organizador.
              </p>

              {/* TOGGLE SWITCH DESTACADO */}
              <div
                style={{
                  background: contactInputs.horario?.visible ? '#F0FDF4' : '#F8FAFC',
                  border: `1.5px solid ${contactInputs.horario?.visible ? '#86EFAC' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() =>
                  setContactInputs((prev) => ({
                    ...prev,
                    horario: { ...prev.horario, visible: !prev.horario?.visible }
                  }))
                }
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: contactInputs.horario?.visible ? '#15803D' : '#1E293B', marginBottom: '4px' }}>
                    {contactInputs.horario?.visible ? '✓ Tarjeta de Horarios VISIBLE en la página de Contacto' : '✕ Tarjeta de Horarios OCULTA (Recomendado si no tienen horario de servicio fijo)'}
                  </strong>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    {contactInputs.horario?.visible
                      ? 'Los visitantes verán los horarios configurados abajo.'
                      : 'Actualmente oculta para que los jugadores se comuniquen directamente por WhatsApp sin restricción horaria.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(contactInputs.horario?.visible)}
                  onChange={(e) =>
                    setContactInputs((prev) => ({
                      ...prev,
                      horario: { ...prev.horario, visible: e.target.checked }
                    }))
                  }
                  style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#16A34A' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {contactInputs.horario?.visible && (
                <div className="banner-form-fields">
                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Título de la Tarjeta:</label>
                      <input
                        type="text"
                        value={contactInputs.horario?.title || ''}
                        placeholder="Ej. Horarios de Atención"
                        onChange={(e) =>
                          setContactInputs((prev) => ({
                            ...prev,
                            horario: { ...prev.horario, title: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Horario Principal:</label>
                      <input
                        type="text"
                        value={contactInputs.horario?.primary || ''}
                        placeholder="Ej. Lun a Sáb: 8:00 AM - 9:00 PM"
                        onChange={(e) =>
                          setContactInputs((prev) => ({
                            ...prev,
                            horario: { ...prev.horario, primary: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="admin-form-group">
                      <label>Días de Torneo / Nota especial:</label>
                      <input
                        type="text"
                        value={contactInputs.horario?.subtext || ''}
                        placeholder="Ej. Domingos y días de torneo: 8:00 AM - 2:00 PM con soporte en cancha."
                        onChange={(e) =>
                          setContactInputs((prev) => ({
                            ...prev,
                            horario: { ...prev.horario, subtext: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Etiqueta / Badge:</label>
                      <input
                        type="text"
                        value={contactInputs.horario?.tagText || ''}
                        placeholder="Ej. Soporte Activo"
                        onChange={(e) =>
                          setContactInputs((prev) => ({
                            ...prev,
                            horario: { ...prev.horario, tagText: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-policies-footer-sticky" style={{ marginTop: '28px' }}>
            <button
              type="button"
              className="button button-lime"
              onClick={handleSaveContactSettings}
              disabled={isSavingContact}
              style={{ fontSize: '15px', padding: '12px 28px' }}
            >
              <Save size={16} /> {isSavingContact ? 'Guardando...' : 'Guardar Todos los Cambios de Contacto y Sedes'}
            </button>
            <button
              type="button"
              className="button btn-secondary"
              onClick={handleResetContactSettings}
              style={{ fontSize: '13px' }}
            >
              Restablecer Valores Predeterminados
            </button>
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

              <div className="bye-quick-toggle-wrap">
                <button
                  type="button"
                  className={`btn-toggle-bye-mode ${set1Score === 'BYE' ? 'active' : ''}`}
                  onClick={() => {
                    if (set1Score === 'BYE') {
                      setSet1Score('6-4')
                      setSet2Score('6-3')
                      setSet3Score('')
                    } else {
                      setSet1Score('BYE')
                      setSet2Score('')
                      setSet3Score('')
                    }
                  }}
                >
                  <Zap size={14} />
                  <span>{set1Score === 'BYE' ? '✓ Modo Victoria por BYE Activado' : '⚡ Declarar Victoria por BYE (Pase Libre)'}</span>
                </button>
              </div>

              {set1Score === 'BYE' ? (
                <div className="bye-mode-active-alert">
                  <Zap size={18} />
                  <div>
                    <strong>Victoria por Pase Libre (BYE)</strong>
                    <p>El contrincante será registrado como BYE y el jugador seleccionado avanzará directamente sin sets jugados.</p>
                  </div>
                </div>
              ) : (
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
              )}

              <div className="form-group">
                <label htmlFor="points-award">Puntos a Otorgar al Ganador:</label>
                <input
                  id="points-award"
                  type="number"
                  value={pointsAwardInput}
                  onChange={(e) => setPointsAwardInput(e.target.value)}
                  min="0"
                  step="10"
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

      {/* MODAL PARA CONFIRMAR VICTORIA POR BYE */}
      {byeModalData && (
        <div className="admin-modal-backdrop" onClick={() => setByeModalData(null)}>
          <div
            className="admin-modal-card bye-confirm-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header bye-modal-header">
              <div className="bye-header-title">
                <Zap size={22} className="bye-lightning-icon" />
                <h3>Asignar Victoria por BYE — Match #{byeModalData.match.matchNum}</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setByeModalData(null)}
              >
                ✕
              </button>
            </div>

            <div className="bye-modal-body">
              <div className="bye-banner-info">
                <div className="bye-icon-circle">🎾</div>
                <div className="bye-banner-text">
                  <h4>{byeModalData.player?.name || 'Jugador Seleccionado'}</h4>
                  <span className="bye-cat-chip">{byeModalData.player?.categoria || '4ta'}</span>
                  <p>
                    Este jugador avanzará automáticamente a la siguiente ronda de <strong>{currentTourney?.title}</strong> sin tener que disputar este partido.
                  </p>
                </div>
              </div>

              <div className="form-group bye-points-field">
                <label htmlFor="input-bye-points">
                  🏆 Puntos de Ranking ATAP a otorgar por este pase libre:
                </label>
                <div className="points-input-affix">
                  <input
                    id="input-bye-points"
                    type="number"
                    min="0"
                    step="10"
                    value={byePointsAward}
                    onChange={(e) => setByePointsAward(e.target.value)}
                    className="bye-points-input"
                    autoFocus
                  />
                  <span className="points-unit">pts</span>
                </div>
                <small className="bye-field-hint">
                  Escribe los puntos correspondientes (ej. 100, 50 o 0). Se sumarán inmediatamente a su ranking global.
                </small>
              </div>

              <div className="bye-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setByeModalData(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-confirm-bye"
                  onClick={handleConfirmBye}
                >
                  <Zap size={15} /> Confirmar BYE y Avanzar Jugador
                </button>
              </div>
            </div>
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
                  src={getAssetUrl(newAvatarUrl || avatarModalPlayer.image || '/assets/logo.png')}
                  alt={avatarModalPlayer.name}
                  className="modal-avatar-img"
                  onError={(e) => handleImageFallback(e, '/assets/logo.png')}
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
                <Camera size={16} /> Seleccionar archivo desde mi computadora (500x500 px · Máx. 5 MB)
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
            className="admin-modal-card tourney-form-modal-card"
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

              <div className="form-row-2">
                <div className="form-group">
                  <label>Modalidad / Formato</label>
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
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new-tourney-status">Estado del Torneo *</label>
                  <select
                    id="new-tourney-status"
                    value={newTourneyStatus}
                    onChange={(e) => setNewTourneyStatus(e.target.value)}
                  >
                    <option value="inscripciones_abiertas">🟢 Inscripciones Abiertas</option>
                    <option value="en_curso">🔵 En Curso / En Desarrollo</option>
                    <option value="finalizado">🏁 Finalizado / Concluido</option>
                  </select>
                </div>
              </div>

              {/* CATEGORIAS Y CUPOS DEL TORNEO */}
              <div className="tourney-categories-manager-block">
                <div className="cat-manager-header">
                  <div>
                    <label className="section-subtitle-label">Categorías y Cupos Máximos del Torneo *</label>
                    <small className="cat-manager-hint">Configura las categorías disponibles y el límite de inscripciones por categoría.</small>
                  </div>
                  <button
                    type="button"
                    className="btn-add-cat-mini"
                    onClick={() => handleAddCategory(false)}
                  >
                    <Plus size={14} /> Agregar Categoría
                  </button>
                </div>

                <div className="categories-edit-list">
                  {newTourneyCategories.map((cat, idx) => (
                    <div className="cat-edit-row" key={cat.id || idx}>
                      <div className="cat-input-col cat-name-col">
                        <label>Nombre de Categoría:</label>
                        <input
                          type="text"
                          value={cat.nombre}
                          onChange={(e) => handleUpdateCategory(idx, 'nombre', e.target.value, false)}
                          placeholder="Ej: 1ra Categoría"
                          required
                        />
                      </div>
                      <div className="cat-input-col cat-cupos-col">
                        <label>Cupos Máx:</label>
                        <input
                          type="number"
                          min="2"
                          max="128"
                          value={cat.cupos}
                          onChange={(e) => handleUpdateCategory(idx, 'cupos', e.target.value, false)}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-delete-cat"
                        onClick={() => handleDeleteCategory(idx, false)}
                        disabled={newTourneyCategories.length <= 1}
                        title={newTourneyCategories.length <= 1 ? 'Mínimo 1 categoría requerida' : 'Eliminar categoría'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* IMAGEN DE PORTADA / AFICHE (DE ÚLTIMAS) */}
              <div className="tourney-image-upload-card">
                <div className="tourney-image-card-header">
                  <div className="header-left">
                    <ImageIcon size={16} color="#00CFA0" />
                    <label>Afiche o Imagen de Portada</label>
                  </div>
                  <span className="dimension-pill">500x500 px (1:1)</span>
                </div>
                <p className="tourney-image-hint">
                  Sube el afiche oficial del torneo o ingresa un enlace web. Si lo dejas vacío, se asignará una portada de tenis automática.
                </p>

                <div className="tourney-image-content-layout">
                  <div className="tourney-image-preview-wrapper">
                    {newTourneyImage ? (
                      <>
                        <img src={newTourneyImage} alt="Vista previa afiche" />
                        <span className="preview-overlay-badge">500x500 px</span>
                      </>
                    ) : (
                      <div className="tourney-image-empty-placeholder">
                        <Camera size={26} className="empty-icon" />
                        <span>Sin imagen cargada</span>
                        <small>Predeterminada</small>
                      </div>
                    )}
                  </div>

                  <div className="tourney-image-controls-col">
                    <label className="btn-upload-tourney-file">
                      <Camera size={15} /> Subir afiche desde la computadora (máx. 5 MB)
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleTourneyImageFile(e.target.files[0], false)}
                      />
                    </label>

                    <div className="tourney-url-input-wrap">
                      <label htmlFor="new-tourney-img" style={{ fontSize: '11px', color: '#64727A', fontWeight: 600 }}>
                        O ingresa URL de imagen web:
                      </label>
                      <input
                        id="new-tourney-img"
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={newTourneyImage}
                        onChange={(e) => setNewTourneyImage(e.target.value)}
                      />
                    </div>

                    {newTourneyImage && (
                      <button
                        type="button"
                        className="btn-clear-tourney-image"
                        onClick={() => setNewTourneyImage('')}
                      >
                        <Trash2 size={13} /> Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
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
            className="admin-modal-card tourney-form-modal-card"
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

              <div className="form-row-2">
                <div className="form-group">
                  <label>Modalidad / Formato</label>
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
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-tourney-status">Estado del Torneo *</label>
                  <select
                    id="edit-tourney-status"
                    value={editTourneyStatus}
                    onChange={(e) => setEditTourneyStatus(e.target.value)}
                  >
                    <option value="inscripciones_abiertas">🟢 Inscripciones Abiertas</option>
                    <option value="en_curso">🔵 En Curso / En Desarrollo</option>
                    <option value="finalizado">🏁 Finalizado / Concluido</option>
                  </select>
                </div>
              </div>

              {/* CATEGORIAS Y CUPOS DEL TORNEO */}
              <div className="tourney-categories-manager-block">
                <div className="cat-manager-header">
                  <div>
                    <label className="section-subtitle-label">Categorías y Cupos Máximos del Torneo *</label>
                    <small className="cat-manager-hint">Configura las categorías disponibles y el límite de inscripciones por categoría.</small>
                  </div>
                  <button
                    type="button"
                    className="btn-add-cat-mini"
                    onClick={() => handleAddCategory(true)}
                  >
                    <Plus size={14} /> Agregar Categoría
                  </button>
                </div>

                <div className="categories-edit-list">
                  {editTourneyCategories.map((cat, idx) => (
                    <div className="cat-edit-row" key={cat.id || idx}>
                      <div className="cat-input-col cat-name-col">
                        <label>Nombre de Categoría:</label>
                        <input
                          type="text"
                          value={cat.nombre}
                          onChange={(e) => handleUpdateCategory(idx, 'nombre', e.target.value, true)}
                          placeholder="Ej: 1ra Categoría"
                          required
                        />
                      </div>
                      <div className="cat-input-col cat-cupos-col">
                        <label>Cupos Máx:</label>
                        <input
                          type="number"
                          min="2"
                          max="128"
                          value={cat.cupos}
                          onChange={(e) => handleUpdateCategory(idx, 'cupos', e.target.value, true)}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-delete-cat"
                        onClick={() => handleDeleteCategory(idx, true)}
                        disabled={editTourneyCategories.length <= 1}
                        title={editTourneyCategories.length <= 1 ? 'Mínimo 1 categoría requerida' : 'Eliminar categoría'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* IMAGEN DE PORTADA / AFICHE (DE ÚLTIMAS) */}
              <div className="tourney-image-upload-card">
                <div className="tourney-image-card-header">
                  <div className="header-left">
                    <ImageIcon size={16} color="#00CFA0" />
                    <label>Afiche o Imagen de Portada</label>
                  </div>
                  <span className="dimension-pill">500x500 px (1:1)</span>
                </div>
                <p className="tourney-image-hint">
                  Sube el afiche oficial del torneo o ingresa un enlace web. Si no seleccionas ninguna, se conservará la portada actual.
                </p>

                <div className="tourney-image-content-layout">
                  <div className="tourney-image-preview-wrapper">
                    {(editTourneyImage || editTourney.image) ? (
                      <>
                        <img src={editTourneyImage || editTourney.image} alt="Vista previa afiche" />
                        <span className="preview-overlay-badge">500x500 px</span>
                      </>
                    ) : (
                      <div className="tourney-image-empty-placeholder">
                        <Camera size={26} className="empty-icon" />
                        <span>Sin imagen cargada</span>
                        <small>Predeterminada</small>
                      </div>
                    )}
                  </div>

                  <div className="tourney-image-controls-col">
                    <label className="btn-upload-tourney-file">
                      <Camera size={15} /> Subir afiche desde la computadora (máx. 5 MB)
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleTourneyImageFile(e.target.files[0], true)}
                      />
                    </label>

                    <div className="tourney-url-input-wrap">
                      <label htmlFor="edit-tourney-img" style={{ fontSize: '11px', color: '#64727A', fontWeight: 600 }}>
                        O ingresa URL de imagen web:
                      </label>
                      <input
                        id="edit-tourney-img"
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={editTourneyImage}
                        onChange={(e) => setEditTourneyImage(e.target.value)}
                      />
                    </div>

                    {(editTourneyImage || editTourney.image) && (
                      <button
                        type="button"
                        className="btn-clear-tourney-image"
                        onClick={() => setEditTourneyImage('')}
                      >
                        <Trash2 size={13} /> Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
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

      {/* MODAL CREAR / EDITAR NOTICIA EN COMUNIDAD */}
      {showNewsModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowNewsModal(false)}>
          <div
            className="admin-modal-card news-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="modal-subtitle-eyebrow">
                  {editingNews ? 'Gestión de Publicación' : 'Espacio de Publicación Oficial'}
                </span>
                <h3>{editingNews ? 'Editar Noticia / Publicación' : 'Publicar Noticia en Comunidad'}</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowNewsModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="news-form-container">
              {/* PREGUNTA: ¿LLEVA IMAGEN O SOLO TEXTO? */}
              <div className="news-format-choice-block">
                <label className="format-question-label">
                  ¿Qué formato tiene esta publicación? <span className="required-star">*</span>
                </label>
                <p className="format-question-hint">
                  Elige si deseas acompañar tu noticia con una imagen de portada o si es un comunicado de solo texto.
                </p>

                <div className="news-format-cards-grid">
                  <div
                    className={`news-format-card ${newsFormatType === 'imagen' ? 'selected' : ''}`}
                    onClick={() => setNewsFormatType('imagen')}
                  >
                    <div className="format-card-radio">
                      <div className="radio-inner" />
                    </div>
                    <div className="format-card-icon">
                      <Camera size={26} />
                    </div>
                    <div className="format-card-info">
                      <strong>🖼️ Con Imagen / Afiche</strong>
                      <small>Para notas, fotos de premiación, afiches o crónicas con fotografía destacada.</small>
                    </div>
                  </div>

                  <div
                    className={`news-format-card ${newsFormatType === 'texto' ? 'selected' : ''}`}
                    onClick={() => setNewsFormatType('texto')}
                  >
                    <div className="format-card-radio">
                      <div className="radio-inner" />
                    </div>
                    <div className="format-card-icon">
                      <FileText size={26} />
                    </div>
                    <div className="format-card-info">
                      <strong>📝 Solo Texto / Comunicado</strong>
                      <small>Para avisos oficiales, comunicados de la comisión, normas o notas breves sin imagen.</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN ADJUNTO DE IMAGEN (SOLO SI newsFormatType === 'imagen') */}
              {newsFormatType === 'imagen' && (
                <div className="tourney-image-upload-card news-image-box">
                  <div className="tourney-image-card-header">
                    <div className="header-left">
                      <ImageIcon size={16} color="#00CFA0" />
                      <label>Imagen o Afiche de la Noticia *</label>
                    </div>
                    <span className="dimension-pill">Recomendado: 1200x675 px (16:9) o 800x600 px</span>
                  </div>
                  <p className="tourney-image-hint">
                    Adjunta una fotografía desde tu computadora o ingresa un enlace web directo a la imagen.
                  </p>

                  <div className="tourney-image-content-layout">
                    <div className="tourney-image-preview-wrapper news-preview-wrapper">
                      {newsImage ? (
                        <>
                          <img src={newsImage} alt="Vista previa de portada" />
                          <span className="preview-overlay-badge">Vista previa</span>
                        </>
                      ) : (
                        <div className="tourney-image-empty-placeholder">
                          <Camera size={28} className="empty-icon" />
                          <span>Sin imagen adjunta</span>
                          <small>Sube un archivo o pega una URL</small>
                        </div>
                      )}
                    </div>

                    <div className="tourney-image-controls-col">
                      <label className="btn-upload-tourney-file">
                        <Camera size={15} /> Subir archivo desde la computadora (máx. 5 MB)
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleNewsImageFile(e.target.files[0])
                            }
                          }}
                        />
                      </label>

                      <div className="tourney-url-input-wrap">
                        <label htmlFor="news-img-url" style={{ fontSize: '11px', color: '#64727A', fontWeight: 600 }}>
                          O pega la URL de la imagen:
                        </label>
                        <input
                          id="news-img-url"
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={newsImage}
                          onChange={(e) => setNewsImage(e.target.value)}
                        />
                      </div>

                      {newsImage && (
                        <button
                          type="button"
                          className="btn-clear-tourney-image"
                          onClick={() => setNewsImage('')}
                        >
                          <Trash2 size={13} /> Quitar imagen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AVISO INFORMATIVO CUANDO ES SOLO TEXTO */}
              {newsFormatType === 'texto' && (
                <div className="news-text-only-info-pill">
                  <FileText size={18} color="#25005C" />
                  <div>
                    <strong>Modalidad Solo Texto seleccionada</strong>
                    <p>Esta publicación se mostrará con un formato editorial con tipografía destacada y membrete oficial de ATAP sin exigir archivo gráfico.</p>
                  </div>
                </div>
              )}

              {/* CAMPOS DE TEXTO GENERADO / FORMULARIO */}
              <div className="form-group">
                <label htmlFor="news-title-input">Título de la Noticia / Publicación *</label>
                <input
                  id="news-title-input"
                  type="text"
                  placeholder="Ej: Gran inicio del Torneo de Verano con récord de participantes"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="news-category-select">Categoría de la Noticia *</label>
                  <select
                    id="news-category-select"
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                  >
                    <option value="Torneos">🏆 Torneos y Competencias</option>
                    <option value="Comunicado">📢 Comunicado Oficial</option>
                    <option value="Tips de Juego">🎾 Tips y Entrenamiento</option>
                    <option value="Entrevistas">🎙️ Entrevistas y Protagonistas</option>
                    <option value="Comunidad">🤝 Comunidad y Clubes</option>
                    <option value="Ranking">📊 Novedades del Ranking</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="news-author-input">Autor / Emisor *</label>
                  <input
                    id="news-author-input"
                    type="text"
                    placeholder="Ej: Prensa ATAP / Comité de Torneos"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="news-date-input">Fecha de Publicación</label>
                <input
                  id="news-date-input"
                  type="text"
                  placeholder="Ej: 16 de Marzo, 2026"
                  value={newsDate}
                  onChange={(e) => setNewsDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="news-summary-input">Resumen breve / Bajada (Vista previa en tarjeta) *</label>
                <textarea
                  id="news-summary-input"
                  rows={2}
                  placeholder="Un extracto conciso de 1 a 2 oraciones para las tarjetas de la sección..."
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="news-content-input">
                  Texto Completo / Contenido de la Noticia *
                </label>
                <textarea
                  id="news-content-input"
                  rows={6}
                  placeholder="Redacta aquí todos los detalles de la noticia, comunicado, resultados o notas..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  required
                />
              </div>

              {/* CASILLA NOTICIA DESTACADA */}
              <div className="news-featured-checkbox-row">
                <label className="checkbox-featured-label">
                  <input
                    type="checkbox"
                    checked={newsFeatured}
                    onChange={(e) => setNewsFeatured(e.target.checked)}
                  />
                  <div className="checkbox-featured-text">
                    <strong>⭐ Fijar como Noticia Destacada de Portada</strong>
                    <small>Se mostrará como nota principal en el espacio superior de la página Comunidad.</small>
                  </div>
                </label>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNewsModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-lime">
                  <Save size={16} /> {editingNews ? 'Guardar Cambios' : 'Publicar Noticia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO RÁPIDO DE JUGADOR (TORNEO FINALIZADO - SOLO NOMBRE Y DNI) */}
      {showQuickPlayerModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowQuickPlayerModal(false)}>
          <div
            className="admin-modal-card quick-player-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="modal-subtitle-eyebrow">Torneo Finalizado</span>
                <h3>Registrar Jugador Rápido (Nombre y DNI)</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowQuickPlayerModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickPlayer} className="quick-player-form-container">
              <div className="quick-player-info-banner">
                <ShieldCheck size={24} color="#00CFA0" className="info-banner-icon" />
                <div>
                  <strong>Registro simplificado para resultados</strong>
                  <p>
                    Permite ingresar jugadores para cargar resultados en <strong>{currentTourney?.title}</strong> con solo su <strong>Nombre y DNI</strong>. Se le asignará automáticamente el logo oficial ATAP hasta que la persona ingrese a la plataforma y complete su registro.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="quick-p-name">Nombre Completo del Jugador *</label>
                <input
                  id="quick-p-name"
                  type="text"
                  placeholder="Ej: Carlos Mendoza Ramos"
                  value={quickPlayerName}
                  onChange={(e) => setQuickPlayerName(e.target.value.replace(/[0-9]/g, ''))}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="quick-p-dni">DNI / Documento de Identidad *</label>
                  <input
                    id="quick-p-dni"
                    type="text"
                    placeholder="Ej: 71829304"
                    value={quickPlayerDni}
                    onChange={(e) => setQuickPlayerDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quick-p-cat">Categoría *</label>
                  <select
                    id="quick-p-cat"
                    value={quickPlayerCategory}
                    onChange={(e) => setQuickPlayerCategory(e.target.value)}
                  >
                    {(currentTourney?.categorias || [
                      { nombre: '4ta' },
                      { nombre: '5ta A' },
                      { nombre: '5ta B' },
                      { nombre: '6ta' }
                    ]).map((c) => (
                      <option key={c.id || c.nombre} value={c.nombre}>
                        Categoría {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FOTO CON LOGO ATAP PREDETERMINADO */}
              <div className="quick-player-logo-notice">
                <div className="logo-preview-avatar">
                  <img src={getAssetUrl('/assets/logo.png')} alt="Logo ATAP" />
                </div>
                <div className="logo-notice-details">
                  <span className="logo-label-badge">🛡️ Foto de Perfil Asignada: Logo ATAP</span>
                  <small>
                    Como el jugador aún no sube foto personal, su tarjeta y ranking mostrarán el logo oficial de la Asociación de Tenistas Amateur del Perú.
                  </small>
                </div>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowQuickPlayerModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-lime">
                  <Check size={16} /> Crear y Asignar al Torneo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE TEMPORADA */}
      {showCloseSeasonModal && (
        <div className="admin-modal-backdrop" onClick={() => !isClosingSeason && setShowCloseSeasonModal(false)}>
          <div
            className="admin-modal-card season-confirm-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header modal-header-warn">
              <div className="warn-title-wrap">
                <AlertTriangle size={24} color="#D97706" />
                <h3>¿Confirmar Cierre Oficial de la Temporada {activeSeasonYear}?</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                disabled={isClosingSeason}
                onClick={() => setShowCloseSeasonModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="season-confirm-body">
              <p className="season-confirm-lead">
                Estás a punto de finalizar el ciclo deportivo del año <strong>{activeSeasonYear}</strong> (1 de Enero al 31 de Diciembre).
              </p>

              <div className="season-confirm-points-list">
                <div className="confirm-point-item">
                  <span className="point-icon">🔒</span>
                  <div>
                    <strong>Congelamiento de Puntos Históricos:</strong>
                    <p>Todos los puntajes acumulados en Singles y Dobles quedarán registrados de forma inalterable en el Archivo Histórico bajo la <strong>Temporada {activeSeasonYear}</strong>.</p>
                  </div>
                </div>

                <div className="confirm-point-item">
                  <span className="point-icon">🔄</span>
                  <div>
                    <strong>Reinicio a 0 Puntos para la Nueva Temporada:</strong>
                    <p>Iniciará oficialmente la <strong>Temporada {Number(activeSeasonYear) + 1}</strong> y todos los jugadores del circuito comenzarán con <strong>0 puntos</strong>.</p>
                  </div>
                </div>

                <div className="confirm-point-item">
                  <span className="point-icon">🛡️</span>
                  <div>
                    <strong>Preservación Absoluta de Perfiles:</strong>
                    <p>No se pierde ningún dato: categorías, historiales de partidos, DNIs, clubes y fotos de perfil se mantendrán 100% intactos.</p>
                  </div>
                </div>
              </div>

              <div className="season-confirm-actions">
                <button
                  type="button"
                  className="button button-outline"
                  disabled={isClosingSeason}
                  onClick={() => setShowCloseSeasonModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="button btn-confirm-close-danger"
                  disabled={isClosingSeason}
                  onClick={handleConfirmCloseSeason}
                >
                  {isClosingSeason ? 'Procesando Cierre...' : `Sí, Cerrar Temporada ${activeSeasonYear} y Reiniciar a 0`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA LLAMAR / AGREGAR JUGADORES AL BANCO DEL TORNEO */}
      {showBankAddModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setShowBankAddModal(false)
            setBankModalTargetField('bank')
          }}
        >
          <div
            className="admin-modal-card bank-add-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="modal-subtitle-eyebrow">
                  {currentTourney ? `${currentTourney.title} (${currentTourney.category || 'Categoría General'})` : 'Torneo Actual'}
                </span>
                <h3>
                  {bankModalTargetField === 'player1'
                    ? 'Seleccionar Jugador 1 para el Partido'
                    : bankModalTargetField === 'player2'
                    ? 'Seleccionar Jugador 2 para el Partido'
                    : 'Llamar Jugadores al Banco de Participantes'}
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setShowBankAddModal(false)
                  setBankModalTargetField('bank')
                }}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bank-modal-filters-bar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={bankModalSearch}
                  onChange={(e) => setBankModalSearch(e.target.value)}
                />
              </div>

              <div className="filter-select-wrap">
                <label>Categoría:</label>
                <select
                  value={bankModalCategoryFilter}
                  onChange={(e) => setBankModalCategoryFilter(e.target.value)}
                  className="input-select"
                >
                  <option value="todas">Todas las categorías</option>
                  {ALL_OFFICIAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      Categoría {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bank-modal-body">
              {filteredBankCandidates.length === 0 ? (
                <div className="empty-players-notice">
                  <AlertTriangle size={24} color="#D97706" />
                  <p>No se encontraron jugadores registrados que coincidan con la búsqueda o filtro.</p>
                </div>
              ) : (
                <div className="bank-candidates-list">
                  {filteredBankCandidates.map((candidate) => {
                    const cDni = (candidate.dni || candidate.documentoIdentidad || '').toString().trim()
                    const cName = candidate.nombre || candidate.name || 'Jugador'
                    const cCat = candidate.categoria || '4ta'
                    const cPoints = candidate.points || `${candidate.puntosNum || 0} pts`
                    const isAlreadyInBank = (currentTourney?.inscripciones || []).some((insc) => {
                      const inscDni = (insc.dni || insc.documentoIdentidad || '').toString().trim()
                      const inscName = (insc.nombre || insc.name || '').toString().trim().toLowerCase()
                      return (cDni && inscDni && cDni === inscDni) || (inscName === cName.toLowerCase())
                    })

                    return (
                      <div
                        key={cDni || candidate.id || candidate.email}
                        className={`bank-candidate-item ${isAlreadyInBank ? 'already-added' : ''}`}
                      >
                        <div className="candidate-info-col">
                          <div className="candidate-avatar">
                            {candidate.image && candidate.image !== '/assets/logo.png' ? (
                              <img src={candidate.image} alt={cName} className="candidate-avatar-img" />
                            ) : (
                              cName ? cName.charAt(0).toUpperCase() : 'J'
                            )}
                          </div>
                          <div className="candidate-details">
                            <span className="candidate-name">{cName}</span>
                            <div className="candidate-meta">
                              <span className="candidate-dni">DNI: {maskDni(cDni) || 'S/D'}</span>
                              <span className={`candidate-cat-pill cat-${cCat.toLowerCase().replace(/\s+/g, '-')}`}>
                                Cat. {cCat}
                              </span>
                              <span className="candidate-points-pill">
                                {cPoints}
                              </span>
                              <span
                                className={`player-status-badge ${candidate.perfilIncompleto ? 'status-pending' : 'status-complete'}`}
                                title={candidate.perfilIncompleto ? 'Pre-cargado por administración para torneos, pendiente de registro web' : 'Cuenta registrada en la plataforma'}
                              >
                                {candidate.perfilIncompleto ? 'Pre-cargado' : 'Registrado Web'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="candidate-action-col">
                          {bankModalTargetField === 'player1' || bankModalTargetField === 'player2' ? (
                            <button
                              type="button"
                              className="btn-add-candidate-now select-for-match-btn"
                              onClick={() => {
                                if (bankModalTargetField === 'player1') {
                                  setResultPlayer1(cName)
                                  if (!resultWinner) setResultWinner(cName)
                                } else {
                                  setResultPlayer2(cName)
                                }
                                handleAddPlayerToTournamentBank(candidate)
                                setShowBankAddModal(false)
                                setBankModalTargetField('bank')
                                showToast(`"${cName}" asignado al partido y agregado al torneo.`)
                              }}
                            >
                              <Check size={14} /> Seleccionar
                            </button>
                          ) : isAlreadyInBank ? (
                            <span className="bank-badge-already">
                              <UserCheck size={14} /> Ya en el banco
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-add-candidate-now"
                              onClick={() => handleAddPlayerToTournamentBank(candidate)}
                            >
                              <Plus size={14} /> Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <span className="bank-modal-count-hint">
                Mostrando {filteredBankCandidates.length} jugador(es) de la base de datos
              </span>
              <button
                type="button"
                className="button btn-secondary"
                onClick={() => {
                  setShowBankAddModal(false)
                  setBankModalTargetField('bank')
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
