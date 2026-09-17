import { useState, useEffect } from 'react'
import { CheckCircle2, Copy, Send, X, AlertTriangle, Users, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react'
import { registerPlayerToTournament, findUserByDni, getCategoryOccupancy, isUserProfileIncomplete, saveRegisteredUser, maskDni } from '../../services/atapStorage'
import RulesModal from '../RulesModal/RulesModal'
import './TournamentRegisterModal.css'

export default function TournamentRegisterModal({
  tournament,
  usuario,
  onClose,
  onSuccess
}) {
  const isDobles = tournament?.modalidad === 'dobles'
  const categoriesList = tournament?.categorias && tournament.categorias.length > 0
    ? tournament.categorias
    : (isDobles ? [
        { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16 },
        { id: 'cat-d5a', nombre: '5ta A Dobles', cupos: 16 },
        { id: 'cat-d5b', nombre: '5ta B Dobles', cupos: 16 },
        { id: 'cat-d6', nombre: '6ta Dobles', cupos: 16 }
      ] : [
        { id: 'cat-4', nombre: '4ta', cupos: 16 },
        { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
        { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
        { id: 'cat-6', nombre: '6ta', cupos: 32 }
      ])

  // Player 1 state
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [email, setEmail] = useState(usuario?.email || '')
  const [dni, setDni] = useState(usuario?.dni || usuario?.documentoIdentidad || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || usuario?.whatsapp || '')

  // Player 2 state (for doubles / dúos)
  const [nombre2, setNombre2] = useState('')
  const [email2, setEmail2] = useState('')
  const [dni2, setDni2] = useState('')
  const [telefono2, setTelefono2] = useState('')

  // Mandatory Category selection
  const [categoria, setCategoria] = useState(() => {
    if (categoriesList.length > 0) return categoriesList[0].nombre
    return isDobles ? '4ta Dobles' : '4ta'
  })

  const [metodoPago, setMetodoPago] = useState('Yape')
  const [comprobanteRef, setComprobanteRef] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [copiado, setCopiado] = useState('')
  const [validationError, setValidationError] = useState('')
  const [unregisteredPlayerInfo, setUnregisteredPlayerInfo] = useState(null)
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)

  // Sincronizar automáticamente datos de usuario si se loguea o cambia
  useEffect(() => {
    if (usuario) {
      if (usuario.nombre && (!nombre || nombre === '')) setNombre(usuario.nombre)
      const userDni = usuario.dni || usuario.documentoIdentidad
      if (userDni && (!dni || dni === '')) setDni(userDni)
      if (usuario.email && (!email || email === '')) setEmail(usuario.email)
      const userTel = usuario.telefono || usuario.whatsapp
      if (userTel && (!telefono || telefono === '')) setTelefono(userTel)
    }
  }, [usuario])

  // Sincronizar cuando se crea o actualiza usuario en el sistema
  useEffect(() => {
    function handleStorageSync() {
      if (dni && dni.length >= 5) {
        const found = findUserByDni(dni)
        if (found) {
          if (found.nombre && (!nombre || nombre === '')) setNombre(found.nombre)
          if (found.email && (!email || email === '')) setEmail(found.email)
          const fTel = found.telefono || found.whatsapp
          if (fTel && (!telefono || telefono === '')) setTelefono(fTel)
        }
      }
    }
    window.addEventListener('atap_data_updated', handleStorageSync)
    return () => window.removeEventListener('atap_data_updated', handleStorageSync)
  }, [dni, nombre, email, telefono])

  if (!tournament) return null

  const precioDisplay = tournament.precio ? ('S/ ' + tournament.precio + '.00') : 'S/ 100.00'

  function handleOpenRegisterInAtap(playerData = null) {
    if (onClose) onClose()
    const target = playerData || (unregisteredPlayerInfo?.user) || unregisteredPlayerInfo || null

    const targetDni = (target?.dni || target?.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')
    const isPlayer2 = isDobles && targetDni && targetDni === (dni2 || '').toString().trim().replace(/\s+/g, '')

    const selectedDni = isPlayer2 ? dni2 : dni
    const selectedNombre = isPlayer2 ? nombre2 : nombre
    const selectedEmail = isPlayer2 ? email2 : email
    const selectedPhone = isPlayer2 ? telefono2 : telefono

    const finalDni = (target?.dni || target?.documentoIdentidad || selectedDni || '').toString().trim().replace(/\s+/g, '')
    const finalNombre = (target?.nombre || selectedNombre || '').toString().trim()
    const finalEmail = (target?.email || selectedEmail || '').toString().trim()
    const finalPhone = (target?.telefono || target?.whatsapp || selectedPhone || '').toString().trim()
    const finalCat = target?.categoria || categoria || '4ta'

    const payload = {
      dni: finalDni,
      nombre: finalNombre,
      email: finalEmail,
      telefono: finalPhone,
      whatsapp: finalPhone,
      categoria: finalCat,
      completarDatos: Boolean(unregisteredPlayerInfo?.incomplete || (target && isUserProfileIncomplete(target))),
      tournamentId: tournament?.id
    }
    window.dispatchEvent(new CustomEvent('atap_open_register', { detail: payload }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setValidationError('')
    setUnregisteredPlayerInfo(null)

    const cleanNombre = nombre.trim()
    const cleanDni = dni.trim().replace(/\s+/g, '')
    const cleanEmail = email.trim()
    const cleanPhone = telefono.trim()

    // 1. Verificación básica de datos ingresados
    if (!cleanNombre || !cleanDni) {
      setValidationError('Por favor ingresa el nombre y DNI del Jugador 1.')
      return
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanPhone || cleanPhone.length < 6) {
      setValidationError('Para formalizar tu inscripción y completar tu perfil oficial en ATAP, por favor ingresa tu correo electrónico y celular / WhatsApp en este formulario.')
      return
    }

    if (isDobles) {
      const cleanNombre2 = nombre2.trim()
      const cleanDni2 = dni2.trim().replace(/\s+/g, '')
      const cleanEmail2 = email2.trim()
      const cleanPhone2 = telefono2.trim()

      if (!cleanNombre2 || !cleanDni2) {
        setValidationError('Por favor completa el nombre y DNI del Jugador 2 para la inscripción en Dúos.')
        return
      }
      if (!cleanEmail2 || !cleanEmail2.includes('@') || !cleanPhone2 || cleanPhone2.length < 6) {
        setValidationError('Por favor ingresa un correo electrónico y teléfono / WhatsApp válidos para el Jugador 2 en este formulario.')
        return
      }
    }

    // 2. Selección obligatoria de categoría y verificación de cupos
    if (!categoria) {
      setValidationError('La selección de una categoría es obligatoria.')
      return
    }

    const catOccupancy = getCategoryOccupancy(tournament, categoria)
    if (catOccupancy.isFull) {
      setValidationError(`La categoría "${categoria}" ha alcanzado su límite de cupos (${catOccupancy.total}). Por favor selecciona otra categoría con cupos disponibles.`)
      return
    }

    // 3. Validación obligatoria de registro oficial en ATAP:
    // Si la persona no está registrada o tiene perfil incompleto, NO se puede procesar la inscripción a estado pendiente.
    // Se muestra el error "Faltan datos de inscripción" y se le dirige a registrarse para crear su cuenta.
    const existingUser1 = findUserByDni(cleanDni)
    if (!existingUser1 || isUserProfileIncomplete(existingUser1)) {
      setValidationError('Faltan datos de inscripción para continuar. Tu perfil aún no está registrado oficialmente en ATAP. Debes registrarte y crear tu cuenta para poder formalizar tu inscripción.')
      setUnregisteredPlayerInfo({
        dni: cleanDni,
        nombre: cleanNombre,
        email: cleanEmail,
        telefono: cleanPhone,
        whatsapp: cleanPhone,
        categoria: categoria,
        incomplete: true,
        user: {
          ...(existingUser1 || {}),
          dni: cleanDni,
          nombre: cleanNombre,
          email: cleanEmail || existingUser1?.email || '',
          telefono: cleanPhone || existingUser1?.telefono || '',
          whatsapp: cleanPhone || existingUser1?.whatsapp || '',
          categoria: categoria || existingUser1?.categoria || '4ta'
        }
      })
      return
    }

    if (isDobles) {
      const cleanDni2 = dni2.trim().replace(/\s+/g, '')
      const cleanNombre2 = nombre2.trim()
      const cleanEmail2 = email2.trim()
      const cleanPhone2 = telefono2.trim()
      const existingUser2 = findUserByDni(cleanDni2)

      if (!cleanNombre2 || !cleanDni2) {
        setValidationError('Por favor completa el nombre y DNI del Jugador 2 para la inscripción en Dúos.')
        return
      }

      if (!existingUser2 || isUserProfileIncomplete(existingUser2)) {
        setValidationError(`Faltan datos de inscripción del Jugador 2 (${cleanNombre2 || cleanDni2}). Debe completar su registro oficial en ATAP antes de poder participar.`)
        setUnregisteredPlayerInfo({
          dni: cleanDni2,
          nombre: cleanNombre2,
          email: cleanEmail2,
          telefono: cleanPhone2,
          whatsapp: cleanPhone2,
          categoria: categoria,
          incomplete: true,
          user: {
            ...(existingUser2 || {}),
            dni: cleanDni2,
            nombre: cleanNombre2,
            email: cleanEmail2 || existingUser2?.email || '',
            telefono: cleanPhone2 || existingUser2?.telefono || '',
            whatsapp: cleanPhone2 || existingUser2?.whatsapp || '',
            categoria: categoria || existingUser2?.categoria || '4ta'
          }
        })
        return
      }
    }

    // 4. Aceptación obligatoria de Políticas & Reglas
    if (!aceptaPoliticas) {
      setValidationError('Debes aceptar las Políticas & Reglas Oficiales de ATAP para formalizar tu inscripción al torneo.')
      return
    }

    // 5. Inscripción exitosa al torneo
    registerPlayerToTournament(tournament.id, {
      nombre: cleanNombre,
      email: cleanEmail,
      dni: cleanDni,
      telefono: cleanPhone,
      categoria,
      modalidad: isDobles ? 'dobles' : 'singles',
      nombreJugador2: isDobles ? nombre2.trim() : undefined,
      emailJugador2: isDobles ? email2.trim() : undefined,
      dniJugador2: isDobles ? dni2.trim() : undefined,
      telefonoJugador2: isDobles ? telefono2.trim() : undefined,
      metodoPago,
      comprobanteInfo: comprobanteRef,
      aceptoPoliticas: true,
      fechaAceptacionPoliticas: new Date().toISOString()
    })

    setEnviado(true)
    if (onSuccess) {
      onSuccess()
    }
  }

  function handleCopy(text, label) {
    navigator.clipboard.writeText(text)
    setCopiado(label)
    setTimeout(() => setCopiado(''), 2500)
  }

  const whatsappMessage = encodeURIComponent(
    '¡Hola ATAP! 👋 Acabo de inscribirme al torneo *' + tournament.title + '*.\n\n' +
    (isDobles
      ? '👥 *Modalidad:* Dúos / Dobles\n' +
        '🎾 *Categoría:* ' + categoria + '\n' +
        '👤 *Jugador 1:* ' + nombre + ' (DNI: ' + maskDni(dni) + ')\n' +
        '👤 *Jugador 2:* ' + nombre2 + ' (DNI: ' + maskDni(dni2) + ')\n'
      : '👤 *Jugador:* ' + nombre + '\n' +
        '🪪 *DNI:* ' + maskDni(dni) + '\n' +
        '🎾 *Categoría:* ' + categoria + '\n') +
    '💰 *Monto:* ' + precioDisplay + ' (Vía Yape)\n\n' +
    'Adjunto mi comprobante de pago por Yape para la validación y aprobación en el cuadro oficial.'
  )

  const whatsappLink = 'https://wa.me/51987654321?text=' + whatsappMessage

  // Active verified status hints
  const user1Verified = dni && findUserByDni(dni)
  const user2Verified = dni2 && findUserByDni(dni2)

  const isUser1Ready = user1Verified && (!isUserProfileIncomplete(user1Verified) || (email.trim().includes('@') && telefono.trim().length >= 6))
  const isUser2Ready = user2Verified && (!isUserProfileIncomplete(user2Verified) || (email2.trim().includes('@') && telefono2.trim().length >= 6))

  return (
    <div className='tourney-modal-backdrop' onClick={onClose}>
      <div
        className={'tourney-modal-card' + (isDobles ? ' tourney-modal-card-wide' : '')}
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        <button
          className='tourney-modal-close'
          onClick={onClose}
          type='button'
          aria-label='Cerrar'
        >
          <X size={20} />
        </button>

        {!enviado ? (
          <>
            <div className='tourney-modal-header'>
              <div className='tourney-badge-row'>
                <span className='tourney-badge-kicker'>Inscripción Oficial ATAP</span>
                <span className='tourney-modality-badge'>
                  {isDobles ? '👥 Modalidad Dúos (Dobles)' : '🎾 Modalidad Singles'}
                </span>
              </div>
              <h2>{tournament.title}</h2>
              <div className='tourney-price-banner'>
                <div>
                  <span className='price-label'>Precio de inscripción:</span>
                  <div className='price-subtext-note'>
                    {isDobles ? 'Incluye la pareja de juego oficial' : 'Participación individual'}
                  </div>
                </div>
                <strong className='price-value'>{precioDisplay}</strong>
              </div>
            </div>

            {/* VALIDATION ERROR BANNER WITH CTA */}
            {validationError && (
              <div className={`tourney-validation-error-alert ${unregisteredPlayerInfo?.incomplete ? 'is-incomplete-alert' : ''}`} role='alert'>
                <div className='alert-icon-col'>
                  {unregisteredPlayerInfo?.incomplete ? (
                    <AlertTriangle size={24} color="#D97706" />
                  ) : (
                    <ShieldAlert size={24} color="#D32F2F" />
                  )}
                </div>
                <div className='alert-content-col'>
                  <strong className='alert-title'>
                    {unregisteredPlayerInfo?.incomplete
                      ? '⚠️ Faltan datos para continuar con la inscripción'
                      : 'Validación Requerida para Inscripción'}
                  </strong>
                  <p className='alert-message'>{validationError}</p>
                  {unregisteredPlayerInfo && (
                    <div className='alert-cta-wrap'>
                      <button
                        type='button'
                        className={`button-register-cta ${unregisteredPlayerInfo.incomplete ? 'btn-complete-cta' : ''}`}
                        onClick={() => handleOpenRegisterInAtap(unregisteredPlayerInfo.user)}
                      >
                        <span>
                          {unregisteredPlayerInfo.incomplete
                            ? 'Completar mis datos y registrarme'
                            : 'Registrarse en ATAP Ahora'}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                      <small className='alert-cta-note'>
                        {unregisteredPlayerInfo.incomplete
                          ? 'Tus datos ingresados ya fueron precargados automáticamente. Al registrarte solo deberás crear tu contraseña para activar tu perfil oficial.'
                          : unregisteredPlayerInfo.both
                            ? 'Ambos jugadores deben completar su registro gratuito antes de enviar este formulario.'
                            : `El jugador con DNI ${maskDni(unregisteredPlayerInfo.dni)} debe completar su registro gratuito.`}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form className='tourney-register-form' onSubmit={handleSubmit}>
              {/* SECTION: JUGADOR 1 */}
              <div className={isDobles ? 'player-form-section' : ''}>
                {isDobles && (
                  <div className='player-section-title'>
                    <Users size={16} color="#00CFA0" />
                    <h4>Jugador 1 (Capitán / Titular)</h4>
                    {user1Verified && (
                      <span className={`verified-user-pill ${isUserProfileIncomplete(user1Verified) ? 'incomplete-pill' : ''}`}>
                        <UserCheck size={12} /> {isUserProfileIncomplete(user1Verified) ? `Precargado: ${user1Verified.nombre} (Faltan datos)` : `Usuario Registrado (${user1Verified.nombre})`}
                      </span>
                    )}
                  </div>
                )}

                <div className='form-row-2'>
                  <div className='form-group'>
                    <label htmlFor='t-name'>
                      {isDobles ? 'Nombre completo Jugador 1 *' : 'Nombre completo *'}
                    </label>
                    <input
                      id='t-name'
                      type='text'
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value)
                        if (validationError) setValidationError('')
                      }}
                      placeholder='Ej. Carlos Mendoza'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <div className='label-with-hint'>
                      <label htmlFor='t-dni'>
                        {isDobles ? 'DNI Jugador 1 *' : 'DNI / Documento *'}
                      </label>
                      {user1Verified && (
                        <span className={`verified-tag-micro ${!isUser1Ready ? 'incomplete-tag' : ''}`}>
                          {isUser1Ready ? '✓ ATAP Activo' : '⚠️ Faltan datos'}
                        </span>
                      )}
                    </div>
                    <input
                      id='t-dni'
                      type='text'
                      value={dni}
                      onChange={(e) => {
                        const val = e.target.value
                        setDni(val)
                        if (validationError) setValidationError('')
                        const found = findUserByDni(val)
                        if (found && (!nombre || nombre === '')) {
                          setNombre(found.nombre)
                        }
                        if (found && found.email && (!email || email === '')) {
                          setEmail(found.email)
                        }
                        if (found && found.telefono && (!telefono || telefono === '')) {
                          setTelefono(found.telefono)
                        }
                      }}
                      placeholder='Ej. 72345678'
                      required
                    />
                  </div>
                </div>

                <div className='form-row-2'>
                  <div className='form-group'>
                    <label htmlFor='t-email'>
                      {isDobles ? 'Correo Jugador 1 *' : 'Correo electrónico *'}
                    </label>
                    <input
                      id='t-email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='correo@ejemplo.com'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label htmlFor='t-phone'>
                      {isDobles ? 'Teléfono Jugador 1 *' : 'Teléfono / WhatsApp *'}
                    </label>
                    <input
                      id='t-phone'
                      type='tel'
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder='987 654 321'
                      required
                    />
                  </div>
                </div>

                {user1Verified && isUserProfileIncomplete(user1Verified) && (
                  <div className="incomplete-player-helper-box">
                    <div className="helper-icon-wrap">
                      <AlertTriangle size={18} color="#D97706" />
                    </div>
                    <div className="helper-text-wrap">
                      <strong>Faltan datos de inscripción</strong>
                      <p>
                        Tu DNI figura precargado en el sistema ({user1Verified.nombre}), pero aún no has completado tu registro oficial en ATAP. Debes crear tu cuenta para poder formalizar tu inscripción.
                      </p>
                      <button
                        type="button"
                        className="btn-complete-account-now"
                        onClick={() => handleOpenRegisterInAtap(user1Verified)}
                      >
                        Crear mi cuenta en ATAP ahora →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: JUGADOR 2 (IF DOBLES) */}
              {isDobles && (
                <div className='player-form-section player-section-secondary'>
                  <div className='player-section-title'>
                    <Users size={16} color="#00304A" />
                    <h4>Jugador 2 (Compañero de Dúo)</h4>
                    {user2Verified && (
                      <span className={`verified-user-pill ${isUserProfileIncomplete(user2Verified) ? 'incomplete-pill' : ''}`}>
                        <UserCheck size={12} /> {isUserProfileIncomplete(user2Verified) ? `Precargado: ${user2Verified.nombre} (Faltan datos)` : `Usuario Registrado (${user2Verified.nombre})`}
                      </span>
                    )}
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-name-2'>Nombre completo Jugador 2 *</label>
                      <input
                        id='t-name-2'
                        type='text'
                        value={nombre2}
                        onChange={(e) => {
                          setNombre2(e.target.value)
                          if (validationError) setValidationError('')
                        }}
                        placeholder='Ej. Valeria Torres'
                        required={isDobles}
                      />
                    </div>
                    <div className='form-group'>
                      <div className='label-with-hint'>
                        <label htmlFor='t-dni-2'>DNI Jugador 2 *</label>
                        {user2Verified && (
                          <span className={`verified-tag-micro ${!isUser2Ready ? 'incomplete-tag' : ''}`}>
                            {isUser2Ready ? '✓ ATAP Activo' : '⚠️ Faltan datos'}
                          </span>
                        )}
                      </div>
                      <input
                        id='t-dni-2'
                        type='text'
                        value={dni2}
                        onChange={(e) => {
                          const val = e.target.value
                          setDni2(val)
                          if (validationError) setValidationError('')
                          const found = findUserByDni(val)
                          if (found && (!nombre2 || nombre2 === '')) {
                            setNombre2(found.nombre)
                          }
                          if (found && found.email && (!email2 || email2 === '')) {
                            setEmail2(found.email)
                          }
                          if (found && found.telefono && (!telefono2 || telefono2 === '')) {
                            setTelefono2(found.telefono)
                          }
                        }}
                        placeholder='Ej. 71234567'
                        required={isDobles}
                      />
                    </div>
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-email-2'>Correo Jugador 2 *</label>
                      <input
                        id='t-email-2'
                        type='email'
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                        placeholder='companero@ejemplo.com'
                        required={isDobles}
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='t-phone-2'>Teléfono Jugador 2 *</label>
                      <input
                        id='t-phone-2'
                        type='tel'
                        value={telefono2}
                        onChange={(e) => setTelefono2(e.target.value)}
                        placeholder='987 112 233'
                        required={isDobles}
                      />
                    </div>
                  </div>

                  {user2Verified && isUserProfileIncomplete(user2Verified) && (
                    <div className="incomplete-player-helper-box">
                      <div className="helper-icon-wrap">
                        <AlertTriangle size={18} color="#D97706" />
                      </div>
                      <div className="helper-text-wrap">
                        <strong>Faltan datos de inscripción del Jugador 2</strong>
                        <p>
                          El DNI figura precargado en el sistema ({user2Verified.nombre}), pero debe crear su cuenta oficial en ATAP para poder participar en el torneo.
                        </p>
                        <button
                          type="button"
                          className="btn-complete-account-now"
                          onClick={() => handleOpenRegisterInAtap(user2Verified)}
                        >
                          Registrar Jugador 2 en ATAP →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: CATEGORIA OBLIGATORIA CON CUPOS & METODO DE PAGO */}
              <div className='form-row-2'>
                <div className='form-group'>
                  <div className='label-with-hint'>
                    <label htmlFor='t-cat'>Categoría del Torneo (Obligatorio) *</label>
                  </div>
                  <select
                    id='t-cat'
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value)
                      if (validationError) setValidationError('')
                    }}
                    required
                  >
                    {categoriesList.map((cat) => {
                      const occ = getCategoryOccupancy(tournament, cat.nombre)
                      const isFull = occ.isFull
                      return (
                        <option
                          key={cat.id || cat.nombre}
                          value={cat.nombre}
                          disabled={isFull}
                        >
                          {cat.nombre} — {isFull ? '⛔ AGOTADO (0 cupos)' : `🟢 ${occ.remaining} de ${occ.total} cupos disponibles`}
                        </option>
                      )
                    })}
                  </select>
                  <small className='field-hint-micro'>
                    Cupos fijados por la organización para este torneo.
                  </small>
                </div>

                <div className='form-group'>
                  <label htmlFor='t-metodo'>Método de pago</label>
                  <select
                    id='t-metodo'
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value='Yape'>Yape</option>
                  </select>
                </div>
              </div>

              <div className='payment-guidance-box'>
                <p className='guidance-title'>💡 Instrucciones de Pago y Confirmación:</p>
                <p className='guidance-text'>
                  Al registrar tu inscripción, tu solicitud quedará en estado <strong>Pendiente de Pago</strong>.
                  Para confirmar tu cupo y ser incluido en el sorteo manual de la <strong>fase de grupos</strong>, realiza el abono de <strong>{precioDisplay}</strong> vía <strong>Yape</strong> y envía tu comprobante a la mesa técnica por WhatsApp.
                </p>
              </div>

              {/* ACEPTACIÓN OBLIGATORIA DE POLÍTICAS Y REGLAS */}
              <div className='terms-acceptance-card'>
                <label className='terms-checkbox-label'>
                  <input
                    type='checkbox'
                    checked={aceptaPoliticas}
                    onChange={(e) => {
                      setAceptaPoliticas(e.target.checked)
                      if (validationError) setValidationError('')
                    }}
                    className='terms-checkbox-input'
                    required
                  />
                  <span className='terms-text'>
                    He leído y acepto las{' '}
                    <button
                      type='button'
                      className='btn-open-rules-inline'
                      onClick={() => setShowRulesModal(true)}
                    >
                      Políticas & Reglas Oficiales de ATAP
                    </button>
                    {' '}(Uso de Imagen, Categorización, Formato Round Robin y Devoluciones).
                  </span>
                </label>
                <small className='terms-caption'>
                  * Autorización voluntaria para difusión deportiva sin fines comerciales y declaración de nivel de buena fe.
                </small>
              </div>

              <div className='modal-action-buttons'>
                <button
                  type='button'
                  className='button button-secondary-outline'
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button type='submit' className='button button-lime'>
                  Confirmar Inscripción
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className='tourney-success-content'>
            <div className='success-icon-badge'>
              <CheckCircle2 size={46} color='#00CFA0' />
            </div>
            <span className='status-pill-warning'>ESTADO: PENDIENTE DE PAGO</span>
            <h2>¡Inscripción Registrada con Éxito!</h2>
            <p className='success-subtext'>
              Tu solicitud para <strong>{tournament.title}</strong> ({isDobles ? 'Dúos' : 'Singles'} - {categoria}) ha sido creada. Para confirmar tu cupo definitivo y participar en la fase de grupos, realiza el abono de <strong>{precioDisplay}</strong> vía <strong>Yape</strong> y envía tu comprobante.
            </p>

            <div className='payment-accounts-card'>
              <div className='account-item'>
                <div className='account-info'>
                  <span className='account-name'>📲 Yape Oficial</span>
                  <strong>987 654 321</strong>
                  <span className='account-holder'>Titular: Asoc. Tenistas Amateur Perú</span>
                </div>
                <button
                  type='button'
                  className='copy-btn'
                  onClick={() => handleCopy('987654321', 'yape')}
                >
                  <Copy size={14} />
                  {copiado === 'yape' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className='whatsapp-action-section'>
              <a
                href={whatsappLink}
                target='_blank'
                rel='noopener noreferrer'
                className='whatsapp-confirm-btn'
              >
                <Send size={18} />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>
              <small className='whatsapp-hint'>
                Te dirigirá al WhatsApp oficial de ATAP con tus datos y DNI listos para validación.
              </small>
            </div>

            <button
              type='button'
              className='button button-secondary-outline full-width-btn'
              onClick={onClose}
              style={{ marginTop: '16px' }}
            >
              Entendido, volver a torneos
            </button>
          </div>
        )}
      </div>
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
    </div>
  )
}
