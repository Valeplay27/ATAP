import { useState } from 'react'
import { CheckCircle2, Copy, Send, X } from 'lucide-react'
import { registerPlayerToTournament } from '../../services/atapStorage'
import './TournamentRegisterModal.css'

export default function TournamentRegisterModal({
  tournament,
  usuario,
  onClose,
  onSuccess
}) {
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [email, setEmail] = useState(usuario?.email || '')
  const [dni, setDni] = useState(usuario?.dni || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || '')
  const [categoria, setCategoria] = useState(usuario?.categoria || '1ra Categoría')
  const [metodoPago, setMetodoPago] = useState('Yape / Plin')
  const [comprobanteRef, setComprobanteRef] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [copiado, setCopiado] = useState('')

  if (!tournament) return null

  const precioDisplay = tournament.precio ? ('S/ ' + tournament.precio + '.00') : 'S/ 100.00'

  function handleSubmit(e) {
    e.preventDefault()
    if (!nombre || !email || !dni || !telefono) {
      alert('Por favor completa todos los campos requeridos.')
      return
    }

    registerPlayerToTournament(tournament.id, {
      nombre,
      email,
      dni,
      telefono,
      categoria,
      metodoPago,
      comprobanteInfo: comprobanteRef
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
    '👤 *Jugador:* ' + nombre + '\n' +
    '🪪 *DNI:* ' + dni + '\n' +
    '🎾 *Categoría:* ' + categoria + '\n' +
    '💰 *Monto:* ' + precioDisplay + '\n\n' +
    'Adjunto mi comprobante de pago para la validación y aprobación en el cuadro oficial.'
  )

  const whatsappLink = 'https://wa.me/51987654321?text=' + whatsappMessage

  return (
    <div className='tourney-modal-backdrop' onClick={onClose}>
      <div
        className='tourney-modal-card'
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
              <span className='tourney-badge-kicker'>Inscripción Oficial ATAP</span>
              <h2>{tournament.title}</h2>
              <div className='tourney-price-banner'>
                <span className='price-label'>Precio de inscripción:</span>
                <strong className='price-value'>{precioDisplay}</strong>
              </div>
            </div>

            <form className='tourney-register-form' onSubmit={handleSubmit}>
              <div className='form-row-2'>
                <div className='form-group'>
                  <label htmlFor='t-name'>Nombre completo *</label>
                  <input
                    id='t-name'
                    type='text'
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder='Ej. Carlos Mendoza'
                    required
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='t-dni'>DNI / Documento *</label>
                  <input
                    id='t-dni'
                    type='text'
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder='Ej. 74589632'
                    required
                  />
                </div>
              </div>

              <div className='form-row-2'>
                <div className='form-group'>
                  <label htmlFor='t-email'>Correo electrónico *</label>
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
                  <label htmlFor='t-phone'>Teléfono / WhatsApp *</label>
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

              <div className='form-row-2'>
                <div className='form-group'>
                  <label htmlFor='t-cat'>Categoría de juego *</label>
                  <select
                    id='t-cat'
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value='1ra Categoría'>1ra Categoría</option>
                    <option value='2da Categoría'>2da Categoría</option>
                    <option value='3ra Categoría'>3ra Categoría</option>
                    <option value='4ta Categoría'>4ta Categoría</option>
                  </select>
                </div>
                <div className='form-group'>
                  <label htmlFor='t-metodo'>Método de pago preferido</label>
                  <select
                    id='t-metodo'
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value='Yape / Plin'>Yape / Plin</option>
                    <option value='Transferencia BCP'>Transferencia BCP</option>
                    <option value='Transferencia BBVA'>Transferencia BBVA</option>
                  </select>
                </div>
              </div>

              <div className='payment-guidance-box'>
                <p className='guidance-title'>💡 Instrucciones de Pago:</p>
                <p className='guidance-text'>
                  Al enviar este formulario, tu registro quedará en estado <strong>Pendiente</strong>.
                  Deberás transferir <strong>{precioDisplay}</strong> y remitir tu comprobante por WhatsApp para que el administrador apruebe tu lugar en las llaves del torneo.
                </p>
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
                  Inscribirme al Torneo
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className='tourney-success-content'>
            <div className='success-icon-badge'>
              <CheckCircle2 size={46} color='#00CFA0' />
            </div>
            <span className='status-pill-warning'>ESTADO: PENDIENTE DE VALIDACIÓN</span>
            <h2>¡Inscripción Registrada!</h2>
            <p className='success-subtext'>
              Tu solicitud para <strong>{tournament.title}</strong> ha sido creada. Para confirmar tu cupo definitivo y participar en el sorteo de llaves, realiza el abono de <strong>{precioDisplay}</strong> y envía tu comprobante.
            </p>

            <div className='payment-accounts-card'>
              <div className='account-item'>
                <div className='account-info'>
                  <span className='account-name'>📲 Yape / Plin</span>
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

              <div className='account-item'>
                <div className='account-info'>
                  <span className='account-name'>🏦 BCP Soles</span>
                  <strong>193-9876543-0-12</strong>
                  <span className='account-holder'>CCI: 00219300987654301214</span>
                </div>
                <button
                  type='button'
                  className='copy-btn'
                  onClick={() => handleCopy('1939876543012', 'bcp')}
                >
                  <Copy size={14} />
                  {copiado === 'bcp' ? '¡Copiado!' : 'Copiar'}
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
                Te dirigirá al chat de validaciones de ATAP con tus datos listos para enviar.
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
    </div>
  )
}
