import { ArrowRight } from 'lucide-react'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow">Vive la pasión del tenis</p>
        <h1>Grandes torneos,<br /><em>grandes historias</em></h1>
        <p className="hero-text">Sé parte de la comunidad de tenis más grande del Perú. Compite, mejora tu ranking y vive la emoción de cada torneo.</p>
        <div className="hero-actions">
          <a href="#torneos" className="button button-lime">Ver torneos <ArrowRight size={15} /></a>
          <a href="#comunidad" className="watch-link"><span className="play">▶</span> Conócenos</a>
        </div>
      </div>
      
      {/* Contenedor de la imagen */}
      <div className="hero-image">
        <img src="/assets/hero.png" alt="Torneo de tenis" />
      </div>

      <div className="hero-event">
        <span>▎</span>
        <div>
          <strong>Torneo Nacional Open</strong>
          <small>Lima, Perú</small>
          <small>12 - 18 May 2025</small>
        </div>
      </div>
      
      <div className="hero-dots">
        <span className="selected" /><span /><span /><span />
      </div>
    </section>
  );
}