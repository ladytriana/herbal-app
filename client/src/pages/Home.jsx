// src/pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Leaf,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import '../styles/animations.css';

function Home() {
  const navigate = useNavigate();
  const [hoveredPlant, setHoveredPlant] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const popularPlants = [
    { name: 'Jahe', icon: '🌿', latin: 'Zingiber officinale' },
    { name: 'Kunyit', icon: '🌾', latin: 'Curcuma longa' },
    { name: 'Daun Sirih', icon: '🍃', latin: 'Piper betle' },
    { name: 'Pandan', icon: '🌱', latin: 'Pandanus amaryllifolius' },
    { name: 'Kemangi', icon: '🌿', latin: 'Ocimum basilicum' },
    { name: 'Seledri', icon: '🌿', latin: 'Apium graveolens' },
    { name: 'Lidah Buaya', icon: '🌵', latin: 'Aloe vera' },
    { name: 'Kumis Kucing', icon: '🌸', latin: 'Orthosiphon stamineus' }
  ];

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Akurasi Tinggi',
      description: 'AI dengan akurasi 88%+',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Cepat & Mudah',
      description: 'Hasil dalam hitungan detik',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Info Lengkap',
      description: 'Khasiat dan cara penggunaan',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const handleNavigation = (mode) => {
    navigate('/scan', { state: { action: mode } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 font-sans">
      
      {/* HEADER - Sticky with backdrop blur */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm border-b border-gray-100 animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg hover-scale transition-smooth">
              <Leaf className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">Herb Classifier</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                Powered by AI
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HERO SECTION + POPULAR PLANTS */}
        <section className="grid lg:grid-cols-12 gap-6 mb-12 animate-fade-in-up">
          
          {/* LEFT: HERO CARD - Takes 5 columns */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl h-full flex flex-col justify-between relative overflow-hidden hover-lift transition-smooth">
              {/* Background decoration */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 animate-float">
                <Leaf className="w-full h-full" />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-3 leading-tight">
                  Identifikasi Tanaman
                </h2>
                <p className="text-green-100 mb-6 leading-relaxed">
                  Kenali jenis dan khasiat daun herbal dengan cepat dan akurat menggunakan AI.
                </p>

                <button
                  onClick={() => handleNavigation('camera')}
                  className="bg-white text-green-700 font-bold py-3.5 px-8 rounded-full inline-flex items-center gap-3 shadow-xl hover:shadow-2xl hover-scale transition-smooth btn-press group"
                >
                  <Camera className="w-5 h-5 group-hover:animate-wiggle" />
                  Mulai Scan
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: POPULAR PLANTS - Takes 7 columns */}
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">
                Tanaman Populer
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularPlants.map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPlant(idx)}
                  onMouseLeave={() => setHoveredPlant(null)}
                  className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-green-300 transition-all cursor-pointer text-center stagger-item animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div 
                    className={`text-4xl mb-3 transition-transform duration-300 ${
                      hoveredPlant === idx ? 'scale-125 rotate-12' : ''
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="font-bold text-gray-800 text-sm mb-1">
                    {item.name}
                  </div>

                  <div 
                    className={`text-xs text-gray-500 italic transition-all duration-300 overflow-hidden ${
                      hoveredPlant === idx ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.latin}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* FEATURES SECTION */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-xl">
              Keunggulan Kami
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 hover:shadow-lg hover:border-green-200 transition-all stagger-item animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div 
                  className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-white shadow-md mb-4 transition-transform duration-300 ${
                    hoveredCard === idx ? 'scale-110 rotate-6' : ''
                  }`}
                >
                  {f.icon}
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW TO USE SECTION */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-xl">
              Cara Penggunaan
            </h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* TAKE PHOTO CARD */}
            <div
              onClick={() => handleNavigation('camera')}
              className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
            >
              <div className="flex gap-5 items-start">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl text-white shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-2 text-lg group-hover:text-green-600 transition-colors">
                    Ambil Foto
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Gunakan kamera untuk memotret daun tanaman secara langsung dan dapatkan hasil instant.
                  </p>
                </div>
              </div>
            </div>

            {/* UPLOAD CARD */}
            <div
              onClick={() => handleNavigation('upload')}
              className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex gap-5 items-start">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl text-white shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-2 text-lg group-hover:text-emerald-600 transition-colors">
                    Upload Gambar
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pilih foto yang sudah ada dari galeri device kamu untuk dianalisis.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA SECTION */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-10 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Siap Mengidentifikasi Tanaman?</h3>
              <p className="text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Gunakan teknologi AI untuk mengenali daun herbal dengan cepat, mudah, dan akurat. Dapatkan informasi lengkap tentang khasiat dan cara penggunaan.
              </p>

              <button
                onClick={() => handleNavigation('camera')}
                className="bg-white text-green-700 font-bold py-4 px-10 rounded-full inline-flex items-center gap-3 shadow-xl hover:shadow-2xl hover-scale transition-smooth btn-press group"
              >
                <Camera className="w-6 h-6 group-hover:animate-wiggle" />
                Mulai Identifikasi Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            Made with <span className="text-red-500 animate-heartbeat">❤</span> using AI Technology
          </p>
          <p className="mt-2">© 2024 Herb Classifier. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;