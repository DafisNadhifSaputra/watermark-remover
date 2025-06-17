import { useState, useCallback, useEffect } from 'react'
import SmoothVideoPlayer from './SmoothVideoPlayer'
import ProcessingProgress from './ProcessingProgress'
import './VideoProcessor.css'

const VideoProcessor = () => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('')
  const [selections, setSelections] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResult, setProcessedResult] = useState(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState('')
  const [error, setError] = useState('')

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (uploadedVideoUrl && uploadedVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedVideoUrl)
      }
      if (processedResult?.processedFile?.path && processedResult.processedFile.path.startsWith('blob:')) {
        URL.revokeObjectURL(processedResult.processedFile.path)
      }
    }
  }, [uploadedVideoUrl, processedResult])

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Silakan pilih file video yang valid')
      return
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Silakan pilih video kurang dari 50MB')
      return
    }

    setError('')
    setUploadedFile(file)
    setUploadedVideoUrl(URL.createObjectURL(file))
    setSelections([])
    setProcessedResult(null)
  }, [])

  // Handle selection changes
  const handleSelectionChange = useCallback((newSelections) => {
    setSelections(newSelections)
  }, [])
  // Process video with client-side FFmpeg WASM  // Process video with server-side FFmpeg
  const processVideo = useCallback(async () => {
    if (!uploadedFile || selections.length === 0) {
      setError('Silakan upload video dan pilih minimal satu area watermark')
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStep('Mempersiapkan video untuk diproses...')
    setError('')

    try {
      const formData = new FormData()
      formData.append('video', uploadedFile)
      formData.append('selections', JSON.stringify(selections))

      setProcessingStep('Mengirim video ke server...')
      setProcessingProgress(20)

      console.log('� Sending video to server for FFmpeg processing...')
      const response = await fetch('/api/process-video-manual', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Server error')
      }

      setProcessingStep('Memproses video dengan FFmpeg Native...')
      setProcessingProgress(80)

      const result = await response.json()
      
      setProcessingStep('Selesai!')
      setProcessingProgress(100)

      // Create blob URL for download
      const videoBlob = new Blob([
        Uint8Array.from(atob(result.processedFile.data), c => c.charCodeAt(0))
      ], { type: result.processedFile.mimeType })
      
      const blobUrl = URL.createObjectURL(videoBlob)
      
      setProcessedResult({
        ...result,
        processedFile: {
          ...result.processedFile,
          path: blobUrl
        }
      })

      console.log('✅ Video berhasil diproses dengan server FFmpeg:', result.message)

    } catch (error) {
      console.error('Processing error:', error)
      setError(error.message || 'Terjadi kesalahan saat memproses video')
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProcessingProgress(0)
        setProcessingStep('')
      }, 2000)
    }
  }, [uploadedFile, selections])

  // Reset everything
  const resetAll = useCallback(() => {
    setUploadedFile(null)
    setUploadedVideoUrl('')
    setSelections([])
    setProcessedResult(null)
    setError('')
    setIsProcessing(false)
    setProcessingProgress(0)
    setProcessingStep('')
  }, [])

  return (
    <div className="video-processor">
      {/* Header */}
      <div className="processor-header">
        <h2>🎯 Penghapus Watermark Manual</h2>
        <p>Upload video Anda dan pilih area watermark yang ingin dihapus</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Upload Section */}
      {!uploadedVideoUrl && (
        <div className="upload-section">
          <div className="upload-area">
            <div className="upload-icon">📹</div>
            <h3>Upload Video</h3>
            <p>Pilih file video untuk mulai menghapus watermark</p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="file-input"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="upload-button">
              Pilih File Video
            </label>
            <div className="upload-info">
              <span>Maksimal: 50MB</span>
              <span>Format: MP4, AVI, MOV, WebM</span>
            </div>
          </div>
        </div>
      )}

      {/* Video Editor Section */}      {uploadedVideoUrl && !processedResult && (
        <div className="editor-section">
          <div className="editor-header">
            <h3>Pilih Area Watermark</h3>
            <p>Klik dan drag pada video untuk memilih area dimana watermark berada</p>
            <button onClick={resetAll} className="reset-button">
              🔄 Upload Video Baru
            </button>
          </div>

          <SmoothVideoPlayer
            videoUrl={uploadedVideoUrl}
            selections={selections}
            onSelectionChange={handleSelectionChange}
          />

          <div className="editor-actions">
            <div className="selection-summary">
              <span className="selection-count">
                {selections.length} area watermark terpilih
              </span>
              {selections.length > 0 && (
                <button 
                  onClick={() => setSelections([])} 
                  className="clear-selections"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <button
              onClick={processVideo}
              disabled={selections.length === 0 || isProcessing}
              className="process-button"
            >
              {isProcessing ? 'Memproses...' : '🚀 Hapus Watermark'}
            </button>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress
          progress={processingProgress}
          step={processingStep}
          isVisible={isProcessing}
        />
      )}      {/* Results Section */}
      {processedResult && (
        <div className="results-section">
          <div className="results-header">
            <h3>✅ Proses Selesai!</h3>
            <p>{processedResult.message}</p>
          </div>

          <div className="results-content">
            <div className="processing-info">
              <div className="info-item">
                <span className="info-label">Metode:</span>
                <span className="info-value">{processedResult.method || 'Seleksi Manual'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Area Diproses:</span>
                <span className="info-value">{processedResult.areasProcessed}</span>
              </div>
              {processedResult.processingInfo && (
                <>
                  <div className="info-item">
                    <span className="info-label">Teknik:</span>
                    <span className="info-value">{processedResult.processingInfo.technique}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Kualitas:</span>
                    <span className="info-value">{processedResult.processingInfo.quality}</span>
                  </div>
                </>
              )}
              {processedResult.autoCleanup && (
                <div className="info-item auto-cleanup-info">
                  <span className="info-label">🗑️ Auto-Cleanup:</span>
                  <span className="info-value">{processedResult.autoCleanup.deleteAfter}</span>
                </div>
              )}
            </div>            {/* Auto-cleanup notice */}
            {processedResult.autoCleanup && (
              <div className="cleanup-notice">
                <div className="notice-icon">⏰</div>
                <div className="notice-content">
                  <h4>File Sementara</h4>
                  <p>{processedResult.autoCleanup.message}</p>
                  <small>Download video Anda sekarang untuk menyimpannya secara permanen!</small>
                </div>
              </div>
            )}<div className="download-section">
              <a
                href={processedResult.processedFile.path}
                download={processedResult.processedFile.filename}
                className="download-button"
              >
                📥 Download Video
              </a>
              
              <button onClick={resetAll} className="new-video-button">
                🎬 Proses Video Lain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoProcessor
