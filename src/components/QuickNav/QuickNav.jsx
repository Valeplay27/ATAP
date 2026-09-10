import { CalendarDays, CircleUserRound, Trophy, Users } from 'lucide-react'
import './QuickNav.css'

const quickLinks = [
  { icon: Trophy, label: 'Torneos', detail: 'Nacionales e internacionales' }, { icon: Users, label: 'Jugadores', detail: 'Ranking y estadísticas' },
  { icon: CalendarDays, label: 'Comunidad', detail: 'Conecta y comparte' }, { icon: CircleUserRound, label: 'Escuela de tenis', detail: 'Formación y desarrollo' },
  { icon: CalendarDays, label: 'Noticias', detail: 'Lo último del mundo tenístico' }, { icon: Trophy, label: 'Tienda', detail: 'Accesorios y equipamiento' },
]

export default function QuickNav() { return <section className="quick-nav" aria-label="Accesos rápidos">{quickLinks.map(({ icon: Icon, label, detail }) => <a href={`#${label.toLowerCase().replaceAll(' ', '-')}`} className="quick-item" key={label}><Icon size={22} strokeWidth={1.7} /><span><strong>{label}</strong><small>{detail}</small></span></a>)}</section> }