import { ArrowRight, ChevronDown } from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import QuickNav from '../../components/QuickNav/QuickNav'
import RankingCard from '../../components/RankingCard/RankingCard'
import { rankingPlayers } from '../../data/ranking'
import './Home.css'

function SignupPanel() {
	return (
		<article className="signup-panel information-panel panel">
			<img
				className="event-image"
				src="/assets/Evento.png"
				alt="Cancha de tenis preparada para un evento"
			/>
			<div className="event-copy">
				<p>Regístrate ahora</p>
				<h2>
					Inscripciones abiertas
					<br />
					<em>torneos de tenis</em>
				</h2>
				<span>
					Participa en nuestros torneos y demuestra
					<br className="desktop-break" /> tu talento en la cancha.
				</span>
			</div>
			<a href="#registro" className="button button-lime event-register-button">
				Registrarse <ArrowRight size={15} />
			</a>
		</article>
	)
}

function SocialPanel() {
	return (
		<article className="social-panel panel">
			<div className="social-copy">
				<p className="eyebrow">Síguenos en redes</p>
				<h2>Todo el tenis, en un solo lugar.</h2>
				<div className="social-icons">
					<a href="#facebook" aria-label="Facebook">
						<i className="fi fi-brands-facebook" />
						<span>Facebook ATAP</span>
					</a>
					<a href="#twitter" aria-label="Twitter">
						<i className="fi fi-brands-twitter" />
						<span>Twitter ATAP</span>
					</a>
					<a href="#instagram" aria-label="Instagram">
						<i className="fi fi-brands-instagram" />
						<span>Instagram ATAP</span>
					</a>
					<a href="#youtube" aria-label="Youtube">
						<i className="fi fi-brands-youtube" />
						<span>YouTube ATAP</span>
					</a>
				</div>
			</div>
			<div className="phone">
				<div className="phone-screen">
					<img src="/assets/logo.png" alt="ATAP" />
					<span>TORNEOS</span>
				</div>
			</div>
		</article>
	)
}

function RankingSection() {
	return (
		<section className="tournaments ranking-section panel" id="ranking">
			<div className="ranking-heading">
				<p>Jugadores destacados</p>
				<h2>Promesas ATAP</h2>
			</div>
			<div className="tournament-list">
				{rankingPlayers.map((player) => (
					<RankingCard player={player} key={player.position} />
				))}
			</div>
		</section>
	)
}

function InformationSection() {
	const rules = [
		'Reglas de torneos singles y dobles',
		'Categorías y modalidades',
		'Sistema de puntuación',
		'Código de conducta',
		'Fechas y horarios',
	]

	return (
		<section className="information-grid">
			<article className="faq-card panel">
				<img src="/assets/logo.png" alt="Asociación de Tenistas Amateur del Perú" />
				<h2>
					Preguntas
					<br />
					frecuentes
				</h2>
				<p>¿No se resolvió tu duda?</p>
				<a href="#contacto" className="whatsapp-button">
					Escríbenos <ArrowRight size={12} />
				</a>
			</article>
			<article className="rules-card panel">
				<p className="eyebrow">Información para jugadores</p>
				<h2>Reglas de torneos</h2>
				<div className="rules-list">
					{rules.map((rule) => (
						<a href="#reglamento" key={rule}>
							{rule}
							<ChevronDown size={14} />
						</a>
					))}
				</div>
			</article>
		</section>
	)
}

function SponsorsSection() {
	return (
		<section className="sponsors-card panel">
			<p className="sponsor-kicker">Main sponsor</p>
			<img className="platino-logo" src="/assets/Logo%20Platino.png" alt="Platino Perú" />
			<p className="sponsor-kicker">Partners and suppliers</p>
			<div className="sponsor-list">
				<strong>◈ GemLab</strong>
				<strong>TENNIS MERITS</strong>
				<strong>PUERTO NORTE</strong>
				<strong>◉ BORDIANI</strong>
				<strong>noi</strong>
				<strong>UP BEAST</strong>
				<strong>HEAD</strong>
			</div>
		</section>
	)
}

export default function Home() {
	return (
		<main>
			<Hero />
			<div className="page-shell">
				<QuickNav />
				<div className="content-grid">
					<div className="left-column">
						<SignupPanel />
						<SocialPanel />
					</div>
					<RankingSection />
					<InformationSection />
					<SponsorsSection />
				</div>
			</div>
		</main>
	)
}