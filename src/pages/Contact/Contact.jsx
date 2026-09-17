import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import './Contact.css'

const FAQ_ITEMS = [
  {
    q: '¿Cómo me inscribo a un torneo de ATAP?',
    a: 'Ingresa a la sección "Torneos", ubica el torneo activo y haz clic en "Inscribirme". Si no has completado tu perfil de jugador, podrás ingresar tu categoría (1ra a 4ta) y datos de contacto en segundos.'
  },
  {
    q: '¿Cómo confirmo y valido el pago de mi inscripción?',
    a: 'Realiza el pago por Yape al monto indicado en el torneo. Luego, envía la captura del comprobante al WhatsApp oficial de ATAP (+51 987 654 321) indicando tu nombre y DNI. El comité validará tu registro para incluirte en el sorteo oficial de la fase de grupos.'
  },
  {
    q: '¿Cómo funciona el sorteo de llaves y emparejamientos?',
    a: 'Una vez cerradas las inscripciones y aprobados los pagos de los jugadores, el administrador oficial realiza el sorteo aleatorio transparente. La llave del torneo se publica de inmediato en la plataforma y podrás ver a tu rival y horarios.'
  },
  {
    q: '¿Cómo sumo puntos para el Ranking Oficial ATAP?',
    a: 'Cada partido ganado en los torneos oficiales del circuito suma puntos directamente a tu perfil en el ranking de tu categoría. Al concluir cada ronda, los marcadores son registrados y el ranking se actualiza en tiempo real.'
  },
  {
    q: '¿Puedo jugar torneos tanto en modalidad Singles como en Dúo / Dobles?',
    a: '¡Sí! En ATAP organizamos torneos tanto en formato Individual (Singles) como en Parejas (Dúo). Cada torneo tiene claramente especificada su modalidad en su tarjeta oficial.'
  }
]

