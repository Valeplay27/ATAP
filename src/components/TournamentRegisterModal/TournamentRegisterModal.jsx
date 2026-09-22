import { useState, useEffect } from 'react'
import { CheckCircle2, Copy, Send, X, AlertTriangle, Users, UserCheck, ShieldAlert, ArrowRight, Shield, Trophy, Image } from 'lucide-react'
import { registerPlayerToTournament, findUserByDni, getCategoryOccupancy, isUserProfileIncomplete, saveRegisteredUser, maskDni, getYapeConfig } from '../../services/atapStorage'
import RulesModal from '../RulesModal/RulesModal'
import './TournamentRegisterModal.css'

export default function TournamentRegisterModal({
  tournament,
  usuario,
  onClose,
  onSuccess
}) {
  const isGrupal = tournament?.modalidad === 'grupal' || tournament?.modalidad === 'equipos'
  const isDobles = tournament?.modalidad === 'dobles' && !isGrupal
  const categoriesList = tournament?.categorias && tournament.categorias.length > 0
    ? tournament.categorias
    : (isGrupal ? [
        { id: 'cat-g4', nombre: '4ta Equipos', cupos: 8 },
        { id: 'cat-g5a', nombre: '5ta A Equipos', cupos: 8 },
        { id: 'cat-g5b', nombre: '5ta B Equipos', cupos: 16 },
        { id: 'cat-g6', nombre: '6ta Equipos', cupos: 16 }
      ] : isDobles ? [
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

  // Team state (for grupal / 5 personas)
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [fotoEquipo, setFotoEquipo] = useState('')

  // Player 1 state
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [email, setEmail] = useState(usuario?.email || '')
  const [dni, setDni] = useState(usuario?.dni || usuario?.documentoIdentidad || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || usuario?.whatsapp || '')

  // Player 2 state (for doubles / dúos / grupal)
  const [nombre2, setNombre2] = useState('')
  const [email2, setEmail2] = useState('')
  const [dni2, setDni2] = useState('')
  const [telefono2, setTelefono2] = useState('')

  // Player 3 state (for grupal)
  const [nombre3, setNombre3] = useState('')
  const [email3, setEmail3] = useState('')
  const [dni3, setDni3] = useState('')
  const [telefono3, setTelefono3] = useState('')

  // Player 4 state (for grupal)
  const [nombre4, setNombre4] = useState('')
  const [email4, setEmail4] = useState('')
  const [dni4, setDni4] = useState('')
  const [telefono4, setTelefono4] = useState('')

  // Player 5 state (for grupal - Suplente Opcional)
  const [nombre5, setNombre5] = useState('')
  const [email5, setEmail5] = useState('')
  const [dni5, setDni5] = useState('')
  const [telefono5, setTelefono5] = useState('')

  // Mandatory Category selection
  const [categoria, setCategoria] = useState(() => {
    if (categoriesList.length > 0) return categoriesList[0].nombre
    return isGrupal ? '4ta Equipos' : isDobles ? '4ta Dobles' : '4ta'
  })

  const [metodoPago, setMetodoPago] = useState('Yape')
  const [comprobanteRef, setComprobanteRef] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [copiado, setCopiado] = useState('')
  const [validationError, setValidationError] = useState('')
  const [unregisteredPlayerInfo, setUnregisteredPlayerInfo] = useState(null)
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [yapeConfig, setYapeConfig] = useState(() => getYapeConfig())

  // Sincronizar datos de Yape en tiempo real si el administrador los actualiza
  useEffect(() => {
    function handleYapeStorage(e) {
      if (!e?.detail || e.detail.key === 'atap_yape_config') {
        setYapeConfig(getYapeConfig())
      }
    }
    window.addEventListener('atap_storage_update', handleYapeStorage)
    window.addEventListener('storage', handleYapeStorage)
    return () => {
      window.removeEventListener('atap_storage_update', handleYapeStorage)
      window.removeEventListener('storage', handleYapeStorage)
    }
  }, [])

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

  const isFree = tournament.precio !== undefined && Number(tournament.precio) === 0
  const precioDisplay = tournament.precio !== undefined ? (Number(tournament.precio) === 0 ? 'GRATIS' : ('S/ ' + tournament.precio + '.00')) : 'S/ 100.00'

  function handleOpenRegisterInAtap(playerData = null) {
    if (onClose) onClose()
    const target = playerData || (unregisteredPlayerInfo?.user) || unregisteredPlayerInfo || null

    const targetDni = (target?.dniReal || target?.dni || target?.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')
    const isPlayer2 = isDobles && targetDni && targetDni === (dni2 || '').toString().trim().replace(/\s+/g, '')

    const selectedDni = isPlayer2 ? dni2 : dni
    const selectedNombre = isPlayer2 ? nombre2 : nombre
    const selectedEmail = isPlayer2 ? email2 : email
    const selectedPhone = isPlayer2 ? telefono2 : telefono

    // Priorizar exactamente el DNI real y sin máscara que el usuario está escribiendo en la inscripción del torneo
    const rawTypedDni = (selectedDni || '').toString().trim().replace(/\s+/g, '')
    const targetReal = (target?.dniReal || '').toString().trim().replace(/\s+/g, '')
    const targetDoc = (target?.dni || target?.documentoIdentidad || '').toString().trim().replace(/\s+/g, '')

    let finalDni = ''
    if (rawTypedDni && !rawTypedDni.includes('*') && !rawTypedDni.includes('•')) {
      finalDni = rawTypedDni
    } else if (targetReal && !targetReal.includes('*') && !targetReal.includes('•')) {
      finalDni = targetReal
    } else if (targetDoc && !targetDoc.includes('*') && !targetDoc.includes('•')) {
      finalDni = targetDoc
    } else {
      finalDni = rawTypedDni || ''
    }

    const finalNombre = (selectedNombre || target?.nombre || '').toString().trim()
    const finalEmail = (selectedEmail || target?.email || '').toString().trim()
    const finalPhone = (selectedPhone || target?.telefono || target?.whatsapp || '').toString().trim()
    const finalCat = target?.categoria || categoria || '4ta'

    const payload = {
      dni: finalDni,
      dniReal: finalDni,
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

    if (isGrupal) {
      if (!nombreEquipo || !nombreEquipo.trim()) {
        setValidationError('Por favor ingresa el nombre de tu grupo o equipo (obligatorio).')
        return
      }

      // Check member 1
      if (!cleanNombre || !cleanDni || cleanDni.length !== 8) {
        setValidationError('Por favor completa el nombre y DNI válido (8 dígitos) del Jugador 1 (Capitán).')
        return
      }

      // Check member 2
      const cleanNombre2 = (nombre2 || '').trim()
      const cleanDni2 = (dni2 || '').replace(/\D/g, '')
      if (!cleanNombre2 || cleanDni2.length !== 8) {
        setValidationError('Por favor completa el nombre y DNI válido (8 dígitos) del Jugador 2 (Titular).')
        return
      }

      // Check member 3
      const cleanNombre3 = (nombre3 || '').trim()
      const cleanDni3 = (dni3 || '').replace(/\D/g, '')
      if (!cleanNombre3 || cleanDni3.length !== 8) {
        setValidationError('Por favor completa el nombre y DNI válido (8 dígitos) del Jugador 3 (Titular).')
        return
      }

      // Check member 4 (Opcional)
      const cleanNombre4 = (nombre4 || '').trim()
      const cleanDni4 = (dni4 || '').replace(/\D/g, '')
      if (cleanNombre4 || cleanDni4) {
        if (!cleanNombre4) {
          setValidationError('Por favor ingresa el nombre completo del Jugador 4 (Opcional) o deja ambos campos vacíos.')
          return
        }
        if (cleanDni4.length !== 8) {
          setValidationError('El DNI del Jugador 4 (Opcional) debe tener exactamente 8 dígitos o dejarse vacío.')
          return
        }
      }

      // Check member 5 (Suplente / Opcional)
      const cleanNombre5 = (nombre5 || '').trim()
      const cleanDni5 = (dni5 || '').replace(/\D/g, '')
      if (cleanNombre5 || cleanDni5) {
        if (!cleanNombre5) {
          setValidationError('Por favor ingresa el nombre completo del Jugador 5 (Suplente) o deja ambos campos vacíos.')
          return
        }
        if (cleanDni5.length !== 8) {
          setValidationError('El DNI del Jugador 5 (Suplente) debe tener exactamente 8 dígitos o dejarse vacío.')
          return
        }
      }

      // Check duplicate DNIs
      const teamDnis = [cleanDni, cleanDni2, cleanDni3]
      if (cleanDni4) teamDnis.push(cleanDni4)
      if (cleanDni5) teamDnis.push(cleanDni5)
      const uniqueDnis = new Set(teamDnis)
      if (uniqueDnis.size !== teamDnis.length) {
        setValidationError('No puedes ingresar el mismo DNI para más de un integrante del equipo.')
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
      modalidad: isGrupal ? 'grupal' : isDobles ? 'dobles' : 'singles',
      nombreEquipo: isGrupal ? nombreEquipo.trim() : undefined,
      fotoEquipo: isGrupal ? fotoEquipo.trim() : undefined,
      nombreJugador2: (isDobles || isGrupal) ? nombre2.trim() : undefined,
      emailJugador2: (isDobles || isGrupal) ? email2.trim() : undefined,
      dniJugador2: (isDobles || isGrupal) ? dni2.trim() : undefined,
      telefonoJugador2: (isDobles || isGrupal) ? telefono2.trim() : undefined,
      nombreJugador3: isGrupal ? nombre3.trim() : undefined,
      emailJugador3: isGrupal ? email3.trim() : undefined,
      dniJugador3: isGrupal ? dni3.trim() : undefined,
      telefonoJugador3: isGrupal ? telefono3.trim() : undefined,
      nombreJugador4: isGrupal && nombre4.trim() ? nombre4.trim() : undefined,
      emailJugador4: isGrupal && email4.trim() ? email4.trim() : undefined,
      dniJugador4: isGrupal && dni4.trim() ? dni4.trim() : undefined,
      telefonoJugador4: isGrupal && telefono4.trim() ? telefono4.trim() : undefined,
      nombreJugador5: isGrupal && nombre5.trim() ? nombre5.trim() : undefined,
      emailJugador5: isGrupal && email5.trim() ? email5.trim() : undefined,
      dniJugador5: isGrupal && dni5.trim() ? dni5.trim() : undefined,
      telefonoJugador5: isGrupal && telefono5.trim() ? telefono5.trim() : undefined,
      metodoPago: isFree ? 'Inscripción Gratuita' : metodoPago,
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
    '¡Hola ATAP! 👋 Acabo de inscribir a mi equipo al torneo *' + tournament.title + '*.\n\n' +
    (isGrupal
      ? '🏆 *Equipo:* ' + (nombreEquipo || 'Equipo') + '\n' +
        '🎾 *Categoría:* ' + categoria + '\n' +
        '👥 *Modalidad:* Grupal (Hasta 5 Personas)\n' +
        '👤 *Jugador 1 (Capitán):* ' + nombre + ' (DNI: ' + maskDni(dni) + ')\n' +
        '👤 *Jugador 2:* ' + nombre2 + ' (DNI: ' + maskDni(dni2) + ')\n' +
        '👤 *Jugador 3:* ' + nombre3 + ' (DNI: ' + maskDni(dni3) + ')\n' +
        (nombre4.trim() ? '👤 *Jugador 4:* ' + nombre4 + ' (DNI: ' + maskDni(dni4) + ')\n' : '') +
        (nombre5.trim() ? '👤 *Jugador 5 (Suplente):* ' + nombre5 + ' (DNI: ' + maskDni(dni5) + ')\n' : '')
      : isDobles
      ? '👥 *Modalidad:* Dúos / Dobles\n' +
        '🎾 *Categoría:* ' + categoria + '\n' +
        '👤 *Jugador 1:* ' + nombre + ' (DNI: ' + maskDni(dni) + ')\n' +
        '👤 *Jugador 2:* ' + nombre2 + ' (DNI: ' + maskDni(dni2) + ')\n'
      : '👤 *Jugador:* ' + nombre + '\n' +
        '🪪 *DNI:* ' + maskDni(dni) + '\n' +
        '🎾 *Categoría:* ' + categoria + '\n') +
    (isFree
      ? '💰 *Monto:* GRATIS (Sin costo de inscripción)\n\nAdjunto los datos para la confirmación en el cuadro oficial.'
      : '💰 *Monto:* ' + precioDisplay + ' (Vía Yape)\n\nAdjunto mi comprobante de pago por Yape para la validación y aprobación en el cuadro oficial.')
  )

  const whatsappLink = 'https://wa.me/51977884423?text=' + whatsappMessage

  // Active verified status hints
  const user1Verified = dni && findUserByDni(dni)
  const user2Verified = dni2 && findUserByDni(dni2)
  const user3Verified = dni3 && findUserByDni(dni3)
  const user4Verified = dni4 && findUserByDni(dni4)
  const user5Verified = dni5 && findUserByDni(dni5)

  const isUser1Ready = user1Verified && (!isUserProfileIncomplete(user1Verified) || (email.trim().includes('@') && telefono.trim().length >= 6))
  const isUser2Ready = user2Verified && (!isUserProfileIncomplete(user2Verified) || (email2.trim().includes('@') && telefono2.trim().length >= 6))
  const isUser3Ready = user3Verified && (!isUserProfileIncomplete(user3Verified) || (email3.trim().includes('@') && telefono3.trim().length >= 6))
  const isUser4Ready = user4Verified && (!isUserProfileIncomplete(user4Verified) || (email4.trim().includes('@') && telefono4.trim().length >= 6))
  const isUser5Ready = user5Verified && (!isUserProfileIncomplete(user5Verified) || (email5.trim().includes('@') && telefono5.trim().length >= 6))

  return (
    <div className='tourney-modal-backdrop' onClick={onClose}>
      <div
        className={'tourney-modal-card' + (isDobles || isGrupal ? ' tourney-modal-card-wide' : '')}
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
                  {isGrupal ? '🏆 Modalidad Grupal (Equipos)' : isDobles ? '👥 Modalidad Dúos (Dobles)' : '🎾 Modalidad Singles'}
                </span>
              </div>
              <h2>{tournament.title}</h2>
              <div className='tourney-price-banner'>
                <div>
                  <span className='price-label'>Precio de inscripción:</span>
                  <div className='price-subtext-note'>
                    {isGrupal ? 'Inscripción por equipo (3 obligatorios, 4to y 5to opcionales)' : isDobles ? 'Incluye la pareja de juego oficial' : 'Participación individual'}
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
              {/* SECTION: DATOS DE EQUIPO (GRUPAL) */}
              {isGrupal && (
                <div className='team-registration-card'>
                  <div className='team-section-header'>
                    <Trophy size={18} color="#00CFA0" />
                    <div className='team-header-titles'>
                      <h4>Datos del Equipo / Grupo (Hasta 5 Integrantes)</h4>
                      <span className='team-header-subtitle'>Asigna nombre y foto a tu equipo (3 obligatorios, 4to y 5to opcionales)</span>
                    </div>
                  </div>

                  <div className='form-row-2' style={{ marginTop: '12px' }}>
                    <div className='form-group'>
                      <label htmlFor='t-team-name'>
                        Nombre del Grupo / Equipo * <span className='field-required-tag'>Obligatorio</span>
                      </label>
                      <input
                        id='t-team-name'
                        type='text'
                        value={nombreEquipo}
                        onChange={(e) => {
                          setNombreEquipo(e.target.value)
                          if (validationError) setValidationError('')
                        }}
                        placeholder='Ej. Los Ases de Lima'
                        required={isGrupal}
                      />
                    </div>

                    <div className='form-group'>
                      <div className='label-with-hint'>
                        <label htmlFor='t-team-photo'>
                          Foto / Escudo del Grupo <span className='field-optional-tag'>Opcional</span>
                        </label>
                        {fotoEquipo && (
                          <button
                            type='button'
                            className='btn-clear-photo'
                            onClick={() => setFotoEquipo('')}
                            title='Quitar foto'
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                      <div className='team-photo-input-group'>
                        <input
                          id='t-team-photo'
                          type='text'
                          value={fotoEquipo}
                          onChange={(e) => setFotoEquipo(e.target.value)}
                          placeholder='URL de imagen o logo'
                        />
                        <label className='btn-upload-team-photo' title='Subir imagen desde tu equipo'>
                          <Image size={15} />
                          <span>Subir</span>
                          <input
                            type='file'
                            accept='image/*'
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0]
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('La imagen debe ser menor a 2MB')
                                  return
                                }
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setFotoEquipo(reader.result)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {fotoEquipo && (
                    <div className='team-photo-preview-bar'>
                      <img src={fotoEquipo} alt="Escudo del equipo" className='team-logo-preview-thumb' />
                      <div className='team-preview-info'>
                        <span className='team-preview-name'>{nombreEquipo || 'Equipo'}</span>
                        <span className='team-preview-hint'>Vista previa del escudo para los cuadros y tabla oficial</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: JUGADOR 1 */}
              <div className={(isDobles || isGrupal) ? 'player-form-section' : ''}>
                {(isDobles || isGrupal) && (
                  <div className='player-section-title'>
                    <Users size={16} color="#00CFA0" />
                    <h4>{isGrupal ? 'Jugador 1 (Capitán / Titular 1) *' : 'Jugador 1 (Capitán / Titular)'}</h4>
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
                      {(isDobles || isGrupal) ? 'Nombre completo Jugador 1 *' : 'Nombre completo *'}
                    </label>
                    <input
                      id='t-name'
                      type='text'
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value.replace(/[0-9]/g, ''))
                        if (validationError) setValidationError('')
                      }}
                      placeholder='Ej. Carlos Mendoza'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <div className='label-with-hint'>
                      <label htmlFor='t-dni'>
                        {(isDobles || isGrupal) ? 'DNI Jugador 1 *' : 'DNI / Documento *'}
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
                        const val = e.target.value.replace(/\D/g, '').slice(0, 8)
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
                      {(isDobles || isGrupal) ? 'Correo Jugador 1 *' : 'Correo electrónico *'}
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
                      {(isDobles || isGrupal) ? 'Teléfono Jugador 1 *' : 'Teléfono / WhatsApp *'}
                    </label>
                    <input
                      id='t-phone'
                      type='tel'
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder='977 884 423'
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
                        onClick={() => handleOpenRegisterInAtap({ ...user1Verified, dni: dni.trim() || user1Verified.dniReal || user1Verified.dni, dniReal: dni.trim() || user1Verified.dniReal })}
                      >
                        Crear mi cuenta en ATAP ahora →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: JUGADOR 2 (IF DOBLES OR GRUPAL) */}
              {(isDobles || isGrupal) && (
                <div className='player-form-section player-section-secondary'>
                  <div className='player-section-title'>
                    <Users size={16} color="#00304A" />
                    <h4>{isGrupal ? 'Jugador 2 (Titular 2) *' : 'Jugador 2 (Compañero de Dúo) *'}</h4>
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
                          setNombre2(e.target.value.replace(/[0-9]/g, ''))
                          if (validationError) setValidationError('')
                        }}
                        placeholder='Ej. Valeria Torres'
                        required
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
                          const val = e.target.value.replace(/\D/g, '').slice(0, 8)
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
                        required
                      />
                    </div>
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-email-2'>Correo Jugador 2 {isGrupal ? '(Opcional)' : '*'}</label>
                      <input
                        id='t-email-2'
                        type='email'
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                        placeholder='jugador2@ejemplo.com'
                        required={isDobles}
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='t-phone-2'>Teléfono Jugador 2 {isGrupal ? '(Opcional)' : '*'}</label>
                      <input
                        id='t-phone-2'
                        type='tel'
                        value={telefono2}
                        onChange={(e) => setTelefono2(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder='977 884 423'
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
                          onClick={() => handleOpenRegisterInAtap({ ...user2Verified, dni: dni2.trim() || user2Verified.dniReal || user2Verified.dni, dniReal: dni2.trim() || user2Verified.dniReal })}
                        >
                          Registrar Jugador 2 en ATAP →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: JUGADOR 3 (IF GRUPAL) */}
              {isGrupal && (
                <div className='player-form-section player-section-tertiary'>
                  <div className='player-section-title'>
                    <Users size={16} color="#00304A" />
                    <h4>Jugador 3 (Titular 3) *</h4>
                    {user3Verified && (
                      <span className={`verified-user-pill ${isUserProfileIncomplete(user3Verified) ? 'incomplete-pill' : ''}`}>
                        <UserCheck size={12} /> {isUserProfileIncomplete(user3Verified) ? `Precargado: ${user3Verified.nombre}` : `Usuario Registrado (${user3Verified.nombre})`}
                      </span>
                    )}
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-name-3'>Nombre completo Jugador 3 *</label>
                      <input
                        id='t-name-3'
                        type='text'
                        value={nombre3}
                        onChange={(e) => {
                          setNombre3(e.target.value.replace(/[0-9]/g, ''))
                          if (validationError) setValidationError('')
                        }}
                        placeholder='Ej. Rodrigo Morales'
                        required={isGrupal}
                      />
                    </div>
                    <div className='form-group'>
                      <div className='label-with-hint'>
                        <label htmlFor='t-dni-3'>DNI Jugador 3 *</label>
                        {user3Verified && (
                          <span className={`verified-tag-micro ${!isUser3Ready ? 'incomplete-tag' : ''}`}>
                            {isUser3Ready ? '✓ ATAP Activo' : '⚠️ Faltan datos'}
                          </span>
                        )}
                      </div>
                      <input
                        id='t-dni-3'
                        type='text'
                        value={dni3}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                          setDni3(val)
                          if (validationError) setValidationError('')
                          const found = findUserByDni(val)
                          if (found && (!nombre3 || nombre3 === '')) {
                            setNombre3(found.nombre)
                          }
                          if (found && found.email && (!email3 || email3 === '')) {
                            setEmail3(found.email)
                          }
                          if (found && found.telefono && (!telefono3 || telefono3 === '')) {
                            setTelefono3(found.telefono)
                          }
                        }}
                        placeholder='Ej. 73456789'
                        required={isGrupal}
                      />
                    </div>
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-email-3'>Correo Jugador 3 (Opcional)</label>
                      <input
                        id='t-email-3'
                        type='email'
                        value={email3}
                        onChange={(e) => setEmail3(e.target.value)}
                        placeholder='jugador3@ejemplo.com'
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='t-phone-3'>Teléfono Jugador 3 (Opcional)</label>
                      <input
                        id='t-phone-3'
                        type='tel'
                        value={telefono3}
                        onChange={(e) => setTelefono3(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder='988 123 456'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: JUGADOR 4 (IF GRUPAL) */}
              {isGrupal && (
                <div className='player-form-section player-section-optional'>
                  <div className='player-section-title'>
                    <Users size={16} color="#64748B" />
                    <div className='player-optional-header-wrap'>
                      <h4>Jugador 4</h4>
                      <span className='badge-suplente-opcional'>OPCIONAL</span>
                    </div>
                    {user4Verified && (
                      <span className={`verified-user-pill ${isUserProfileIncomplete(user4Verified) ? 'incomplete-pill' : ''}`}>
                        <UserCheck size={12} /> {isUserProfileIncomplete(user4Verified) ? `Precargado: ${user4Verified.nombre}` : `Usuario Registrado (${user4Verified.nombre})`}
                      </span>
                    )}
                  </div>
                  <p className='section-subtext-hint'>
                    Puedes registrar al 4to integrante ahora o completar el equipo más adelante.
                  </p>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-name-4'>Nombre completo Jugador 4 (Opcional)</label>
                      <input
                        id='t-name-4'
                        type='text'
                        value={nombre4}
                        onChange={(e) => {
                          setNombre4(e.target.value.replace(/[0-9]/g, ''))
                          if (validationError) setValidationError('')
                        }}
                        placeholder='Ej. Andrea Salazar (Opcional)'
                      />
                    </div>
                    <div className='form-group'>
                      <div className='label-with-hint'>
                        <label htmlFor='t-dni-4'>DNI Jugador 4 (Opcional)</label>
                        {user4Verified && (
                          <span className={`verified-tag-micro ${!isUser4Ready ? 'incomplete-tag' : ''}`}>
                            {isUser4Ready ? '✓ ATAP Activo' : '⚠️ Faltan datos'}
                          </span>
                        )}
                      </div>
                      <input
                        id='t-dni-4'
                        type='text'
                        value={dni4}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                          setDni4(val)
                          if (validationError) setValidationError('')
                          const found = findUserByDni(val)
                          if (found && (!nombre4 || nombre4 === '')) {
                            setNombre4(found.nombre)
                          }
                          if (found && found.email && (!email4 || email4 === '')) {
                            setEmail4(found.email)
                          }
                          if (found && found.telefono && (!telefono4 || telefono4 === '')) {
                            setTelefono4(found.telefono)
                          }
                        }}
                        placeholder='Ej. 74567890 (Opcional)'
                      />
                    </div>
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-email-4'>Correo Jugador 4 (Opcional)</label>
                      <input
                        id='t-email-4'
                        type='email'
                        value={email4}
                        onChange={(e) => setEmail4(e.target.value)}
                        placeholder='jugador4@ejemplo.com'
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='t-phone-4'>Teléfono Jugador 4 (Opcional)</label>
                      <input
                        id='t-phone-4'
                        type='tel'
                        value={telefono4}
                        onChange={(e) => setTelefono4(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder='999 456 789'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: JUGADOR 5 (SUPLENTE - OPCIONAL) */}
              {isGrupal && (
                <div className='player-form-section player-section-optional'>
                  <div className='player-section-title'>
                    <Users size={16} color="#64748B" />
                    <div className='player-optional-header-wrap'>
                      <h4>Jugador 5 (Suplente)</h4>
                      <span className='badge-suplente-opcional'>OPCIONAL</span>
                    </div>
                    {user5Verified && (
                      <span className={`verified-user-pill ${isUserProfileIncomplete(user5Verified) ? 'incomplete-pill' : ''}`}>
                        <UserCheck size={12} /> {isUserProfileIncomplete(user5Verified) ? `Precargado: ${user5Verified.nombre}` : `Usuario Registrado (${user5Verified.nombre})`}
                      </span>
                    )}
                  </div>
                  <p className='section-subtext-hint'>
                    Puedes registrar hasta 1 jugador suplente para el equipo en caso de recambio durante el torneo.
                  </p>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-name-5'>Nombre completo Jugador 5 (Suplente)</label>
                      <input
                        id='t-name-5'
                        type='text'
                        value={nombre5}
                        onChange={(e) => {
                          setNombre5(e.target.value.replace(/[0-9]/g, ''))
                          if (validationError) setValidationError('')
                        }}
                        placeholder='Ej. Mateo Gómez (Opcional)'
                      />
                    </div>
                    <div className='form-group'>
                      <div className='label-with-hint'>
                        <label htmlFor='t-dni-5'>DNI Jugador 5 (Suplente)</label>
                        {user5Verified && (
                          <span className={`verified-tag-micro ${!isUser5Ready ? 'incomplete-tag' : ''}`}>
                            {isUser5Ready ? '✓ ATAP Activo' : '⚠️ Faltan datos'}
                          </span>
                        )}
                      </div>
                      <input
                        id='t-dni-5'
                        type='text'
                        value={dni5}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                          setDni5(val)
                          if (validationError) setValidationError('')
                          const found = findUserByDni(val)
                          if (found && (!nombre5 || nombre5 === '')) {
                            setNombre5(found.nombre)
                          }
                          if (found && found.email && (!email5 || email5 === '')) {
                            setEmail5(found.email)
                          }
                          if (found && found.telefono && (!telefono5 || telefono5 === '')) {
                            setTelefono5(found.telefono)
                          }
                        }}
                        placeholder='Ej. 75678901 (Opcional)'
                      />
                    </div>
                  </div>

                  <div className='form-row-2'>
                    <div className='form-group'>
                      <label htmlFor='t-email-5'>Correo Jugador 5 (Opcional)</label>
                      <input
                        id='t-email-5'
                        type='email'
                        value={email5}
                        onChange={(e) => setEmail5(e.target.value)}
                        placeholder='suplente@ejemplo.com'
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='t-phone-5'>Teléfono Jugador 5 (Opcional)</label>
                      <input
                        id='t-phone-5'
                        type='tel'
                        value={telefono5}
                        onChange={(e) => setTelefono5(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder='911 223 344'
                      />
                    </div>
                  </div>
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
                    value={isFree ? 'Gratis' : metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    disabled={isFree}
                  >
                    {isFree ? (
                      <option value='Gratis'>Inscripción Gratuita (S/ 0.00)</option>
                    ) : (
                      <option value='Yape'>Yape</option>
                    )}
                  </select>
                </div>
              </div>

              <div className='payment-guidance-box'>
                <p className='guidance-title'>{isFree ? '💡 Torneo Gratuito:' : '💡 Instrucciones de Pago y Confirmación:'}</p>
                <p className='guidance-text'>
                  {isFree ? (
                    <>
                      Este torneo cuenta con <strong>inscripción 100% gratuita</strong>. Al registrar tu solicitud, tu cupo quedará registrado y validado para el sorteo de los cuadros oficiales.
                    </>
                  ) : (
                    <>
                      Al registrar tu inscripción, tu solicitud quedará en estado <strong>Pendiente de Pago</strong>.
                      Para confirmar tu cupo y ser incluido en el sorteo manual de la <strong>fase de grupos</strong>, realiza el abono de <strong>{precioDisplay}</strong> vía <strong>Yape</strong> y envía tu comprobante a la mesa técnica por WhatsApp.
                    </>
                  )}
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
            <span className={isFree ? 'status-pill-approved' : 'status-pill-warning'}>
              {isFree ? 'ESTADO: INSCRIPCIÓN CONFIRMADA' : 'ESTADO: PENDIENTE DE PAGO'}
            </span>
            <h2>¡Inscripción Registrada con Éxito!</h2>
            <p className='success-subtext'>
              {isFree ? (
                <>
                  Tu solicitud para <strong>{tournament.title}</strong> ({isGrupal ? 'Grupal (Equipos)' : isDobles ? 'Dúos' : 'Singles'} - {categoria}) ha sido registrada exitosamente. Al ser un <strong>torneo gratuito</strong>, tu participación queda registrada para el sorteo oficial.
                </>
              ) : (
                <>
                  Tu solicitud para <strong>{tournament.title}</strong> ({isGrupal ? 'Grupal (Equipos)' : isDobles ? 'Dúos' : 'Singles'} - {categoria}) ha sido creada. Para confirmar tu cupo definitivo y participar en la fase de grupos, realiza el abono de <strong>{precioDisplay}</strong> vía <strong>Yape</strong> y envía tu comprobante.
                </>
              )}
            </p>

            {!isFree && (
              <div className='payment-accounts-card'>
                <div className='account-item'>
                  <div className='account-info'>
                    <span className='account-name'>📲 Yape Oficial</span>
                    <strong className='yape-phone-number'>{yapeConfig.numero}</strong>
                    {yapeConfig.titular && (
                      <span className='account-holder'><strong>Titular:</strong> {yapeConfig.titular}</span>
                    )}
                    {yapeConfig.ruc && (
                      <span className='account-holder-ruc'><strong>RUC Nº</strong> {yapeConfig.ruc}</span>
                    )}
                    {yapeConfig.entidad && (
                      <span className='account-holder-org'>{yapeConfig.entidad}</span>
                    )}
                  </div>
                  <button
                    type='button'
                    className='copy-btn'
                    onClick={() => handleCopy(yapeConfig.numeroRaw || yapeConfig.numero.replace(/\D/g, ''), 'yape')}
                  >
                    <Copy size={14} />
                    {copiado === 'yape' ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            <div className='whatsapp-action-section'>
              <a
                href={whatsappLink}
                target='_blank'
                rel='noopener noreferrer'
                className='whatsapp-confirm-btn'
              >
                <Send size={18} />
                <span>{isFree ? 'Enviar Confirmación por WhatsApp' : 'Enviar Comprobante por WhatsApp'}</span>
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
