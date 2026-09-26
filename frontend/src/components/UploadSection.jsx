export default function UploadSection({
  imagePreview,
  selectedImage,
  isAnalyzing,
  onImageSelect,
  onAnalyze,
  onReset,
}) {
  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onImageSelect(file)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="card" id="upload-section">
      <div className="card-header">
        <div className="card-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h2>Upload X-Ray Image</h2>
      </div>

      <div className="card-body">
        {!imagePreview ? (
          <label
            className="upload-zone"
            id="upload-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            htmlFor="file-input"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="file-input"
              style={{ display: 'none' }}
            />
            <div className="upload-zone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>Drop Clinical Scan</h3>
            <p>Support for JPG, PNG and DICOM formats</p>
            <div className="upload-browse-btn">
              Browse Local Files
            </div>
          </label>
        ) : (
          <>
            <div className="preview-container">
              <img
                src={imagePreview}
                alt="Chest X-Ray Preview"
                className="preview-image"
                id="preview-image"
              />
              <div className="preview-info">
                <span className="preview-filename">{selectedImage?.name}</span>
                <span className="preview-size">
                  {selectedImage && formatFileSize(selectedImage.size)}
                </span>
              </div>
            </div>

            <div className="preview-actions">
              <button
                className="btn btn-primary"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                id="analyze-btn"
              >
                {isAnalyzing ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginBottom: 0 }}></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Analyze X-Ray
                  </>
                )}
              </button>

              <button
                className="btn btn-secondary"
                onClick={onReset}
                disabled={isAnalyzing}
                id="reset-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
                  }
