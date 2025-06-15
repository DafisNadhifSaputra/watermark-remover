import formidable from 'formidable'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

// Configure formidable for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' })
  }

  try {
    console.log('🎯 Memulai penghapusan watermark manual...')

    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes('video')
      },
    })

    const [fields, files] = await form.parse(req)
    
    const videoFile = files.video?.[0]
    if (!videoFile) {
      return res.status(400).json({ error: 'File video tidak ditemukan' })
    }    const selectionsData = fields.selections?.[0]
    let selections = []
    
    try {
      selections = JSON.parse(selectionsData || '[]')
    } catch (parseError) {
      return res.status(400).json({ error: 'Data seleksi tidak valid', parseError })
    }

    console.log('📁 Input:', videoFile.filepath)
    console.log('🎯 Area terpilih:', selections.length)

    if (selections.length === 0) {
      return res.status(400).json({ error: 'Tidak ada area watermark yang dipilih' })
    }

    // Create unique output filename
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000000)
    const ext = path.extname(videoFile.originalFilename || '.mp4')
    const outputFilename = `processed-${timestamp}-${randomNum}${ext}`
    
    // Use /tmp directory for serverless
    const outputPath = path.join('/tmp', outputFilename)

    try {
      // Try FFmpeg processing (simpler for serverless)
      console.log('🎨 Menggunakan FFmpeg delogo...')
      
      const delogoFilters = selections.map(area => {
        const x = Math.max(0, Math.floor(Number(area.x) || 0))
        const y = Math.max(0, Math.floor(Number(area.y) || 0))
        const w = Math.max(1, Math.floor(Number(area.width) || 1))
        const h = Math.max(1, Math.floor(Number(area.height) || 1))
        return `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`
      })
      
      const filterChain = delogoFilters.join(',')
      const ffmpegCmd = `ffmpeg -hide_banner -loglevel error -y -i "${videoFile.filepath}" -vf "${filterChain}" -c:a copy "${outputPath}"`
      
      console.log('Menjalankan command FFmpeg...')
      const { stdout, stderr } = await execAsync(ffmpegCmd, {
        timeout: 240000, // 4 minutes for serverless
        cwd: '/tmp'
      })
      
      if (stdout) console.log('FFmpeg stdout:', stdout)
      if (stderr) console.warn('FFmpeg stderr:', stderr)
      
      if (!fs.existsSync(outputPath)) {
        throw new Error('FFmpeg gagal membuat file output')
      }
      
      // Read file as base64 for response (since we can't serve files directly)
      const processedVideoBuffer = fs.readFileSync(outputPath)
      const processedVideoBase64 = processedVideoBuffer.toString('base64')
      
      // Cleanup temp files
      try {
        fs.unlinkSync(outputPath)
        fs.unlinkSync(videoFile.filepath)
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError.message)
      }
      
      console.log('✅ Penghapusan watermark selesai!')
      
      res.json({
        success: true,
        message: 'Watermark berhasil dihapus menggunakan teknik Enhanced Delogo',
        method: 'ENHANCED_DELOGO',
        originalFile: {
          filename: videoFile.originalFilename,
          size: videoFile.size
        },
        processedFile: {
          filename: outputFilename,
          data: processedVideoBase64,
          mimeType: 'video/mp4'
        },
        areasProcessed: selections.length,
        processingInfo: {
          technique: 'FFmpeg Enhanced Delogo',
          description: 'Watermark dihapus dengan algoritma enhanced',
          quality: 'Kualitas Bagus - Penghapusan Enhanced'
        },
        autoCleanup: {
          message: 'File sementara telah dibersihkan otomatis',
          deleteAfter: 'Langsung setelah diproses'
        }
      })

    } catch (processingError) {
      console.error('❌ Error saat memproses:', processingError)
      
      // Cleanup on error
      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        fs.unlinkSync(videoFile.filepath)
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError.message)
      }
      
      return res.status(500).json({
        error: 'Gagal memproses video',
        details: processingError.message
      })
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
    res.status(500).json({
      error: 'Terjadi kesalahan pada server',
      details: error.message
    })
  }
}
