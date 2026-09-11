import './SimplePage.css'

export default function SimplePage({ eyebrow, title, description, children }) {
  return (
    <main className="page-content simple-page">
      <section className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      {children || (
        <section className="page-placeholder">
          <p>Esta sección se encuentra en construcción.</p>
        </section>
      )}
    </main>
  )
}
