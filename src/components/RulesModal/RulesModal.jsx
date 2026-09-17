import { useState, useEffect } from 'react'
import { X, ScrollText, CheckCircle2 } from 'lucide-react'
import { getPoliciesAndRules } from '../../services/atapStorage'
import './RulesModal.css'

export default function RulesModal({ isOpen, onClose }) {
  const [sections, setSections] = useState(() => getPoliciesAndRules())
  const [activeSectionId, setActiveSectionId] = useState('')

  useEffect(() => {
    function handleUpdate() {
      const updated = getPoliciesAndRules()
      setSections(updated)
      if (!activeSectionId && updated.length > 0) {
        setActiveSectionId(updated[0].id)
      }
    }
    handleUpdate()
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id)
    }
  }, [sections, activeSectionId])

  if (!isOpen) return null

  function scrollToSection(id) {
    setActiveSectionId(id)
    const element = document.getElementById(`modal-sec-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="rules-modal-backdrop" onClick={onClose}>
      <div
        className="rules-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Políticas y Reglas Oficiales de ATAP"
      >
        {/* MODAL HEADER */}
        <div className="rules-modal-header">
          <div className="rules-modal-header-info">
            <span className="rules-modal-badge">
              <ScrollText size={14} /> Reglamento Oficial ATAP
            </span>
            <h2>Políticas & Reglas del Circuito</h2>
            <p className="rules-modal-subtitle">
              Compromiso de juego limpio, transparencia deportiva y convivencia amateur
            </p>
          </div>
          <button
            type="button"
            className="rules-modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar reglamento"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL QUICK NAV PILLS */}
        <div className="rules-modal-nav-strip">
          {sections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`rules-nav-chip ${activeSectionId === sec.id ? 'active' : ''}`}
              onClick={() => scrollToSection(sec.id)}
            >
              <span className="chip-num">#{sec.num}</span>
              <span className="chip-label">{sec.title.replace(/^\d+\.\s*/, '')}</span>
            </button>
          ))}
        </div>

        {/* MODAL BODY */}
        <div className="rules-modal-body">
          {sections.map((sec) => (
            <section
              key={sec.id}
              id={`modal-sec-${sec.id}`}
              className={`rules-section-card ${activeSectionId === sec.id ? 'highlighted' : ''}`}
            >
              <div className="rules-section-header">
                <span className="rules-section-number">{sec.num}</span>
                <div>
                  <h3 className="rules-section-title">{sec.title}</h3>
                  {sec.summary && <p className="rules-section-summary">{sec.summary}</p>}
                </div>
              </div>

              <div className="rules-section-text">
                {sec.content.split('\n\n').map((paragraph, pIdx) => {
                  const isTitleLike = paragraph.length < 70 && !paragraph.includes('•') && !paragraph.includes('–') && (paragraph.startsWith('¿') || paragraph.includes('Categoría') || paragraph.includes('Round Robin') || paragraph.includes('Walk Over') || paragraph.includes('Reserva') || paragraph.includes('FASE') || paragraph.includes('Subir') || paragraph.includes('No está') || paragraph.includes('Declaración') || paragraph.includes('Nuevos Filtros') || paragraph.includes('Congelamiento') || paragraph.includes('Ascenso Automático') || paragraph.includes('Comité de Evaluación'));

                  if (isTitleLike) {
                    return (
                      <h4 key={pIdx} className="rules-subheading">
                        {paragraph}
                      </h4>
                    )
                  }

                  if (paragraph.includes('•') || paragraph.includes('–') || /^\d+\.\s/.test(paragraph)) {
                    const lines = paragraph.split('\n')
                    return (
                      <div key={pIdx} className="rules-bullets-block">
                        {lines.map((line, lIdx) => {
                          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('–') || /^\d+\.\s/.test(line.trim())
                          return (
                            <p key={lIdx} className={isBullet ? 'rules-bullet-line' : 'rules-bullet-intro'}>
                              {line}
                            </p>
                          )
                        })}
                      </div>
                    )
                  }

                  return (
                    <p key={pIdx} className="rules-paragraph">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* MODAL FOOTER */}
        <div className="rules-modal-footer">
          <span className="rules-modal-note">
            <CheckCircle2 size={15} color="#00CFA0" />
            <span>Al inscribirse a cualquier torneo oficial, el jugador declara conocer y aceptar estas normas.</span>
          </span>
          <button type="button" className="rules-modal-btn-confirm" onClick={onClose}>
            Entendido, volver
          </button>
        </div>
      </div>
    </div>
  )
}
