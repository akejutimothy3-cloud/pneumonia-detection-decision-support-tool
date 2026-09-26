import './LandingPage.css'

export default function Header({ onHome }) {
  return (
    <header className="hero-nav" style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="nav-links">
        <a href="#" onClick={(e) => { e.preventDefault(); onHome(); }}>HOME</a>
        <a href="#">EXPLORE</a>
        <a href="#">FEATURES</a>
        <a href="#">RESEARCH</a>
        <a href="#">RESOURCES</a>
      </div>
    </header>
  )
}
