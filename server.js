import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import multer from 'multer'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import fs from 'fs'
import { promisify } from 'util'

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic)

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

// Enable CORS
app.use(cors())

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit for local processing
})

// API route for video processing with real FFmpeg
app.post('/api/process-video-manual', upload.single('video'), async (req, res) => {
  let inputPath = null
  let outputPath = null
  
  try {
    console.log('🎯 Memulai penghapusan watermark dengan FFmpeg Native...')
    
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file video yang diunggah' })
    }

    // Parse selections from form data
    let selections = []
    if (req.body.selections) {
      try {
        selections = JSON.parse(req.body.selections)
        console.log('🎯 Area watermark yang dipilih:', selections.length, 'area')
        selections.forEach((sel, index) => {
          console.log(`   Area ${index + 1}:`, {
            x: Math.round(sel.x), 
            y: Math.round(sel.y), 
            w: Math.round(sel.width), 
            h: Math.round(sel.height)
          })
        })
      } catch (parseError) {
        console.warn('⚠️ Gagal parse selections, menggunakan default')
        selections = []
      }
    }

    console.log('📹 File video diterima:', req.file.originalname)
    console.log('📊 Ukuran file:', req.file.size, 'bytes')
    
    // Create temporary directory
    const tempDir = path.join(__dirname, 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    // Create temporary file paths
    const timestamp = Date.now()
    const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')
    inputPath = path.join(tempDir, `input_${timestamp}_${sanitizedName}`)
    outputPath = path.join(tempDir, `output_${timestamp}_${sanitizedName}`)
    
    // Write uploaded file to temporary location
    await writeFile(inputPath, req.file.buffer)
    console.log('💾 File disimpan sementara di:', inputPath)
    
    console.log('🔄 Memproses video dengan FFmpeg untuk menghapus watermark...')
    
    // Build video filters based on user selections
    let videoFilters = []
    
    if (selections.length > 0) {
      // Use user-selected areas
      selections.forEach((selection, index) => {
        const x = Math.max(0, Math.round(selection.x))
        const y = Math.max(0, Math.round(selection.y))
        const w = Math.max(10, Math.round(selection.width))
        const h = Math.max(10, Math.round(selection.height))
        
        videoFilters.push(`delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`)
        console.log(`🎯 Filter ${index + 1}: delogo=x=${x}:y=${y}:w=${w}:h=${h}`)
      })
    } else {
      // Fallback: use common watermark positions
      videoFilters = [
        'delogo=x=10:y=10:w=150:h=40:show=0',
        'delogo=x=W-160:y=10:w=150:h=40:show=0',
        'delogo=x=10:y=H-50:w=150:h=40:show=0',
        'delogo=x=W-160:y=H-50:w=150:h=40:show=0'
      ]
      console.log('🎯 Menggunakan posisi watermark default (4 sudut)')
    }
    
    // Process video with FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters(videoFilters)
        .videoCodec('libx264')
        .audioCodec('copy')
        .format('mp4')
        .addOptions([
          '-crf 20',
          '-preset medium',
          '-avoid_negative_ts make_zero'
        ])
        .on('start', (commandLine) => {
          console.log('🎬 FFmpeg command:', commandLine)
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log('⏳ Progress: ' + Math.round(progress.percent) + '% selesai')
          }
        })
        .on('end', () => {
          console.log('✅ FFmpeg selesai memproses video')
          resolve()
        })
        .on('error', (err, stdout, stderr) => {
          console.error('❌ FFmpeg error:', err.message)
          reject(new Error(`FFmpeg processing failed: ${err.message}`))
        })
        .save(outputPath)
    })
    
    // Read processed video file
    console.log('📖 Membaca file video yang sudah diproses...')
    const processedVideoBuffer = await readFile(outputPath)
    const processedVideoBase64 = processedVideoBuffer.toString('base64')
    
    console.log('📈 Ukuran video setelah diproses:', processedVideoBuffer.length, 'bytes')
    
    // Clean up temporary files
    try {
      await unlink(inputPath)
      await unlink(outputPath)
      console.log('🧹 File sementara dibersihkan')
    } catch (cleanupError) {
      console.warn('⚠️ Peringatan pembersihan:', cleanupError.message)
    }
    
    // Return response with processed video
    const result = {
      success: true,
      message: selections.length > 0 
        ? `Video berhasil diproses - ${selections.length} area watermark telah dihapus!`
        : 'Video berhasil diproses - Watermark di 4 posisi umum telah dihapus!',
      originalFile: req.file.originalname,
      processedFile: {
        data: processedVideoBase64,
        mimeType: req.file.mimetype,
        size: processedVideoBuffer.length,
        name: `no_watermark_${req.file.originalname}`,
        filename: `no_watermark_${req.file.originalname}`
      },
      removedWatermarks: selections.length > 0
        ? selections.map((_, index) => `Area watermark ${index + 1} (dipilih user)`)
        : ['Watermark kiri atas', 'Watermark kanan atas', 'Watermark kiri bawah', 'Watermark kanan bawah'],
      areasProcessed: selections.length > 0 ? selections.length : 4,
      processingInfo: {
        technique: 'FFmpeg Native Delogo Filter (Local)',
        quality: 'High Quality (CRF 20)',
        originalSize: req.file.size,
        processedSize: processedVideoBuffer.length,
        platform: 'Local Development Server'
      },
      processingTime: 'Selesai'
    }
    
    console.log('🎉 Sukses! Video tanpa watermark siap didownload')
    res.json(result)
    
  } catch (error) {
    console.error('💥 Error fatal:', error)
    
    // Cleanup on error
    if (inputPath && fs.existsSync(inputPath)) {
      try { await unlink(inputPath) } catch (e) { /* ignore */ }
    }
    if (outputPath && fs.existsSync(outputPath)) {
      try { await unlink(outputPath) } catch (e) { /* ignore */ }
    }
    
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat memproses video',
      details: error.message 
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Local development server running with FFmpeg Native', 
    timestamp: new Date().toISOString(),
    ffmpegPath: ffmpegStatic
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`)
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/process-video-manual`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🎬 FFmpeg path: ${ffmpegStatic}`)
  console.log(`✨ Ready for real watermark removal!`)
  console.log(``)
  console.log(`📱 Open frontend: http://localhost:5173`)
  console.log(`🎯 Use: npm run dev:full to start both frontend and backend`)
})
