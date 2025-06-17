# 🚀 Setup Instructions - Video Watermark Remover

## 📋 **Prerequisites**

- Node.js 18+ 
- Git
- 2GB+ RAM untuk video processing
- Windows/Mac/Linux

## 🎯 **Quick Setup**

### **1. Clone Repository**
```bash
git clone https://github.com/DafisNadhifSaputra/watermark-remover.git
cd watermark-remover
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start Application**
```bash
npm run dev:full
```

### **4. Open Browser**
- Frontend: http://localhost:5173 (atau port yang ditampilkan)
- Backend: http://localhost:3001

## 🎬 **How to Use**

### **Step 1: Upload Video**
- Drag & drop video file atau click upload button
- Supported formats: MP4, AVI, MOV, MKV, WebM
- Max size: 200MB (dapat diubah di server.js)

### **Step 2: Select Watermark Areas**
- Video akan muncul di player
- Drag mouse di area watermark untuk select
- Bisa select multiple areas
- Area akan muncul sebagai kotak merah

### **Step 3: Process Video**
- Click "Hapus Watermark" button
- FFmpeg akan memproses video (1-5 menit tergantung ukuran)
- Progress bar akan menunjukkan status

### **Step 4: Download Result**
- Video tanpa watermark akan muncul
- Click "Download Video" untuk save
- File akan bernama "no_watermark_[original_name]"

## ⚙️ **Configuration**

### **Server Settings (server.js):**
```javascript
// File size limit (default 200MB)
limits: { fileSize: 200 * 1024 * 1024 }

// FFmpeg quality settings
'-crf 20',          // Quality (lower = better, 18-28 recommended)
'-preset medium',   // Speed (ultrafast, fast, medium, slow)
```

### **Frontend Settings (vite.config.js):**
```javascript
// Frontend port
port: 5173

// Backend proxy
proxy: {
  '/api': 'http://localhost:3001'
}
```

## 🔧 **Advanced Usage**

### **Processing Large Files:**
1. Increase memory limit di server.js
2. Use faster preset (`-preset fast`)
3. Monitor temp folder space

### **Batch Processing:**
- Process satu video per satu
- Server otomatis cleanup temp files
- Restart server jika ada masalah memory

### **Custom FFmpeg Parameters:**
Edit di server.js pada bagian:
```javascript
.addOptions([
  '-crf 20',              // Quality
  '-preset medium',       // Speed
  '-avoid_negative_ts make_zero'
])
```

## 🚨 **Troubleshooting**

### **Port Already in Use:**
- Vite akan otomatis cari port kosong
- Backend selalu di port 3001
- Kill proses dengan `taskkill /F /IM node.exe`

### **FFmpeg Error:**
- Check video format (MP4 paling stable)
- Reduce file size jika terlalu besar
- Restart server jika hang

### **Memory Issues:**
- Close aplikasi lain saat processing
- Reduce video resolution sebelum upload
- Monitor task manager

### **Processing Stuck:**
- Check console untuk error
- Restart dengan `Ctrl+C` dan `npm run dev:full`
- Check temp folder tidak penuh

## 📁 **Project Structure**

```
watermark-remover/
├── src/
│   ├── components/
│   │   ├── VideoProcessor.jsx      # Main app logic
│   │   ├── SmoothVideoPlayer.jsx   # Video player + selection
│   │   └── ProcessingProgress.jsx  # Progress indicator
│   ├── App.jsx                     # Root component
│   └── main.jsx                    # Entry point
├── temp/                           # Temporary processing files
├── server.js                       # Backend API server
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Frontend build config
└── README.md                       # Main documentation
```

## 📊 **Performance Tips**

### **For Best Results:**
- Use MP4 format videos
- Keep files under 100MB for faster processing
- Close other heavy applications
- Use SSD storage for temp files

### **Quality vs Speed:**
- **Fast Processing**: `-preset ultrafast -crf 28`
- **Balanced**: `-preset medium -crf 23` (default)
- **High Quality**: `-preset slow -crf 18`

## 🔒 **Security & Privacy**

- ✅ **100% Local Processing** - No data uploaded to cloud
- ✅ **Temporary Files** - Auto cleanup after processing
- ✅ **No Internet Required** - Works offline after setup
- ✅ **Privacy First** - Your videos never leave your computer

## 🎉 **Ready to Use!**

Your local video watermark remover is ready! 

**Command: `npm run dev:full` dan mulai hapus watermark! 🚀**
