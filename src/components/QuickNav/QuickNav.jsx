import './QuickNav.css'

const quickLinks = [
  { icon: 'fi fi-rs-sun', label: 'Summer Cup', detail: 'Competencia abierta', color: 'yellow' },
  { icon: 'fi fi-rs-leaf', label: 'Open Series', detail: 'Circuito nacional', color: 'red' },
  { icon: 'fi fi-rs-snowflake', label: 'Winter Series', detail: 'Temporada de invierno', color: 'blue' },
  { icon: 'fi fi-rs-leafy-green', label: 'Copa Verde', detail: 'Torneo por equipos', color: 'green' },
  { icon: 'fi fi-rs-diamond', label: 'Masters', detail: 'Categoría premium', color: 'sand' },
  { icon: 'battle', label: 'Battle Series', detail: 'Desafío competitivo', color: 'navy' },
]

export default function QuickNav() {
  return (
    <section className="quick-nav" aria-label="Accesos rápidos">
      {quickLinks.map(({ icon, label, color }) => (
        <a href={`#${label.toLowerCase().replaceAll(' ', '-')}`} className={`quick-item quick-item-${color}`} aria-label={label} title={label} key={label}>
          {icon === 'battle' ? <span className="battle-icon" aria-hidden="true">BATTLE<br /><strong>SERIES</strong></span> : <i className={`event-icon ${icon}`} aria-hidden="true" />}
        </a>
      ))}
    </section>
  );
}