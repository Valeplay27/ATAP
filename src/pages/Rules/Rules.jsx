import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ScrollText, CheckCircle2, ShieldAlert, ArrowRight, MessageCircle, FileText } from 'lucide-react'
import { getPoliciesAndRules } from '../../services/atapStorage'
import './Rules.css'

export default function Rules() {
  const [sections, setSections] = useState(() => getPoliciesAndRules())
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    function handleUpdate() {
      const updated = getPoliciesAndRules()
      setSections(updated)
      if (!activeId && updated.length > 0) {
        setActiveId(updated[0].id)
      }
    }
    handleUpdate()
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  useEffect(() => {
    if (sections.length > 0 && !activeId) {
      setActiveId(sections[0].id)
    }
  }, [sections, activeId])

  function scrollToSection(id) {
    setActiveId(id)
    const element = document.getElementById(`rule-section-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <main className="page-content rules-page">
      <div className="rules-hero-strip">
        <div className="rules-hero-inner">
          <span className="rules-eyebrow">
            <ScrollText size={16} /> Reglamento Oficial del Circuito
          </span>
          <h1>Políticas & Reglas ATAP</h1>
          <p className="rules-lead">
            Conoce el marco normativo oficial de la Asociación de Tenistas Amateur del Perú. Nuestro compromiso es garantizar competitividad real, equilibrio deportivo, juego justo y un ambiente de camaradería.
          </p>
        </div>
      </div>

      <div className="rules-container">
        {/* SIDEBAR NAVIGATION (STICKY) */}
        <aside className="rules-sidebar">
          <div className="rules-sidebar-card">
            <h3 className="sidebar-title">Índice del Reglamento</h3>
            <nav className="rules-toc-nav" aria-label="Capítulos de reglas">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`rules-toc-item ${activeId === sec.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(sec.id)}
                >
                  <span className="toc-number">{sec.num}</span>
                  <span className="toc-text">{sec.title.replace(/^\d+\.\s*/, '')}</span>
                </button>
              ))}
            </nav>

            <hr className="rules-sidebar-divider" />

            <div className="rules-sidebar-help">
              <h4>¿Tienes dudas sobre tu categoría?</h4>
              <p>Un asesor ATAP te orientará para ubicarte según tu nivel real.</p>
              <a
                href="https://wa.me/51987654321?text=Hola%20ATAP,%20tengo%20una%20consulta%20sobre%20las%20Pol%C3%ADticas%20y%20mi%20categor%C3%ADa."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-rules"
              >
                <MessageCircle size={15} /> Contactar Asesor
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN RULES CONTENT */}
        <div className="rules-main-content">
          {sections.map((sec) => (
            <article
              key={sec.id}
              id={`rule-section-${sec.id}`}
              className="rules-chapter-card"
            >
              <header className="chapter-header">
                <span className="chapter-badge">Capítulo {sec.num}</span>
                <h2>{sec.title}</h2>
                {sec.summary && <p className="chapter-summary">{sec.summary}</p>}
              </header>

              <div className="chapter-body">
                {sec.content.split('\n\n').map((paragraph, idx) => {
                  const isTitleLike =
                    paragraph.length < 75 &&
                    !paragraph.includes('•') &&
                    !paragraph.includes('–') &&
                    (paragraph.startsWith('¿') ||
                      paragraph.includes('Declaración') ||
                      paragraph.includes('Nuevos Filtros') ||
                      paragraph.includes('Subir de categoría') ||
                      paragraph.includes('No está permitido') ||
                      paragraph.includes('7MA CATEGORÍA') ||
                      paragraph.includes('5TA PRINCIPIANTE') ||
                      paragraph.includes('Regla de participación') ||
                      paragraph.includes('FASE DE GRUPOS') ||
                      paragraph.includes('FASE ELIMINATORIA') ||
                      paragraph.includes('Formato Round Robin') ||
                      paragraph.includes('Reserva de Canchas') ||
                      paragraph.includes('Congelamiento') ||
                      paragraph.includes('Ascenso Automático') ||
                      paragraph.includes('Comité de Evaluación'))

                  if (isTitleLike) {
                    return (
                      <h3 key={idx} className="chapter-subheading">
                        {paragraph}
                      </h3>
                    )
                  }

                  if (
                    paragraph.includes('•') ||
                    paragraph.includes('–') ||
                    /^\d+\.\s/.test(paragraph)
                  ) {
                    const lines = paragraph.split('\n')
                    return (
                      <div key={idx} className="chapter-list-block">
                        {lines.map((line, lIdx) => {
                          const isBullet =
                            line.trim().startsWith('•') ||
                            line.trim().startsWith('–') ||
                            /^\d+\.\s/.test(line.trim())
                          return (
                            <p
                              key={lIdx}
                              className={isBullet ? 'chapter-bullet' : 'chapter-list-intro'}
                            >
                              {line}
                            </p>
                          )
                        })}
                      </div>
                    )
                  }

                  return (
                    <p key={idx} className="chapter-paragraph">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </article>
          ))}

          {/* FINAL CTA BANNER */}
          <div className="rules-cta-banner">
            <div className="cta-icon-wrap">
              <CheckCircle2 size={32} color="#00CFA0" />
            </div>
            <div className="cta-text-wrap">
              <h3>¿Listo para competir con juego limpio?</h3>
              <p>
                Inscríbete en los torneos oficiales del calendario ATAP y suma puntos en vivo para el ranking nacional.
              </p>
            </div>
            <Link to="/torneos" className="btn-go-to-tourneys">
              Ver Torneos Oficiales <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
