import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Edit3, Plus, X } from 'lucide-react'
import { saveRegisteredUser, maskDni } from '../../services/atapStorage'
import { api, authApi } from '../../services/api'
import './PlayerOnboardingModal.css'

export default function PlayerOnboardingModal({
  initialUserData = {},
  onComplete,
  onClose
}) {
  const [step, setStep] = useState(1)
  const [stepError, setStepError] = useState('')

  const [formData, setFormData] = useState({
    nombre: initialUserData.nombre || '',
    email: initialUserData.email || '',
    whatsapp: initialUserData.whatsapp || initialUserData.telefono || '',
    instagram: initialUserData.instagram || '',
    
    genero: initialUserData.genero || 'Masculino', 
    diaNacimiento: initialUserData.diaNacimiento || '',
    mesNacimiento: initialUserData.mesNacimiento || '',
    anioNacimiento: initialUserData.anioNacimiento || '',
    categoria: initialUserData.categoria || '4ta', 
    documentoIdentidad: initialUserData.dni || initialUserData.documentoIdentidad || '',
    avatar: initialUserData.avatar || '',
    
    // Paso 4: Tu Trayectoria
    titulosGanados: initialUserData.titulosGanados || '0',

    // Paso 5: Calibra tus Golpes
    calibracionGolpes: initialUserData.calibracionGolpes || {
      reves: null,
      saque: null,
      drive: null,
      drop: null,
      slice: null
    },

    // Paso 6: Perfil Físico
    altura: initialUserData.altura || '',
    peso: initialUserData.peso || '',
    mejorGolpe: initialUserData.mejorGolpe || 'Drive cruzado',

    // Paso 7: Preferencias
    zonas: initialUserData.zonas && initialUserData.zonas.length > 0
      ? initialUserData.zonas
      : ['Lima Centro'],
    manoDominante: initialUserData.manoDominante || 'Diestro', 
    disponibilidad: initialUserData.disponibilidad && initialUserData.disponibilidad.length > 0
      ? initialUserData.disponibilidad
      : ['SAB', 'DOM'],
  })

  const fileInputRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (initialUserData && Object.keys(initialUserData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        nombre: initialUserData.nombre || prev.nombre || '',
        email: initialUserData.email || prev.email || '',
        whatsapp: initialUserData.whatsapp || initialUserData.telefono || prev.whatsapp || '',
        documentoIdentidad: initialUserData.dni || initialUserData.documentoIdentidad || prev.documentoIdentidad || '',
        categoria: initialUserData.categoria || prev.categoria || '4ta'
      }))
    }
  }, [initialUserData])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (stepError) setStepError('')
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0]
    if (file) {
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
    setFormData((prev) => {
      const exists = prev.zonas.includes(zona)
      if (exists) {
        return { ...prev, zonas: prev.zonas.filter((z) => z !== zona) }
      } else {
        return { ...prev, zonas: [...prev.zonas, zona] }
      }
    })
  }

  function toggleDia(dia) {
    setFormData((prev) => {
      const exists = prev.disponibilidad.includes(dia)
      if (exists) {
        return { ...prev, disponibilidad: prev.disponibilidad.filter((d) => d !== dia) }
      } else {
        return { ...prev, disponibilidad: [...prev.disponibilidad, dia] }
      }
    })
  }

  function updateCalibracionGolpe(key, value) {
    const num = parseInt(value, 10)
    setFormData((prev) => ({
      ...prev,
      calibracionGolpes: {
        ...prev.calibracionGolpes,
        [key]: isNaN(num) ? null : num
      }
    }))
  }

  function nextStep() {
    setStepError('')

    // Validación Paso 1: Contacto
    if (step === 1) {
      if (formData.whatsapp) {
        const cleanPhone = formData.whatsapp.replace(/\D/g, '')
        if (cleanPhone.length > 0 && cleanPhone.length < 6) {
          setStepError('Por favor ingresa un número de WhatsApp válido (mínimo 6 dígitos).')
          return
        }
      }
      setStep(2)
      return
    }

    // Validación Paso 2: Un poco sobre ti
    if (step === 2) {
      const cleanDni = (formData.documentoIdentidad || '').toString().trim().replace(/\D/g, '')
      if (!cleanDni || cleanDni.length < 5) {
        setStepError('Por favor ingresa tu número de documento de identidad (DNI).')
        return
      }

      if (formData.diaNacimiento || formData.mesNacimiento || formData.anioNacimiento) {
        const d = parseInt(formData.diaNacimiento, 10)
        const m = parseInt(formData.mesNacimiento, 10)
        const y = parseInt(formData.anioNacimiento, 10)
        if (isNaN(d) || d < 1 || d > 31) {
          setStepError('Por favor ingresa un día de nacimiento válido (1-31).')
          return
        }
        if (isNaN(m) || m < 1 || m > 12) {
          setStepError('Por favor ingresa un mes de nacimiento válido (1-12).')
          return
        }
        if (isNaN(y) || y < 1920 || y > 2020) {
          setStepError('Por favor ingresa un año de nacimiento válido (ej. 1995).')
          return
        }
      }

      if (!formData.categoria) {
        setStepError('Por favor selecciona tu categoría deportiva.')
        return
      }

      setStep(3)
      return
    }

    if (step < 7) {
      setStep(step + 1)
    } else {
      finishOnboarding()
    }
  }

  function prevStep() {
    setStepError('')
    if (step > 1) {
      setStep(step - 1)
    }
  }

  function finishOnboarding() {
    const iniciales = formData.nombre
      ? formData.nombre
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'JA'

    const fechaNacimiento = (formData.diaNacimiento && formData.mesNacimiento && formData.anioNacimiento)
      ? `${formData.diaNacimiento.padStart(2, '0')}/${formData.mesNacimiento.padStart(2, '0')}/${formData.anioNacimiento}`
      : (initialUserData.fechaNacimiento || '')

    const cleanDni = (formData.documentoIdentidad || initialUserData.dni || '').toString().trim().replace(/\s+/g, '')
    const maskedDni = maskDni(cleanDni)

    const fullProfile = {
      ...initialUserData,
      ...formData,
      dni: maskedDni,
      documentoIdentidad: maskedDni,
      fechaNacimiento,
      telefono: formData.whatsapp || initialUserData.telefono || '',
      whatsapp: formData.whatsapp || initialUserData.whatsapp || '',
      avatar: formData.avatar || initialUserData.avatar || '/assets/logo.png',
      image: formData.avatar || initialUserData.image || '/assets/logo.png',
      perfilIncompleto: false,
      rol: 'Jugador ATAP',
      iniciales: iniciales,
      completadoOnboarding: true,
      titulosGanados: formData.titulosGanados || '0',
      zonas: formData.zonas && formData.zonas.length > 0 ? formData.zonas : ['Lima Centro'],
      manoDominante: formData.manoDominante || 'Diestro',
      disponibilidad: formData.disponibilidad && formData.disponibilidad.length > 0 ? formData.disponibilidad : ['SAB', 'DOM']
    }

    // Guardar usuario completo en almacenamiento
    saveRegisteredUser(fullProfile)

    // Sincronizar en segundo plano con MySQL
    authApi.updateProfile({
      nombre: fullProfile.nombre,
      telefono: fullProfile.telefono,
      whatsapp: fullProfile.whatsapp,
      avatar: fullProfile.avatar,
      categoria: fullProfile.categoria,
      zonas: fullProfile.zonas,
      disponibilidad: fullProfile.disponibilidad
    }).catch((e) => console.warn('Sync onboarding profile fallback:', e))

    if (onComplete) {
      onComplete(fullProfile)
    }

    // Si venía de inscripción de un torneo, reabrir el torneo con sus datos listos
    if (initialUserData?.tournamentId) {
      window.dispatchEvent(
        new CustomEvent('atap_open_tournament_register', {
          detail: { tournamentId: initialUserData.tournamentId }
        })
      )
    }
  }

  const calibracionStrokes = [
    { key: 'reves', label: 'REVÉS' },
    { key: 'saque', label: 'SAQUE' },
    { key: 'drive', label: 'DRIVE' },
    { key: 'drop', label: 'DROP' },
    { key: 'slice', label: 'SLICE' }
  ]

  const hasAnyCalibrated = Object.values(formData.calibracionGolpes || {}).some(
    (val) => val !== null && val !== undefined
  )

  const categorias = ['6ta', '5ta B', '5ta A', '4ta', '3ra', '2da', '1ra']
  const zonasLima = ['Lima Norte', 'Lima Centro', 'Lima Sur', 'Lima Este', 'Lima Oeste']
  const diasSemana = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']

  const golpes = [
    {
      id: 'Drive cruzado',
      label: 'Drive cruzado',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="24" cy="10" r="4" />
          <path d="M16 22l8-4 8 6-4 12" />
          <path d="M18 36l-4 6M28 36l4 6" />
          <path d="M32 24l8-8" />
          <circle cx="42" cy="14" r="3" fill="#00CFA0" stroke="none" />
        </svg>
      )
    },
    {
      id: 'Drive paralelo',
      label: 'Drive paralelo',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="20" cy="10" r="4" />
          <path d="M14 22l6-4 8 4 2 14" />
          <path d="M16 36l-2 6M28 36l2 6" />
          <path d="M28 22l10-2" />
          <circle cx="40" cy="20" r="3" fill="#00CFA0" stroke="none" />
        </svg>
      )
    },
    {
      id: 'Reves - 1 mano',
      label: 'Reves – 1 mano',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="28" cy="10" r="4" />
          <path d="M32 22l-8-4-6 6 2 12" />
          <path d="M20 36l-4 6M30 36l2 6" />
          <path d="M18 24l-8-8" />
          <circle cx="8" cy="14" r="3" fill="#00CFA0" stroke="none" />
        </svg>
      )
    },
    {
      id: 'Reves - 2 manos',
      label: 'Reves – 2 manos',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="26" cy="10" r="4" />
          <path d="M30 22l-6-4-6 4 2 14" />
          <path d="M20 36l-3 6M28 36l3 6" />
          <path d="M20 22l-8-2M24 22l-8-4" />
          <circle cx="10" cy="18" r="3" fill="#00CFA0" stroke="none" />
        </svg>
      )
    },
    {
      id: 'Drop Shot',
      label: 'Drop Shop',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="16" cy="12" r="4" />
          <path d="M12 24l6 2 6-4 6 12" />
          <path d="M16 38l-4 4M28 34l4 8" />
          <path d="M24 26l8 4" />
          <path d="M36 28q6-8 10 4" strokeDasharray="3 3" />
          <circle cx="45" cy="32" r="2.5" fill="#00CFA0" stroke="none" />
        </svg>
      )
    },
    {
      id: 'Slice',
      label: 'Slice',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="24" cy="10" r="4" />
          <path d="M18 22l6-2 6 4-2 12" />
          <path d="M18 36l-3 6M28 36l3 6" />
          <path d="M30 24l8-4" />
          <path d="M38 20q-12 8-24 4" stroke="#00CFA0" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      id: 'Saque',
      label: 'Saque',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-svg">
          <circle cx="24" cy="16" r="4" />
          <path d="M22 24l2 6-2 12" />
          <path d="M22 42l-4 4M26 30l4 12" />
          <path d="M24 20l4-12 6-4" />
          <circle cx="36" cy="4" r="3" fill="#00CFA0" stroke="none" />
        </svg>
      )
    }
  ]

  const primerNombre = formData.nombre ? formData.nombre.split(' ')[0] : 'Jugador'

  return (
    <div className="onboarding-backdrop" onMouseDown={onClose}>
      <section
        className="onboarding-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
       
        <div className="onboarding-top-bar">
          {step > 1 ? (
            <button
              type="button"
              className="onboarding-back-btn"
              onClick={prevStep}
              aria-label="Volver al paso anterior"
            >
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>
          ) : (
            <div />
          )}

          <div className="onboarding-steps-indicator" aria-label={`Paso ${step} de 7`}>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <span
                key={s}
                className={`onboarding-step-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="onboarding-close-btn"
            onClick={onClose}
            aria-label="Cerrar asistente"
          >
            <X size={18} />
          </button>
        </div>

     
        {step === 1 && (
          <div className="onboarding-step-content step-1">
            <div className="onboarding-brand-header">
              <img className="onboarding-brand-logo" src="/assets/logo.png" alt="ATAP Logo" />
              <div className="onboarding-brand-text">
                <span>ASOCIACIÓN DE</span>
                <span>TENISTAS AMATEUR</span>
                <span>DEL PERÚ</span>
              </div>
            </div>

            <h2 className="onboarding-title welcome-title">
              ¡Bienvenido <span className="highlight-name">“{primerNombre}”</span>!
            </h2>

            <p className="onboarding-section-label">Información de Contacto</p>

            {stepError && (
              <div className="onboarding-error-message" role="alert">
                {stepError}
              </div>
            )}

            <div className="onboarding-form-group">
              <div className="onboarding-pill-input-wrap">
                <input
                  type="text"
                  className="onboarding-pill-input"
                  placeholder="Whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                />
              </div>

              <div className="onboarding-pill-input-wrap">
                <input
                  type="text"
                  className="onboarding-pill-input"
                  placeholder="Instagram"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="onboarding-submit-btn navy-btn"
              onClick={nextStep}
            >
              CONTINUAR ...
            </button>
          </div>
        )}

    
        {step === 2 && (
          <div className="onboarding-step-content step-2">
            <div className="onboarding-step-icon">
              <span role="img" aria-label="Escribiendo">✍️</span>
            </div>

            <h2 className="onboarding-title">UN POCO SOBRE TI</h2>
            <p className="onboarding-subtitle">Completa tu perfil de jugador.</p>

            {stepError && (
              <div className="onboarding-error-message" role="alert">
                {stepError}
              </div>
            )}

  
            <div className="onboarding-block">
              <span className="onboarding-field-tag">GÉNERO</span>
              <div className="onboarding-toggle-pair">
                <button
                  type="button"
                  className={`onboarding-toggle-btn ${formData.genero === 'Masculino' ? 'selected' : ''}`}
                  onClick={() => updateField('genero', 'Masculino')}
                >
                  <span className="symbol">♂</span> Masculino
                </button>
                <button
                  type="button"
                  className={`onboarding-toggle-btn ${formData.genero === 'Femenino' ? 'selected' : ''}`}
                  onClick={() => updateField('genero', 'Femenino')}
                >
                  <span className="symbol">♀</span> Femenino
                </button>
              </div>
            </div>

          
            <div className="onboarding-block">
              <span className="onboarding-field-tag">FECHA DE NACIMIENTO</span>
              <div className="onboarding-date-row">
                <div className="onboarding-date-field">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="DD"
                    value={formData.diaNacimiento}
                    onChange={(e) => updateField('diaNacimiento', e.target.value.replace(/\D/g, ''))}
                  />
                  <small>DÍA</small>
                </div>
                <span className="date-separator">/</span>
                <div className="onboarding-date-field">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="MM"
                    value={formData.mesNacimiento}
                    onChange={(e) => updateField('mesNacimiento', e.target.value.replace(/\D/g, ''))}
                  />
                  <small>MES</small>
                </div>
                <span className="date-separator">/</span>
                <div className="onboarding-date-field date-year">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="YYYY"
                    value={formData.anioNacimiento}
                    onChange={(e) => updateField('anioNacimiento', e.target.value.replace(/\D/g, ''))}
                  />
                  <small>AÑO</small>
                </div>
              </div>
            </div>

            
            <div className="onboarding-block">
              <span className="onboarding-field-tag">ELIGE TU CATEGORÍA (NIVEL)</span>
              <div className="onboarding-chips-grid">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`onboarding-category-chip ${formData.categoria === cat ? 'selected' : ''}`}
                    onClick={() => updateField('categoria', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            
            <div className="onboarding-block">
              <div className="onboarding-pill-input-wrap">
                <input
                  type="text"
                  className="onboarding-pill-input"
                  placeholder="Documento de Identidad"
                  value={formData.documentoIdentidad}
                  onChange={(e) => updateField('documentoIdentidad', e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="onboarding-submit-btn navy-btn"
              onClick={nextStep}
            >
              CONTINUAR ...
            </button>
          </div>
        )}

      
        {step === 3 && (
          <div className="onboarding-step-content step-3">
            <div className="onboarding-step-icon">
              <span role="img" aria-label="Cámara">📸</span>
            </div>

            <h2 className="onboarding-title">SUBE TU FOTO</h2>
            <p className="onboarding-subtitle">Dale personalidad a tu perfil de élite. (Opcional)</p>

     
            <div className="onboarding-avatar-uploader-container">
              <div
                className="onboarding-avatar-circle"
                onClick={() => fileInputRef.current?.click()}
                title="Subir foto de perfil"
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Foto de perfil" className="avatar-preview-img" />
                ) : (
                  <div className="avatar-placeholder-content">
                    <img src="/assets/logo.png" alt="" className="avatar-placeholder-logo" />
                  </div>
                )}
                <button
                  type="button"
                  className="avatar-add-badge"
                  aria-label="Agregar foto"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />

              <p
                className="onboarding-avatar-hint"
                onClick={() => fileInputRef.current?.click()}
              >
                Toca para subir una foto de tu galería
              </p>
            </div>

            <button
              type="button"
              className="onboarding-submit-btn green-btn"
              onClick={nextStep}
            >
              {formData.avatar ? 'CONTINUAR →' : 'SALTAR POR AHORA →'}
            </button>
          </div>
        )}

     
        {/* Paso 4: Tu Trayectoria (media_1789315732287.png) */}
        {step === 4 && (
          <div className="onboarding-step-content step-4">
            <div className="onboarding-step-icon">
              <svg viewBox="0 0 64 64" width="56" height="56" fill="none" className="trajectory-medal-svg">
                <path d="M18 10L32 32L46 10H38L32 23L26 10H18Z" fill="#38BDF8" stroke="#0B2038" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M24 10L32 23L40 10" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="32" cy="42" r="14" fill="#F59E0B" stroke="#0B2038" strokeWidth="2.5" />
                <circle cx="32" cy="42" r="10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="32" cy="42" r="6" fill="#F59E0B" opacity="0.6" />
              </svg>
            </div>

            <h2 className="onboarding-title">TU TRAYECTORIA</h2>
            <p className="onboarding-subtitle">Define tu experiencia y habilidades técnicas.</p>

            <div className="onboarding-block">
              <span className="onboarding-field-tag">TÍTULOS GANADOS</span>
              <div className="onboarding-trajectory-grid">
                {['0', '1', '2', '2+'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`trajectory-card ${formData.titulosGanados === t ? 'selected' : ''}`}
                    onClick={() => updateField('titulosGanados', t)}
                  >
                    {t === '2+' ? (
                      <span className="trajectory-trophy-label">
                        2+ <span role="img" aria-label="Trofeo">🏆</span>
                      </span>
                    ) : (
                      t
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="onboarding-submit-btn green-btn"
              onClick={nextStep}
            >
              {formData.titulosGanados && formData.titulosGanados !== '0' ? 'CONTINUAR →' : 'SALTAR POR AHORA →'}
            </button>
          </div>
        )}

        {/* Paso 5: Calibra tus Golpes */}
        {step === 5 && (
          <div className="onboarding-step-content step-5 step-calibra">
            <div className="calib-trophy-icon" aria-hidden="true">
              <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
                <path d="M14 9h20v14c0 5.523-4.477 10-10 10s-10-4.477-10-10V9z" fill="#FBBF24" stroke="#78350F" strokeWidth="2.5" />
                <path d="M14 12H7a3 3 0 0 0-3 3v2a7 7 0 0 0 7 7h3M34 12h7a3 3 0 0 1 3 3v2a7 7 0 0 1-7 7h-3" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 33v5" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <rect x="15" y="38" width="18" height="6" rx="2" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                <path d="M17 12h14v5c0 3.866-3.134 7-7 7s-7-3.134-7-7v-5z" fill="#FDE68A" />
              </svg>
            </div>

            <h2 className="onboarding-title calib-title">
              CALIBRA TUS GOLPES <span className="calib-sparkle">✨</span>
            </h2>
            <p className="onboarding-subtitle calib-subtitle">
              Esto nos ayuda a encontrarte mejores rivales. (Opcional)
            </p>

            <div className="calib-strokes-grid">
              {calibracionStrokes.map((stroke, index) => {
                const val = formData.calibracionGolpes?.[stroke.key]
                const isCalibrated = val !== null && val !== undefined
                const currentVal = isCalibrated ? val : 0

                const trackGradient = isCalibrated
                  ? `linear-gradient(to right, #00304A 0%, #00CFA0 ${Math.max(8, Math.round(currentVal * 0.6))}%, #C6FF00 ${currentVal}%, #E8EEEE ${currentVal}%, #E8EEEE 100%)`
                  : '#E8EEEE'

                return (
                  <div
                    key={stroke.key}
                    className={`calib-stroke-card ${isCalibrated ? 'calibrated' : ''} ${index === 4 ? 'grid-col-left' : ''}`}
                  >
                    <div className="calib-stroke-header">
                      <span className="calib-stroke-name">{stroke.label}</span>
                      <span className={`calib-stroke-value ${!isCalibrated ? 'uncalibrated' : ''}`}>
                        {isCalibrated ? `${val}%` : '—'}
                      </span>
                    </div>

                    <div className="calib-slider-wrap">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentVal}
                        onChange={(e) => updateCalibracionGolpe(stroke.key, e.target.value)}
                        className={`calib-range-slider ${isCalibrated ? 'has-value' : ''}`}
                        style={{ background: trackGradient }}
                        aria-label={`Calibración de ${stroke.label}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className="onboarding-submit-btn forest-green-btn"
              onClick={nextStep}
            >
              {hasAnyCalibrated ? 'SIGUIENTE →' : 'SALTAR POR AHORA →'}
            </button>
          </div>
        )}

        {/* Paso 6: Perfil Físico */}
        {step === 6 && (
          <div className="onboarding-step-content step-6">
            <div className="onboarding-step-icon">
              <span role="img" aria-label="Estadísticas">📊</span>
            </div>

            <h2 className="onboarding-title">TU PERFIL FÍSICO</h2>
            <p className="onboarding-subtitle">Altura, peso y tu golpe estrella.</p>

            <div className="onboarding-phys-row">
              <div className="onboarding-phys-col">
                <span className="onboarding-field-tag">ALTURA (CM)</span>
                <div className="onboarding-phys-box">
                  <input
                    type="number"
                    placeholder="—"
                    value={formData.altura}
                    onChange={(e) => updateField('altura', e.target.value)}
                  />
                  <Edit3 size={15} className="phys-edit-icon" />
                </div>
              </div>

              <div className="onboarding-phys-col">
                <span className="onboarding-field-tag">PESO (KG)</span>
                <div className="onboarding-phys-box">
                  <input
                    type="number"
                    placeholder="—"
                    value={formData.peso}
                    onChange={(e) => updateField('peso', e.target.value)}
                  />
                  <Edit3 size={15} className="phys-edit-icon" />
                </div>
              </div>
            </div>

            <div className="onboarding-block">
              <span className="onboarding-field-tag">MEJOR GOLPE 🎾</span>
              <div className="onboarding-strokes-grid">
                {golpes.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`stroke-card ${formData.mejorGolpe === g.id ? 'selected' : ''}`}
                    onClick={() => updateField('mejorGolpe', g.id)}
                  >
                    <div className="stroke-icon-wrap">{g.icon}</div>
                    <span className="stroke-label">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="onboarding-submit-btn green-btn"
              onClick={nextStep}
            >
              {formData.altura || formData.peso || formData.mejorGolpe ? 'CONTINUAR →' : 'SALTAR POR AHORA →'}
            </button>
          </div>
        )}

        {/* Paso 7: Preferencias */}
        {step === 7 && (
          <div className="onboarding-step-content step-7">
            <div className="onboarding-step-icon">
              <span role="img" aria-label="Ubicación">📍</span>
            </div>

            <h2 className="onboarding-title">TUS PREFERENCIAS</h2>
            <p className="onboarding-subtitle">Zona, mano dominante y disponibilidad.</p>

            <div className="onboarding-block">
              <span className="onboarding-field-tag">ZONA DE JUEGO</span>
              <div className="onboarding-zones-row">
                {zonasLima.map((zona) => (
                  <button
                    key={zona}
                    type="button"
                    className={`onboarding-zone-chip ${formData.zonas.includes(zona) ? 'selected' : ''}`}
                    onClick={() => toggleZona(zona)}
                  >
                    {zona}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-block">
              <span className="onboarding-field-tag">MANO DOMINANTE</span>
              <div className="onboarding-dominant-row">
                <button
                  type="button"
                  className={`onboarding-dominant-btn ${formData.manoDominante === 'Diestro' ? 'selected' : ''}`}
                  onClick={() => updateField('manoDominante', 'Diestro')}
                >
                  <span role="img" aria-label="Raqueta">🎾</span> Diestro
                </button>
                <button
                  type="button"
                  className={`onboarding-dominant-btn ${formData.manoDominante === 'Zurdo' ? 'selected' : ''}`}
                  onClick={() => updateField('manoDominante', 'Zurdo')}
                >
                  <span role="img" aria-label="Raqueta">🎾</span> Zurdo
                </button>
              </div>
            </div>

            <div className="onboarding-block">
              <span className="onboarding-field-tag">DISPONIBILIDAD SEMANAL</span>
              <div className="onboarding-days-row">
                {diasSemana.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    className={`onboarding-day-circle ${formData.disponibilidad.includes(dia) ? 'selected' : ''}`}
                    onClick={() => toggleDia(dia)}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="onboarding-submit-btn green-btn"
              onClick={finishOnboarding}
            >
              FINALIZAR REGISTRO →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
