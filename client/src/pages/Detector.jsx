// src/pages/Detector.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  X, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  Leaf,
  AlertCircle,
  BookOpen
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
  const [cameraDevice, setCameraDevice] = useState("environment"); // Default ke rear camera
  const [activeTab, setActiveTab] = useState('detail');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const imageRef = useRef();
  
  const location = useLocation();
  const mode = location.state?.action; 

  // INITIALIZE MODEL
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

  // HANDLE FILE UPLOAD
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

  // CAPTURE FROM WEBCAM
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    setImage(imageSrc);
    setResult(null);
    setPlantInfo(null);
    setShowWebcam(false);
    setImageLoaded(false);
  }, [webcamRef]);

  // PREDICT IMAGE WITH AI
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
      } catch (error) { 
        console.log("Log error"); 
      }

      setAnalyzing(false);
    }
  };

  // TOGGLE CAMERA
  const toggleCamera = () => {
    setCameraDevice(prev => prev === "user" ? "environment" : "user");
  };

  // RESET ALL STATES
  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setPlantInfo(null);
    setImage(null);
    setImageLoaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-custom-xl p-10 max-w-md w-full animate-scale-up">
          <div className="text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
              <Leaf className="w-14 h-14 text-green-600 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">Memuat Model AI</h3>
            <p className="text-gray-600 mb-8 text-sm">Mohon tunggu sebentar...</p>
            <div className="progress-container mb-4">
              <div 
                className="progress-bar bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-lg text-green-600 font-bold">{loadingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 font-sans">
      
      {/* WEBCAM MODAL - CONTAINED SIZE */}
      {showWebcam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          
          {/* WEBCAM CONTAINER */}
          <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 animate-scale-up">
            
            {/* WEBCAM PREVIEW */}
            <div className="relative aspect-video">
              <Webcam 
                audio={false} 
                ref={webcamRef} 
                screenshotFormat="image/jpeg" 
                videoConstraints={{ 
                  facingMode: cameraDevice,
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }} 
                className="w-full h-full object-cover"
              />

              {/* TOP BAR - Status & Close */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-bold">Live</span>
                </div>
                
                <button 
                  onClick={() => setShowWebcam(false)} 
                  className="bg-red-500/90 backdrop-blur-sm p-3 rounded-full text-white hover:bg-red-600 transition-smooth shadow-lg hover-scale btn-press"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* CAMERA GUIDE OVERLAY */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white/40 rounded-3xl"></div>
              </div>

              {/* BOTTOM CONTROLS */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-center gap-8">
                  
                  {/* Flip Camera Button */}
                  <button 
                    onClick={toggleCamera} 
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-smooth shadow-lg hover-scale btn-press"
                    title="Flip Camera"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                  
                  {/* Capture Button */}
                  <button 
                    onClick={capture} 
                    className="w-20 h-20 bg-white rounded-full border-4 border-white/50 shadow-2xl hover:scale-95 transition-transform active:scale-90 flex items-center justify-center"
                    title="Capture Photo"
                  >
                    <Camera className="w-8 h-8 text-green-600" />
                  </button>
                  
                  {/* Placeholder for symmetry */}
                  <div className="w-14 h-14"></div>
                </div>

                {/* Instruction Text */}
                <p className="text-white text-center mt-4 text-sm font-medium">
                  Posisikan daun di dalam kotak putih
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ANALYZING MODAL */}
      {analyzing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-10 max-w-md mx-4 shadow-custom-xl animate-scale-up">
            <div className="text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative glow-pulse">
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                <Sparkles className="w-14 h-14 text-green-600 animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">Menganalisis Gambar</h3>
              <p className="text-gray-600 mb-8 text-sm">AI sedang memproses tanaman Anda...</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 sticky top-0 z-40 text-white shadow-lg animate-slide-up">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover-scale transition-smooth p-2 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-bold text-lg">Identifikasi Tanaman</h1>
              <p className="text-xs text-green-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by AI
              </p>
            </div>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Ready</span>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
        />

        {/* EMPTY STATE */}
        {!preview ? (
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 text-center py-20 mt-6 animate-fade-in-up">
            {mode === 'camera' && (
              <div className="px-8 animate-scale-up">
                <div className="w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 glow-pulse">
                  <Camera className="w-14 h-14 text-green-600 animate-float" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Kamera Siap</h3>
                <p className="text-gray-500 mb-10 text-sm max-w-md mx-auto leading-relaxed">
                  Klik tombol di bawah untuk membuka kamera dan mulai mengambil foto tanaman
                </p>
                <button 
                  onClick={() => setShowWebcam(true)} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 shadow-xl hover:shadow-2xl hover-scale transition-smooth btn-press group"
                >
                  <Camera className="w-6 h-6 group-hover:animate-wiggle"/>
                  Buka Kamera
                </button>
              </div>
            )}

            {mode === 'upload' && (
              <div className="px-8 animate-scale-up">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8 glow-pulse">
                  <Upload className="w-14 h-14 text-blue-600 animate-float" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Upload Gambar</h3>
                <p className="text-gray-500 mb-10 text-sm max-w-md mx-auto leading-relaxed">
                  Pilih foto tanaman dari galeri Anda untuk dianalisis
                </p>
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="bg-white border-2 border-green-600 text-green-600 font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 hover:bg-green-50 transition-smooth shadow-md hover-scale btn-press group"
                >
                  <Upload className="w-6 h-6 group-hover:animate-wiggle"/>
                  Pilih Gambar
                </button>
              </div>
            )}

            {!mode && (
              <div className="px-8">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">Silakan kembali ke Home untuk memilih mode</p>
                <Link to="/" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 shadow-xl hover:shadow-2xl hover-scale transition-smooth btn-press">
                  <ArrowLeft className="w-5 h-5" />
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-6">
            
            {/* IMAGE PREVIEW */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
              <div className="w-full h-96 flex items-center justify-center bg-gray-50">
                <LazyImage
                  src={preview}
                  alt="Plant Preview"
                  className="w-full h-full object-contain"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              
              {/* Hidden img for AI prediction */}
              <img 
                ref={imageRef} 
                src={preview} 
                className="hidden" 
                alt="Hidden for prediction"
                crossOrigin="anonymous"
              />

              {/* Result Overlay */}
              {result && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent p-6 pt-16 text-white animate-slide-up rounded-b-3xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-400 tracking-wide uppercase">Teridentifikasi</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{result.plantName}</h2>
                  <p className="text-gray-300 text-sm italic">{plantInfo?.namaLatin}</p>
                </div>
              )}

              {/* Close Button */}
              {!result && (
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm p-3 rounded-full text-white hover:bg-red-600 transition-smooth shadow-lg hover-scale btn-press"
                  title="Remove Image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* ANALYZE BUTTON */}
            {preview && !result && imageLoaded && (
              <button 
                onClick={predictImage} 
                className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover-scale transition-smooth text-lg flex items-center justify-center gap-3 btn-press gradient-animate"
              >
                <Sparkles className="w-6 h-6 animate-pulse" />
                Analisis dengan AI
              </button>
            )}

          </div>
        )}

        {/* RESULT INFO CARD */}
        {result && plantInfo && (
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
                  {/* Confidence Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Akurasi AI
                      </span>
                      <span className="text-lg font-bold text-green-700">{result.confidence}%</span>
                    </div>
                    <div className="progress-container h-4">
                      <div 
                        className="progress-bar bg-gradient-to-r from-green-500 to-emerald-500" 
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-4">
                      Deskripsi (Wikipedia)
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed text-justify">
                      {plantInfo.deskripsi}
                    </p>
                    {plantInfo.wikiUrl && (
                      <a 
                        href={plantInfo.wikiUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-green-600 font-bold text-sm mt-5 hover:underline hover-scale transition-smooth group"
                      >
                        Baca selengkapnya di Wikipedia
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* Benefits */}
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Manfaat Utama
                    </h4>
                    <ul className="space-y-3">
                      {plantInfo.khasiat && plantInfo.khasiat.length > 0 ? (
                        plantInfo.khasiat.map((item, idx) => (
                          <li 
                            key={idx} 
                            className="flex gap-3 text-sm text-gray-700 bg-green-50 p-4 rounded-xl border-2 border-green-100 hover-lift transition-smooth stagger-item animate-slide-in-left"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-md">
                              ✓
                            </div>
                            <span className="flex-1 leading-relaxed">{item}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">Data khasiat belum tersedia.</p>
                      )}
                    </ul>
                  </div>

                  {/* Processing */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl border-2 border-orange-200 hover-lift transition-smooth">
                    <h4 className="font-bold text-orange-800 text-lg mb-4 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5"/> 
                      Saran Penyajian
                    </h4>
                    <p className="text-sm text-orange-900/80 leading-relaxed">
                      {plantInfo.pengolahan || "Informasi pengolahan belum tersedia."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* FOOTER ACTIONS */}
            <div className="p-5 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button 
                onClick={handleReset} 
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold shadow-md hover:bg-gray-100 hover-scale transition-smooth btn-press flex items-center justify-center gap-2 group"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Scan Lagi
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Detector;