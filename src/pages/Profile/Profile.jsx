import { useState, useRef } from 'react'
import { ArrowRight, Calendar, Camera, Check, Edit3, FileText, LogOut, Mail, MapPin, Phone, ShieldCheck, Trophy, User, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { maskDni } from '../../services/atapStorage'
import { api, authApi } from '../../services/api'
import './Profile.css'

export default function Profile({ usuario, onUpdateUser, onOpenLogin, onLogout }) {
  if (!usuario) {
    return (
      <main className="profile-page page-shell-simple">
        <section className="profile-not-logged panel">
          <div className="profile-empty-icon">
            <User size={48} />
          </div>
          <h1>Mi Perfil de Jugador</h1>
          <p>
            Aún no has iniciado sesión. Ingresa o regístrate para ver tu perfil deportivo, ranking y gestionar tus torneos.
          </p>
          <button
            type="button"
            className="button button-lime"
            onClick={onOpenLogin}
          >
            Iniciar sesión o Registrarse <ArrowRight size={15} />
          </button>
        </section>
      </main>
    )
  }

  const [isEditing, setIsEditing] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)
  const fileInputRef = useRef(null)

  // Estado del formulario de edición local
  const [editData, setEditData] = useState({
    nombre: usuario.nombre || '',
    email: usuario.email || '',
    whatsapp: usuario.whatsapp || '',
    instagram: usuario.instagram || '',
    genero: usuario.genero || 'Masculino',
    diaNacimiento: usuario.diaNacimiento || '',
    mesNacimiento: usuario.mesNacimiento || '',
    anioNacimiento: usuario.anioNacimiento || '',
    categoria: usuario.categoria || '4ta',
    documentoIdentidad: usuario.documentoIdentidad || '',
    avatar: usuario.avatar || '',
    altura: usuario.altura || '',
    peso: usuario.peso || '',
    mejorGolpe: usuario.mejorGolpe || 'Drive cruzado',
    titulosGanados: usuario.titulosGanados || '0',
    zonas: usuario.zonas || ['Lima Centro'],
    manoDominante: usuario.manoDominante || 'Diestro',
    disponibilidad: usuario.disponibilidad || ['SAB', 'DOM'],
    calibracionGolpes: usuario.calibracionGolpes || null
  })

  function startEditing() {
    setEditData({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      whatsapp: usuario.whatsapp || '',
      instagram: usuario.instagram || '',
      genero: usuario.genero || 'Masculino',
      diaNacimiento: usuario.diaNacimiento || '',
      mesNacimiento: usuario.mesNacimiento || '',
      anioNacimiento: usuario.anioNacimiento || '',
      categoria: usuario.categoria || '4ta',
      documentoIdentidad: usuario.documentoIdentidad || '',
      avatar: usuario.avatar || '',
      altura: usuario.altura || '',
      peso: usuario.peso || '',
      mejorGolpe: usuario.mejorGolpe || 'Drive cruzado',
      titulosGanados: usuario.titulosGanados || '0',
      zonas: Array.isArray(usuario.zonas) ? [...usuario.zonas] : ['Lima Centro'],
      manoDominante: usuario.manoDominante || 'Diestro',
      disponibilidad: Array.isArray(usuario.disponibilidad) ? [...usuario.disponibilidad] : ['SAB', 'DOM'],
      calibracionGolpes: usuario.calibracionGolpes || null
    })
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
  }

  function handleSave(e) {
    e?.preventDefault()
    const iniciales = editData.nombre
      ? editData.nombre
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : usuario.iniciales || 'JA'

    const cleanDoc = (editData.documentoIdentidad || usuario.documentoIdentidad || usuario.dni || '').toString().trim().replace(/\s+/g, '')
    const maskedDoc = cleanDoc ? maskDni(cleanDoc) : ''

    const updated = {
      ...usuario,
      ...editData,
      documentoIdentidad: maskedDoc,
      dni: maskedDoc,
      iniciales
    }

    if (onUpdateUser) {
      onUpdateUser(updated)
    }

    // Sincronizar en segundo plano con MySQL
    authApi.updateProfile({
      nombre: updated.nombre,
      telefono: updated.telefono,
      whatsapp: updated.whatsapp,
      avatar: updated.avatar,
      categoria: updated.categoria,
      zonas: updated.zonas,
      disponibilidad: updated.disponibilidad
    }).catch((e) => console.warn('Sync profile en background:', e))

    setIsEditing(false)
    setMensajeExito(true)
    setTimeout(() => setMensajeExito(false), 3500)
  }

  function updateField(field, value) {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La foto de perfil no debe superar los 5 MB para no saturar la base de datos.')
        if (event.target) event.target.value = ''
        return
      }

      // Subir archivo al servidor para evitar saturar localStorage con base64
      try {
        const res = await api.uploadImage(file)
        if (res?.url) {
          updateField('avatar', res.url)
          return
        }
      } catch (err) {
        console.warn('Subida al servidor falló, usando lector local:', err)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        updateField('avatar', e.target?.result || '')
      }
      reader.readAsDataURL(file)
    }
  }

  function toggleZona(zona) {
    setEditData((prev) => {
      const exists = prev.zonas.includes(zona)
      if (exists) {
        return { ...prev, zonas: prev.zonas.filter((z) => z !== zona) }
      } else {
        return { ...prev, zonas: [...prev.zonas, zona] }
      }
    })
  }

  function toggleDia(dia) {
    setEditData((prev) => {
      const exists = prev.disponibilidad.includes(dia)
      if (exists) {
        return { ...prev, disponibilidad: prev.disponibilidad.filter((d) => d !== dia) }
      } else {
        return { ...prev, disponibilidad: [...prev.disponibilidad, dia] }
      }
    })
  }

  const {
    nombre = 'Jugador ATAP',
    email = '',
    whatsapp = '',
    instagram = '',
    genero = 'Masculino',
    diaNacimiento = '',
    mesNacimiento = '',
    anioNacimiento = '',
    categoria = '4ta',
    documentoIdentidad = '',
    avatar = '',
    altura = '',
    peso = '',
    mejorGolpe = 'Drive cruzado',
    titulosGanados = '0',
    zonas = ['Lima Centro'],
    manoDominante = 'Diestro',
    disponibilidad = ['SAB', 'DOM'],
    iniciales = 'JA',
    rol = 'Jugador ATAP',
    calibracionGolpes = null
  } = isEditing ? editData : usuario

  const isAdmin = Boolean(
    usuario &&
      usuario.email?.toLowerCase() === 'vladimiryt18@gmail.com'
  )

  const fechaNacStr = diaNacimiento && mesNacimiento && anioNacimiento
    ? `${diaNacimiento}/${mesNacimiento}/${anioNacimiento}`
    : null

  const categoriasList = ['1ra', '2da', '3ra', '4ta', '5ta A', '5ta B', '6ta']
  const zonasLima = ['Lima Norte', 'Lima Centro', 'Lima Sur', 'Lima Este', 'Lima Oeste']
  const diasSemana = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']
  const golpesList = [
    'Drive cruzado',
    'Drive paralelo',
    'Reves – 1 mano',
    'Reves – 2 manos',
    'Drop Shot',
    'Slice',
    'Saque'
  ]

  return (
    <main className="profile-page">
      <div className="profile-shell">
        {/* Notificación de éxito */}
        {mensajeExito && (
          <div className="profile-success-toast" role="alert">
            <Check size={18} />
            <span>¡Tu perfil ha sido actualizado con éxito!</span>
          </div>
        )}

        {/* Cabecera del Perfil */}
        <section className={`profile-hero-card panel ${isEditing ? 'is-editing-mode' : ''}`}>
          <div className="profile-hero-top">
            <div className="profile-avatar-wrap">
              {avatar && avatar !== '/assets/logo.png' && !avatar.includes('logo.png') ? (
                <img src={avatar} alt={nombre} className="profile-hero-avatar" />
              ) : (
                <div className="profile-hero-avatar default-avatar-badge is-atap-logo">
                  <img src="/assets/logo.png" alt="ATAP" className="default-avatar-logo" />
                </div>
              )}
              {isEditing ? (
                <button
                  type="button"
                  className="profile-change-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto de perfil (máx. 5 MB)"
                >
                  <Camera size={15} />
                </button>
              ) : (
                <span className="profile-verified-badge" title="Jugador Oficial">
                  <ShieldCheck size={16} />
                </span>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="profile-hero-info">
              <div className="profile-title-row">
                {isEditing ? (
                  <div className="inline-edit-field inline-edit-name">
                    <label className="inline-edit-label">Nombre de jugador:</label>
                    <input
                      type="text"
                      className="profile-inline-input name-input"
                      value={editData.nombre}
                      placeholder="Tu nombre completo"
                      onChange={(e) => updateField('nombre', e.target.value.replace(/[0-9]/g, ''))}
                    />
                  </div>
                ) : (
                  <>
                    <h1>{nombre}</h1>
                    <span className="profile-category-pill">
                      {categoria ? `Categoría ${categoria}` : rol}
                    </span>
                  </>
                )}
              </div>

              {!isEditing && <p className="profile-email-text">{email}</p>}

              <div className="profile-tags-row">
                {isEditing ? (
                  <div className="inline-edit-tags-row">
                    <div className="inline-field-sm">
                      <label>Mano:</label>
                      <select
                        className="profile-inline-select"
                        value={editData.manoDominante}
                        onChange={(e) => updateField('manoDominante', e.target.value)}
                      >
                        <option value="Diestro">Diestro</option>
                        <option value="Zurdo">Zurdo</option>
                      </select>
                    </div>

                    <div className="inline-field-sm">
                      <label>Categoría:</label>
                      <select
                        className="profile-inline-select highlight-select"
                        value={editData.categoria}
                        onChange={(e) => updateField('categoria', e.target.value)}
                      >
                        {categoriasList.map((cat) => (
                          <option key={cat} value={cat}>
                            Categoría {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="profile-tag">🎾 {manoDominante || 'Diestro'}</span>
                    {titulosGanados && titulosGanados !== '0' && (
                      <span className="profile-tag trophy-tag">🏆 {titulosGanados} {titulosGanados === '1' ? 'Título' : 'Títulos'}</span>
                    )}
                    {altura && <span className="profile-tag">📏 {altura} cm</span>}
                    {peso && <span className="profile-tag">⚖️ {peso} kg</span>}
                    <span className="profile-tag status-tag">● Activo en ATAP</span>
                  </>
                )}
              </div>
            </div>

            <div className="profile-hero-actions">
              {isEditing ? (
                <div className="edit-mode-actions">
                  <button
                    type="button"
                    className="profile-save-button"
                    onClick={handleSave}
                  >
                    <Check size={16} />
                    <span>Guardar Cambios</span>
                  </button>
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                  >
                    <X size={16} />
                    <span>Cancelar</span>
                  </button>
                </div>
              ) : (
                <>
                  {isAdmin && (
                    <NavLink
                      to="/dashboard"
                      className="profile-dashboard-btn"
                      title="Ir al Panel Dashboard de Administración"
                    >
                      <ShieldCheck size={16} />
                      <span>Panel Dashboard</span>
                    </NavLink>
                  )}
                  <button
                    type="button"
                    className="profile-edit-button"
                    onClick={startEditing}
                    title="Editar datos de jugador"
                  >
                    <Edit3 size={15} />
                    <span>Editar Perfil</span>
                  </button>
                  <button
                    type="button"
                    className="profile-logout-button"
                    onClick={() => onLogout && onLogout(usuario?.nombre || usuario?.email)}
                    title="Cerrar sesión"
                  >
                    <LogOut size={15} />
                    <span>Cerrar sesión</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Grilla de secciones de información */}
        <div className="profile-grid">
          {/* Bloque 1: Datos de Contacto y Personales */}
          <section className={`profile-info-card panel ${isEditing ? 'is-editing-card' : ''}`}>
            <div className="card-header">
              <div className="card-header-icon">
                <FileText size={20} />
              </div>
              <h3>Información Personal</h3>
            </div>

            <div className="profile-details-list">
              <div className="detail-item">
                <span className="detail-label">
                  <Mail size={14} /> Correo electrónico
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    className="profile-inline-input"
                    value={editData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                ) : (
                  <strong className="detail-value">{email || 'No registrado'}</strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <Phone size={14} /> WhatsApp
                </span>
                {isEditing ? (
                  <input
                    type="tel"
                    className="profile-inline-input"
                    placeholder="Ej. 977884423"
                    value={editData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  />
                ) : (
                  <strong className="detail-value">
                    {whatsapp ? (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-link"
                      >
                        {whatsapp}
                      </a>
                    ) : (
                      <span className="text-muted">No especificado</span>
                    )}
                  </strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg> Instagram
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-inline-input"
                    placeholder="Ej. usuario_tenis"
                    value={editData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                  />
                ) : (
                  <strong className="detail-value">
                    {instagram ? (
                      <span className="profile-social-chip">@{instagram.replace('@', '')}</span>
                    ) : (
                      <span className="text-muted">No especificado</span>
                    )}
                  </strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <User size={14} /> Género
                </span>
                {isEditing ? (
                  <select
                    className="profile-inline-select"
                    value={editData.genero}
                    onChange={(e) => updateField('genero', e.target.value)}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                ) : (
                  <strong className="detail-value">{genero || 'No especificado'}</strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <Calendar size={14} /> Fecha de nacimiento
                </span>
                {isEditing ? (
                  <div className="inline-date-fields">
                    <input
                      type="text"
                      maxLength={2}
                      className="date-subinput"
                      placeholder="DD"
                      value={editData.diaNacimiento}
                      onChange={(e) => updateField('diaNacimiento', e.target.value.replace(/\D/g, ''))}
                    />
                    <span>/</span>
                    <input
                      type="text"
                      maxLength={2}
                      className="date-subinput"
                      placeholder="MM"
                      value={editData.mesNacimiento}
                      onChange={(e) => updateField('mesNacimiento', e.target.value.replace(/\D/g, ''))}
                    />
                    <span>/</span>
                    <input
                      type="text"
                      maxLength={4}
                      className="date-subinput year"
                      placeholder="AAAA"
                      value={editData.anioNacimiento}
                      onChange={(e) => updateField('anioNacimiento', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                ) : (
                  <strong className="detail-value">{fechaNacStr || 'No especificada'}</strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <ShieldCheck size={14} /> DNI
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-inline-input"
                    placeholder="DNI"
                    value={editData.documentoIdentidad}
                    onChange={(e) => updateField('documentoIdentidad', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  />
                ) : (
                  <strong className="detail-value">{maskDni(documentoIdentidad) || 'No registrado'}</strong>
                )}
              </div>
            </div>
          </section>

          {/* Bloque 2: Ficha Deportiva y Físico */}
          <section className={`profile-info-card panel ${isEditing ? 'is-editing-card' : ''}`}>
            <div className="card-header">
              <div className="card-header-icon">
                <Trophy size={20} />
              </div>
              <h3>Ficha Técnica Deportiva</h3>
            </div>

            <div className="profile-details-list">
              <div className="detail-item">
                <span className="detail-label">Categoría de Torneos</span>
                {isEditing ? (
                  <select
                    className="profile-inline-select highlight-select"
                    value={editData.categoria}
                    onChange={(e) => updateField('categoria', e.target.value)}
                  >
                    {categoriasList.map((cat) => (
                      <option key={cat} value={cat}>
                        Categoría {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong className="detail-value highlight-category">
                    {categoria ? `${categoria}` : 'Sin categoría'}
                  </strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">Golpe Estrella</span>
                {isEditing ? (
                  <select
                    className="profile-inline-select"
                    value={editData.mejorGolpe}
                    onChange={(e) => updateField('mejorGolpe', e.target.value)}
                  >
                    {golpesList.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong className="detail-value star-stroke">
                    ⭐ {mejorGolpe || 'Drive cruzado'}
                  </strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">Mano Dominante</span>
                {isEditing ? (
                  <select
                    className="profile-inline-select"
                    value={editData.manoDominante}
                    onChange={(e) => updateField('manoDominante', e.target.value)}
                  >
                    <option value="Diestro">Diestro</option>
                    <option value="Zurdo">Zurdo</option>
                  </select>
                ) : (
                  <strong className="detail-value">{manoDominante || 'Diestro'}</strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">Títulos Ganados</span>
                {isEditing ? (
                  <select
                    className="profile-inline-select"
                    value={editData.titulosGanados}
                    onChange={(e) => updateField('titulosGanados', e.target.value)}
                  >
                    <option value="0">0 títulos</option>
                    <option value="1">1 título</option>
                    <option value="2">2 títulos</option>
                    <option value="2+">🏆 2+ títulos</option>
                  </select>
                ) : (
                  <strong className="detail-value">
                    {titulosGanados && titulosGanados !== '0' ? (
                      <span className="profile-trophy-badge">🏆 {titulosGanados} {titulosGanados === '1' ? 'título' : 'títulos'}</span>
                    ) : (
                      '0 títulos'
                    )}
                  </strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">Estatura</span>
                {isEditing ? (
                  <div className="inline-measure-input">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="175"
                      value={editData.altura}
                      onChange={(e) => updateField('altura', e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                    />
                    <span>cm</span>
                  </div>
                ) : (
                  <strong className="detail-value">{altura ? `${altura} cm` : '—'}</strong>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label">Peso corporal</span>
                {isEditing ? (
                  <div className="inline-measure-input">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="70"
                      value={editData.peso}
                      onChange={(e) => updateField('peso', e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                    />
                    <span>kg</span>
                  </div>
                ) : (
                  <strong className="detail-value">{peso ? `${peso} kg` : '—'}</strong>
                )}
              </div>

              {calibracionGolpes && Object.values(calibracionGolpes).some((v) => v !== null) && (
                <div className="detail-item profile-calib-detail-item">
                  <span className="detail-label">Calibración de Golpes</span>
                  <div className="profile-calib-bars-wrap">
                    {[
                      { key: 'reves', label: 'Revés' },
                      { key: 'saque', label: 'Saque' },
                      { key: 'drive', label: 'Drive' },
                      { key: 'drop', label: 'Drop' },
                      { key: 'slice', label: 'Slice' }
                    ].map(({ key, label }) => {
                      const val = calibracionGolpes[key]
                      return (
                        <div key={key} className="profile-calib-mini-row">
                          <div className="profile-calib-mini-header">
                            <span className="profile-calib-mini-label">{label}</span>
                            <span className="profile-calib-mini-pct">{val !== null && val !== undefined ? `${val}%` : '—'}</span>
                          </div>
                          <div className="profile-calib-mini-track">
                            <div
                              className="profile-calib-mini-fill"
                              style={{ width: `${val || 0}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Bloque 3: Preferencias y Disponibilidad */}
          <section className={`profile-info-card panel full-width ${isEditing ? 'is-editing-card' : ''}`}>
            <div className="card-header">
              <div className="card-header-icon">
                <MapPin size={20} />
              </div>
              <h3>Zonas y Disponibilidad de Juego</h3>
              {isEditing && (
                <span className="inline-header-hint">(Haz clic para activar o desactivar)</span>
              )}
            </div>

            <div className="preferences-grid">
              <div className="preference-group">
                <span className="detail-label">Zonas de Juego Habituales</span>
                <div className="chips-container">
                  {isEditing ? (
                    zonasLima.map((z) => {
                      const isSelected = editData.zonas.includes(z)
                      return (
                        <button
                          key={z}
                          type="button"
                          className={`preference-chip editable ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleZona(z)}
                        >
                          📍 {z} {isSelected ? '✓' : '+'}
                        </button>
                      )
                    })
                  ) : (
                    zonas && zonas.length > 0 ? (
                      zonas.map((z) => (
                        <span key={z} className="preference-chip active">
                          📍 {z}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">Sin zonas seleccionadas</span>
                    )
                  )}
                </div>
              </div>

              <div className="preference-group">
                <span className="detail-label">Días Disponibles para Torneos</span>
                <div className="chips-container">
                  {diasSemana.map((dia) => {
                    const currentList = isEditing ? editData.disponibilidad : disponibilidad
                    const isAvailable = currentList && currentList.includes(dia)
                    return isEditing ? (
                      <button
                        key={dia}
                        type="button"
                        className={`day-badge editable ${isAvailable ? 'available' : 'unavailable'}`}
                        onClick={() => toggleDia(dia)}
                        title={isAvailable ? 'Disponible (clic para quitar)' : 'No disponible (clic para agregar)'}
                      >
                        {dia}
                      </button>
                    ) : (
                      <span
                        key={dia}
                        className={`day-badge ${isAvailable ? 'available' : 'unavailable'}`}
                      >
                        {dia}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Banner de acceso rápido a Torneos */}
        <section className="profile-footer-banner panel">
          <div className="footer-banner-copy">
            <h3>¿Listo para tu próximo desafío?</h3>
            <p>Inscríbete en los torneos abiertos y sube en el ranking amateur oficial del Perú.</p>
          </div>
          <NavLink to="/torneos" className="button button-lime">
            Ver torneos disponibles <ArrowRight size={15} />
          </NavLink>
        </section>
      </div>
    </main>
  )
}
