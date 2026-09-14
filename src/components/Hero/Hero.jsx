import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getSiteImages, INITIAL_HERO_SLIDES } from '../../services/atapStorage'
import './Hero.css'

export default function Hero() {
  const [slides, setSlides] = useState(() => {
    const siteImgs = getSiteImages()
    return siteImgs.heroSlides && siteImgs.heroSlides.length > 0
      ? siteImgs.heroSlides
      : INITIAL_HERO_SLIDES
  })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => {
    function handleUpdate() {
      const siteImgs = getSiteImages()
      if (siteImgs.heroSlides && siteImgs.heroSlides.length > 0) {
        setSlides(siteImgs.heroSlides)
        setCurrentSlide((prev) => (prev >= siteImgs.heroSlides.length ? 0 : prev))
      }
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  // Auto-play timer (5s)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, slides.length])

  function handlePrev() {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  function handleNext() {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  const activeSlideData = slides[currentSlide] || slides[0]

  return (
    <section
      className="hero"
      id="inicio"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrusel de torneos destacados"
    >
      {/* SLIDER IMAGES TRACK */}
      <div className="hero-slider-wrapper">
        <div
          className="hero-slider-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div className="hero-slide-item" key={slide.id || idx}>
              <img
                src={slide.image || '/assets/hero1.png'}
                alt={slide.title || `Torneo ATAP ${idx + 1}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* GRADIENT OVERLAYS FOR HIGH CONTRAST */}
      <div className="hero-gradient-overlay" aria-hidden="true" />

      {/* HERO TEXT CONTENT */}
      <div className="hero-copy">
        <p className="eyebrow">{activeSlideData.eyebrow || 'Vive la pasión del tenis'}</p>
        <h1>
          {activeSlideData.title ? (
            activeSlideData.title.includes(',') ? (
              <>
                {activeSlideData.title.split(',')[0]},
                <br />
                <em>{activeSlideData.title.split(',').slice(1).join(',').trim()}</em>
              </>
            ) : (
              <>
                Grandes torneos,
                <br />
                <em>grandes historias</em>
              </>
            )
          ) : (
            <>
              Grandes torneos,
              <br />
              <em>grandes historias</em>
            </>
          )}
        </h1>
        <p className="hero-text">
          {activeSlideData.description ||
            'Sé parte de la comunidad de tenis más grande del Perú. Compite, mejora tu ranking y vive la emoción de cada torneo.'}
        </p>
        <div className="hero-actions">
          <a href="/torneos" className="button button-lime">
            Ver torneos <ArrowRight size={15} />
          </a>
          <a href="/comunidad" className="watch-link">
            <span className="play">▶</span>
            Conócenos
          </a>
        </div>
      </div>

      {/* SLIDER ARROWS (VISIBLE ON HOVER) */}
      {slides.length > 1 && (
        <div className="hero-nav-arrows" aria-label="Controles del carrusel">
          <button
            type="button"
            className="hero-arrow-btn prev"
            onClick={handlePrev}
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="hero-arrow-btn next"
            onClick={handleNext}
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* INTERACTIVE INDICATOR DOTS CAPSULE */}
      {slides.length > 1 && (
        <div className="hero-dots-capsule" role="tablist" aria-label="Indicadores de diapositivas">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`hero-dot-btn ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir a diapositiva ${idx + 1}`}
              aria-selected={currentSlide === idx}
              role="tab"
            />
          ))}
        </div>
      )}
    </section>
  )
}
