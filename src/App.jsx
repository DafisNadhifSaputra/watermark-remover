import './App.css'
import VideoProcessor from './components/VideoProcessor'

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎯 Penghapus Watermark Video</h1>
          <p className="app-subtitle">Alat Profesional Penghapus Watermark Manual</p>
          <div className="features">
            <span className="feature-item">✨ Rekonstruksi Konten ASLI</span>
            <span className="feature-item">🎨 Seleksi Manual</span>
            <span className="feature-item">🚀 Kualitas Tinggi</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <VideoProcessor />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Teknologi Canggih Penghapus Watermark</p>
        <div className="tech-stack">
          <span>OpenCV Inpainting</span>
          <span>FFmpeg Processing</span>
          <span>React Frontend</span>
        </div>
        <div className="creator-credit">
          <p>Dibuat oleh <strong>Dafis Nadhif Saputra</strong></p>        </div>
      </footer>
    </div>
  )
}

export default App