export default function Contact() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    motivo: 'Inscripción a Torneo',
    mensaje: ''
  })

  const [enviado, setEnviado] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [openFaq, setOpenFaq] = useState(0) // First FAQ open by default

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.mensaje.trim()) {
      alert('Por favor ingresa tu nombre y mensaje antes de enviar.')
      return
    }

    const lines = [
      `🎾 *CONSULTA ATAP - ASOCIACIÓN DE TENISTAS AMATEUR DEL PERÚ*`,
      `👤 *Nombre:* ${formData.nombre.trim()}`,
      formData.email.trim() ? `📧 *Correo:* ${formData.email.trim()}` : null,
      formData.telefono.trim() ? `📱 *Teléfono:* ${formData.telefono.trim()}` : null,
      `📌 *Motivo:* ${formData.motivo}`,
      `💬 *Mensaje:* ${formData.mensaje.trim()}`
    ].filter(Boolean)

    const text = encodeURIComponent(lines.join('\n'))
    const whatsappUrl = `https://wa.me/51987654321?text=${text}`

    setEnviado(true)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setTimeout(() => setEnviado(false), 8000)
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText('contacto@atap.pe')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  return (
    <main className="contact-page">
      {/* HEADER BANNER */}
      <section className="contact-heading-card">
        <span className="contact-eyebrow">
          <span className="eyebrow-slash">//</span> ATENCIÓN AL JUGADOR Y AFILIADOS
        </span>
        <h1>Contacto y Soporte Oficial ATAP</h1>
        <p className="contact-desc">
          ¿Tienes dudas sobre los torneos, validación de pagos, emparejamientos o el ranking oficial? Nuestro equipo de coordinación técnica y administrativa está listo para ayudarte.
        </p>
      </section>

      {/* 4 TOP QUICK CHANNEL CARDS */}
      <section className="contact-channels-grid">
        {/* WHATSAPP */}
        <article className="channel-card whatsapp">
          <div className="channel-icon-wrap">
            <MessageSquare size={22} />
          </div>
          <h3>WhatsApp Oficial</h3>
          <p className="channel-primary-val">+51 987 654 321</p>
          <p className="channel-sub">
            Atención ágil para envío de comprobantes de pago y consultas en tiempo real.
          </p>
          <a
            href="https://wa.me/51987654321"
            target="_blank"
            rel="noopener noreferrer"
            className="channel-btn-action"
          >
            <span>Iniciar Chat WhatsApp</span>
            <ExternalLink size={13} />
          </a>
        </article>

        {/* EMAIL */}
        <article className="channel-card email">
          <div className="channel-icon-wrap">
            <Mail size={22} />
          </div>
          <h3>Correo Electrónico</h3>
          <p className="channel-primary-val">contacto@atap.pe</p>
          <p className="channel-sub">
            Para consultas formales, solicitudes de auspicios y asuntos administrativos.
          </p>
          <button
            type="button"
            className="channel-btn-action"
            onClick={handleCopyEmail}
          >
            {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedEmail ? '¡Correo Copiado!' : 'Copiar Correo'}</span>
          </button>
        </article>

        {/* SEDE PRINCIPAL */}
        <article className="channel-card location">
          <div className="channel-icon-wrap">
            <MapPin size={22} />
          </div>
          <h3>Sedes del Circuito</h3>
          <p className="channel-primary-val">Lima Metropolitana, Perú</p>
          <p className="channel-sub">
            Club Lawn Tennis de la Exposición y clubes asociados del circuito amateur.
          </p>
          <div className="channel-btn-action">
            <span>Canchas Oficiales</span>
          </div>
        </article>

        {/* HORARIO */}
        <article className="channel-card hours">
          <div className="channel-icon-wrap">
            <Clock size={22} />
          </div>
          <h3>Horarios de Atención</h3>
          <p className="channel-primary-val">Lun a Sáb: 8:00 AM - 9:00 PM</p>
          <p className="channel-sub">
            Domingos y días de torneo: 8:00 AM - 2:00 PM con soporte en cancha.
          </p>
          <div className="channel-btn-action">
            <span>Soporte Activo</span>
          </div>
        </article>
      </section>

      {/* MAIN TWO-COLUMN SECTION: FORM & FAQ */}
      <section className="contact-main-grid">
        {/* COLUMN 1: FORMULARIO */}
        <div className="contact-form-card">
          <div className="form-header-box">
            <h2>Envíanos tu Consulta</h2>
            <p>Completa el formulario y un coordinador de ATAP te responderá a la brevedad.</p>
          </div>

          {enviado && (
            <div className="contact-success-alert" role="alert">
              <CheckCircle2 size={18} />
              <span>
                ¡Abriendo chat de WhatsApp oficial de ATAP con tu consulta estructurada!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="contact-nombre">Nombre Completo *</label>
                <input
                  id="contact-nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej: Carlos Mendoza"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Correo Electrónico</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="carlos@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="contact-telefono">Teléfono / WhatsApp</label>
                <input
                  id="contact-telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Ej: 987654321"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-motivo">Motivo de Consulta *</label>
                <select
                  id="contact-motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  required
                >
                  <option value="Inscripción a Torneo">Inscripción a Torneo</option>
                  <option value="Validación de Pago / Comprobante">Validación de Pago / Comprobante</option>
                  <option value="Consulta sobre Ranking y Puntos">Consulta sobre Ranking y Puntos</option>
                  <option value="Evaluación de Categoría (1ra a 4ta)">Evaluación de Categoría (1ra a 4ta)</option>
                  <option value="Modalidades (Singles o Dobles)">Modalidades (Singles o Dobles)</option>
                  <option value="Auspicios y Patrocinios">Auspicios y Patrocinios</option>
                  <option value="Otro Motivo">Otro Motivo</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-mensaje">Mensaje o Consulta Detallada *</label>
              <textarea
                id="contact-mensaje"
                name="mensaje"
                placeholder="Escribe aquí tu consulta, número de operación o detalle del torneo..."
                value={formData.mensaje}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn-contact-whatsapp-only">
                <MessageSquare size={18} />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </form>
        </div>

        {/* COLUMN 2: PREGUNTAS FRECUENTES (FAQ) */}
        <div className="contact-faq-card">
          <div className="faq-header-box">
            <h2>Preguntas Frecuentes</h2>
            <p>Respuestas rápidas a las consultas más habituales de nuestros tenistas.</p>
          </div>

          <div className="faq-accordion-list">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  className={`faq-item ${isOpen ? 'is-open' : ''}`}
                  key={idx}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={16} className="faq-icon-arrow" />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-content">
                      <p style={{ margin: 0 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM QUICK HELP BANNER */}
      <section className="contact-quick-help-banner">
        <div className="quick-help-text">
          <h3>¿Tienes una urgencia o partido en curso?</h3>
          <p>
            Comunícate directamente con la mesa de control y coordinación de torneos de ATAP vía WhatsApp para reprogramaciones justificadas o reportes de cancha.
          </p>
        </div>
        <a
          href="https://wa.me/51987654321?text=Hola%20ATAP,%20tengo%20una%20consulta%20urgente%20sobre%20mi%20partido"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-direct-chat"
        >
          <MessageSquare size={16} />
          <span>Chat de Emergencias</span>
        </a>
      </section>
    </main>
  )
}
