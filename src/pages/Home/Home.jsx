import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import QuickNav from '../../components/QuickNav/QuickNav'
import RankingCard from '../../components/RankingCard/RankingCard'
import {
	getRanking,
	getSiteImages,
	getSponsors,
	getHomeBanners,
	getPoliciesAndRules,
	getAssetUrl,
	handleImageFallback
} from '../../services/atapStorage'
import './Home.css'

function SignupPanel({ onOpenRegister, bannerData }) {
	const data = bannerData || {}
	const kicker = data.kicker || 'Regístrate ahora'
	const title = data.title || 'Inscripciones abiertas'
	const highlight = data.highlight !== undefined ? data.highlight : 'torneos de tenis'
	const desc = data.description || 'Participa en nuestros torneos y demuestra tu talento en la cancha.'
	const btnText = data.buttonText || 'Registrarse'
	const bgImg = data.image || '/assets/Evento.png'

	const handleBtnClick = (e) => {
		if (data.buttonAction === 'link' && data.buttonLink && data.buttonLink !== '#registro') {
			return
		}
		if (onOpenRegister) {
			e.preventDefault()
			onOpenRegister()
		}
	}

	return (
		<article className="signup-panel information-panel panel">
			<img
				className="event-image"
				src={getAssetUrl(bgImg)}
				alt={title}
				onError={(e) => handleImageFallback(e, '/assets/Evento.png')}
			/>
			<div className="event-overlay" />
			<div className="event-copy">
				<p className="event-kicker">{kicker}</p>
				<h2>
					{title}
					{highlight && (
						<>
							<br />
							<em>{highlight}</em>
						</>
					)}
				</h2>
				<span className="event-desc">
					{desc}
				</span>
				{onOpenRegister && (!data.buttonAction || data.buttonAction === 'register') ? (
					<button
						type="button"
						className="button button-lime event-register-button"
						onClick={onOpenRegister}
					>
						{btnText} <ArrowRight size={15} />
					</button>
				) : (
					<a
						href={data.buttonLink || '#registro'}
						onClick={handleBtnClick}
						className="button button-lime event-register-button"
					>
						{btnText} <ArrowRight size={15} />
					</a>
				)}
			</div>
		</article>
	)
}

function SocialPanel({ socialData }) {
	const data = socialData || {}
	const eyebrow = data.eyebrow || '// SÍGUENOS EN REDES'
	const title = data.title || 'Todo el tenis,\nen un solo lugar.'
	const desc = data.description || 'Mantente al día con los torneos, resultados, noticias y mucho más. ¡Sé parte de nuestra comunidad!'
	const instagramUrl = data.instagramUrl || 'https://www.instagram.com/atap_tenisperu/'
	const whatsappUrl = data.whatsappUrl || 'https://wa.me/51977884423'
	const artworkImg = data.image || '/assets/Redes.png'

	const cleanEyebrow = eyebrow.startsWith('//') ? eyebrow.replace(/^\/\/\s*/, '') : eyebrow

	return (
		<article className="social-panel panel">
			<div className="social-copy">
				<p className="eyebrow">
					<span className="eyebrow-accent">//</span> {cleanEyebrow}
				</p>
				<h2>
					{title.split('\n').map((line, i) => (
						<span key={i}>
							{line}
							{i < title.split('\n').length - 1 && <br />}
						</span>
					))}
				</h2>
				<p className="social-subtext">
					{desc}
				</p>
				<div className="social-icons">
					<a
						href={instagramUrl}
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
						href={whatsappUrl}
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
					src={getAssetUrl(artworkImg)}
					alt="ATAP en Redes Sociales"
					className="social-artwork-img"
					onError={(e) => handleImageFallback(e, '/assets/Redes.png')}
				/>
			</div>
		</article>
	)
}

