import * as tf from '@tensorflow/tfjs';

class HerbalClassifier {
  constructor() {
    this.model = null;
    this.metadata = null;
    this.isLoading = false;
    this.loadingProgress = 0;
    this.listeners = {
      onLoadStart: [],
      onLoadProgress: [],
      onLoadComplete: [],
      onLoadError: [],
      onPredictStart: [],
      onPredictComplete: [],
      onPredictError: []
    };
  }

  // Event listener system untuk animasi
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  async loadModel() {
    try {
      this.isLoading = true;
      this.emit('onLoadStart', { message: 'Memulai loading model...' });

      // Simulate progress untuk UX yang lebih baik
      this.loadingProgress = 10;
      this.emit('onLoadProgress', { progress: 10 });

      // Load model dari folder public/model
      this.model = await tf.loadLayersModel('/model/model.json');
      
      this.loadingProgress = 60;
      this.emit('onLoadProgress', { progress: 60 });

      // Load metadata
      const metadataRes = await fetch('/model/metadata.json');
      this.metadata = await metadataRes.json();
      
      this.loadingProgress = 100;
      this.emit('onLoadProgress', { progress: 100 });

      console.log("Model AI berhasil dimuat!");
      
      this.isLoading = false;
      this.emit('onLoadComplete', { 
        message: 'Model berhasil dimuat!',
        classes: this.metadata.labels 
      });
      
      return true;
    } catch (error) {
      this.isLoading = false;
      this.loadingProgress = 0;
      
      console.error("Gagal memuat model. Cek folder public/model Anda!", error);
      
      this.emit('onLoadError', { 
        error: error.message,
        message: 'Gagal memuat model AI' 
      });
      
      return false;
    }
  }

  async predict(imageElement) {
    if (!this.model) {
      this.emit('onPredictError', { 
        message: 'Model belum dimuat!' 
      });
      return null;
    }

    try {
      this.emit('onPredictStart', { 
        message: 'Menganalisis gambar...' 
      });

      // Proses gambar menjadi Tensor
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224]) // Sesuaikan dengan Teachable Machine
        .toFloat()
        .expandDims()
        .div(255.0);

      // Simulasi delay untuk animasi (optional, bisa dihapus untuk production)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const predictions = await this.model.predict(tensor).data();
      
      // Cleanup tensor
      tensor.dispose();
      
      // Ambil nilai tertinggi
      const maxPrediction = Math.max(...predictions);
      const classIndex = predictions.indexOf(maxPrediction);
      
      const result = {
        plantName: this.metadata.labels[classIndex],
        confidence: (maxPrediction * 100).toFixed(2),
        allPredictions: predictions.map((pred, idx) => ({
          label: this.metadata.labels[idx],
          confidence: (pred * 100).toFixed(2)
        })).sort((a, b) => b.confidence - a.confidence)
      };

      this.emit('onPredictComplete', result);
      
      return result;
    } catch (error) {
      console.error('Error during prediction:', error);
      
      this.emit('onPredictError', { 
        error: error.message,
        message: 'Gagal menganalisis gambar' 
      });
      
      return null;
    }
  }

  // Helper method untuk cleanup
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }

  // Get model info
  getModelInfo() {
    if (!this.metadata) return null;
    
    return {
      classes: this.metadata.labels,
      totalClasses: this.metadata.labels.length,
      isLoaded: this.model !== null
    };
  }
}

export default new HerbalClassifier();