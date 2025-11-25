export function register() {
// Hanya jalan di browser yang support Service Worker
if ('serviceWorker' in navigator) {

```
window.addEventListener('load', () => {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then((registration) => {
      console.log('🚀 Service Worker registered:', registration.scope);

      // Cek jika ada update baru
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Update Service Worker ditemukan!');

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            console.log('📦 Update tersedia — silakan reload.');

            // Opsional: popup update
            if (confirm('Versi baru aplikasi tersedia. Muat ulang sekarang?')) {
              window.location.reload();
            }
          }
        });
      });
    })
    .catch((err) => {
      console.error('❌ Service Worker gagal terdaftar:', err);
    });
});
```

} else {
console.log('⚠️ Browser tidak mendukung Service Worker');
}
}

// Untuk menghapus service worker (optional)
export function unregister() {
if ('serviceWorker' in navigator) {
navigator.serviceWorker.ready
.then((registration) => {
registration.unregister();
console.log('🧹 Service Worker dihapus');
})
.catch((error) => {
console.error('❌ Gagal menghapus Service Worker', error);
});
}
}
