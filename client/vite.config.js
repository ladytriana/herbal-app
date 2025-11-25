import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vite.dev/config/](https://vite.dev/config/)
export default defineConfig({
plugins: [react()],
build: {
rollupOptions: {
input: {
main: 'index.html'
},
output: {
manualChunks: {
// Memisahkan library besar agar load lebih cepat
'react-vendor': ['react', 'react-dom', 'react-router-dom'],
'ui-vendor': ['lucide-react'],
}
}
}
}
})
