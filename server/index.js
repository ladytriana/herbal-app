// 📄 server/index.js (File Backend Node.js)

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3000; // Port Backend

app.use(cors()); // Middleware untuk mengizinkan React (port 5173) mengakses
app.use(express.json());

// Database Sementara (Untuk menyimpan riwayat scan)
let scanHistory = [];

// --- WIKIMAP: Peta untuk memperbaiki nama agar sesuai judul artikel Wikipedia ---
const wikiMap = {
  // Gunakan huruf kecil sebagai kunci
  "jahe": "Jahe",
  "kunyit": "Kunyit",
  "jambu biji": "Jambu biji",
  "jambu": "Jambu biji", 
  "daun sirih": "Sirih",
  "lidah buaya": "Lidah buaya",
  "salam": "Salam (tumbuhan)",
  "seledri": "Seledri",
  "pandan": "Pandan",
  "kemangi": "Kemangi",
  "mint": "Mint",
  "kumis kucing": "Kumis kucing",
  // --- TAMBAHAN BARU ---
  "pegagan": "Pegagan", // Tambahan dari langkah sebelumnya
  "lemon": "Lemon" // <-- TAMBAHAN TERBARU UNTUK LEMON
};

// --- ENDPOINT 1: CARI DATA DARI WIKIPEDIA (PROXY) ---
app.get('/api/wiki/:plantName', async (req, res) => {
  try {
    let query = req.params.plantName.toLowerCase().trim();

    // Koreksi nama jika ada di map
    if (wikiMap[query]) {
      query = wikiMap[query];
    }

    // URL Wikipedia API (Bahasa Indonesia)
    const apiUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    
    // Panggil API dengan Header User-Agent (WAJIB agar tidak kena blokir 403)
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'HerbalAppProject/1.0 (student_project@kampus.ac.id)' 
      }
    });

    // Kirim data Deskripsi dan Link ke Frontend
    res.json({
      description: response.data.extract,
      wikiUrl: response.data.content_urls.desktop.page
    });

  } catch (error) {
    console.error(`Gagal ambil data Wikipedia untuk ${req.params.plantName}: ${error.message}`);
    // Fallback jika Wikipedia error
    res.status(404).json({ 
      description: "Data Wikipedia tidak ditemukan atau koneksi ditolak (403/404).",
      wikiUrl: null
    });
  }
});

// --- ENDPOINT 2: SIMPAN HISTORY SCAN ---
app.post('/api/history', (req, res) => {
  const { plantName, confidence, date } = req.body;
  const newLog = {
    id: scanHistory.length + 1,
    plantName,
    confidence,
    date: date || new Date().toLocaleString()
  };
  scanHistory.unshift(newLog);
  console.log(`📝 History Baru: ${plantName}`);
  res.json({ message: 'Log scan berhasil disimpan', total: scanHistory.length });
});

// --- MENJALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});