// Netlify function handler untuk demo
export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method tidak diizinkan' })
    }
  }

  try {
    console.log('🎯 Memulai penghapusan watermark manual...')

    // For Netlify demo, we'll simulate the processing
    // In real implementation, you'd need to properly handle multipart form data
    
    // Mock selections for demo
    const selections = [
      { x: 10, y: 10, width: 100, height: 50 }
    ]

    console.log('📁 Processing with', selections.length, 'selections')

    if (selections.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Tidak ada area watermark yang dipilih' })
      }
    }

    // Create temporary file paths
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000000)
    const outputFilename = `processed-${timestamp}-${randomNum}.mp4`

    try {
      // For demo purposes, create a mock response
      // In real implementation, you'd process the actual video file
      console.log('🎨 Simulasi FFmpeg processing...')
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create mock processed video data (base64 of a small placeholder)
      const mockVideoData = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvmcbee'
      
      console.log('✅ Penghapusan watermark selesai!')
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Watermark berhasil dihapus (Netlify Demo Mode)',
          method: 'ENHANCED_DELOGO_DEMO',
          originalFile: {
            filename: 'uploaded-video.mp4',
            size: 1024000
          },
          processedFile: {
            filename: outputFilename,
            data: mockVideoData,
            mimeType: 'video/mp4'
          },
          areasProcessed: selections.length,
          processingInfo: {
            technique: 'FFmpeg Enhanced Delogo (Demo)',
            description: 'Watermark dihapus dengan algoritma enhanced - Demo Mode',
            quality: 'Demo Mode - Netlify Function'
          },
          autoCleanup: {
            message: 'File sementara telah dibersihkan otomatis',
            deleteAfter: 'Langsung setelah diproses'
          },
          note: 'Ini adalah demo mode. Untuk implementasi lengkap, diperlukan parsing multipart form data yang lebih kompleks.'
        })
      }

    } catch (processingError) {
      console.error('❌ Error saat memproses:', processingError)
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Gagal memproses video',
          details: processingError.message
        })
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Terjadi kesalahan pada server',
        details: error.message
      })
    }
  }
}
