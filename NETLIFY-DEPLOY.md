# 🚀 Deploy ke Netlify

Panduan lengkap untuk deploy Video Watermark Remover ke Netlify sebagai alternatif Vercel.

## 📋 **Prasyarat**

- ✅ Repository sudah ada di GitHub
- ✅ Akun Netlify (gratis)
- ✅ Code sudah di-push ke GitHub

## 🎯 **Konfigurasi yang Sudah Dibuat**

### **1. netlify.toml**
File konfigurasi utama Netlify dengan:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Redirects untuk SPA dan API routes
- CORS headers
- Timeout settings (15 detik max untuk free tier)

### **2. Netlify Functions**
- **Path**: `netlify/functions/process-video-manual.js`
- **URL**: `https://yoursite.netlify.app/.netlify/functions/process-video-manual`
- **Mode**: Demo mode (karena keterbatasan Netlify functions)

## 🔧 **Cara Deploy**

### **Option 1: Via Netlify Dashboard**

1. **Login ke Netlify**: https://netlify.com
2. **New site from Git** → Pilih GitHub
3. **Pilih Repository**: `watermark-remover`
4. **Deploy Settings**:
   - Build command: `npm run build` (auto-detect)
   - Publish directory: `dist` (auto-detect)
   - Functions directory: `netlify/functions` (auto-detect)
5. **Deploy site**

### **Option 2: Via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Deploy dari directory project
netlify deploy

# Deploy production
netlify deploy --prod
```

## 🌐 **URL Structure Setelah Deploy**

```
Frontend: https://yoursite.netlify.app
API:      https://yoursite.netlify.app/.netlify/functions/process-video-manual
```

## ⚠️ **Perbedaan dengan Vercel**

### **Netlify Limitations (Free Tier)**
- ⏱️ **Function Timeout**: 15 detik (vs 10 detik Vercel)
- 📦 **Function Size**: 50MB (vs 50MB Vercel)
- 🔄 **Executions**: 125,000/bulan (vs 100GB Vercel)
- 💾 **Memory**: 1024MB (vs 1024MB Vercel)

### **Keuntungan Netlify**
- ✅ **Form Handling**: Built-in form processing
- ✅ **Edge Functions**: Deno-based edge functions
- ✅ **Split Testing**: A/B testing built-in
- ✅ **Deploy Previews**: Preview setiap PR

## 🛠️ **Troubleshooting**

### **Build Errors**
```bash
# Cek build logs di Netlify dashboard
# Atau test build lokal:
npm run build
```

### **Function Errors**
```bash
# Test function lokal dengan Netlify CLI:
netlify dev
```

### **CORS Issues**
Headers sudah dikonfigurasi di `netlify.toml`, tapi jika masih ada masalah:
```bash
# Cek di Network tab browser
# Pastikan request ke /.netlify/functions/process-video-manual
```

## 📝 **Custom Domain (Opsional)**

1. **Beli domain** atau gunakan yang sudah ada
2. **Netlify Dashboard** → Domain settings
3. **Add custom domain**
4. **Update DNS** sesuai instruksi Netlify

## 🔒 **Environment Variables**

Jika diperlukan (untuk production):
```bash
# Di Netlify Dashboard → Site settings → Environment variables
FFMPEG_PATH=/opt/bin/ffmpeg
NODE_ENV=production
```

## 📊 **Monitoring**

- **Analytics**: Built-in di Netlify dashboard
- **Function Logs**: Real-time di Functions tab
- **Deploy Logs**: Detailed build logs

## 🎯 **Next Steps**

1. Deploy ke Netlify
2. Test functionality
3. Configure custom domain (optional)
4. Set up monitoring
5. Optimize performance

---

## 🆚 **Netlify vs Vercel Comparison**

| Feature | Netlify | Vercel |
|---------|---------|---------|
| Build Time | ~2-3 min | ~1-2 min |
| Function Timeout | 15s | 10s |
| Cold Start | ~200ms | ~100ms |
| CDN | Global | Global |
| HTTPS | Auto | Auto |
| Custom Domains | ✅ | ✅ |
| Deploy Previews | ✅ | ✅ |

**Pilih Netlify jika**: Anda butuh form handling, A/B testing, atau prefer interface Netlify.
**Pilih Vercel jika**: Anda fokus pada performance dan Next.js integration.

---

**Dibuat oleh: Dafis Nadhif Saputra**
