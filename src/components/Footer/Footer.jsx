import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a className="brand" href="#inicio">
          <img className="brand-logo" src="/assets/logo.png" alt="" />
          <span>
            <strong>ASOCIACIÓN DE</strong>
            <strong>TENISTAS AMATEUR</strong>
            <strong>DEL PERÚ</strong>
          </span>
        </a>
        <p>Impulsamos el tenis peruano y formamos jugadores preparados para competir.</p>
      </div>
      <div>
        <h3>Enlaces rápidos</h3>
        <a href="#inicio">Inicio</a>
        <a href="#torneos">Torneos</a>
        <a href="#jugadores">Jugadores</a>
        <a href="#ranking">Ranking</a>
      </div>
      <div>
        <h3>Información</h3>
        <a href="#nosotros">Sobre nosotros</a>
        <a href="#reglamento">Reglamento</a>
        <a href="#contacto">Contacto</a>
        <a href="#prensa">Prensa</a>
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