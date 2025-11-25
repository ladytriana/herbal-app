// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Detector from './pages/Detector';
import './styles/animations.css'; // Import global animations

function App() {
  // Preload critical resources
  useEffect(() => {
    // Preload model files (optional - untuk faster loading)
    const preloadModel = async () => {
      try {
        // Prefetch model.json and weights
        await fetch('/model/model.json');
        console.log('Model preloaded successfully');
      } catch (error) {
        console.log('Model preload skipped');
      }
    };
    
    preloadModel();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Jalan Utama (Home) */}
          <Route path="/" element={<Home />} />
          
          {/* Jalan ke Deteksi (Scan) */}
          <Route path="/scan" element={<Detector />} />
          
          {/* 404 Page - Redirect ke Home (Optional) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// Optional: 404 Not Found Component
function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-up">
        <div className="text-6xl mb-4">🌿</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-600 mb-6">Halaman tidak ditemukan</p>
        <a 
          href="/" 
          className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}

export default App;