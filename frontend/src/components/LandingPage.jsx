import { useRef } from 'react'
import './LandingPage.css'

export default function LandingPage({ onGetStarted }) {
  const videoRef = useRef(null)

  return (
    <div className="landing">
      <div className="hero-video-container">
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="hero-video-element"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-scroll-container">
        <div className="hero-sticky">
          <nav className="hero-nav">
            <div className="nav-links">
              <a href="#">EXPLORE</a>
              <a href="#">FEATURES</a>
              <a href="#">RESEARCH</a>
              <a href="#">RESOURCES</a>
            </div>
            <button className="nav-cta" onClick={onGetStarted}>GET STARTED</button>
          </nav>

          <div className="hero-content">
            <h1>
              Detect with precision.<br />
              Analyze with intelligence.
            </h1>
            <p className="hero-body">
              <strong>Our AI-powered diagnosis adapts to your clinical workflow —</strong>{' '}
              fast, accurate, and truly yours. Every scan is personalized,
              effortless, and clinician-ready.
            </p>
            <button className="hero-cta" onClick={onGetStarted}>
              Analyze my scan now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
