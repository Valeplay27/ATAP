import { NavLink } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <NavLink className="brand" to="/">
          <img className="brand-logo" src="/assets/logo.png" alt="" />
          <span>
            <strong>ASOCIACIÓN DE</strong>
            <strong>TENISTAS AMATEUR</strong>
            <strong>DEL PERÚ</strong>
          </span>
        </NavLink>
        <p>Impulsamos el tenis peruano y formamos jugadores preparados para competir.</p>
      </div>
      <div>
        <h3>Enlaces rápidos</h3>
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/torneos">Torneos</NavLink>
        <NavLink to="/jugadores">Jugadores</NavLink>
        <NavLink to="/ranking">Ranking</NavLink>
      </div>
      <div>
        <h3>Información</h3>
        <NavLink to="/comunidad">Sobre nosotros</NavLink>
        <NavLink to="/comunidad">Reglamento</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
        <NavLink to="/comunidad">Prensa</NavLink>
      </div>
      <div>
        <h3>Contáctanos</h3>
        <p>+51 987 654 321</p>
        <p>contacto@atap.pe</p>
        <p>Lima, Perú</p>
      </div>
      <div className="copyright">
        © 2025 Asociación de Tenistas Amateur del Perú. Todos los derechos reservados.
      </div>
    </footer>
  );
}