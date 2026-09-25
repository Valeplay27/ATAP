import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Newspaper,
  Search,
  Calendar,
  User,
  Share2,
  FileText,
  Camera,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react'
import { getNews, getAssetUrl, handleImageFallback } from '../../services/atapStorage'
import './Community.css'

export default function Community() {
  const [news, setNews] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [readingArticle, setReadingArticle] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const backdropMouseDownRef = useRef(false)
  const handleBackdropMouseDown = (e) => {
    backdropMouseDownRef.current = (e.target === e.currentTarget)
  }
  const handleBackdropClose = (e, closeFn) => {
    if (backdropMouseDownRef.current && e.target === e.currentTarget) {
      closeFn()
    }
    backdropMouseDownRef.current = false
  }

  // Cargar noticias desde el storage sincronizado
  useEffect(() => {
    function loadNews() {
      setNews(getNews())
    }

    loadNews()

    function handleDataUpdate(e) {
      if (!e.detail || e.detail.key === 'atap_comunidad_noticias') {
        loadNews()
      }
    }

    window.addEventListener('atap_data_updated', handleDataUpdate)
    return () => window.removeEventListener('atap_data_updated', handleDataUpdate)
  }, [])

  // Categorías fijas y dinámicas
  const categories = ['Todas', 'Torneos', 'Comunicado', 'Tips de Juego', 'Entrevistas', 'Comunidad', 'Ranking']

  // Filtrado por categoría y búsqueda
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchCat =
        selectedCategory === 'Todas' ||
        item.categoria?.toLowerCase() === selectedCategory.toLowerCase()

      const q = searchQuery.trim().toLowerCase()
      if (!q) return matchCat

      const matchSearch =
        item.titulo?.toLowerCase().includes(q) ||
        item.resumen?.toLowerCase().includes(q) ||
        item.contenido?.toLowerCase().includes(q) ||
        item.autor?.toLowerCase().includes(q) ||
        item.categoria?.toLowerCase().includes(q)

      return matchCat && matchSearch
    })
  }, [news, selectedCategory, searchQuery])

  // Noticia destacada (la marcada como destacada === true, o la primera de la lista si no hay filtro activo)
  const featuredPost = useMemo(() => {
    if (selectedCategory !== 'Todas' || searchQuery.trim() !== '') return null
    const explicitlyFeatured = news.find((n) => n.destacada)
    return explicitlyFeatured || (news.length > 0 ? news[0] : null)
  }, [news, selectedCategory, searchQuery])

  // Lista secundaria (excluye la destacada si se muestra en portada principal)
  const secondaryNews = useMemo(() => {
    if (featuredPost) {
      return filteredNews.filter((n) => n.id !== featuredPost.id)
    }
    return filteredNews
  }, [filteredNews, featuredPost])

  function handleShareWhatsApp(item) {
    const text = `🎾 *${item.titulo}* - Noticia del circuito ATAP:\n${item.resumen}\n\nMás información en: ${window.location.href}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  function handleCopyShareLink(item) {
    const link = `${window.location.origin}/comunidad?noticia=${item.id}`
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2500)
    })
  }

  return (
    <div className="community-page">
      {/* HERO BANNER SECTION */}
      <section className="community-hero-section">
        <div className="community-hero-container">
          <span className="community-eyebrow">
            <Sparkles size={14} /> MÁS QUE TENIS • PASIÓN Y DEPORTE
          </span>
          <h1 className="community-title">Comunidad & Noticias ATAP</h1>
          <p className="community-subtitle">
            Entérate de las últimas crónicas del circuito amateur, comunicados oficiales de la comisión,
            galería de campeones, consejos de entrenamiento y la vida tenística del Perú.
          </p>

          {/* BUSCADOR DE NOTICIAS */}
          <div className="community-search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar noticias, torneos, entrevistas o comunicados..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER CHIPS */}
      <section className="community-filters-section">
        <div className="community-container">
          <div className="category-chips-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'Todas' && '✨ '}
                {cat === 'Torneos' && '🏆 '}
                {cat === 'Comunicado' && '📢 '}
                {cat === 'Tips de Juego' && '🎾 '}
                {cat === 'Entrevistas' && '🎙️ '}
                {cat === 'Comunidad' && '🤝 '}
                {cat === 'Ranking' && '📊 '}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="community-container community-content-wrap">
        {/* NOTICIA DESTACADA (HERO SPOTLIGHT CARD) */}
        {featuredPost && (
          <section className="featured-news-spotlight">
            <div className={`spotlight-card ${featuredPost.tipo === 'texto' ? 'is-text-spotlight' : ''}`}>
              {featuredPost.tipo === 'imagen' && featuredPost.imagen ? (
                <div className="spotlight-media-wrap">
                  <img
                    src={getAssetUrl(featuredPost.imagen)}
                    alt={featuredPost.titulo}
                    onError={(e) => handleImageFallback(e, '/assets/hero1.png')}
                  />
                  <span className="spotlight-badge-overlay">
                    ⭐ NOTICIA DESTACADA
                  </span>
                </div>
              ) : (
                <div className="spotlight-text-banner">
                  <div className="text-banner-content">
                    <FileText size={38} className="banner-icon" />
                    <span className="banner-official-tag">COMUNICADO OFICIAL DESTACADO</span>
                    <small>CIRCUITO AMATEUR ATAP</small>
                  </div>
                </div>
              )}

              <div className="spotlight-content">
                <div className="spotlight-meta-tags">
                  <span className="spotlight-cat-tag">{featuredPost.categoria}</span>
                  <span className="spotlight-format-tag">
                    {featuredPost.tipo === 'imagen' ? '🖼️ Con Fotografía' : '📝 Comunicado Oficial'}
                  </span>
                </div>

                <h2 className="spotlight-title">{featuredPost.titulo}</h2>
                <p className="spotlight-excerpt">{featuredPost.resumen}</p>

                <div className="spotlight-footer">
                  <div className="spotlight-author-date">
                    <span>
                      <Calendar size={14} /> {featuredPost.fecha}
                    </span>
                    <span>
                      <User size={14} /> {featuredPost.autor}
                    </span>
                  </div>

                  <div className="spotlight-actions">
                    <button
                      type="button"
                      className="btn-share-icon"
                      title="Compartir por WhatsApp"
                      onClick={() => handleShareWhatsApp(featuredPost)}
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-read-spotlight"
                      onClick={() => setReadingArticle(featuredPost)}
                    >
                      Leer Nota Completa <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FEED DE NOTICIAS SECUNDARIAS */}
        <section className="community-news-feed">
          <div className="feed-header-row">
            <h3>
              {selectedCategory === 'Todas' ? 'Últimas Novedades y Avisos' : `Publicaciones en ${selectedCategory}`}
              <span className="feed-count-tag">{filteredNews.length}</span>
            </h3>
          </div>

          {secondaryNews.length > 0 ? (
            <div className="community-news-grid">
              {secondaryNews.map((item) => (
                <article
                  key={item.id}
                  className={`community-news-card ${item.tipo === 'texto' ? 'card-text-only' : 'card-with-image'}`}
                  onClick={() => setReadingArticle(item)}
                >
                  {/* CARD CON IMAGEN */}
                  {item.tipo === 'imagen' && item.imagen ? (
                    <div className="card-cover-wrapper">
                      <img
                        src={getAssetUrl(item.imagen)}
                        alt={item.titulo}
                        loading="lazy"
                        onError={(e) => handleImageFallback(e, '/assets/hero1.png')}
                      />
                      <span className="card-cat-badge">{item.categoria}</span>
                      {item.destacada && <span className="card-star-badge">⭐ Destacada</span>}
                    </div>
                  ) : (
                    /* CARD SOLO TEXTO (DISEÑO EDITORIAL MEMBRETADO) */
                    <div className="card-text-header-box">
                      <div className="text-header-top">
                        <span className="editorial-seal">ATAP OFICIAL</span>
                        <span className="card-cat-badge">{item.categoria}</span>
                      </div>
                      <FileText size={28} className="editorial-icon" />
                      <span className="editorial-label">COMUNICADO • SOLO TEXTO</span>
                    </div>
                  )}

                  <div className="card-body">
                    <div className="card-date-author">
                      <span><Calendar size={13} /> {item.fecha}</span>
                      <span><User size={13} /> {item.autor}</span>
                    </div>

                    <h3 className="card-title">{item.titulo}</h3>
                    <p className="card-summary">{item.resumen}</p>

                    <div className="card-footer">
                      <span className="read-more-link">
                        Leer publicación <ArrowRight size={13} />
                      </span>
                      <button
                        type="button"
                        className="btn-card-share"
                        title="Compartir en WhatsApp"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShareWhatsApp(item)
                        }}
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="community-empty-state">
              <Newspaper size={48} className="empty-icon" />
              <h4>No se encontraron publicaciones</h4>
              <p>
                {searchQuery
                  ? `No hay resultados que coincidan con "${searchQuery}". Intenta con otros términos.`
                  : 'Aún no hay publicaciones en esta categoría. Vuelve pronto para nuevas novedades.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('Todas')
                  }}
                >
                  Ver todas las noticias
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* MODAL LECTOR DE ARTÍCULO COMPLETO */}
      {readingArticle && (
        <div
          className="article-modal-backdrop"
          onMouseDown={handleBackdropMouseDown}
          onClick={(e) => handleBackdropClose(e, () => setReadingArticle(null))}
        >
          <div
            className="article-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="btn-article-close"
              onClick={() => setReadingArticle(null)}
              aria-label="Cerrar artículo"
            >
              <X size={20} />
            </button>

            {/* CABECERA EDITORIAL */}
            <div className="article-modal-header">
              <div className="article-category-row">
                <span className="article-cat-pill">{readingArticle.categoria}</span>
                <span className="article-format-pill">
                  {readingArticle.tipo === 'imagen' ? '🖼️ Publicación Ilustrada' : '📝 Comunicado Oficial'}
                </span>
                {readingArticle.destacada && (
                  <span className="article-featured-pill">⭐ Destacada</span>
                )}
              </div>

              <h1 className="article-modal-title">{readingArticle.titulo}</h1>

              <div className="article-meta-row">
                <div className="article-meta-item">
                  <User size={15} />
                  <span>Por <strong>{readingArticle.autor}</strong></span>
                </div>
                <div className="article-meta-item">
                  <Calendar size={15} />
                  <span>{readingArticle.fecha}</span>
                </div>
              </div>
            </div>

            {/* IMAGEN PRINCIPAL EN MODAL (SI TIENE) */}
            {readingArticle.tipo === 'imagen' && readingArticle.imagen && (
              <div className="article-modal-media">
                <img
                  src={getAssetUrl(readingArticle.imagen)}
                  alt={readingArticle.titulo}
                  onError={(e) => handleImageFallback(e, '/assets/hero1.png')}
                />
              </div>
            )}

            {/* BAJADA / RESUMEN */}
            <div className="article-lead-paragraph">
              {readingArticle.resumen}
            </div>

            {/* CUERPO COMPLETO DEL ARTÍCULO */}
            <div className="article-body-content">
              {readingArticle.contenido.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* FOOTER Y BOTONES DE COMPARTIR */}
            <div className="article-modal-footer">
              <div className="share-actions-group">
                <button
                  type="button"
                  className="btn-share-whatsapp-full"
                  onClick={() => handleShareWhatsApp(readingArticle)}
                >
                  <Share2 size={16} /> Compartir por WhatsApp
                </button>

                <button
                  type="button"
                  className="btn-copy-link-full"
                  onClick={() => handleCopyShareLink(readingArticle)}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 size={16} color="#00CFA0" /> ¡Enlace copiado!
                    </>
                  ) : (
                    <>🔗 Copiar Enlace</>
                  )}
                </button>
              </div>

              <button
                type="button"
                className="btn-close-article-bottom"
                onClick={() => setReadingArticle(null)}
              >
                Cerrar lectura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
