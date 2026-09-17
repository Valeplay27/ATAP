import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import QuickNav from '../../components/QuickNav/QuickNav'
import RankingCard from '../../components/RankingCard/RankingCard'
import { getRanking, getSiteImages, getSponsors } from '../../services/atapStorage'
import './Home.css'

function SignupPanel({ onOpenRegister, eventImage }) {
	return (
		<article className="signup-panel information-panel panel">
			<img
				className="event-image"
				src={eventImage || '/assets/Evento.png'}
				alt="Cancha de tenis preparada para un evento"
			/>
			<div className="event-overlay" />
			<div className="event-copy">
				<p className="event-kicker">Regístrate ahora</p>
				<h2>
					Inscripciones abiertas
					<br />
					<em>torneos de tenis</em>
				</h2>
				<span className="event-desc">
					Participa en nuestros torneos y demuestra
					<br className="desktop-break" /> tu talento en la cancha.
				</span>
				{onOpenRegister ? (
					<button
						type="button"
						className="button button-lime event-register-button"
						onClick={onOpenRegister}
					>
						Registrarse <ArrowRight size={15} />
					</button>
				) : (
					<a href="#registro" className="button button-lime event-register-button">
						Registrarse <ArrowRight size={15} />
					</a>
				)}
			</div>
		</article>
	)
}

function SocialPanel() {
	return (
		<article className="social-panel panel">
			<div className="social-copy">
				<p className="eyebrow">
					<span className="eyebrow-accent">//</span> SÍGUENOS EN REDES
				</p>
				<h2>
					Todo el tenis,
					<br />
					en un solo lugar.
				</h2>
				<p className="social-subtext">
					Mantente al día con los torneos, resultados, noticias y mucho más. ¡Sé parte de nuestra comunidad!
				</p>
				<div className="social-icons">
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noopener noreferrer"
						className="social-btn"
						aria-label="Facebook"
					>
						<span className="social-btn-icon">
							<i className="fi fi-brands-facebook" />
						</span>
						<span className="social-btn-label">Facebook</span>
					</a>
					<a
						href="https://twitter.com"
						target="_blank"
						rel="noopener noreferrer"
						className="social-btn"
						aria-label="Twitter / X"
					>
						<span className="social-btn-icon">
							<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</span>
						<span className="social-btn-label">Twitter / X</span>
					</a>
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
						className="social-btn"
						aria-label="Instagram"
					>
						<span className="social-btn-icon">
							<i className="fi fi-brands-instagram" />
						</span>
						<span className="social-btn-label">Instagram</span>
					</a>
					<a
						href="https://youtube.com"
						target="_blank"
						rel="noopener noreferrer"
						className="social-btn"
						aria-label="YouTube"
					>
						<span className="social-btn-icon">
							<i className="fi fi-brands-youtube" />
						</span>
						<span className="social-btn-label">YouTube</span>
					</a>
				</div>
			</div>
			<div className="social-artwork">
				<img
					src="public/assets/redes.png"
					alt="ATAP en Redes Sociales"
					className="social-artwork-img"
				/>
			</div>
		</article>
	)
}

function RankingSection({ players = [] }) {
	// En el inicio mostramos las 4 primeras promesas para un equilibrio estético perfecto con las tarjetas de la izquierda
	const featuredPlayers = players.slice(0, 4)

	return (
		<section className="tournaments ranking-section panel" id="ranking">
			<div className="ranking-heading-row">
				<div className="ranking-heading">
					<p>Jugadores destacados</p>
					<h2>Promesas ATAP</h2>
				</div>
				<span className="ranking-top-badge">Top 4</span>
			</div>
			<div className="tournament-list">
				{featuredPlayers.map((player) => (
					<RankingCard player={player} key={player.id || player.position} />
				))}
			</div>
			<div className="ranking-footer-row">
				<Link to="/ranking" className="ranking-view-all-link">
					<span>Ver ranking completo ({players.length} jugadores)</span>
					<ArrowRight size={14} />
				</Link>
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

function SponsorsSection({ platinoLogo, sponsors = [] }) {
	const sponsorsWithImages = sponsors.filter((s) => s.logo && s.logo.trim() !== '')

	return (
		<section className="sponsors-card panel">
			<p className="sponsor-kicker">Main sponsor</p>
			<img className="platino-logo" src={platinoLogo || '/assets/Logo Platino.png'} alt="Platino Perú" />
			<p className="sponsor-kicker">Partners and suppliers</p>
			{sponsorsWithImages.length > 0 ? (
				<div className="sponsor-logos-grid">
					{sponsorsWithImages.map((s, idx) => (
						<div className="sponsor-logo-item" key={s.id || idx}>
							<img
								src={s.logo}
								alt={s.name || `Auspiciador ${idx + 1}`}
								className="sponsor-logo-img"
							/>
						</div>
					))}
				</div>
			) : (
				<div className="sponsor-list">
					{sponsors.map((partner, idx) => (
						<strong key={partner.id || idx}>{partner.name || `Auspiciador ${idx + 1}`}</strong>
					))}
				</div>
			)}
		</section>
	)
}

export default function Home({ onOpenRegister }) {
	const [rankingList, setRankingList] = useState(() => getRanking())
	const [siteImages, setSiteImages] = useState(() => getSiteImages())
	const [sponsorsList, setSponsorsList] = useState(() => getSponsors())

	useEffect(() => {
		function handleUpdate() {
			setRankingList(getRanking())
			setSiteImages(getSiteImages())
			setSponsorsList(getSponsors())
		}
		window.addEventListener('atap_data_updated', handleUpdate)
		return () => window.removeEventListener('atap_data_updated', handleUpdate)
	}, [])

	return (
		<main>
			<Hero />
			<div className="page-shell">
				<QuickNav />
				<div className="content-grid">
					<div className="left-column">
						<SignupPanel
							onOpenRegister={onOpenRegister}
							eventImage={siteImages.eventoBanner}
						/>
						<SocialPanel />
					</div>
					<RankingSection players={rankingList} />
					<InformationSection />
					<SponsorsSection
						platinoLogo={siteImages.logoPlatino}
						sponsors={sponsorsList}
					/>
				</div>
			</div>
		</main>
	)
}