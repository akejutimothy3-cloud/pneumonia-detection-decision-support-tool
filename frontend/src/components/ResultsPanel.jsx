export default function ResultsPanel({ result, isAnalyzing, error }) {
  if (isAnalyzing) {
    return (
      <div className="card" id="results-section">
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h2>Analysis Results</h2>
        </div>
        <div className="card-body">
          <div className="analyzing-overlay">
            <div className="spinner"></div>
            <p className="analyzing-text">Analyzing X-Ray...</p>
            <p className="analyzing-subtext">Processing through VGG19 neural network</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="card" id="results-section">
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h2>Analysis Results</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="error-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p>{error}</p>
            </div>
          )}
          <div className="results-empty">
            <div className="results-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>System Ready</h3>
            <p>Awaiting clinical data for neural analysis</p>
          </div>
        </div>
      </div>
    )
  }

  const { prediction = {}, metadata = {}, disclaimer = "" } = result
  const classification = prediction.classification || "UNKNOWN"
  const isNormal = classification === 'NORMAL'
  const confidencePercent = prediction.confidence ? (prediction.confidence * 100).toFixed(1) : "0.0"
  const severity = prediction.severity || "N/A"
  const patientType = prediction.patient_type || "Unknown"

  const getConfidenceLevel = (val) => {
    if (val >= 0.9) return 'high'
    if (val >= 0.7) return 'medium'
    return 'low'
  }

  return (
    <div className="card" id="results-section">
      <div className="card-header">
        <div className="card-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h2>Analysis Results</h2>
      </div>

      <div className="card-body">
        <div className={`result-classification ${isNormal ? 'normal' : 'pneumonia'}`}>
          <div className="result-icon">
            {isNormal ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div>
            <div className="result-label">Classification</div>
            <div className="result-value">{classification}</div>
          </div>
        </div>

        <div className="confidence-section">
          <div className="confidence-header">
            <span className="confidence-label">Model Confidence</span>
            <span className="confidence-value">{confidencePercent}%</span>
          </div>
          <div className="confidence-bar-track">
            <div
              className={`confidence-bar-fill ${getConfidenceLevel(prediction.confidence)}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-item-label">Model</div>
            <div className="meta-item-value">{metadata.model}</div>
          </div>
          <div className="meta-item">
            <div className="meta-item-label">Input Size</div>
            <div className="meta-item-value">{metadata.image_size}</div>
          </div>
          <div className="meta-item">
            <div className="meta-item-label">Patient Category</div>
            <div className="meta-item-value">{patientType}</div>
          </div>
          <div className="meta-item">
            <div className="meta-item-label">Severity</div>
            <div className={`meta-item-value ${severity.toLowerCase().replace('/', '-')}`}>
              {severity}
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-item-label">Threshold</div>
            <div className="meta-item-value">{prediction.threshold || "0.5"}</div>
          </div>
          <div className="meta-item">
            <div className="meta-item-label">Timestamp</div>
            <div className="meta-item-value" style={{ fontSize: '0.72rem' }}>
              {metadata.timestamp ? new Date(metadata.timestamp).toLocaleTimeString() : "--:--"}
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <div className="disclaimer-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Clinical Disclaimer
          </div>
          <p>{disclaimer}</p>
        </div>
      </div>
    </div>
  )
}
