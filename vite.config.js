import {defineConfig} from 'vite'
import pkg from './package.json'

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
  define: {
    'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version)
  },
  server: {
    port: 3000,
    open: true
  }
})
