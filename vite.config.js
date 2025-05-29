import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js',
      name: 'PosterEditor',
      fileName: 'poster-editor',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
