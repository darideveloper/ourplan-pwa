import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  images: ['public/ourplan-logo.png'],
  preset: {
    transparent: {
      sizes: [192, 512],
      padding: 0,
    },
    maskable: {
      sizes: [192, 512],
      padding: 0.3,
    },
    apple: {
      sizes: [180],
      padding: 0,
    },
    assetName: (type, size) => {
      if (type === 'transparent') return `icons/icon-${size.width}x${size.height}.png`
      if (type === 'maskable') return `icons/icon-maskable-${size.width}x${size.height}.png`
      if (type === 'apple') return `icons/apple-touch-icon.png`
      return `icons/pwa-${size.width}x${size.height}.png`
    },
    png: {
      compressionLevel: 9,
      quality: 85,
    },
  },
})
