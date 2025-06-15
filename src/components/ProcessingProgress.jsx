import { useEffect, useState } from 'react'
import './ProcessingProgress.css'

const ProcessingProgress = ({ 
  progress = 0, 
  step = '', 
  isVisible = false 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [progress])

  if (!isVisible) return null

  return (
    <div className="processing-progress">
      <div className="progress-container">        <div className="progress-header">
          <h3>🔄 Memproses Video</h3>
          <p>{step || 'Memproses video Anda...'}</p>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(displayProgress)}%</span>
        </div>
          <div className="processing-info">
          <div className="processing-step">
            {progress < 20 && "🎬 Menganalisis video..."}
            {progress >= 20 && progress < 40 && "🎯 Mendeteksi area watermark..."}
            {progress >= 40 && progress < 60 && "🔬 Menerapkan penghapusan ASLI..."}
            {progress >= 60 && progress < 80 && "🎨 Merekonstruksi konten..."}
            {progress >= 80 && progress < 100 && "📹 Menyelesaikan video..."}
            {progress >= 100 && "✅ Proses selesai!"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingProgress
