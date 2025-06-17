# 🎯 Video Watermark Remover (Local Development)

Aplikasi desktop untuk menghapus watermark dari video menggunakan FFmpeg native.

**⚡ Real Local Processing - No Demo Mode!**

## 🚀 **Quick Start**

```bash
# 1. Clone atau download project
git clone <your-repo-url>
cd video-watermark-removal

# 2. Install dependencies
npm install

# 3. Start aplikasi (frontend + backend)
npm run dev:full

# 4. Buka browser di:
# Frontend: http://localhost:5174 (atau port yang ditampilkan)
# Backend: http://localhost:3001
```

## ✨ **Features**

### **Real Watermark Removal:**
- ✅ **FFmpeg Native** - Processing cepat dan berkualitas tinggi
- ✅ **Manual Area Selection** - Pilih area watermark dengan drag & drop
- ✅ **Multiple Areas** - Hapus beberapa watermark sekaligus
- ✅ **High Quality Output** - CRF 20 untuk hasil terbaik
- ✅ **Large File Support** - Hingga 200MB per video
- ✅ **No Time Limits** - Processing sepuasnya
- ✅ **Progress Tracking** - Real-time progress display

### **Supported Formats:**
- Input: MP4, AVI, MOV, MKV, WebM
- Output: MP4 (H.264)

## 🎯 **How to Use**

1. **Start Application**: `npm run dev:full`
2. **Open Browser**: Go to displayed URL (usually http://localhost:5173)
3. **Upload Video**: Drag & drop atau click upload
4. **Select Watermark Areas**: Drag di video untuk select area watermark
5. **Process Video**: Click "Hapus Watermark"
6. **Wait for Processing**: FFmpeg akan memproses video (1-5 menit)
7. **Download Result**: Download video tanpa watermark

## 📋 **Available Scripts**

```bash
npm run dev:full        # Start frontend + backend
npm run dev:frontend    # Frontend only (Vite)
npm run dev:backend     # Backend only (Express + FFmpeg)
npm start              # Alias untuk dev:full
npm run build          # Build frontend untuk production
```

## 🛠️ **Tech Stack**

- **Frontend**: React 19 + Vite
- **Backend**: Express.js + FFmpeg Native
- **Video Processing**: fluent-ffmpeg + ffmpeg-static
- **UI**: CSS3 dengan drag & drop interface

## 📁 **Project Structure**

```
video-watermark-removal/
├── src/
│   ├── components/
│   │   ├── VideoProcessor.jsx      # Main component
│   │   ├── SmoothVideoPlayer.jsx   # Video player dengan selection
│   │   └── ProcessingProgress.jsx  # Progress indicator
│   ├── App.jsx
│   └── main.jsx
├── server.js                       # Backend server dengan FFmpeg
├── package.json
├── vite.config.js
└── README.md
```

## 🎬 **FFmpeg Processing Details**

### **Delogo Filter:**
- Menggunakan `delogo=x:y:w:h` filter
- Koordinat dari user selection area
- Interpolasi cerdas untuk mengisi area watermark

### **Quality Settings:**
- **Video Codec**: H.264 (libx264)
- **CRF**: 20 (high quality)
- **Preset**: Medium (balance speed/quality)
- **Audio**: Copy original (no re-encoding)

## 🔧 **Troubleshooting**

### **Port sudah digunakan:**
- Vite akan otomatis cari port kosong
- Backend selalu di port 3001

### **FFmpeg error:**
- Pastikan video format didukung
- Coba dengan video MP4
- Check ukuran file (max 200MB)

### **Processing lambat:**
- Normal untuk video besar
- Local processing lebih cepat dari cloud
- Monitor progress di console

## 📝 **Notes**

- **Desktop Only**: Aplikasi ini dirancang untuk development local
- **No Cloud Deployment**: FFmpeg processing memerlukan server dedicated
- **Real Processing**: Tidak ada mode demo, semua processing nyata
- **High Performance**: Menggunakan FFmpeg native untuk speed optimal

## 🎉 **Ready to Use!**

Aplikasi siap untuk real watermark removal di komputer Anda. Tidak perlu internet setelah dependencies terinstall!

**Run command: `npm run dev:full` dan mulai hapus watermark! 🚀**
