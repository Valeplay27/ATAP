import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import './ScrollToTopButton.css'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      // Mostrar cuando el usuario haya bajado más de 260px
      if (window.scrollY > 260) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      className="global-scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <ArrowUp size={22} strokeWidth={2.6} />
    </button>
  )
}
