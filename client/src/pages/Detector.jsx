import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Upload, X, RefreshCw, CheckCircle, ExternalLink, 
  Sparkles, TrendingUp, Leaf, AlertCircle, BookOpen 
} from 'lucide-react';
import Webcam from 'react-webcam'; 
import classifier from '../utils/HerbalClassifier';
import { plantDatabase } from '../data/plants';
import axios from 'axios';
import LazyImage from '../components/LazyImage';
import '../styles/animations.css';

function Detector() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false); 
  const [cameraDevice, setCameraDevice] = useState("environment");
  const [activeTab, setActiveTab] = useState('detail');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const imageRef = useRef();
  
  const location = useLocation();
  const mode = location.state?.action; 

  // --- INITIALIZE MODEL ---
  useEffect(() => {
    async function init() {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await classifier.loadModel();
      setLoadingProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        if (mode === 'camera') setShowWebcam(true);
      }, 500);
    }
    init();
  }, [mode]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreview(url);
      setResult(null);
      setPlantInfo(null);
      setShowWebcam(false);
      setImageLoaded(false);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    setImage(imageSrc);
    setResult(null);
    setPlantInfo(null);
    setShowWebcam(false);
    setImageLoaded(false);
  }, [webcamRef]);

  // --- PREDICT IMAGE ---
  const predictImage = async () => {
    if (imageRef.current) {
      setAnalyzing(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const prediction = await classifier.predict(imageRef.current);
      setResult(prediction);

      const lookupKey = prediction.plantName.toLowerCase().trim();
      const localData = plantDatabase[lookupKey];

      let wikiDescription = "Sedang mengambil data...";
      let wikiUrl = null;

      try {
        const response = await axios.get(`http://localhost:3000/api/wiki/${prediction.plantName}`);
        wikiDescription = response.data.description;
        wikiUrl = response.data.wikiUrl;
      } catch (err) {
        wikiDescription = "Gagal mengambil data Wikipedia. Pastikan server backend menyala.";
      }

      setPlantInfo({
        namaLatin: prediction.plantName,
        deskripsi: wikiDescription,
        wikiUrl: wikiUrl,
        khasiat: localData ? localData.khasiat : [],
        pengolahan: localData ? localData.pengolahan : ""
      });
      
      try {
        await axios.post('http://localhost:3000/api/history', {
          plantName: prediction.plantName,
          confidence: prediction.confidence,
          date: new Date().toLocaleString()
        });
      } catch (error) { console.log("Log error"); }

      setAnalyzing(false);
    }
  };

  const toggleCamera = () => {
    setCameraDevice(prev => prev === "user" ? "environment" : "user");
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setPlantInfo(null);
    setImage(null);
    setImageLoaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-custom-xl p-10 max-w-md w-full animate-scale-up text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
            <Leaf className="w-10 h-10 text-green-600 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Memuat Model AI</h3>
          <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 font-sans pb-20">
      
      {/* WEBCAM MODAL (RESPONSIVE FIX) */}
      {showWebcam && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
          
          {/* Container dibuat width 95% di HP dan max-w-2xl di Laptop */}
          <div className="relative w-[95%] max-w-2xl bg-black rounded-3xl overflow-hidden border-2 border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Bagian Video: aspect-[3/4] untuk HP (Potrait), aspect-video untuk Laptop (Landscape) */}
            <div className="relative aspect-[3/4] md:aspect-video w-full bg-gray-900 overflow-hidden">
              <Webcam 
                audio={false} 
                ref={webcamRef} 
                screenshotFormat="image/jpeg" 
                videoConstraints={{ 
                  facingMode: cameraDevice,
                  // Agar responsif, kita tidak hardcode width/height di sini
                }} 
                className="w-full h-full object-cover"
              />

              {/* Top Bar Controls (Live Badge & Close) */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent z-10">
                <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-bold uppercase tracking-wide">Live</span>
                </div>
                
                <button 
                  onClick={() => setShowWebcam(false)} 
                  className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-600 transition-all border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guide Overlay (Kotak Putih) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 p-8">
                <div className="w-full h-full max-w-[250px] max-h-[250px] border-2 border-white/80 rounded-3xl relative">
                  {/* Pojok-pojok agar terlihat seperti viewfinder */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400 -mt-1 -ml-1 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400 -mt-1 -mr-1 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400 -mb-1 -ml-1 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400 -mb-1 -mr-1 rounded-br-lg"></div>
                </div>
              </div>
            </div>

            {/* Bagian Kontrol Bawah (Terpisah dari Video) */}
            <div className="bg-gray-900 p-6 flex flex-col items-center justify-center border-t border-gray-800 shrink-0">
              <div className="flex items-center justify-center gap-10">
                
                {/* Flip Camera */}
                <button 
                  onClick={toggleCamera} 
                  className="p-4 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition active:scale-95"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>

                {/* Shutter Button (Jepret) */}
                <button 
                  onClick={capture} 
                  className="w-20 h-20 bg-white rounded-full border-4 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-90 transition transform flex items-center justify-center hover:bg-gray-100"
                >
                   <Camera className="w-8 h-8 text-green-600" />
                </button>

                {/* Dummy Spacer agar tombol tengah pas */}
                <div className="w-14"></div> 
              </div>
              
              <p className="text-gray-400 text-xs mt-4 font-medium text-center">
                Pastikan tanaman berada dalam kotak fokus
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ANALYZING LOADING */}
      {analyzing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-scale-up">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-bold">Sedang Menganalisis...</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="font-bold text-gray-800 text-lg">Identifikasi Tanaman</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-xl mx-auto px-4 py-6">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />

        {/* STATE 1: BELUM ADA GAMBAR */}
        {!preview ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center mt-4 animate-fade-in-up">
            {mode === 'camera' ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Kamera Siap</h3>
                <p className="text-gray-500 mb-6 text-sm">Ambil foto tanaman secara langsung</p>
                <button onClick={() => setShowWebcam(true)} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition transform active:scale-95">
                  Buka Kamera
                </button>
              </>
            ) : mode === 'upload' ? (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Upload Gambar</h3>
                <p className="text-gray-500 mb-6 text-sm">Pilih foto dari galeri perangkat Anda</p>
                <button onClick={() => fileInputRef.current.click()} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition transform active:scale-95">
                  Pilih File
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Silakan kembali ke menu utama</p>
                <Link to="/" className="text-green-600 font-bold underline">Ke Beranda</Link>
              </div>
            )}
          </div>
        ) : (
          /* STATE 2: SUDAH ADA GAMBAR (PREVIEW / RESULT) */
          <div className="space-y-6 animate-fade-in">
            
            {/* IMAGE CARD */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black group">
              <img 
                ref={imageRef} 
                src={preview} 
                className="w-full h-80 object-contain bg-gray-900" 
                alt="Preview" 
                crossOrigin="anonymous"
              />
              
              {/* TOMBOL HAPUS (X) - Muncul jika belum ada hasil */}
              {!result && (
                <button 
                  onClick={handleReset}
                  className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-red-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* OVERLAY HASIL */}
              {result && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Teridentifikasi</span>
                  </div>
                  <h2 className="text-3xl font-bold capitalize">{result.plantName}</h2>
                  <p className="text-gray-300 text-sm italic">{plantInfo?.namaLatin || "Nama Latin..."}</p>
                </div>
              )}
            </div>

            {/* ACTION BUTTON (ANALISIS) */}
            {!result && (
              <button 
                onClick={predictImage}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:shadow-2xl transition transform active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                Analisis Tanaman
              </button>
            )}

            {/* INFO CARD (HASIL) */}
            {result && plantInfo && (
              <>
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden animate-scale-up mt-6">
                  
                  {/* TABS */}
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    <button 
                      onClick={() => setActiveTab('detail')} 
                      className={`flex-1 py-4 text-sm font-bold transition-smooth relative ${
                        activeTab === 'detail' ? 'text-green-600 bg-white' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Detail (Wiki)
                      {activeTab === 'detail' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      )}
                    </button>
                    <button 
                      onClick={() => setActiveTab('khasiat')} 
                      className={`flex-1 py-4 text-sm font-bold transition-smooth relative ${
                        activeTab === 'khasiat' ? 'text-green-600 bg-white' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Khasiat & Resep
                      {activeTab === 'khasiat' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      )}
                    </button>
                  </div>

                  {/* TAB CONTENT */}
                  <div className="p-6">
                    {activeTab === 'detail' ? (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Akurasi AI</span>
                            <span className="text-sm font-bold text-green-600">{result.confidence}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Deskripsi (Wikipedia)</span>
                          <p className="text-gray-600 text-sm leading-relaxed text-justify">
                            {plantInfo.deskripsi}
                          </p>
                          {plantInfo.wikiUrl && (
                            <a href={plantInfo.wikiUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600 font-bold text-xs mt-3 hover:underline">
                              Baca di Wikipedia <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" /> Manfaat Utama
                          </h4>
                          <ul className="space-y-2">
                            {plantInfo.khasiat?.map((k, i) => (
                              <li key={i} className="flex gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                                {k}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                          <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Saran Penyajian
                          </h4>
                          <p className="text-sm text-orange-900/80 leading-relaxed">
                            {plantInfo.pengolahan}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOMBOL SCAN LAGI */}
                <button 
                  onClick={handleReset} 
                  className="w-full bg-white text-gray-700 font-bold py-4 rounded-2xl shadow-lg border-2 border-gray-200 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-6"
                >
                  <RefreshCw className="w-5 h-5" />
                  Scan Tanaman Lain
                </button>
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

export default Detector;