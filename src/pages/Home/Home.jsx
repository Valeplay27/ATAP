import { useState } from 'react'
import { ArrowRight, CircleDot, CircleUserRound, Share2, Video } from 'lucide-react'
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'
import QuickNav from '../../components/QuickNav/QuickNav'
import TournamentCard from '../../components/TournamentCard/TournamentCard'
import Footer from '../../components/Footer/Footer'
import { tournaments } from '../../data/tournaments'
import './Home.css'

function SignupPanel() { return <article className="signup-panel panel"><div><p className="eyebrow">Regístrate ahora</p><h2>Inscripciones abiertas<br /><em>torneos de tenis</em></h2><p>Participa en nuestros torneos y demuestra tu talento en la cancha.</p><div className="chips"><span>Dobles | 30, 4ta, 3ra</span><span>Singles | 5ta, 4ta, 3ra, 2da</span></div><a href="#registro" className="button button-lime">Registrar jugador <ArrowRight size={15} /></a></div><div className="signup-photo" /></article> }
function SocialPanel() { return <article className="social-panel panel"><div><p className="eyebrow">Síguenos en redes</p><h2>Todo el tenis, en un solo lugar.</h2><div className="social-icons"><a href="#facebook" aria-label="Facebook"><CircleDot size={15} /></a><a href="#twitter" aria-label="Twitter"><Share2 size={15} /></a><a href="#instagram" aria-label="Instagram"><CircleUserRound size={15} /></a><a href="#youtube" aria-label="Youtube"><Video size={15} /></a></div></div><div className="phone"><div className="phone-screen">ATAP<br /><small>TORNEOS</small></div></div></article> }
function TournamentsSection() { return <section className="tournaments panel" id="torneos"><div className="section-heading"><h2>Próximos torneos</h2><a href="#todos">Ver todos <ArrowRight size={13} /></a></div><div className="tournament-list">{tournaments.map((tournament) => <TournamentCard tournament={tournament} key={tournament.title} />)}</div></section> }

export default function Home() { const [menuOpen, setMenuOpen] = useState(false); return <><Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><main><Hero /><div className="page-shell"><QuickNav /><div className="content-grid"><div className="left-column"><SignupPanel /><SocialPanel /></div><TournamentsSection /></div></div></main><Footer /></> }