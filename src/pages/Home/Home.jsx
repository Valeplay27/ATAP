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
						href="https://www.instagram.com/atap_tenisperu/"
						target="_blank"
						rel="noopener noreferrer"
						className="social-btn"
						aria-label="Instagram ATAP"
					>
						<span className="social-btn-icon">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
							</svg>
						</span>
						<span className="social-btn-label">Instagram</span>
					</a>
					<a
						href="https://wa.me/51977884423"
						target="_blank"
						rel="noopener noreferrer"
						className="social-btn"
						aria-label="WhatsApp ATAP"
					>
						<span className="social-btn-icon">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
							</svg>
						</span>
						<span className="social-btn-label">WhatsApp</span>
					</a>
				</div>
			</div>
			<div className="social-artwork">
				<img
					src="/assets/redes.png"
					alt="ATAP en Redes Sociales"
					className="social-artwork-img"
					onError={(e) => {
						if (!e.target.dataset.tried) {
							e.target.dataset.tried = 'true';
							e.target.src = '/assets/Redes.png';
						}
					}}
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