function RankingSection({ players = [] }) {
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

const DEFAULT_RULE_TOPICS = [
	{
		id: 'singles-dobles',
		chapterId: 'reglas-torneo',
		defaultTitle: 'Reglas de torneos singles y dobles',
		badge: 'Capítulo 3',
		summary: 'Modalidad Round Robin con partidos agendados directamente entre participantes con 3 partidos garantizados.',
		highlights: [
			{ label: 'Formato', text: 'Round Robin: 3 partidos garantizados en fase de grupos con total flexibilidad de horarios.' },
			{ label: 'Definición', text: 'Mejor de 3 sets. En empate (1-1), el 3er set se define en Super Tie-Break a 10 puntos.' },
			{ label: 'Tolerancia', text: '15 minutos de espera. El no presentarse genera W.O. (6/0 - 6/0) y asumir costo de cancha.' }
		],
		linkText: 'Ver Capítulo 3: Reglas del Torneo'
	},
	{
		id: 'categorias',
		chapterId: 'categorizacion',
		defaultTitle: 'Categorías y modalidades',
		badge: 'Capítulo 2',
		summary: 'Niveles equilibrados con filtros rigurosos, ascensos automáticos y verificación de historial.',
		highlights: [
			{ label: 'Niveles', text: '5ta P (Principiante), 5ta B, 5ta A, 4ta y 3ra categoría para singles y dobles.' },
			{ label: 'Filtros ATAP', text: 'Prohibido bajar de nivel. El Comité verifica antecedentes para garantizar juego justo.' },
			{ label: 'Ascenso', text: 'Ganar torneos o clara superioridad genera ascenso inmediato a la categoría superior.' }
		],
		linkText: 'Ver Capítulo 2: Categorización de Jugador'
	},
	{
		id: 'puntuacion',
		chapterId: 'reglas-torneo',
		defaultTitle: 'Sistema de puntuación',
		badge: 'Capítulo 3',
		summary: 'Puntos oficiales sumados por cada victoria para el ranking anual de singles y dobles del Circuito ATAP.',
		highlights: [
			{ label: 'Sets', text: 'Sets oficiales a 6 games. Super Tie-Break decisivo a 10 puntos con diferencia de 2.' },
			{ label: 'Puntos ranking', text: 'Cada partido ganado y fase superada suma puntos oficiales para la tabla anual.' },
			{ label: 'Reporte', text: 'Marcadores reportados inmediatamente tras finalizar el encuentro para actualizar la tabla en vivo.' }
		],
		linkText: 'Ver Sistema de Puntuación Oficial'
	},
	{
		id: 'conducta',
		chapterId: 'reglas-complementarias',
		defaultTitle: 'Código de conducta',
		badge: 'Capítulo 5',
		summary: 'Compromiso con el Fair Play, honestidad en los fallos y respeto mutuo entre competidores.',
		highlights: [
			{ label: 'Juego limpio', text: 'Declaración de buena fe, autocantos transparentes y respeto al rival dentro y fuera de cancha.' },
			{ label: 'Puntualidad', text: 'Respeto riguroso de fechas y horarios pactados para cuidar el tiempo del rival y las canchas.' },
			{ label: 'Comité ATAP', text: 'Resoluciones inapelables en caso de reclamos, conductas antideportivas o irregularidades.' }
		],
		linkText: 'Ver Reglas Complementarias y Comité'
	},
	{
		id: 'fechas-horarios',
		chapterId: 'cambio-condiciones',
		defaultTitle: 'Fechas y horarios',
		badge: 'Capítulo 4',
		summary: 'Flexibilidad de programación semanal y condiciones ante fuerza mayor, disponibilidad o clima.',
		highlights: [
			{ label: 'Programación', text: '1 partido por semana coordinado libremente entre ambos rivales según su tiempo.' },
			{ label: 'Fase de grupos', text: '3 semanas continuas de duración. Es obligatorio disputar los partidos asignados.' },
			{ label: 'Sedes y Finales', text: 'La final es cubierta 100% por ATAP. Modificaciones por clima se informan oportunamente.' }
		],
		linkText: 'Ver Condiciones de Fechas y Clima'
	}
]

function getTopicForTitle(title, index, policies) {
	const lower = (title || '').toLowerCase()
	let match = null
	if (lower.includes('single') || lower.includes('doble') || lower.includes('torneo')) {
		match = DEFAULT_RULE_TOPICS[0]
	} else if (lower.includes('categor') || lower.includes('modalidad')) {
		match = DEFAULT_RULE_TOPICS[1]
	} else if (lower.includes('puntuaci') || lower.includes('punto') || lower.includes('score')) {
		match = DEFAULT_RULE_TOPICS[2]
	} else if (lower.includes('conducta') || lower.includes('comit') || lower.includes('comportamiento')) {
		match = DEFAULT_RULE_TOPICS[3]
	} else if (lower.includes('fecha') || lower.includes('horario') || lower.includes('programaci')) {
		match = DEFAULT_RULE_TOPICS[4]
	} else if (DEFAULT_RULE_TOPICS[index]) {
		match = DEFAULT_RULE_TOPICS[index]
	}

	if (match) {
		const policy = policies.find((p) => p.id === match.chapterId)
		return {
			...match,
			displayTitle: title || match.defaultTitle,
			summary: policy?.summary || match.summary
		}
	}

	return {
		id: `custom-${index}`,
		chapterId: 'reglas-torneo',
		displayTitle: title,
		badge: 'Reglamento',
		summary: 'Consulta la normativa y directivas oficiales de la Asociación de Tenistas Amateur del Perú.',
		highlights: [
			{ label: 'Normativa oficial', text: 'Aplicable a todos los torneos y categorías del circuito ATAP.' },
			{ label: 'Soporte', text: 'Ante cualquier consulta técnica o reglamentaria, contacta al Comité de Organización.' }
		],
		linkText: 'Ver Reglamento Oficial'
	}
}

function InformationSection({ faqData }) {
	const data = faqData || {}
	const faqTitle = data.title || 'Preguntas\nfrecuentes'
	const faqSubtitle = data.subtitle || '¿No se resolvió tu duda?'
	const btnText = data.buttonText || 'Escríbenos'
	const whatsappUrl = data.whatsappUrl || 'https://wa.me/51977884423'
	const rulesEyebrow = data.rulesEyebrow || 'Información para jugadores'
	const rulesTitle = data.rulesTitle || 'Reglas de torneos'
	const rawRulesList = data.rulesList || [
		'Reglas de torneos singles y dobles',
		'Categorías y modalidades',
		'Sistema de puntuación',
		'Código de conducta',
		'Fechas y horarios'
	]

	const [expandedRule, setExpandedRule] = useState(null)
	const [policies, setPolicies] = useState(() => getPoliciesAndRules())

	useEffect(() => {
		function handleUpdate() {
			setPolicies(getPoliciesAndRules())
		}
		window.addEventListener('atap_data_updated', handleUpdate)
		return () => window.removeEventListener('atap_data_updated', handleUpdate)
	}, [])

	const toggleRule = (topicId) => {
		setExpandedRule((prev) => (prev === topicId ? null : topicId))
	}

	return (
		<section className="information-grid">
			<article className="faq-card panel">
				<div className="faq-logo-wrap">
					<img
						src={getAssetUrl(data.logo || '/assets/logo.png')}
						alt="Asociación de Tenistas Amateur del Perú"
						className="faq-logo-img"
						onError={(e) => handleImageFallback(e, '/assets/logo.png')}
					/>
				</div>
				<div className="faq-content">
					<h2>
						{faqTitle.includes('\n') ? (
							faqTitle.split('\n').map((l, i) => (
								<span key={i}>
									{l}
									{i < faqTitle.split('\n').length - 1 && <br />}
								</span>
							))
						) : faqTitle.toLowerCase().includes('preguntas frecuentes') ? (
							<>
								Preguntas
								<br />
								frecuentes
							</>
						) : (
							faqTitle
						)}
					</h2>
					<p>{faqSubtitle}</p>
					<a
						href={whatsappUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="whatsapp-button"
					>
						{btnText} <ArrowRight size={13} />
					</a>
				</div>
			</article>
			<article className="rules-card panel">
				<p className="eyebrow">{rulesEyebrow}</p>
				<h2>{rulesTitle}</h2>
				<div className="rules-accordion">
					{rawRulesList.map((ruleTitle, index) => {
						const topic = getTopicForTitle(ruleTitle, index, policies)
						const isExpanded = expandedRule === topic.id
						return (
							<div
								key={topic.id || index}
								className={`rules-accordion-item ${isExpanded ? 'is-expanded' : ''}`}
							>
								<button
									type="button"
									className="rules-accordion-trigger"
									onClick={() => toggleRule(topic.id)}
									aria-expanded={isExpanded}
								>
									<span className="rules-trigger-title">{topic.displayTitle}</span>
									<ChevronDown
										size={16}
										className={`rules-accordion-chevron ${isExpanded ? 'is-open' : ''}`}
									/>
								</button>
								{isExpanded && (
									<div className="rules-accordion-panel">
										<p className="rules-panel-summary">{topic.summary}</p>
										<div className="rules-highlights-list">
											{topic.highlights.map((h, hIdx) => (
												<div key={hIdx} className="rules-highlight-row">
													<span className="rules-highlight-bullet">✓</span>
													<p className="rules-highlight-text">
														<strong>{h.label}:</strong> {h.text}
													</p>
												</div>
											))}
										</div>
										<div className="rules-panel-actions">
											<Link
												to={`/reglas#rule-section-${topic.chapterId}`}
												className="rules-panel-link"
											>
												<span>{topic.linkText}</span>
												<ArrowRight size={12} />
											</Link>
										</div>
									</div>
								)}
							</div>
						)
					})}
				</div>
				<div className="rules-footer">
					<Link to="/reglas" className="rules-card-footer-link">
						<span>Ver todo el Reglamento Oficial ATAP ({policies.length} Capítulos)</span>
						<ArrowRight size={13} />
					</Link>
				</div>
			</article>
		</section>
	)
}

function SponsorsSection({ platinoLogo, sponsors = [] }) {
	// Solo auspiciadores que tengan una imagen/logo cargada (sin textos de relleno si no hay imagen)
	const sponsorsWithImages = sponsors.filter((s) => s.logo && s.logo.trim() !== '')

	return (
		<section className="sponsors-card panel">
			<p className="sponsor-kicker">Main sponsor</p>
			<img
				className="platino-logo"
				src={getAssetUrl(platinoLogo || '/assets/Logo Platino.png')}
				alt="Platino Perú"
				onError={(e) => handleImageFallback(e, '/assets/Logo Platino.png')}
			/>
			{sponsorsWithImages.length > 0 && (
				<>
					<p className="sponsor-kicker">Partners and suppliers</p>
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
				</>
			)}
		</section>
	)
}

export default function Home({ onOpenRegister }) {
	const [rankingList, setRankingList] = useState(() => getRanking())
	const [siteImages, setSiteImages] = useState(() => getSiteImages())
	const [sponsorsList, setSponsorsList] = useState(() => getSponsors())
	const [homeBanners, setHomeBanners] = useState(() => getHomeBanners())

	useEffect(() => {
		function handleUpdate() {
			setRankingList(getRanking())
			setSiteImages(getSiteImages())
			setSponsorsList(getSponsors())
			setHomeBanners(getHomeBanners())
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
							bannerData={homeBanners?.signupBanner}
						/>
						<SocialPanel
							socialData={homeBanners?.socialBanner}
						/>
					</div>
					<RankingSection players={rankingList} />
					<InformationSection
						faqData={homeBanners?.faqSection}
					/>
					<SponsorsSection
						platinoLogo={siteImages.logoPlatino}
						sponsors={sponsorsList}
					/>
				</div>
			</div>
		</main>
	)
}