import { ArrowRight } from 'lucide-react'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-image">
        <img src="/assets/hero1.png" alt="Torneo de tenis" />
      </div>

      <div className="hero-copy">
        <p className="eyebrow">Vive la pasión del tenis</p>
        <h1>
          Grandes torneos,
          <br />
          <em>grandes historias</em>
        </h1>
        <p className="hero-text">
          Sé parte de la comunidad de tenis más grande del Perú. Compite,
          mejora tu ranking y vive la emoción de cada torneo.
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

      <div className="hero-dots" aria-hidden="true">
        <span className="selected" />
        <span />
        <span />
        <span />
      </div>
    </section>
  )
}
